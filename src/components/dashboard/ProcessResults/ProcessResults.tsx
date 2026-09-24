import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './ProcessResults.module.css';

interface ProcessResultsProps {
  images: string[];
  onDownload?: (url: string, index: number) => void;
  /** When set with multiple images, show one main preview + thumbnail strip (controlled) */
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  hideTitle?: boolean;
  /** Hide per-image download when composite export is available in editor */
  hideDownload?: boolean;
  /** Show only thumbnail strip (variant switcher), no large preview */
  thumbnailsOnly?: boolean;
  variantBadges?: Array<'original' | 'saved'>;
}

export default function ProcessResults({
  images,
  onDownload,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  hideTitle = false,
  hideDownload = false,
  thumbnailsOnly = false,
  variantBadges,
}: ProcessResultsProps) {
  const { t } = useLanguage();
  if (images.length === 0) return null;

  const handleDownload = (url: string, index: number) => {
    if (onDownload) {
      onDownload(url, index);
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = `result-${index + 1}.png`;
      a.click();
    }
  };

  const useVariantUi =
    images.length > 1 && controlledIndex !== undefined && onActiveIndexChange !== undefined;
  const idx = useVariantUi
    ? Math.min(Math.max(0, controlledIndex), images.length - 1)
    : 0;

  if (useVariantUi) {
    const url = images[idx];
    return (
      <div className={styles.wrapper}>
        {!hideTitle && !thumbnailsOnly && (
          <h3 className={styles.title}>{t('dashboard.resultTitle')}</h3>
        )}
        {!thumbnailsOnly && (
          <div className={styles.singleMain}>
            <div className={styles.imgWrap}>
              <img src={url} alt={t('dashboard.resultAlt', { n: idx + 1 })} className={styles.img} />
            </div>
            {!hideDownload && (
              <button
                type="button"
                className={styles.downloadBtn}
                onClick={() => handleDownload(url, idx)}
              >
                {t('dashboard.download')}
              </button>
            )}
          </div>
        )}
        <div className={styles.thumbRow} role="tablist" aria-label={t('dashboard.variantStripAria')}>
          {images.map((thumbUrl, i) => (
            <button
              key={`${thumbUrl}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === idx}
              className={`${styles.thumbBtn} ${i === idx ? styles.thumbBtnActive : ''}`}
              onClick={() => onActiveIndexChange(i)}
            >
              <img src={thumbUrl} alt="" className={styles.thumbImg} />
              {variantBadges?.[i] === 'saved' && (
                <span className={styles.thumbBadge}>{t('dashboard.badgeSavedShort')}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {!hideTitle && <h3 className={styles.title}>{t('dashboard.resultTitle')}</h3>}
      <div className={styles.grid}>
        {images.map((url, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.imgWrap}>
              <img src={url} alt={t('dashboard.resultAlt', { n: i + 1 })} className={styles.img} />
            </div>
            {!hideDownload && (
              <button
                type="button"
                className={styles.downloadBtn}
                onClick={() => handleDownload(url, i)}
              >
                {t('dashboard.download')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
