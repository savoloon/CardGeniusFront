import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, ThemeToggle, LanguageToggle } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/dashboard" className={styles.logo}>
            <span className={styles.logoIcon}>◇</span>
            Card Genius AI
          </Link>

          <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
            <div className={styles.navItems}>
              <ThemeToggle />
              <LanguageToggle />
              <Link to="/profile" className={styles.profileLink} onClick={() => setMenuOpen(false)}>
                {t('common.profile')}
              </Link>
              {user?.isAdmin && (
                <Link to="/admin" className={styles.profileLink} onClick={() => setMenuOpen(false)}>
                  {t('common.admin')}
                </Link>
              )}
              <span className={styles.userEmail}>{user?.email}</span>
              <Button variant="outline" onClick={handleLogout} className={styles.logoutBtn}>
                {t('common.logout')}
              </Button>
            </div>
          </nav>

          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('landing.menuAria')}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
