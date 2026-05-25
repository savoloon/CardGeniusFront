import styles from './RouteLoader.module.css';

interface RouteLoaderProps {
  minHeight?: string;
}

export default function RouteLoader({ minHeight = '60vh' }: RouteLoaderProps) {
  return (
    <div className={styles.wrap} style={{ minHeight }} role="status" aria-label="Loading">
      <div className={styles.spinner} aria-hidden />
    </div>
  );
}
