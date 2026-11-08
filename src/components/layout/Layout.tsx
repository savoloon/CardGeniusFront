import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle, LanguageToggle } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import BrandLogo from '../brand/BrandLogo';
import SiteFooter from './SiteFooter';
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
              <h1 className={styles.logo}>
                <BrandLogo />
              </h1>
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
      <SiteFooter />
    </div>
  );
}
