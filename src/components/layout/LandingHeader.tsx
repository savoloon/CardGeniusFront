import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ThemeToggle, LanguageToggle } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './LandingHeader.module.css';

const navKeys = ['menuHow', 'menuCases', 'menuTools', 'menuPricing'] as const;
const navHrefs: Record<(typeof navKeys)[number], string> = {
  menuHow: '#how-it-works',
  menuCases: '#cases',
  menuTools: '#tools',
  menuPricing: '#pricing',
};

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>◇</span>
          Card Genius AI
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {navKeys.map((key) => (
            <a
              key={key}
              href={navHrefs[key]}
              className={styles.navLink}
              onClick={() => setMenuOpen(false)}
            >
              {t(`layout.${key}`)}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          <LanguageToggle />
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" className={styles.ctaButton}>
                {t('common.panel')}
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="primary" className={styles.ctaButton}>
                {t('common.login')}
              </Button>
            </Link>
          )}
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
