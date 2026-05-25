import type { ProcessMode } from '../../../services/api';
import { PROCESS_MODE_OPTIONS } from '../../../constants/processModes';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './ProcessModeSelector.module.css';

interface ProcessModeSelectorProps {
  value: ProcessMode;
  onChange: (mode: ProcessMode) => void;
  disabled?: boolean;
  /** Hide the built-in section heading when the parent already provides a label */
  hideSectionTitle?: boolean;
}

export default function ProcessModeSelector({
  value,
  onChange,
  disabled,
  hideSectionTitle,
}: ProcessModeSelectorProps) {
  const { t } = useLanguage();
  return (
    <div className={styles.wrapper}>
      {!hideSectionTitle && (
        <h3 className={styles.sectionTitle}>{t('dashboard.stepMode')}</h3>
      )}
      <label className={styles.label} id="mode-label">{t('dashboard.modeLabel')}</label>
      <div className={styles.grid} role="group" aria-labelledby="mode-label">
        {PROCESS_MODE_OPTIONS.map((mode) => (
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
