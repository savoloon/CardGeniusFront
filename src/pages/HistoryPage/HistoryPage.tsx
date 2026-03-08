import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../../components/ui';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getHistory,
  type HistoryItem,
  type HistoryFilters,
  type ApiError,
} from '../../services/api';
import styles from './HistoryPage.module.css';

const MODE_KEYS: Record<string, string> = {
  remove_background: 'dashboard.modeRemoveBg',
  generate_background: 'dashboard.modeGenerateBg',
  generate_exposure: 'dashboard.modeGenerateExposure',
  generate_exposition_by_request: 'dashboard.modeExposureByRequest',
  improve_image: 'dashboard.modeImprove',
  generate_infographic: 'dashboard.modeInfographic',
};

const STATUS_KEYS: Record<string, string> = {
  pending: 'history.statusPending',
  completed: 'history.statusCompleted',
  failed: 'history.statusFailed',
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function HistoryPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const fetchList = useCallback(
    async (filters: HistoryFilters) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getHistory(filters);
        if (res.success && res.data?.items) {
          setItems(res.data.items);
        }
      } catch (err) {
        const apiErr = err as ApiError;
        setError(apiErr.response?.data?.message ?? t('auth.connectionError'));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    fetchList({});
  }, [fetchList]);

  const handleApplyFilters = () => {
    const filters: HistoryFilters = {};
    if (statusFilter) filters.status = statusFilter as 'pending' | 'completed' | 'failed';
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    fetchList(filters);
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    fetchList({});
  };

  const hasActiveFilters = !!statusFilter || !!dateFrom || !!dateTo;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('history.title')}</h1>
        <p className={styles.subtitle}>{t('history.subtitle')}</p>
      </header>

      <Card className={styles.filtersCard}>
        <div className={styles.filtersRow}>
          <label className={styles.filterLabel}>
            <span className={styles.filterLabelText}>{t('history.filterStatus')}</span>
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('history.filterStatus')}
            >
              <option value="">{t('history.statusAll')}</option>
              <option value="pending">{t('history.statusPending')}</option>
              <option value="completed">{t('history.statusCompleted')}</option>
              <option value="failed">{t('history.statusFailed')}</option>
            </select>
          </label>
          <label className={styles.filterLabel}>
            <span className={styles.filterLabelText}>{t('history.filterDateFrom')}</span>
            <input
              type="date"
              className={styles.dateInput}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label={t('history.filterDateFrom')}
            />
          </label>
          <label className={styles.filterLabel}>
            <span className={styles.filterLabelText}>{t('history.filterDateTo')}</span>
            <input
              type="date"
              className={styles.dateInput}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label={t('history.filterDateTo')}
            />
          </label>
        </div>
        <div className={styles.filtersActions}>
          <Button onClick={handleApplyFilters} disabled={loading}>
            {t('history.filterApply')}
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters} disabled={loading}>
              {t('history.clearFilters')}
            </Button>
          )}
        </div>
      </Card>

      {loading && <p className={styles.loading}>{t('admin.loading')}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <Card className={styles.emptyCard}>
          <p className={styles.emptyText}>
            {hasActiveFilters ? t('history.noResults') : t('history.empty')}
          </p>
          {hasActiveFilters ? (
            <button type="button" className={styles.linkButton} onClick={handleClearFilters}>
              {t('history.clearFilters')}
            </button>
          ) : (
            <Link to="/dashboard" className={styles.link}>{t('history.goToDashboard')}</Link>
          )}
        </Card>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id}>
              <Link to={`/history/${item.id}`} className={styles.cardLink}>
                <Card className={styles.card}>
                  <div className={styles.row}>
                    <span className={styles.mode}>{t(MODE_KEYS[item.mode] ?? item.mode)}</span>
                    <span className={styles.status} data-status={item.status}>
                      {t(STATUS_KEYS[item.status] ?? item.status)}
                    </span>
                  </div>
                  <div className={styles.date}>{formatDate(item.createdAt)}</div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
