import { useEffect, type ReactNode } from 'react';
import styles from './StaticPage.module.css';

interface StaticPageProps {
  title: string;
  lead?: string;
  children: ReactNode;
}

export default function StaticPage({ title, lead, children }: StaticPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className={styles.page}>
      <header>
        <h1 className={styles.title}>{title}</h1>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
      </header>
      <div className={styles.body}>{children}</div>
    </article>
  );
}
