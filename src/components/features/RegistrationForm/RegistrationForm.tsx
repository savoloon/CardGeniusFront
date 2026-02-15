import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card, PasswordRequirements, CaptchaWidget } from '../../ui';
import {
  registerUser,
  type RegisterResponse,
  type ApiError,
} from '../../../services/api';
import { getPasswordChecks, allPasswordChecksPass } from '../../../utils/passwordValidation';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './RegistrationForm.module.css';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  isAdmin: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
}

interface RegistrationFormProps {
  onSuccess?: (data: RegisterResponse['data']) => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const passwordChecks = useMemo(
    () => getPasswordChecks(formData.password),
    [formData.password]
  );
  const passwordValid = allPasswordChecksPass(formData.password);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (!passwordValid) {
      newErrors.password = t('validation.passwordRequirements');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await registerUser({
        email: formData.email,
        password: formData.password,
        smartToken: captchaToken,
        isAdmin: formData.isAdmin,
      });

      if (response.success) {
        onSuccess?.(response.data);
      } else {
        const msg = response.message ?? t('auth.registerError');
        setErrors({ submit: msg });
        if (msg.toLowerCase().includes('captcha')) setCaptchaToken('');
      }
    } catch (err) {
      const apiError = err as ApiError;
      const message =
        apiError.response?.data?.message ??
        apiError.response?.data?.errors?.[0]?.message ??
        'Ошибка подключения к серверу';
      const fieldErrors: FormErrors = {};
      if (apiError.response?.data?.errors) {
        apiError.response.data.errors.forEach((e) => {
          (fieldErrors as Record<string, string>)[e.field] = e.message;
        });
      }
      setErrors({ submit: message, ...fieldErrors });
      if (message.toLowerCase().includes('captcha')) setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.card}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h2 className={styles.title}>{t('auth.registerTitle')}</h2>
        <p className={styles.subtitle}>{t('auth.registerSubtitle')}</p>

        <Input
          label={t('common.email')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t('placeholders.email')}
          error={errors.email}
          autoComplete="email"
          disabled={loading}
        />

        <Input
          label={t('common.password')}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={t('placeholders.passwordMin')}
          error={errors.password}
          autoComplete="new-password"
          disabled={loading}
        />
        <PasswordRequirements checks={passwordChecks} />

        <Input
          label={t('auth.confirmPassword')}
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder={t('placeholders.repeatPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
          disabled={loading}
        />

        <CaptchaWidget onSuccess={setCaptchaToken} />

        {errors.submit && (
          <div className={styles.submitError} role="alert">
            {errors.submit}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={
            loading ||
            !passwordValid ||
            formData.password !== formData.confirmPassword ||
            !formData.email.trim() ||
            !captchaToken
          }
        >
          {t('common.register')}
        </Button>

        <p className={styles.footer}>
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className={styles.link}>
            {t('common.login')}
          </Link>
        </p>
      </form>
    </Card>
  );
}
