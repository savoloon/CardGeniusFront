import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  fullWidth = false,
  loading = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        children
      )}
    </button>
  );
}
