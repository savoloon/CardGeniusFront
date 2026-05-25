import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, DatePicker, StyledList, Select } from '../../components/ui';
import HistoryListItem from '../../components/history/HistoryListItem';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import {
  getHistory,
  type HistoryItem,
  type HistoryFilters,
} from '../../services/api';
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const { t, locale } = useLanguage();
  const getErrorMessage = useApiErrorMessage();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const fetchList = useCallback(
    async (filters: HistoryFilters, opts?: { initial?: boolean }) => {
      const isInitial = opts?.initial ?? false;
      if (isInitial) setInitialLoading(true);
      else setIsFetching(true);
      setError(null);
      try {
        const res = await getHistory(filters);
        if (res.success && res.data?.items) {
          setItems(res.data.items);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        if (isInitial) setInitialLoading(false);
        else setIsFetching(false);
      }
    },
    [getErrorMessage]
  );

  useEffect(() => {
    fetchList({}, { initial: true });
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
  const statusOptions = useMemo(
    () => [
      { value: '', label: t('history.statusAll') },
      { value: 'pending', label: t('history.statusPending') },
      { value: 'completed', label: t('history.statusCompleted') },
      { value: 'failed', label: t('history.statusFailed') },
    ],
    [t]
  );

  const stats = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let failed = 0;
    for (const it of items) {
      if (it.status === 'pending') pending += 1;
      else if (it.status === 'completed') completed += 1;
      else if (it.status === 'failed') failed += 1;
    }
    return { total: items.length, pending, completed, failed };
  }, [items]);

  const localeTag = locale === 'en' ? 'en-US' : 'ru-RU';

  const renderHistoryItem = useCallback(
    (item: HistoryItem) => <HistoryListItem item={item} locale={localeTag} />,
    [localeTag]
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('history.title')}</h1>
          <p className={styles.subtitle}>{t('history.subtitle')}</p>
        </div>
        <Link to="/dashboard" className={styles.primaryLink}>
          <Button>{t('history.goToDashboard')}</Button>
        </Link>
      </header>

      {hasActiveFilters && (
        <p className={styles.statsHint}>{t('history.statsFilteredHint')}</p>
      )}
      <section className={styles.statsGrid} aria-label={t('history.filterStatus')}>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>{t('history.statusAll')}</span>
          <strong className={styles.statValue}>{stats.total}</strong>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>{t('history.statusPending')}</span>
          <strong className={styles.statValue}>{stats.pending}</strong>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>{t('history.statusCompleted')}</span>
          <strong className={styles.statValue}>{stats.completed}</strong>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>{t('history.statusFailed')}</span>
          <strong className={styles.statValue}>{stats.failed}</strong>
        </Card>
      </section>

      <Card className={styles.filtersCard}>
        <div className={styles.filtersRow}>
          <label className={styles.filterLabel}>
            <Select
              label={t('history.filterStatus')}
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />
          </label>
          <label className={styles.filterLabel}>
            <DatePicker
              label={t('history.filterDateFrom')}
              value={dateFrom}
              onChange={setDateFrom}
            />
          </label>
          <label className={styles.filterLabel}>
            <DatePicker
              label={t('history.filterDateTo')}
              value={dateTo}
              onChange={setDateTo}
            />
          </label>
        </div>
        <div className={styles.filtersActions}>
          <Button onClick={handleApplyFilters} disabled={isFetching}>
            {t('history.filterApply')}
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters} disabled={isFetching}>
              {t('history.clearFilters')}
            </Button>
          )}
        </div>
      </Card>

      {initialLoading && <p className={styles.loading}>{t('admin.loading')}</p>}
      {!initialLoading && isFetching && <p className={styles.loading}>{t('admin.loading')}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}

      {!initialLoading && !error && items.length === 0 && (
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

      {!initialLoading && !error && items.length > 0 && (
        <StyledList
          className={styles.list}
          items={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderHistoryItem}
        />
      )}
    </div>
  );
}
