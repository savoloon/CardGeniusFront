import { useCallback, useRef } from 'react';
import styles from './ImageUploadZone.module.css';

interface ImageUploadZoneProps {
  image: File | null;
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_SIZE = 10 * 1024 * 1024;

export default function ImageUploadZone({
  image,
  previewUrl,
  onSelect,
  onClear,
  disabled,
}: ImageUploadZoneProps) {
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
        className={`${styles.zone} ${image ? styles.zoneFilled : ''} ${disabled ? styles.disabled : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label="Загрузить изображение"
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
            <img src={previewUrl} alt="Превью" />
            {!disabled && (
              <span className={styles.hint}>Нажмите или перетащите для замены</span>
            )}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.icon}>↗</span>
            <span className={styles.text}>Загрузить изображение</span>
            <span className={styles.sub}>JPEG, PNG, WebP до 10 МБ</span>
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
          Удалить
        </button>
      )}
    </div>
  );
}
