import type { ProcessMode } from '../../../services/api';
import { PROCESS_MODE_OPTIONS } from '../../../constants/processModes';
import { Checkbox } from '../../ui';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './ProcessModeSelector.module.css';

interface ProcessModeSelectorProps {
  value: ProcessMode;
  onChange: (mode: ProcessMode) => void;
  includeCardTexts?: boolean;
  onIncludeCardTextsChange?: (value: boolean) => void;
  disabled?: boolean;
  /** Hide the built-in section heading when the parent already provides a label */
  hideSectionTitle?: boolean;
  /** Denser mode grid for wide dashboard layout */
  dense?: boolean;
}

export default function ProcessModeSelector({
  value,
  onChange,
  includeCardTexts = false,
  onIncludeCardTextsChange,
  disabled,
  hideSectionTitle,
  dense,
}: ProcessModeSelectorProps) {
  const { t } = useLanguage();
  return (
    <div className={`${styles.wrapper} ${dense ? styles.wrapperDense : ''}`}>
      {!hideSectionTitle && (
        <h3 className={styles.sectionTitle}>{t('dashboard.stepMode')}</h3>
      )}
      {!hideSectionTitle && (
        <label className={styles.label} id="mode-label">
          {t('dashboard.modeLabel')}
        </label>
      )}
      <div
        className={styles.grid}
        role="group"
        aria-label={hideSectionTitle ? t('dashboard.modeLabel') : undefined}
        aria-labelledby={hideSectionTitle ? undefined : 'mode-label'}
      >
        {PROCESS_MODE_OPTIONS.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={`${styles.option} ${value === mode.value ? styles.active : ''}`}
            onClick={() => !disabled && onChange(mode.value)}
            disabled={disabled}
            aria-pressed={value === mode.value}
          >
            {t(`dashboard.${mode.labelKey}`)}
          </button>
        ))}
      </div>
      {onIncludeCardTextsChange && (
        <div className={styles.cardTextsAddon}>
          <Checkbox
            label={t('dashboard.includeCardTexts')}
            checked={includeCardTexts}
            onChange={(e) => !disabled && onIncludeCardTextsChange(e.target.checked)}
            disabled={disabled}
          />
          <p className={styles.cardTextsHint}>{t('dashboard.includeCardTextsHint')}</p>
        </div>
      )}
    </div>
  );
}
