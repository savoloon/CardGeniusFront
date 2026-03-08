import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Button } from '../../components/ui';
import ProcessResults from '../../components/dashboard/ProcessResults/ProcessResults';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getHistoryItem,
  getProcessStatus,
  getProcessInputImageUrl,
  type ApiError,
} from '../../services/api';
import styles from './HistoryDetailPage.module.css';

const MODE_KEYS: Record<string, string> = {
  remove_background: 'dashboard.modeRemoveBg',
  generate_background: 'dashboard.modeGenerateBg',
  generate_exposure: 'dashboard.modeGenerateExposure',
  generate_exposition_by_request: 'dashboard.modeExposureByRequest',
  improve_image: 'dashboard.modeImprove',
};

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [record, setRecord] = useState<{
    taskId: string;
    mode: string;
    status: string;
    createdAt: string;
    inputImageBase64?: string | null;
  } | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [resultError, setResultError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPageError(null);
      try {
        const res = await getHistoryItem(Number(id));
        if (cancelled) return;
        if (!res.success || !res.data) {
          setPageError('Analysis not found');
          return;
        }
        const d = res.data;
        setRecord({
          taskId: d.taskId,
          mode: d.mode,
          status: d.status,
          createdAt: d.createdAt,
          inputImageBase64: d.inputImageBase64 ?? null,
        });
        if (d.status === 'completed') {
          const statusRes = await getProcessStatus(d.taskId);
          if (!cancelled && statusRes.success && statusRes.data?.result?.images) {
            setResultImages(statusRes.data.result.images);
          }
        }
        if (d.status === 'failed') {
          const statusRes = await getProcessStatus(d.taskId);
          if (!cancelled && statusRes.success && statusRes.data?.error) {
            setResultError(statusRes.data.error);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const apiErr = err as ApiError;
          setPageError(apiErr.response?.data?.message ?? t('auth.connectionError'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, t]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>{t('admin.loading')}</p>
      </div>
    );
  }

  if (pageError || !record) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{pageError ?? 'Not found'}</p>
        <Link to="/history" className={styles.backLink}>
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>
    );
  }

  const inputImageSrc =
    record.inputImageBase64
      ? `data:image/png;base64,${record.inputImageBase64}`
      : getProcessInputImageUrl(record.taskId);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/history" className={styles.backLink}>{t('common.back')}</Link>
        <h1 className={styles.title}>{t('history.detailTitle')}</h1>
        <p className={styles.meta}>
          {t(MODE_KEYS[record.mode] ?? record.mode)} · {record.status}
        </p>
      </header>

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('history.originalImage')}</h2>
        <div className={styles.imgWrap}>
          <img
            src={inputImageSrc}
            alt={t('history.originalImage')}
            className={styles.img}
          />
        </div>
      </Card>

      {record.status === 'completed' && resultImages.length > 0 && (
        <Card className={styles.section}>
          <ProcessResults images={resultImages} />
        </Card>
      )}

      {record.status === 'failed' && (
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('dashboard.queueFailed')}</h2>
          {resultError && <p className={styles.errorText}>{resultError}</p>}
        </Card>
      )}

      {record.status === 'pending' && (
        <Card className={styles.section}>
          <p className={styles.pendingText}>{t('dashboard.queuePending')}</p>
          <p className={styles.pendingHint}>{t('dashboard.queueWait')}</p>
        </Card>
      )}
    </div>
  );
}
