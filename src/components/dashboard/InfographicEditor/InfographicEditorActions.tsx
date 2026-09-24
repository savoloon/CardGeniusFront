import { useState } from 'react';
import { Button } from '../../ui';
import { useLanguage } from '../../../contexts/LanguageContext';
import { exportAndDownloadInfographic } from '../../../utils/exportInfographicImage';
import type { TextLayer } from '../../../types/infographicEditor';
import styles from './InfographicEditor.module.css';

interface InfographicEditorActionsProps {
  variantIndex: number;
  variantCount: number;
  imageUrl: string;
  layers: TextLayer[];
  getDisplayWidth: () => number;
  disabled?: boolean;
}

export default function InfographicEditorActions({
  variantIndex,
  variantCount,
  imageUrl,
  layers,
  getDisplayWidth,
  disabled = false,
}: InfographicEditorActionsProps) {
  const { t } = useLanguage();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleDownload = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await exportAndDownloadInfographic({
        imageUrl,
        layers,
        displayWidth: getDisplayWidth(),
        filename: `infographic-variant-${variantIndex + 1}.png`,
      });
    } catch {
      setExportError(t('dashboard.downloadResultError'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={styles.actionBar}>
      <div className={styles.actionBarMeta}>
        <span className={styles.actionBarTitle}>{t('dashboard.infographicEditorTitle')}</span>
        {variantCount > 1 && (
          <span className={styles.actionBarVariant}>
            {t('dashboard.infographicVariantOf', {
              current: variantIndex + 1,
              total: variantCount,
            })}
          </span>
        )}
      </div>
      <Button
        type="button"
        className={styles.downloadResultBtn}
        loading={exporting}
        disabled={disabled || !imageUrl || exporting}
        onClick={handleDownload}
      >
        {t('dashboard.downloadResult')}
      </Button>
      {exportError && (
        <p className={styles.exportError} role="alert">
          {exportError}
        </p>
      )}
    </div>
  );
}
