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
  getVariantSave,
  getProcessSavedImageUrl,
} from '../../services/api';
import VariantEditor from '../../features/imageEditor/VariantEditor';
import { buildProcessVariant, type ProcessVariant } from '../../types/processVariant';
import type { TextLayer } from '../../types/infographicEditor';
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
  const [processVariants, setProcessVariants] = useState<ProcessVariant[]>([]);
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
            const images = statusRes.data.result.images;
            const items = statusRes.data.infographicItems ?? [];
            const list: ProcessVariant[] = [];
            for (let i = 0; i < images.length; i++) {
              let variant = buildProcessVariant({
                taskId: d.taskId,
                resultIndex: i,
                originalUrl: images[i],
                infographicItems: items,
              });
              try {
                const saveRes = await getVariantSave(d.taskId, i);
                if (saveRes.success && saveRes.data) {
                  variant = {
                    ...variant,
                    displayBase: 'saved',
                    savedUrl: getProcessSavedImageUrl(d.taskId, i),
                    savedRevision: saveRes.data.revision,
                    textLayers: (saveRes.data.textLayers ?? []) as TextLayer[],
                  };
                }
              } catch {
                /* no save */
              }
              list.push(variant);
            }
            setProcessVariants(list);
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
  const activeVariant = processVariants[activeImage] ?? processVariants[0] ?? null;
  const showEditor = activeVariant != null && activeVariant.infographicItems.length > 0;

  const updateVariant = (id: string, patch: Partial<ProcessVariant>) => {
    setProcessVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

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
        {record.status === 'completed' && processVariants.length > 0 && !showEditor ? (
          <Card className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('dashboard.resultTitle')}</h2>
            {activeVariant && (
              <div className={styles.mediaFrame}>
                <img
                  src={
                    activeVariant.displayBase === 'saved' && activeVariant.savedUrl
                      ? activeVariant.savedUrl
                      : activeVariant.originalUrl
                  }
                  alt={t('dashboard.resultAlt', { n: activeImage + 1 })}
                  className={styles.mediaImage}
                />
              </div>
            )}
            {processVariants.length > 1 && (
              <div className={styles.thumbRow}>
                {processVariants.map((v, idx) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`${styles.thumbBtn} ${activeImage === idx ? styles.thumbBtnActive : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img
                      src={v.displayBase === 'saved' && v.savedUrl ? v.savedUrl : v.originalUrl}
                      alt=""
                      className={styles.thumbImg}
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>
        ) : record.status !== 'completed' || processVariants.length === 0 ? (
          <Card className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('history.createdAt')}</h2>
            <p className={styles.metaInfo}>{formatLocaleDateTime(record.createdAt, localeTag)}</p>
          </Card>
        ) : null}
      </div>

      {record.status === 'completed' && showEditor && activeVariant && (
        <Card className={styles.section}>
          <VariantEditor
            key={activeVariant.id}
            variant={activeVariant}
            variantIndex={activeImage}
            variantCount={processVariants.length}
            onVariantChange={updateVariant}
          />
          {processVariants.length > 1 && (
            <div className={styles.thumbRow}>
              {processVariants.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  className={`${styles.thumbBtn} ${activeImage === idx ? styles.thumbBtnActive : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img
                    src={v.displayBase === 'saved' && v.savedUrl ? v.savedUrl : v.originalUrl}
                    alt=""
                    className={styles.thumbImg}
                  />
                </button>
              ))}
            </div>
          )}
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
