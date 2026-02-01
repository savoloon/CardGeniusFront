import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import styles from './LandingHeader.module.css';

const navLinks = [
  { href: '#how-it-works', label: 'Как это работает' },
  { href: '#cases', label: 'Кейсы' },
  { href: '#tools', label: 'Возможности' },
  { href: '#pricing', label: 'Тарифы' },
];

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>◇</span>
          Card Genius AI
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.navLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link to="/register">
            <Button variant="primary" className={styles.ctaButton}>
              Создать карточку бесплатно
            </Button>
          </Link>
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
