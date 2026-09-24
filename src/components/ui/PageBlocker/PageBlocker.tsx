import type { ReactNode } from 'react';
import styles from './PageBlocker.module.css';

interface PageBlockerProps {
  title: string;
  subtitle?: string;
  ariaLabel?: string;
  children?: ReactNode;
}

export default function PageBlocker({ title, subtitle, ariaLabel, children }: PageBlockerProps) {
  return (
    <div
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel ?? title}
    >
      <div className={styles.panel}>
        {children ?? <div className={styles.spinner} aria-hidden />}
        <p className={styles.title}>{title}</p>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}
