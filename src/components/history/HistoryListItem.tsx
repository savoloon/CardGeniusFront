import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { getProcessModeLabelKey, HISTORY_STATUS_LABEL_KEYS } from '../../constants/processModes';
import { formatLocaleDateTime } from '../../utils/formatDate';
import type { HistoryItem } from '../../services/api';
import styles from '../../pages/HistoryPage/HistoryPage.module.css';

interface HistoryListItemProps {
  item: HistoryItem;
  locale: string;
}

function HistoryListItem({ item, locale }: HistoryListItemProps) {
  const { t } = useLanguage();

  return (
    <Link to={`/history/${item.id}`} className={styles.cardLink}>
      <Card className={styles.card}>
        <div className={styles.rowTop}>
          <span className={styles.mode}>{t(getProcessModeLabelKey(item.mode))}</span>
          <span className={styles.status} data-status={item.status}>
            {t(HISTORY_STATUS_LABEL_KEYS[item.status] ?? item.status)}
          </span>
        </div>
        <div className={styles.rowBottom}>
          <span className={styles.date}>{formatLocaleDateTime(item.createdAt, locale)}</span>
          <span className={styles.openHint}>{t('common.next')} →</span>
        </div>
      </Card>
    </Link>
  );
}

export default memo(HistoryListItem);
