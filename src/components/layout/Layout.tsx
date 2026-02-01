import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logoLink}>
          <h1 className={styles.logo}>
            <span className={styles.logoIcon}>◇</span>
            Card Genius AI
          </h1>
        </Link>
        <p className={styles.tagline}>
          Карточки товаров для Wildberries, Ozon, Яндекс.Маркет
        </p>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
