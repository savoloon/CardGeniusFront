import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, Input, PasswordRequirements } from '../../components/ui';
import { updateProfile, type ApiError } from '../../services/api';
import { getPasswordChecks, allPasswordChecksPass } from '../../utils/passwordValidation';
import styles from './ProfilePage.module.css';

type PasswordStep = 'idle' | 'old' | 'new';

export default function ProfilePage() {
  const { user, setUserFromLogin } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState(user?.email ?? '');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [passwordStep, setPasswordStep] = useState<PasswordStep>('idle');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || trimmed === user?.email) return;
    setEmailSaving(true);
    setEmailError(null);
    setEmailSuccess(false);
    try {
      const res = await updateProfile({ email: trimmed });
      if (res.success && res.data?.user) {
        setUserFromLogin({ user: res.data.user });
        setEmailSuccess(true);
      } else {
        setEmailError(res.message ?? t('auth.saveError'));
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setEmailError(apiErr.response?.data?.message ?? t('auth.saveError'));
    } finally {
      setEmailSaving(false);
    }
  };

  const handleOldPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword.trim()) return;
    setPasswordError(null);
    setPasswordStep('new');
  };

  const newPasswordChecks = useMemo(
    () => getPasswordChecks(newPassword, oldPassword),
    [newPassword, oldPassword]
  );
  const newPasswordValid = allPasswordChecksPass(newPassword, oldPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordValid) {
      setPasswordError(t('validation.passwordRequirements'));
      return;
    }
    if (newPassword !== newPasswordRepeat) {
      setPasswordError(t('validation.passwordsMismatch'));
      return;
    }
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      const res = await updateProfile({
        currentPassword: oldPassword,
        newPassword,
      });
      if (res.success) {
        setPasswordSuccess(true);
        setPasswordStep('idle');
        setOldPassword('');
        setNewPassword('');
        setNewPasswordRepeat('');
      } else {
        setPasswordError(res.message ?? t('auth.changePasswordError'));
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setPasswordError(apiErr.response?.data?.message ?? t('auth.changePasswordError'));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('profile.title')}</h1>
          <p className={styles.subtitle}>{t('profile.subtitle')}</p>
        </div>
        <Link to="/history" className={styles.historyLink}>
          <Button variant="outline">{t('history.title')}</Button>
        </Link>
      </header>

      <div className={styles.grid}>
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('profile.email')}</h2>
          <div className={styles.emailDisplay}>{user.email}</div>
          <form onSubmit={handleEmailSubmit} className={styles.formStack}>
            <Input
              label={t('auth.newEmail')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('placeholders.email')}
              error={emailError ?? undefined}
              disabled={emailSaving}
              autoComplete="email"
            />
            <div className={styles.actions}>
              <Button type="submit" loading={emailSaving} disabled={emailSaving || email.trim() === user.email}>
                {t('auth.saveEmail')}
              </Button>
            </div>
            {emailSuccess && <p className={styles.success}>{t('auth.emailUpdated')}</p>}
          </form>
        </Card>

        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('auth.changePassword')}</h2>
          {passwordStep === 'idle' && (
            <Button variant="outline" onClick={() => setPasswordStep('old')}>
              {t('auth.changePassword')}
            </Button>
          )}
          {passwordStep === 'old' && (
            <form onSubmit={handleOldPasswordSubmit} className={styles.passwordStep}>
              <div className={styles.formRow}>
                <Input
                  label={t('auth.currentPassword')}
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder={t('placeholders.currentPassword')}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className={styles.actions}>
                <Button type="submit" disabled={!oldPassword.trim()}>
                  {t('common.next')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setPasswordStep('idle'); setOldPassword(''); setPasswordError(null); }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          )}
          {passwordStep === 'new' && (
            <form onSubmit={handlePasswordSubmit} className={styles.passwordStep}>
              <div className={styles.formRow}>
                <Input
                  label={t('auth.newPassword')}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('placeholders.newPasswordHint')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <PasswordRequirements checks={newPasswordChecks} />
              </div>
              <div className={styles.formRow}>
                <Input
                  label={t('auth.repeatNewPassword')}
                  type="password"
                  value={newPasswordRepeat}
                  onChange={(e) => setNewPasswordRepeat(e.target.value)}
                  placeholder={t('placeholders.repeatPassword')}
                  required
                  autoComplete="new-password"
                />
              </div>
              {passwordError && <p className={styles.error}>{passwordError}</p>}
              {passwordSuccess && <p className={styles.success}>{t('auth.passwordChanged')}</p>}
              <div className={styles.actions}>
                <Button
                  type="submit"
                  loading={passwordSaving}
                  disabled={
                    passwordSaving ||
                    !newPasswordValid ||
                    newPassword !== newPasswordRepeat
                  }
                >
                  {t('auth.savePassword')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPasswordStep('old');
                    setNewPassword('');
                    setNewPasswordRepeat('');
                    setPasswordError(null);
                  }}
                >
                  {t('common.back')}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
