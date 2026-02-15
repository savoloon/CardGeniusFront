import { useState, useEffect } from 'react';
import { getAdminUsers, getAdminPlans, type AdminUser, type AdminPlan, type ApiError } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './AdminPage.module.css';

type Tab = 'users' | 'plans';

export default function AdminPage() {
  const { t, locale } = useLanguage();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'users') {
      setLoadingUsers(true);
      setError(null);
      getAdminUsers()
        .then((res) => {
          if (res.success && res.data?.users) setUsers(res.data.users);
        })
        .catch((err: ApiError) => {
          setError(err.response?.data?.message ?? t('admin.loadUsersError'));
        })
        .finally(() => setLoadingUsers(false));
    } else {
      setLoadingPlans(true);
      setError(null);
      getAdminPlans()
        .then((res) => {
          if (res.success && res.data?.plans) setPlans(res.data.plans);
        })
        .catch((err: ApiError) => {
          setError(err.response?.data?.message ?? t('admin.loadPlansError'));
        })
        .finally(() => setLoadingPlans(false));
    }
  }, [tab]);

  const dateLocale = locale === 'en' ? 'en-US' : 'ru-RU';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('admin.title')}</h1>
        <p className={styles.subtitle}>{t('admin.subtitle')}</p>
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`}
          onClick={() => setTab('users')}
        >
          {t('admin.tabUsers')}
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'plans' ? styles.tabActive : ''}`}
          onClick={() => setTab('plans')}
        >
          {t('admin.tabPlans')}
        </button>
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}

      <div className={styles.panel}>
        {tab === 'users' && (
          <>
            {loadingUsers ? (
              <div className={styles.loading}>{t('admin.loading')}</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t('common.email')}</th>
                      <th>{t('admin.role')}</th>
                      <th>{t('admin.regDate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={styles.empty}>
                          {t('admin.noUsers')}
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.email}</td>
                          <td>
                            {u.isAdmin ? (
                              <span className={styles.badge}>{t('admin.roleAdmin')}</span>
                            ) : (
                              t('admin.roleUser')
                            )}
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString(dateLocale)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'plans' && (
          <>
            {loadingPlans ? (
              <div className={styles.loading}>{t('admin.loading')}</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t('admin.name')}</th>
                      <th>{t('admin.price')}</th>
                      <th>{t('admin.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={styles.empty}>
                          {t('admin.noPlans')}
                        </td>
                      </tr>
                    ) : (
                      plans.map((p) => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.name}</td>
                          <td>{p.price} ₽</td>
                          <td>{p.isActive ? t('admin.statusActive') : t('admin.statusInactive')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
