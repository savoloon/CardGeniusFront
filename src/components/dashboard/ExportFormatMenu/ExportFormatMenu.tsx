import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EXPORT_IMAGE_FORMATS,
  type ExportImageFormat,
} from '../../../features/imageEditor/composeExport';
import styles from './ExportFormatMenu.module.css';

interface ExportFormatMenuProps {
  quality: number;
  onQualityChange: (quality: number) => void;
  onSelect: (format: ExportImageFormat) => void;
}

const FORMAT_LABEL_KEY: Record<ExportImageFormat, string> = {
  png: 'dashboard.exportPng',
  jpeg: 'dashboard.exportJpeg',
  webp: 'dashboard.exportWebp',
};

export default function ExportFormatMenu({
  quality,
  onQualityChange,
  onSelect,
}: ExportFormatMenuProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.menu} role="menu" aria-label={t('dashboard.chooseExportFormat')}>
      <p className={styles.title}>{t('dashboard.chooseExportFormat')}</p>
      <div className={styles.formats}>
        {EXPORT_IMAGE_FORMATS.map((format) => (
          <button
            key={format}
            type="button"
            role="menuitem"
            className={styles.formatBtn}
            onClick={() => onSelect(format)}
          >
            {t(FORMAT_LABEL_KEY[format])}
          </button>
        ))}
      </div>
      <label className={styles.quality}>
        {t('dashboard.exportQuality')}
        <input
          type="range"
          min={60}
          max={100}
          value={Math.round(quality * 100)}
          onChange={(e) => onQualityChange(Number(e.target.value) / 100)}
        />
        <span className={styles.qualityHint}>{t('dashboard.exportQualityHint')}</span>
      </label>
    </div>
  );
}
