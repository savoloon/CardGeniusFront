import type { ProcessMode } from '../../../services/api';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './ProcessModeSelector.module.css';

const MODE_KEYS: { value: ProcessMode; labelKey: string }[] = [
  { value: 'remove_background', labelKey: 'modeRemoveBg' },
  { value: 'generate_background', labelKey: 'modeGenerateBg' },
  { value: 'generate_exposure', labelKey: 'modeGenerateExposure' },
  { value: 'generate_exposition_by_request', labelKey: 'modeExposureByRequest' },
  { value: 'improve_image', labelKey: 'modeImprove' },
  { value: 'generate_infographic', labelKey: 'modeInfographic' },
];

interface ProcessModeSelectorProps {
  value: ProcessMode;
  onChange: (mode: ProcessMode) => void;
  disabled?: boolean;
}

export default function ProcessModeSelector({
  value,
  onChange,
  disabled,
}: ProcessModeSelectorProps) {
  const { t } = useLanguage();
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>{t('dashboard.stepMode')}</h3>
      <label className={styles.label} id="mode-label">{t('dashboard.modeLabel')}</label>
      <div className={styles.grid} role="group" aria-labelledby="mode-label">
        {MODE_KEYS.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={`${styles.option} ${value === mode.value ? styles.active : ''}`}
            onClick={() => !disabled && onChange(mode.value)}
            disabled={disabled}
          >
            {t(`dashboard.${mode.labelKey}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
