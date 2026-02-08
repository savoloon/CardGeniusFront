import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, Button } from '../components/ui';
import ImageUploadZone from '../components/dashboard/ImageUploadZone';
import ProcessModeSelector from '../components/dashboard/ProcessModeSelector';
import ProcessOptions from '../components/dashboard/ProcessOptions';
import ProcessQueueStatus from '../components/dashboard/ProcessQueueStatus';
import ProcessResults from '../components/dashboard/ProcessResults';
import {
  submitProcess,
  getProcessStatus,
  type ProcessMode,
  type ApiError,
} from '../services/api';
import styles from './DashboardPage.module.css';

const POLL_INTERVAL = 2000;

export default function DashboardPage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<ProcessMode>('remove_background');
  const [variants, setVariants] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [queueStatus, setQueueStatus] = useState<'pending' | 'completed' | 'failed' | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
  }, [clearPreview]);

  const handleClear = useCallback(() => {
    clearPreview();
    setError(null);
    setQueueStatus(null);
    setResultImages([]);
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
          stopPolling();
        }
        if (res.data.status === 'failed') {
          stopPolling();
        }
      } catch {
        stopPolling();
        setQueueStatus('failed');
      }
    },
    [stopPolling]
  );

  const handleSubmit = async () => {
    if (!image) {
      setError('Загрузите изображение');
      return;
    }

    setSubmitting(true);
    setError(null);
    setQueueStatus(null);
    setResultImages([]);
    stopPolling();

    try {
      const res = await submitProcess(image, mode, {
        variants: mode === 'generate_background' ? variants : undefined,
        prompt: mode === 'generate_exposure_by_request' ? prompt : undefined,
      });

      if (res.success && res.data?.taskId) {
        setQueueStatus('pending');
        pollRef.current = setInterval(() => pollTask(res.data!.taskId), POLL_INTERVAL);
      } else {
        setError(res.message ?? 'Ошибка отправки');
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(
        apiErr.response?.data?.message ?? 'Ошибка подключения к серверу'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewTask = () => {
    stopPolling();
    setQueueStatus(null);
    setResultImages([]);
  };

  useEffect(() => () => stopPolling(), [stopPolling]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Обработка изображений</h1>
          <p className={styles.subtitle}>
            Загрузите изображение и выберите режим обработки. AI создаст результат в очереди.
          </p>
        </header>

        <div className={styles.grid}>
          <aside className={styles.sidebar}>
            <Card className={styles.card}>
              <ImageUploadZone
                image={image}
                previewUrl={previewUrl}
                onSelect={handleSelectImage}
                onClear={handleClear}
                disabled={submitting}
              />
            </Card>

            <Card className={styles.card}>
              <ProcessModeSelector
                value={mode}
                onChange={setMode}
                disabled={submitting}
              />
              <ProcessOptions
                mode={mode}
                variants={variants}
                prompt={prompt}
                onVariantsChange={setVariants}
                onPromptChange={setPrompt}
                disabled={submitting}
              />
            </Card>

            <Card className={styles.card}>
              <Button
                fullWidth
                loading={submitting}
                disabled={!image || submitting}
                onClick={handleSubmit}
              >
                Обработать
              </Button>
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
            </Card>
          </aside>

          <section className={styles.workspace}>
            {queueStatus === 'pending' && (
              <Card className={styles.workspaceCard}>
                <ProcessQueueStatus status="pending" />
              </Card>
            )}

            {queueStatus === 'failed' && (
              <Card className={styles.workspaceCard}>
                <ProcessQueueStatus status="failed" />
              </Card>
            )}

            {resultImages.length > 0 && (
              <Card className={styles.workspaceCard}>
                <ProcessResults images={resultImages} />
                <Button
                  variant="outline"
                  className={styles.newTaskBtn}
                  onClick={handleNewTask}
                >
                  Новое изображение
                </Button>
              </Card>
            )}

            {!queueStatus && resultImages.length === 0 && (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>◇</span>
                <p>Загрузите изображение и нажмите «Обработать»</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
