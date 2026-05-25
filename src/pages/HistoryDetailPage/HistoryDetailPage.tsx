import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Button } from '../../components/ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { getProcessModeLabelKey } from '../../constants/processModes';
import { formatLocaleDateTime } from '../../utils/formatDate';
import {
  getHistoryItem,
  getProcessStatus,
  getProcessInputImageUrl,
} from '../../services/api';
import styles from './HistoryDetailPage.module.css';

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLanguage();
  const getErrorMessage = useApiErrorMessage();
  const [record, setRecord] = useState<{
    taskId: string;
    mode: string;
    status: string;
    createdAt: string;
    inputImageBase64?: string | null;
  } | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [infographicItems, setInfographicItems] = useState<Array<{ text: string; position: string }>>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [resultError, setResultError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const localeTag = locale === 'en' ? 'en-US' : 'ru-RU';

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
          setPageError(t('history.notFound'));
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
            setInfographicItems(statusRes.data.infographicItems ?? []);
            setActiveImage(0);
          }
        }
        if (d.status === 'failed') {
          setResultError(t('dashboard.queueFailed'));
        }
      } catch (err) {
        if (!cancelled) {
          setPageError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, t, getErrorMessage]);

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
        <p className={styles.error}>{pageError ?? t('history.notFound')}</p>
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
  const activeResultImage = resultImages[activeImage] ?? resultImages[0] ?? null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link to="/history" className={styles.backLink}>{t('common.back')}</Link>
          <span className={styles.status} data-status={record.status}>{record.status}</span>
        </div>
        <h1 className={styles.title}>{t('history.detailTitle')}</h1>
        <p className={styles.meta}>
          {t(getProcessModeLabelKey(record.mode))}
        </p>
      </header>

      <div className={styles.grid}>
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
        {record.status === 'completed' && resultImages.length > 0 ? (
          <Card className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('dashboard.resultTitle')}</h2>
            {activeResultImage && (
              <div className={styles.mediaFrame}>
                <img src={activeResultImage} alt={t('dashboard.resultAlt', { n: activeImage + 1 })} className={styles.mediaImage} />
              </div>
            )}
            {resultImages.length > 1 && (
              <div className={styles.thumbRow}>
                {resultImages.map((url, idx) => (
                  <button
                    key={`${url.slice(0, 32)}-${idx}`}
                    type="button"
                    className={`${styles.thumbBtn} ${activeImage === idx ? styles.thumbBtnActive : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={url} alt="" className={styles.thumbImg} />
                  </button>
                ))}
              </div>
            )}
          </Card>
        ) : (
          <Card className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('history.createdAt')}</h2>
            <p className={styles.metaInfo}>{formatLocaleDateTime(record.createdAt, localeTag)}</p>
          </Card>
        )}
      </div>

      {record.status === 'completed' && infographicItems.length > 0 && (
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('history.infographicItems')}</h2>
          <div className={styles.infoList}>
            {infographicItems.map((item, idx) => (
              <div key={`${item.position}-${item.text}-${idx}`} className={styles.infoItem}>
                <span className={styles.infoText}>{item.text}</span>
                <span className={styles.infoPos}>{item.position}</span>
              </div>
            ))}
          </div>
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
