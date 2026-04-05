import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Input } from '../../components/ui';
import { useLanguage } from '../../contexts/LanguageContext';
import ImageUploadZone from '../../components/dashboard/ImageUploadZone';
import ProcessModeSelector from '../../components/dashboard/ProcessModeSelector';
import ProcessOptions from '../../components/dashboard/ProcessOptions';
import ProcessQueueStatus from '../../components/dashboard/ProcessQueueStatus';
import ProcessResults from '../../components/dashboard/ProcessResults';
import InfographicEditor, {
  type InfographicRecommendedItem,
} from '../../components/dashboard/InfographicEditor';
import {
  submitProcess,
  getProcessStatus,
  generateDescription as apiGenerateDescription,
  type ProcessMode,
  type ApiError,
} from '../../services/api';
import styles from './DashboardPage.module.css';

const POLL_INTERVAL = 2000;
const NARROW_BREAKPOINT = 900;

type MainTab = 'process' | 'copy';
type MobileWorkspaceTab = 'canvas' | 'controls';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<ProcessMode>('remove_background');
  const [variants, setVariants] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [queueStatus, setQueueStatus] = useState<'pending' | 'completed' | 'failed' | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  /** Recommended texts per result image index (parallel to resultImages) */
  const [infographicItemsByVariant, setInfographicItemsByVariant] = useState<
    InfographicRecommendedItem[][]
  >([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [descProductName, setDescProductName] = useState('');
  const [descProductDescription, setDescProductDescription] = useState('');
  const [descBatchTitle, setDescBatchTitle] = useState(1);
  const [descBatchDescription, setDescBatchDescription] = useState(1);
  const [descLoading, setDescLoading] = useState(false);
  const [descError, setDescError] = useState<string | null>(null);
  const [descTitles, setDescTitles] = useState<string[]>([]);
  const [descDescriptions, setDescDescriptions] = useState<string[]>([]);

  const [mainTab, setMainTab] = useState<MainTab>('process');
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<MobileWorkspaceTab>('canvas');
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth < NARROW_BREAKPOINT : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${NARROW_BREAKPOINT - 1}px)`);
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const clearPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImage(null);
  }, [previewUrl]);

  const handleSelectImage = useCallback(
    (file: File) => {
      clearPreview();
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setQueueStatus(null);
      setResultImages([]);
      setInfographicItemsByVariant([]);
      setActiveResultIndex(0);
    },
    [clearPreview]
  );

  const handleClear = useCallback(() => {
    clearPreview();
    setError(null);
    setQueueStatus(null);
    setResultImages([]);
    setInfographicItemsByVariant([]);
    setActiveResultIndex(0);
  }, [clearPreview]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollTask = useCallback(
    async (id: string) => {
      try {
        const res = await getProcessStatus(id);
        if (!res.success || !res.data) return;
        setQueueStatus(res.data.status);
        if (res.data.status === 'completed' && res.data.result?.images) {
          const imgs = res.data.result.images;
          const items = res.data.infographicItems ?? [];
          const itemCopy = items.length > 0 ? [...items] : [];
          setResultImages(imgs);
          setActiveResultIndex(0);
          setInfographicItemsByVariant(imgs.map(() => [...itemCopy]));
          stopPolling();
        }
        if (res.data.status === 'failed') {
          setResultImages([]);
          setInfographicItemsByVariant([]);
          setActiveResultIndex(0);
          stopPolling();
        }
      } catch {
        stopPolling();
        setQueueStatus('failed');
        setInfographicItemsByVariant([]);
      }
    },
    [stopPolling]
  );

  const pollAllTasks = useCallback(
    async (ids: string[]) => {
      let completed = 0;
      const allImages: string[] = [];
      const itemsMatrix: InfographicRecommendedItem[][] = [];
      for (const id of ids) {
        try {
          const res = await getProcessStatus(id);
          if (res.success && res.data?.status === 'completed' && res.data.result?.images) {
            const imgs = res.data.result.images;
            const rawItems = res.data.infographicItems ?? [];
            const itemCopy = rawItems.length > 0 ? [...rawItems] : [];
            for (const _u of imgs) {
              allImages.push(_u);
              itemsMatrix.push([...itemCopy]);
            }
            completed += 1;
          } else if (res.success && res.data?.status === 'failed') {
            completed += 1;
          }
        } catch {
          completed += 1;
        }
      }
      if (completed === ids.length) {
        stopPolling();
        setQueueStatus(allImages.length > 0 ? 'completed' : 'failed');
        setResultImages(allImages);
        setActiveResultIndex(0);
        setInfographicItemsByVariant(
          allImages.map((_, i) => itemsMatrix[i] ?? [])
        );
      }
    },
    [stopPolling]
  );

  const handleSubmit = async () => {
    if (!image) {
      setError(t('dashboard.uploadImageError'));
      return;
    }
    if (mode === 'generate_exposition_by_request' && !prompt.trim()) {
      setError(t('dashboard.enterExpositionPrompt'));
      return;
    }
    if (mode === 'generate_infographic' && (!productName.trim() || !productDescription.trim())) {
      setError(t('dashboard.infographicNameDescRequired'));
      return;
    }

    setSubmitting(true);
    setError(null);
    setQueueStatus(null);
    setResultImages([]);
    setInfographicItemsByVariant([]);
    setActiveResultIndex(0);
    stopPolling();

    try {
      const res = await submitProcess(image, mode, {
        variants:
          mode === 'generate_background' ||
          mode === 'generate_exposure' ||
          mode === 'generate_exposition_by_request' ||
          mode === 'generate_infographic'
            ? variants
            : undefined,
        prompt:
          mode === 'generate_exposition_by_request' || mode === 'generate_infographic'
            ? prompt
            : undefined,
        productName: mode === 'generate_infographic' ? productName.trim() : undefined,
        productDescription: mode === 'generate_infographic' ? productDescription.trim() : undefined,
      });

      const taskIds =
        res.success && res.data?.taskIds?.length
          ? res.data.taskIds
          : res.data?.taskId
            ? [res.data.taskId]
            : [];
      if (res.success && taskIds.length > 0) {
        setQueueStatus('pending');
        if (taskIds.length === 1) {
          pollRef.current = setInterval(() => pollTask(taskIds[0]), POLL_INTERVAL);
        } else {
          pollRef.current = setInterval(() => pollAllTasks(taskIds), POLL_INTERVAL);
        }
      } else {
        setError(res.message ?? t('dashboard.submitError'));
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.message ?? t('auth.connectionError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewTask = () => {
    stopPolling();
    setQueueStatus(null);
    setResultImages([]);
    setInfographicItemsByVariant([]);
    setActiveResultIndex(0);
  };

  useEffect(() => () => stopPolling(), [stopPolling]);

  const handleGenerateDescription = async () => {
    const name = descProductName.trim();
    const desc = descProductDescription.trim();
    if (!name || !desc) return;
    setDescLoading(true);
    setDescError(null);
    setDescTitles([]);
    setDescDescriptions([]);
    try {
      const res = await apiGenerateDescription(name, desc, {
        batchSizeTitle: descBatchTitle,
        batchSizeDescription: descBatchDescription,
      });
      if (res.success && res.data) {
        setDescTitles(res.data.titles || []);
        setDescDescriptions(res.data.descriptions || []);
      } else {
        setDescError(res.message ?? t('dashboard.descriptionError'));
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setDescError(apiErr.response?.data?.message ?? t('dashboard.descriptionError'));
    } finally {
      setDescLoading(false);
    }
  };

  const isProcessing = submitting || queueStatus === 'pending';

  const processDisabled =
    !image ||
    isProcessing ||
    (mode === 'generate_exposition_by_request' && !prompt.trim()) ||
    (mode === 'generate_infographic' && (!productName.trim() || !productDescription.trim()));

  const activeImageUrl = resultImages[activeResultIndex] ?? '';
  const activeInfographicItems = infographicItemsByVariant[activeResultIndex] ?? [];
  const showInfographicEditor = activeInfographicItems.length > 0;

  const optionsProps = {
    mode,
    variants,
    prompt,
    productName,
    productDescription,
    onVariantsChange: setVariants,
    onPromptChange: setPrompt,
    onProductNameChange: setProductName,
    onProductDescriptionChange: setProductDescription,
    disabled: isProcessing,
    hideSectionTitle: true as const,
  };

  const optionsAccordion = (
    <details className={styles.paramDetails} open>
      <summary className={styles.paramSummary}>{t('dashboard.stepParams')}</summary>
      <div className={styles.paramBody}>
        <ProcessOptions {...optionsProps} className={styles.optionsEmbed} />
      </div>
    </details>
  );

  const pipelineUpload = (
    <div className={styles.pipelineSection}>
      <div className={styles.stepHeader}>
        <span className={styles.stepBadge} aria-hidden>
          1
        </span>
        <h2 className={styles.stepHeading}>{t('dashboard.stepImage')}</h2>
      </div>
      <ImageUploadZone
        image={image}
        previewUrl={previewUrl}
        onSelect={handleSelectImage}
        onClear={handleClear}
        disabled={isProcessing}
        compact
      />
    </div>
  );

  const pipelineMode = (
    <div className={styles.pipelineSection}>
      <div className={styles.stepHeader}>
        <span className={styles.stepBadge} aria-hidden>
          2
        </span>
        <h2 className={styles.stepHeading}>{t('dashboard.stepMode')}</h2>
      </div>
      <ProcessModeSelector
        value={mode}
        onChange={setMode}
        disabled={isProcessing}
        hideSectionTitle
      />
    </div>
  );

  const pipelineRun = (
    <>
      <div className={styles.pipelineDivider} aria-hidden />
      <div className={styles.pipelineSection}>
        <div className={styles.stepHeader}>
          <span className={styles.stepBadge} aria-hidden>
            3
          </span>
          <h2 className={styles.stepHeading}>{t('dashboard.stepRun')}</h2>
        </div>
        <Button
          className={styles.runButton}
          fullWidth
          loading={isProcessing}
          disabled={processDisabled}
          onClick={handleSubmit}
        >
          {t('dashboard.process')}
        </Button>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </>
  );

  const leftRailDesktop = (
    <div className={styles.pipelineCard}>
      {pipelineUpload}
      <div className={styles.pipelineDivider} aria-hidden />
      {pipelineMode}
      {pipelineRun}
    </div>
  );

  const mobileControlsColumn = (
    <div className={styles.pipelineCard}>
      {pipelineUpload}
      <div className={styles.pipelineDivider} aria-hidden />
      {pipelineMode}
      <div className={styles.pipelineDivider} aria-hidden />
      {optionsAccordion}
      {pipelineRun}
    </div>
  );

  const workspaceBody = (
    <>
      {queueStatus === 'pending' && (
        <div
          className={styles.stageFrame}
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label={t('dashboard.stageSkeletonAria')}
        >
          <div className={styles.stageSkeleton} aria-hidden />
          <div className={styles.workspaceCardInner}>
            <ProcessQueueStatus status="pending" />
          </div>
        </div>
      )}

      {queueStatus === 'failed' && (
        <div className={styles.stageFrame}>
          <div className={styles.workspaceCardInner}>
            <ProcessQueueStatus status="failed" />
          </div>
        </div>
      )}

      {queueStatus === 'completed' && resultImages.length > 0 && (
        <div className={`${styles.stageFrame} ${styles.stageFrameResults}`}>
          <div className={styles.workspaceCardInner}>
            {showInfographicEditor && activeImageUrl && (
              <InfographicEditor
                key={activeImageUrl}
                imageUrl={activeImageUrl}
                recommendedItems={activeInfographicItems}
              />
            )}
            <div className={styles.resultsFade}>
              <ProcessResults
                images={resultImages}
                {...(resultImages.length > 1
                  ? {
                      activeIndex: activeResultIndex,
                      onActiveIndexChange: setActiveResultIndex,
                    }
                  : {})}
              />
            </div>
            <Button variant="outline" className={styles.newTaskBtn} onClick={handleNewTask}>
              {t('dashboard.newImage')}
            </Button>
          </div>
        </div>
      )}

      {!queueStatus && resultImages.length === 0 && (
        <div className={styles.stageFrame}>
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden>
              ◇
            </span>
            <p>{t('dashboard.emptyHint')}</p>
          </div>
        </div>
      )}
    </>
  );

  const copyPanel = (
    <div className={styles.cardDescription}>
      <h2 className={styles.stepHeading}>{t('dashboard.descriptionSectionTitle')}</h2>
      <p className={styles.descriptionSubtitle}>{t('dashboard.descriptionSectionSubtitle')}</p>
      <div className={styles.descriptionFields}>
        <Input
          label={t('dashboard.productNameLabel')}
          placeholder={t('dashboard.productNamePlaceholder')}
          value={descProductName}
          onChange={(e) => setDescProductName(e.target.value)}
          disabled={descLoading}
        />
        <Input
          label={t('dashboard.productDescriptionLabel')}
          placeholder={t('dashboard.productDescriptionPlaceholder')}
          value={descProductDescription}
          onChange={(e) => setDescProductDescription(e.target.value)}
          disabled={descLoading}
        />
        <div className={styles.batchRow}>
          <label className={styles.batchLabel}>
            <span>{t('dashboard.batchSizeTitleLabel')}</span>
            <select
              value={descBatchTitle}
              onChange={(e) => setDescBatchTitle(Number(e.target.value))}
              disabled={descLoading}
              className={styles.batchSelect}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.batchLabel}>
            <span>{t('dashboard.batchSizeDescriptionLabel')}</span>
            <select
              value={descBatchDescription}
              onChange={(e) => setDescBatchDescription(Number(e.target.value))}
              disabled={descLoading}
              className={styles.batchSelect}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <Button
        fullWidth
        loading={descLoading}
        disabled={!descProductName.trim() || !descProductDescription.trim() || descLoading}
        onClick={handleGenerateDescription}
      >
        {t('dashboard.generateDescriptionBtn')}
      </Button>
      {descError && (
        <p className={styles.error} role="alert">
          {descError}
        </p>
      )}
      {(descTitles.length > 0 || descDescriptions.length > 0) && (
        <div className={styles.descriptionResults}>
          {descTitles.length > 0 && (
            <div className={styles.descriptionBlock}>
              <h3 className={styles.descriptionBlockTitle}>{t('dashboard.titlesResult')}</h3>
              <ul className={styles.descriptionList}>
                {descTitles.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </div>
          )}
          {descDescriptions.length > 0 && (
            <div className={styles.descriptionBlock}>
              <h3 className={styles.descriptionBlockTitle}>{t('dashboard.descriptionsResult')}</h3>
              <ul className={styles.descriptionList}>
                {descDescriptions.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>{t('dashboard.title')}</h1>
          </div>
          <p className={styles.subtitle}>{t('dashboard.subtitle')}</p>
        </header>

        <div
          className={styles.mainTabs}
          role="tablist"
          aria-label={t('dashboard.mainTabsAria')}
        >
          <button
            type="button"
            role="tab"
            id="tab-main-process"
            aria-selected={mainTab === 'process'}
            aria-controls="panel-main-process"
            tabIndex={mainTab === 'process' ? 0 : -1}
            className={`${styles.mainTab} ${mainTab === 'process' ? styles.mainTabActive : ''}`}
            onClick={() => setMainTab('process')}
          >
            {t('dashboard.tabMainProcess')}
          </button>
          <button
            type="button"
            role="tab"
            id="tab-main-copy"
            aria-selected={mainTab === 'copy'}
            aria-controls="panel-main-copy"
            tabIndex={mainTab === 'copy' ? 0 : -1}
            className={`${styles.mainTab} ${mainTab === 'copy' ? styles.mainTabActive : ''}`}
            onClick={() => setMainTab('copy')}
          >
            {t('dashboard.tabMainCopy')}
          </button>
        </div>

        {mainTab === 'copy' && (
          <div
            id="panel-main-copy"
            role="tabpanel"
            aria-labelledby="tab-main-copy"
            className={styles.copyPanelWrap}
          >
            {copyPanel}
          </div>
        )}

        {mainTab === 'process' && (
          <div
            id="panel-main-process"
            role="tabpanel"
            aria-labelledby="tab-main-process"
            className={styles.processPanel}
          >
            {isNarrow && (
              <div
                className={styles.workspaceTabs}
                role="tablist"
                aria-label={t('dashboard.workspaceTabsAria')}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobileWorkspaceTab === 'canvas'}
                  className={`${styles.workspaceTab} ${mobileWorkspaceTab === 'canvas' ? styles.workspaceTabActive : ''}`}
                  onClick={() => setMobileWorkspaceTab('canvas')}
                >
                  {t('dashboard.tabCanvas')}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobileWorkspaceTab === 'controls'}
                  className={`${styles.workspaceTab} ${mobileWorkspaceTab === 'controls' ? styles.workspaceTabActive : ''}`}
                  onClick={() => setMobileWorkspaceTab('controls')}
                >
                  {t('dashboard.tabControls')}
                </button>
              </div>
            )}

            <div className={styles.shellWrap}>
              <div className={styles.shell}>
                {!isNarrow && (
                  <aside className={styles.leftRail} aria-label={t('dashboard.pipelinePanelAria')}>
                    {leftRailDesktop}
                  </aside>
                )}

                {isNarrow && mobileWorkspaceTab === 'controls' && (
                  <div className={styles.controlsColumn}>{mobileControlsColumn}</div>
                )}

                {(!isNarrow || mobileWorkspaceTab === 'canvas') && (
                  <section className={styles.stage} aria-label={t('dashboard.tabCanvas')}>
                    {workspaceBody}
                  </section>
                )}

                {!isNarrow && (
                  <aside className={styles.rightRail} aria-label={t('dashboard.paramsPanelAria')}>
                    <div className={styles.rightRailInner}>{optionsAccordion}</div>
                  </aside>
                )}
              </div>
              {isProcessing && (
                <div
                  className={styles.busyOverlay}
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                  aria-label={t('dashboard.processingOverlayAria')}
                />
              )}
            </div>

            {isNarrow && mobileWorkspaceTab === 'canvas' && (
              <div className={styles.mobileStickyBar}>
                {isProcessing ? (
                  <Button type="button" fullWidth loading disabled>
                    {t('dashboard.process')}
                  </Button>
                ) : processDisabled ? (
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => setMobileWorkspaceTab('controls')}
                  >
                    {t('dashboard.mobileOpenControls')}
                  </Button>
                ) : (
                  <Button type="button" fullWidth onClick={handleSubmit}>
                    {t('dashboard.process')}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
