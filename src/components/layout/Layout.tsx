import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle, LanguageToggle } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './Layout.module.css';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useLanguage();
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <Link to="/" className={styles.logoLink}>
            <h1 className={styles.logo}>
              <span className={styles.logoIcon}>◇</span>
              Card Genius AI
            </h1>
          </Link>
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <p className={styles.tagline}>{t('layout.tagline')}</p>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
