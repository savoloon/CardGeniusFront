import styles from './ProcessQueueStatus.module.css';

interface ProcessQueueStatusProps {
  status: 'pending' | 'completed' | 'failed';
}

export default function ProcessQueueStatus({ status }: ProcessQueueStatusProps) {
  if (status === 'pending') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.spinner} aria-hidden />
        <p className={styles.text}>Обработка в очереди…</p>
        <p className={styles.sub}>Подождите, результат появится автоматически</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={`${styles.wrapper} ${styles.error}`}>
        <span className={styles.errorIcon}>!</span>
        <p className={styles.text}>Ошибка обработки</p>
      </div>
    );
  }

  return null;
}
