import { useCallback, useRef } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './ImageUploadZone.module.css';

interface ImageUploadZoneProps {
  image: File | null;
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
  /** Shorter drop zone for dense sidebars */
  compact?: boolean;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_SIZE = 10 * 1024 * 1024;

export default function ImageUploadZone({
  image,
  previewUrl,
  onSelect,
  onClear,
  disabled,
  compact,
}: ImageUploadZoneProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > MAX_SIZE) return;
      onSelect(file);
    },
    [onSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.zone} ${compact ? styles.zoneCompact : ''} ${image ? styles.zoneFilled : ''} ${disabled ? styles.disabled : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label={t('dashboard.uploadAria')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleChange}
          className={styles.input}
          aria-hidden
        />
        {previewUrl ? (
          <div className={styles.preview}>
            <img src={previewUrl} alt={t('dashboard.uploadPreview')} />
            {!disabled && (
              <span className={styles.hint}>{t('dashboard.uploadHint')}</span>
            )}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.icon}>↗</span>
            <span className={styles.text}>{t('dashboard.uploadImage')}</span>
            <span className={styles.sub}>{t('dashboard.uploadFormats')}</span>
          </div>
        )}
      </div>
      {image && !disabled && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          {t('dashboard.clear')}
        </button>
      )}
    </div>
  );
}
