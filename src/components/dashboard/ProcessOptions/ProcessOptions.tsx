import type { ProcessMode } from '../../../services/api';
import { Input } from '../../ui';
import styles from './ProcessOptions.module.css';

interface ProcessOptionsProps {
  mode: ProcessMode;
  variants: number;
  prompt: string;
  onVariantsChange: (n: number) => void;
  onPromptChange: (s: string) => void;
  disabled?: boolean;
}

export default function ProcessOptions({
  mode,
  variants,
  prompt,
  onVariantsChange,
  onPromptChange,
  disabled,
}: ProcessOptionsProps) {
  if (mode !== 'generate_background' && mode !== 'generate_exposure_by_request') {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      {mode === 'generate_background' && (
        <div className={styles.field}>
          <label className={styles.label}>Количество вариантов (1–5)</label>
          <div className={styles.variants}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.variantBtn} ${variants === n ? styles.active : ''}`}
                onClick={() => !disabled && onVariantsChange(n)}
                disabled={disabled}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
      {mode === 'generate_exposure_by_request' && (
        <div className={styles.field}>
          <Input
            label="Описание экспозиции"
            placeholder="Например: белый фон для товара, студийное освещение"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
