import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, ThemeToggle, LanguageToggle } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = async () => {
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

          <nav className={styles.nav}>
            <ThemeToggle />
            <LanguageToggle />
            <Link to="/profile" className={styles.profileLink}>
              {t('common.profile')}
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" className={styles.profileLink}>
                {t('common.admin')}
              </Link>
            )}
            <span className={styles.userEmail}>{user?.email}</span>
            <Button variant="outline" onClick={handleLogout} className={styles.logoutBtn}>
              {t('common.logout')}
            </Button>
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
