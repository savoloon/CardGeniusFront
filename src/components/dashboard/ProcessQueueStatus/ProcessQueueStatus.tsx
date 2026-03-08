import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './ProcessQueueStatus.module.css';

interface ProcessQueueStatusProps {
  status: 'pending' | 'completed' | 'failed';
}

export default function ProcessQueueStatus({ status }: ProcessQueueStatusProps) {
  const { t } = useLanguage();
  if (status === 'pending') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.spinner} aria-hidden />
        <p className={styles.text}>{t('dashboard.queuePending')}</p>
        <p className={styles.sub}>{t('dashboard.queueWait')}</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={`${styles.wrapper} ${styles.error}`}>
        <span className={styles.errorIcon}>!</span>
        <p className={styles.text}>{t('dashboard.queueFailed')}</p>
      </div>
    );
  }

  return null;
}
