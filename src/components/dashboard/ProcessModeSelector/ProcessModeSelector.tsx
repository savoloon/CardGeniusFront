import type { ProcessMode } from '../../../services/api';
import styles from './ProcessModeSelector.module.css';

const MODES: { value: ProcessMode; label: string; short?: string }[] = [
  { value: 'remove_background', label: 'Удалить фон' },
  { value: 'generate_background', label: 'Сгенерировать фон', short: 'Фон' },
  { value: 'generate_exposure', label: 'Сгенерировать экспозицию (подходящую)' },
  { value: 'generate_exposure_by_request', label: 'Экспозиция по запросу' },
  { value: 'improve_image', label: 'Улучшить изображение' },
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
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Режим обработки</label>
      <div className={styles.grid}>
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={`${styles.option} ${value === mode.value ? styles.active : ''}`}
            onClick={() => !disabled && onChange(mode.value)}
            disabled={disabled}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
