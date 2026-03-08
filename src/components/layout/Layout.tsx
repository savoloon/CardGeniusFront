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
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <Link to="/" className={styles.logoLink}>
              <span className={styles.logoIcon}>◇</span>
              <h1 className={styles.logo}>Card Genius AI</h1>
            </Link>
            <p className={styles.tagline}>{t('layout.tagline')}</p>
          </div>
          <div className={styles.headerRight}>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
