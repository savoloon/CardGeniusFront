import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button, PageBlocker } from '../../components/ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProcessPolling } from '../../hooks/useProcessPolling';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { clearAllDrafts } from '../../features/imageEditor/variantDraftStorage';
import VariantEditor from '../../features/imageEditor/VariantEditor';
import ImageUploadZone from '../../components/dashboard/ImageUploadZone';
import ProcessModeSelector from '../../components/dashboard/ProcessModeSelector';
import ProcessOptions from '../../components/dashboard/ProcessOptions';
import ProcessQueueStatus from '../../components/dashboard/ProcessQueueStatus';
import ProcessResults from '../../components/dashboard/ProcessResults';
import {
  submitProcess,
  generateDescription as apiGenerateDescription,
  type ProcessMode,
} from '../../services/api';
import styles from './DashboardPage.module.css';

type WorkflowPhase = 'setup' | 'processing' | 'results';

export default function DashboardPage() {
  const { t } = useLanguage();
  const getErrorMessage = useApiErrorMessage();
  const {
    queueStatus,
    variants: processVariants,
    updateVariant,
    resultImages,
    activeResultIndex,
    setActiveResultIndex,
    resultSessionId,
    startPolling,
    stopPolling,
    resetResults,
    restoreWorkspaceFromMeta,
  } = useProcessPolling();

  const variantDirtyRef = useRef(false);
  const [sessionRestoredNotice, setSessionRestoredNotice] = useState(false);
  /** True after a process job was accepted; keeps us off setup until reset even if overlay state glitches. */
  const [jobAwaiting, setJobAwaiting] = useState(false);

  useEffect(() => {
    void restoreWorkspaceFromMeta().then((ok) => {
      if (ok) setSessionRestoredNotice(true);
    });
  }, [restoreWorkspaceFromMeta]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!variantDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const previewUrlRef = useRef<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<ProcessMode>('remove_background');
  const [includeCardTexts, setIncludeCardTexts] = useState(false);
  const [variantBatchCount, setVariantBatchCount] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [batchSizeTitle, setBatchSizeTitle] = useState(1);
  const [batchSizeDescription, setBatchSizeDescription] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [textsLoading, setTextsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [descTitles, setDescTitles] = useState<string[]>([]);
  const [descDescriptions, setDescDescriptions] = useState<string[]>([]);

  const needsProductFields = includeCardTexts || mode === 'generate_infographic';

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setImage(null);
  }, []);

  const handleSelectImage = useCallback(
    (file: File) => {
      clearPreview();
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setImage(file);
      setPreviewUrl(url);
      setError(null);
      stopPolling();
      resetResults();
      clearAllDrafts();
      setJobAwaiting(false);
      setDescTitles([]);
      setDescDescriptions([]);
    },
    [clearPreview, stopPolling, resetResults]
  );

  const handleClear = useCallback(() => {
    clearPreview();
    setError(null);
    stopPolling();
    resetResults();
    clearAllDrafts();
    setJobAwaiting(false);
    setDescTitles([]);
    setDescDescriptions([]);
  }, [clearPreview, stopPolling, resetResults]);

  const handleSubmit = async () => {
    if (!image) {
      setError(t('dashboard.uploadImageError'));
      return;
    }
    if (mode === 'generate_exposition_by_request' && !prompt.trim()) {
      setError(t('dashboard.enterExpositionPrompt'));
      return;
    }
    if (needsProductFields && (!productName.trim() || !productDescription.trim())) {
      setError(t('dashboard.productFieldsRequired'));
      return;
    }

    setSubmitting(true);
    setError(null);
    stopPolling();
    resetResults();
    clearAllDrafts();
    setDescTitles([]);
    setDescDescriptions([]);

    let imageOk = false;

    try {
      const textsPromise = includeCardTexts
        ? (async () => {
            setTextsLoading(true);
            try {
              const res = await apiGenerateDescription(
                productName.trim(),
                productDescription.trim(),
                {
                  batchSizeTitle,
                  batchSizeDescription,
                }
              );
              if (res.success && res.data) {
                setDescTitles(res.data.titles || []);
                setDescDescriptions(res.data.descriptions || []);
                return true;
              }
              setError(res.message ?? t('dashboard.descriptionError'));
              return false;
            } catch (err) {
              setError(getErrorMessage(err) || t('dashboard.descriptionError'));
              return false;
            } finally {
              setTextsLoading(false);
            }
          })()
        : Promise.resolve(true);

      const imagePromise = submitProcess(image, mode, {
        variants:
          mode === 'generate_background' ||
          mode === 'generate_exposure' ||
          mode === 'generate_exposition_by_request' ||
          mode === 'generate_infographic'
            ? variantBatchCount
            : undefined,
        prompt:
          mode === 'generate_exposition_by_request' || mode === 'generate_infographic'
            ? prompt
            : undefined,
        productName: mode === 'generate_infographic' ? productName.trim() : undefined,
        productDescription:
          mode === 'generate_infographic' ? productDescription.trim() : undefined,
      });

      const [imageRes, textsOk] = await Promise.all([imagePromise, textsPromise]);

      const taskIds =
        imageRes.success && imageRes.data?.taskIds?.length
          ? imageRes.data.taskIds
          : imageRes.data?.taskId
            ? [imageRes.data.taskId]
            : [];

      if (imageRes.success && taskIds.length > 0) {
        startPolling(taskIds);
        setJobAwaiting(true);
        imageOk = true;
      } else if (!imageRes.success) {
        setError(imageRes.message ?? t('dashboard.submitError'));
      }

      if (!imageOk && !textsOk) {
        setError((prev) => prev ?? t('dashboard.submitError'));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewTask = () => {
    stopPolling();
    resetResults();
    clearAllDrafts();
    setJobAwaiting(false);
    setSessionRestoredNotice(false);
    setDescTitles([]);
    setDescDescriptions([]);
    setError(null);
  };

  const handleActiveIndexChange = useCallback(
    (index: number) => {
      if (variantDirtyRef.current) {
        const stay = !window.confirm(t('dashboard.unsavedSwitchConfirm'));
        if (stay) return;
      }
      setActiveResultIndex(index);
    },
    [setActiveResultIndex, t]
  );

  const isProcessing =
    submitting ||
    textsLoading ||
    queueStatus === 'pending' ||
    queueStatus === 'processing';

  const hasImageResults = queueStatus === 'completed' && resultImages.length > 0;
  const hasTextResults = descTitles.length > 0 || descDescriptions.length > 0;
  const hasAnyResults = hasImageResults || hasTextResults;
  const showResultsSoon =
    jobAwaiting && !hasImageResults && queueStatus !== 'failed';

  const phase: WorkflowPhase = useMemo(() => {
    if (isProcessing) return 'processing';
    if (hasAnyResults || queueStatus === 'failed' || showResultsSoon) return 'results';
    return 'setup';
  }, [isProcessing, hasAnyResults, queueStatus, showResultsSoon]);

  const processDisabled =
    !image ||
    isProcessing ||
    (mode === 'generate_exposition_by_request' && !prompt.trim()) ||
    (needsProductFields && (!productName.trim() || !productDescription.trim()));

  const activeVariant = processVariants[activeResultIndex] ?? null;
  const showImageEditor =
    hasImageResults && activeVariant != null && resultSessionId != null;

  const optionsProps = {
    mode,
    variants: variantBatchCount,
    onVariantsChange: setVariantBatchCount,
    prompt,
    productName,
    productDescription,
    onPromptChange: setPrompt,
    onProductNameChange: setProductName,
    onProductDescriptionChange: setProductDescription,
    showProductFields: needsProductFields,
    showTextBatchOptions: includeCardTexts,
    batchSizeTitle,
    batchSizeDescription,
    onBatchSizeTitleChange: setBatchSizeTitle,
    onBatchSizeDescriptionChange: setBatchSizeDescription,
    disabled: isProcessing,
    hideSectionTitle: true as const,
  };

  const setupStepIndicator = (
    <ol className={styles.stepper} aria-label={t('dashboard.workflowStepsAria')}>
      <li className={`${styles.stepperItem} ${styles.stepperItemActive}`}>
        <span className={styles.stepperDot} aria-hidden />
        {t('dashboard.workflowStepSetup')}
      </li>
      <li className={styles.stepperItem}>
        <span className={styles.stepperDot} aria-hidden />
        {t('dashboard.workflowStepProcess')}
      </li>
      <li className={styles.stepperItem}>
        <span className={styles.stepperDot} aria-hidden />
        {t('dashboard.workflowStepResult')}
      </li>
    </ol>
  );

  const setupView = (
    <section className={styles.setup} aria-label={t('dashboard.workflowStepSetup')}>
      <header className={styles.setupTopBar}>
        <div className={styles.setupIntro}>
          <h1 className={styles.title}>{t('dashboard.title')}</h1>
          <p className={styles.subtitle}>{t('dashboard.subtitle')}</p>
        </div>
        {setupStepIndicator}
      </header>

      <div className={styles.setupWorkspace}>
        <div className={styles.setupCanvas}>
          <div className={styles.setupCanvasHeader}>
            <h2 className={styles.setupSectionTitle}>{t('dashboard.stepImage')}</h2>
          </div>
          <div className={styles.setupCanvasBody}>
            <ImageUploadZone
              image={image}
              previewUrl={previewUrl}
              onSelect={handleSelectImage}
              onClear={handleClear}
              disabled={isProcessing}
              hero
            />
          </div>
        </div>

        <aside className={styles.setupConfig}>
          <div className={styles.setupConfigScroll}>
            <section className={styles.setupConfigSection} aria-labelledby="setup-mode-heading">
              <h2 id="setup-mode-heading" className={styles.setupSectionTitle}>
                {t('dashboard.stepMode')}
              </h2>
              <ProcessModeSelector
                value={mode}
                onChange={setMode}
                includeCardTexts={includeCardTexts}
                onIncludeCardTextsChange={setIncludeCardTexts}
                disabled={isProcessing}
                hideSectionTitle
                dense
              />
            </section>

            <div className={styles.setupConfigDivider} aria-hidden />

            <section className={styles.setupConfigSection} aria-labelledby="setup-params-heading">
              <h2 id="setup-params-heading" className={styles.setupSectionTitle}>
                {t('dashboard.stepParams')}
              </h2>
              <ProcessOptions {...optionsProps} className={styles.optionsEmbed} compact />
            </section>
          </div>

          <footer className={styles.setupConfigFooter}>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <Button
              className={styles.runButton}
              loading={isProcessing}
              disabled={processDisabled}
              onClick={handleSubmit}
              fullWidth
            >
              {t('dashboard.process')}
            </Button>
          </footer>
        </aside>
      </div>
    </section>
  );

  const textResultsPanel = hasTextResults && (
    <aside className={styles.textResults} aria-label={t('dashboard.textResultsAria')}>
      <h2 className={styles.textResultsTitle}>{t('dashboard.cardTextsResultTitle')}</h2>
      {descTitles.length > 0 && (
        <div className={styles.textBlock}>
          <h3 className={styles.textBlockHeading}>{t('dashboard.titlesResult')}</h3>
          <ul className={styles.textList}>
            {descTitles.map((text, i) => (
              <li key={`title-${i}`}>
                <button
                  type="button"
                  className={styles.copyChip}
                  onClick={() => void navigator.clipboard.writeText(text)}
                  title={t('dashboard.copyToClipboard')}
                >
                  {text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {descDescriptions.length > 0 && (
        <div className={styles.textBlock}>
          <h3 className={styles.textBlockHeading}>{t('dashboard.descriptionsResult')}</h3>
          <ul className={styles.textList}>
            {descDescriptions.map((text, i) => (
              <li key={`desc-${i}`}>
                <button
                  type="button"
                  className={styles.copyChip}
                  onClick={() => void navigator.clipboard.writeText(text)}
                  title={t('dashboard.copyToClipboard')}
                >
                  {text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );

  const resultsView = (
    <section className={styles.results} aria-label={t('dashboard.workflowStepResult')}>
      <header className={styles.resultsHeader}>
        <div>
          <h2 className={styles.resultsTitle}>{t('dashboard.resultsPageTitle')}</h2>
          <p className={styles.resultsSubtitle}>{t('dashboard.resultsPageSubtitle')}</p>
        </div>
        <Button variant="outline" onClick={handleNewTask}>
          {t('dashboard.newImage')}
        </Button>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {queueStatus === 'failed' && !hasImageResults && (
        <div className={styles.failedBanner}>
          <ProcessQueueStatus status="failed" />
          <Button variant="outline" onClick={handleNewTask}>
            {t('dashboard.tryAgain')}
          </Button>
        </div>
      )}

      <div
        className={`${styles.resultsBody} ${hasTextResults ? styles.resultsBodyWithTexts : ''}`}
      >
        <div className={styles.resultsMain}>
          {sessionRestoredNotice && (
            <p className={styles.storageWarning} role="status">
              {t('dashboard.sessionRestored')}
            </p>
          )}

          {showImageEditor && activeVariant && (
            <div className={styles.editorBlock}>
              <VariantEditor
                key={activeVariant.id}
                variant={activeVariant}
                variantIndex={activeResultIndex}
                variantCount={processVariants.length}
                onVariantChange={updateVariant}
                onDirtyChange={(d) => {
                  variantDirtyRef.current = d;
                }}
              />
            </div>
          )}

          {hasImageResults && (
            <div className={styles.resultsFade}>
              <ProcessResults
                images={resultImages}
                hideDownload={showImageEditor}
                thumbnailsOnly={showImageEditor && resultImages.length > 1}
                variantBadges={processVariants.map((v) =>
                  v.displayBase === 'saved' ? 'saved' : 'original'
                )}
                {...(resultImages.length > 1
                  ? {
                      activeIndex: activeResultIndex,
                      onActiveIndexChange: handleActiveIndexChange,
                    }
                  : {})}
              />
            </div>
          )}

          {showResultsSoon && !hasImageResults && (
            <div className={styles.textsOnlyNotice} role="status">
              <p>{t('dashboard.resultsSoonHint')}</p>
            </div>
          )}

          {!hasImageResults && !showResultsSoon && hasTextResults && (
            <div className={styles.textsOnlyNotice}>
              <p>{t('dashboard.textsOnlyResultHint')}</p>
            </div>
          )}
        </div>

        {textResultsPanel}
      </div>
    </section>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {phase === 'setup' && setupView}
        {phase === 'results' && resultsView}

        {phase === 'processing' && (
          <PageBlocker
            title={t('dashboard.processingTitle')}
            subtitle={t('dashboard.processingSubtitle')}
            ariaLabel={t('dashboard.processingOverlayAria')}
          />
        )}
      </div>
    </div>
  );
}
