import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, ThemeToggle, LanguageToggle } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children?: ReactNode;
}

interface NavItem {
  to: string;
  labelKey: string;
  end?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', labelKey: 'layout.navDashboard' },
  { to: '/history', labelKey: 'layout.navHistory' },
  { to: '/profile', labelKey: 'common.profile', end: true },
  { to: '/admin', labelKey: 'common.admin', adminOnly: true },
];

function getUserInitials(email?: string | null): string {
  if (!email) return '?';
  const local = email.split('@')[0]?.trim();
  if (!local) return '?';
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.adminOnly || user?.isAdmin),
    [user?.isAdmin],
  );

  const userInitials = useMemo(() => getUserInitials(user?.email), [user?.email]);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.brand}>
            <Link to="/dashboard" className={styles.logo} onClick={closeMobileMenu}>
              <span className={styles.logoIcon} aria-hidden>
                ◇
              </span>
              <span className={styles.logoText}>Card Genius AI</span>
            </Link>
          </div>

          <nav className={styles.primaryNav} aria-label={t('layout.navAria')}>
            <div className={styles.navPills}>
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                  onClick={closeMobileMenu}
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className={styles.actions}>
            <div className={styles.preferences} aria-label={t('layout.preferencesAria')}>
              <ThemeToggle />
              <LanguageToggle />
            </div>

            <div className={styles.userMenu} ref={userMenuRef}>
              <button
                type="button"
                className={`${styles.userTrigger} ${userMenuOpen ? styles.userTriggerOpen : ''}`}
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label={t('layout.userMenuAria')}
              >
                <span className={styles.userAvatar} aria-hidden>
                  {userInitials}
                </span>
                <span className={styles.userEmail}>{user?.email}</span>
                <svg
                  className={styles.userChevron}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className={styles.userDropdown} role="menu">
                  <p className={styles.userDropdownEmail}>{user?.email}</p>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className={styles.logoutBtn}
                    role="menuitem"
                  >
                    {t('common.logout')}
                  </Button>
                </div>
              )}
            </div>

            <button
              type="button"
              className={`${styles.menuToggle} ${menuOpen ? styles.menuToggleOpen : ''}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={t('landing.menuAria')}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ''}`}>
          <div className={styles.mobileSection}>
            <p className={styles.mobileSectionLabel}>{t('layout.mobileNavLabel')}</p>
            <nav className={styles.mobileNav} aria-label={t('layout.navAria')}>
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                  }
                  onClick={closeMobileMenu}
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className={styles.mobileSection}>
            <p className={styles.mobileSectionLabel}>{t('layout.preferencesAria')}</p>
            <div className={styles.mobilePreferences}>
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>

          <div className={styles.mobileSection}>
            <p className={styles.mobileSectionLabel}>{t('layout.mobileAccountLabel')}</p>
            <p className={styles.mobileUserEmail}>{user?.email}</p>
            <Button variant="outline" onClick={handleLogout} className={styles.mobileLogoutBtn}>
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
