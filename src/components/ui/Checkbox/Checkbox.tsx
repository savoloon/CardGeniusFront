import type { InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id?: string;
  className?: string;
}

export default function Checkbox({
  label,
  id,
  error,
  className = '',
  ...props
}: CheckboxProps) {
  const checkboxId = id ?? `checkbox-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <label htmlFor={checkboxId} className={styles.label}>
        <input
          id={checkboxId}
          type="checkbox"
          className={styles.input}
          aria-invalid={!!error}
          {...props}
        />
        <span className={styles.checkmark} />
        {label}
      </label>
      {error && (
        <span className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
