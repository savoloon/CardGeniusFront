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
  const [infographicData, setInfographicData] = useState<{
    imageUrl: string;
    items: InfographicRecommendedItem[];
  } | null>(null);
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

  const clearPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImage(null);
  }, [previewUrl]);

  const handleSelectImage = useCallback((file: File) => {
    clearPreview();
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setQueueStatus(null);
    setResultImages([]);
    setInfographicData(null);
  }, [clearPreview]);

  const handleClear = useCallback(() => {
    clearPreview();
    setError(null);
    setQueueStatus(null);
    setResultImages([]);
    setInfographicData(null);
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
          setResultImages(res.data.result.images);
          const items = res.data.infographicItems;
          if (items && items.length > 0) {
            setInfographicData({
              imageUrl: res.data.result.images[0],
              items,
            });
          } else {
            setInfographicData(null);
          }
          stopPolling();
        }
        if (res.data.status === 'failed') {
          setInfographicData(null);
          stopPolling();
        }
      } catch {
        stopPolling();
        setQueueStatus('failed');
        setInfographicData(null);
      }
    },
    [stopPolling]
  );

  const pollAllTasks = useCallback(
    async (ids: string[]) => {
      let completed = 0;
      const allImages: string[] = [];
      let collectedItems: InfographicRecommendedItem[] | undefined;
      let firstImageForEditor: string | undefined;
      for (const id of ids) {
        try {
          const res = await getProcessStatus(id);
          if (res.success && res.data?.status === 'completed' && res.data.result?.images) {
            allImages.push(...res.data.result.images);
            if (!firstImageForEditor) firstImageForEditor = res.data.result.images[0];
            if (res.data.infographicItems?.length && !collectedItems) {
              collectedItems = res.data.infographicItems;
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
        if (collectedItems && collectedItems.length > 0 && firstImageForEditor) {
          setInfographicData({ imageUrl: firstImageForEditor, items: collectedItems });
        } else {
          setInfographicData(null);
        }
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
    setInfographicData(null);
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

      const taskIds = res.success && res.data?.taskIds?.length
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
      setError(
        apiErr.response?.data?.message ?? t('auth.connectionError')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewTask = () => {
    stopPolling();
    setQueueStatus(null);
    setResultImages([]);
    setInfographicData(null);
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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('dashboard.title')}</h1>
          <p className={styles.subtitle}>{t('dashboard.subtitle')}</p>
        </header>

        <div className={styles.grid}>
          <aside className={styles.sidebar}>
            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepBadge} aria-hidden>1</span>
                <h2 className={styles.stepHeading}>{t('dashboard.stepImage')}</h2>
              </div>
              <ImageUploadZone
                image={image}
                previewUrl={previewUrl}
                onSelect={handleSelectImage}
                onClear={handleClear}
                disabled={submitting}
              />
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepBadge} aria-hidden>2</span>
                <h2 className={styles.stepHeading}>{t('dashboard.stepMode')}</h2>
              </div>
              <ProcessModeSelector
                value={mode}
                onChange={setMode}
                disabled={submitting}
              />
              <div className={styles.stepParamsWrap}>
                <ProcessOptions
                  mode={mode}
                  variants={variants}
                  prompt={prompt}
                  productName={productName}
                  productDescription={productDescription}
                  onVariantsChange={setVariants}
                  onPromptChange={setPrompt}
                  onProductNameChange={setProductName}
                  onProductDescriptionChange={setProductDescription}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className={styles.runCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepBadge} aria-hidden>3</span>
                <h2 className={styles.stepHeading}>{t('dashboard.stepRun')}</h2>
              </div>
              <Button
                className={styles.runButton}
                fullWidth
                loading={submitting}
                disabled={
                  !image ||
                  submitting ||
                  (mode === 'generate_exposition_by_request' && !prompt.trim()) ||
                  (mode === 'generate_infographic' && (!productName.trim() || !productDescription.trim()))
                }
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

            <div className={styles.sectionDivider} aria-hidden="true" />

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
                        <option key={n} value={n}>{n}</option>
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
                        <option key={n} value={n}>{n}</option>
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
                <p className={styles.error} role="alert">{descError}</p>
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
          </aside>

          <section className={styles.workspace}>
            {queueStatus === 'pending' && (
              <div className={styles.workspaceCard}>
                <ProcessQueueStatus status="pending" />
              </div>
            )}

            {queueStatus === 'failed' && (
              <div className={styles.workspaceCard}>
                <ProcessQueueStatus status="failed" />
              </div>
            )}

            {queueStatus === 'completed' && resultImages.length > 0 && (
              <div className={styles.workspaceCard}>
                {infographicData && infographicData.items.length > 0 && (
                  <InfographicEditor
                    imageUrl={infographicData.imageUrl}
                    recommendedItems={infographicData.items}
                  />
                )}
                {infographicData &&
                  infographicData.items.length > 0 &&
                  resultImages.length > 1 && (
                    <p className={styles.infographicVariantsHint}>
                      {t('dashboard.infographicVariantsBelow')}
                    </p>
                  )}
                {(!infographicData || infographicData.items.length === 0 || resultImages.length > 1) && (
                  <ProcessResults images={resultImages} />
                )}
                <Button
                  variant="outline"
                  className={styles.newTaskBtn}
                  onClick={handleNewTask}
                >
                  {t('dashboard.newImage')}
                </Button>
              </div>
            )}

            {!queueStatus && resultImages.length === 0 && (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>◇</span>
                <p>{t('dashboard.emptyHint')}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
