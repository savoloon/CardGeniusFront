import { useState, useEffect, useCallback } from 'react';
import {
  getAdminUsers,
  getAdminPlans,
  createPlan,
  updatePlan,
  deletePlan,
  setUserPlan,
  type AdminUser,
  type AdminPlan,
  type CreatePlanBody,
  type ApiError,
} from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button, Input } from '../../components/ui';
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
  const [planForm, setPlanForm] = useState<Partial<AdminPlan> & { name: string } | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [updatingUserPlan, setUpdatingUserPlan] = useState<number | null>(null);

  const loadUsers = useCallback(() => {
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
  }, [t]);

  const loadPlans = useCallback(() => {
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
  }, [t]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else loadPlans();
  }, [tab, loadUsers, loadPlans]);

  const dateLocale = locale === 'en' ? 'en-US' : 'ru-RU';

  const handleCreatePlan = () => {
    setPlanForm({
      name: '',
      priceNew: 0,
      priceOld: 0,
      countByTasks: true,
      limit: 0,
      visible: true,
    });
    setError(null);
  };

  const handleEditPlan = (p: AdminPlan) => {
    setPlanForm({ ...p });
    setError(null);
  };

  const handleSavePlan = async () => {
    if (!planForm?.name?.trim()) {
      setError(t('admin.planNamePlaceholder'));
      return;
    }
    setSavingPlan(true);
    setError(null);
    const body: CreatePlanBody = {
      name: planForm.name.trim(),
      priceNew: planForm.priceNew ?? 0,
      priceOld: planForm.priceOld ?? 0,
      countByTasks: planForm.countByTasks ?? true,
      limit: planForm.limit ?? 0,
      visible: planForm.visible ?? true,
    };
    try {
      if (planForm.id) {
        await updatePlan(planForm.id, body);
        loadPlans();
      } else {
        await createPlan(body);
        loadPlans();
      }
      setPlanForm(null);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.message ?? (planForm.id ? t('admin.updatePlanError') : t('admin.createPlanError')));
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!window.confirm(t('admin.deletePlan') + '?')) return;
    setError(null);
    try {
      await deletePlan(id);
      loadPlans();
      if (planForm?.id === id) setPlanForm(null);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.message ?? t('admin.deletePlanError'));
    }
  };

  const handleUserPlanChange = async (userId: number, planId: number | null) => {
    setUpdatingUserPlan(userId);
    setError(null);
    try {
      await setUserPlan(userId, planId);
      loadUsers();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.message ?? t('admin.setUserPlanError'));
    } finally {
      setUpdatingUserPlan(null);
    }
  };

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
                      <th>{t('admin.plan')}</th>
                      <th>{t('admin.regDate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.empty}>
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
                          <td>
                            <select
                              className={styles.planSelect}
                              value={u.planId ?? ''}
                              onChange={(e) => handleUserPlanChange(u.id, e.target.value === '' ? null : Number(e.target.value))}
                              disabled={updatingUserPlan === u.id}
                            >
                              <option value="">{t('admin.planNone')}</option>
                              {plans.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            {updatingUserPlan === u.id && <span className={styles.savingHint}>...</span>}
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
            {planForm !== null ? (
              <div className={styles.planForm}>
                <h3 className={styles.planFormTitle}>{planForm.id ? t('admin.editPlan') : t('admin.createPlan')}</h3>
                <Input
                  label={t('admin.name')}
                  value={planForm.name}
                  onChange={(e) => setPlanForm((f) => (f ? { ...f, name: e.target.value } : null))}
                  placeholder={t('admin.planNamePlaceholder')}
                  disabled={savingPlan}
                />
                <div className={styles.planFormRow}>
                  <Input
                    type="number"
                    label={t('admin.priceNew')}
                    value={String(planForm.priceNew ?? 0)}
                    onChange={(e) => setPlanForm((f) => (f ? { ...f, priceNew: Number(e.target.value) || 0 } : null))}
                    disabled={savingPlan}
                  />
                  <Input
                    type="number"
                    label={t('admin.priceOld')}
                    value={String(planForm.priceOld ?? 0)}
                    onChange={(e) => setPlanForm((f) => (f ? { ...f, priceOld: Number(e.target.value) || 0 } : null))}
                    disabled={savingPlan}
                  />
                </div>
                <div className={`${styles.planFormRow} ${styles.planFormRowCountBy}`}>
                  <label className={styles.planFormLabel}>
                    <span>{t('admin.countBy')}</span>
                    <select
                      value={planForm.countByTasks ? 'tasks' : 'downloads'}
                      onChange={(e) => setPlanForm((f) => (f ? { ...f, countByTasks: e.target.value === 'tasks' } : null))}
                      disabled={savingPlan}
                      className={styles.planFormSelect}
                    >
                      <option value="tasks">{t('admin.countByTasks')}</option>
                      <option value="downloads">{t('admin.countByDownloads')}</option>
                    </select>
                  </label>
                  <div className={styles.planFormLimitWrap}>
                    <Input
                      type="number"
                      label={t('admin.limit')}
                      value={String(planForm.limit ?? 0)}
                      onChange={(e) => setPlanForm((f) => (f ? { ...f, limit: Math.max(0, parseInt(e.target.value, 10) || 0) } : null))}
                      disabled={savingPlan}
                      min={0}
                    />
                  </div>
                </div>
                <label className={styles.planFormCheckbox}>
                  <input
                    type="checkbox"
                    checked={planForm.visible ?? true}
                    onChange={(e) => setPlanForm((f) => (f ? { ...f, visible: e.target.checked } : null))}
                    disabled={savingPlan}
                  />
                  <span>{t('admin.visible')} ({planForm.visible ? t('admin.visibleYes') : t('admin.visibleNo')})</span>
                </label>
                <div className={styles.planFormActions}>
                  <Button onClick={handleSavePlan} loading={savingPlan} disabled={savingPlan}>
                    {t('admin.savePlan')}
                  </Button>
                  <Button variant="outline" onClick={() => setPlanForm(null)} disabled={savingPlan}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.planToolbar}>
                  <Button onClick={handleCreatePlan}>{t('admin.createPlan')}</Button>
                </div>
                {loadingPlans ? (
                  <div className={styles.loading}>{t('admin.loading')}</div>
                ) : (
                  <div className={`${styles.tableWrap} ${styles.tableWrapPlans}`}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>{t('admin.name')}</th>
                          <th>{t('admin.priceNew')}</th>
                          <th>{t('admin.priceOld')}</th>
                          <th>{t('admin.countBy')}</th>
                          <th>{t('admin.limit')}</th>
                          <th>{t('admin.visible')}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {plans.length === 0 ? (
                          <tr>
                            <td colSpan={8} className={styles.empty}>
                              {t('admin.noPlans')}
                            </td>
                          </tr>
                        ) : (
                          plans.map((p) => (
                            <tr key={p.id}>
                              <td>{p.id}</td>
                              <td>{p.name}</td>
                              <td>{p.priceNew}</td>
                              <td>{p.priceOld}</td>
                              <td>{p.countByTasks ? t('admin.countByTasks') : t('admin.countByDownloads')}</td>
                              <td>{p.limit}</td>
                              <td>{p.visible ? t('admin.visibleYes') : t('admin.visibleNo')}</td>
                              <td className={styles.actionsCell}>
                                <button
                                  type="button"
                                  className={styles.actionBtn}
                                  onClick={() => handleEditPlan(p)}
                                >
                                  {t('admin.editPlan')}
                                </button>
                                <button
                                  type="button"
                                  className={styles.actionBtnDanger}
                                  onClick={() => handleDeletePlan(p.id)}
                                >
                                  {t('admin.deletePlan')}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
