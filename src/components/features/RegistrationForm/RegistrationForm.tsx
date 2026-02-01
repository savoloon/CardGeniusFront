import { useState } from 'react';
import { Button, Input, Card, Checkbox } from '../../ui';
import {
  registerUser,
  type RegisterResponse,
  type ApiError,
} from '../../../services/api';
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
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
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
        isAdmin: formData.isAdmin,
      });

      if (response.success) {
        onSuccess?.(response.data);
      } else {
        setErrors({
          submit: response.message ?? 'Ошибка регистрации',
        });
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.card}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h2 className={styles.title}>Регистрация</h2>
        <p className={styles.subtitle}>
          Создайте аккаунт для управления карточками товаров
        </p>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@mail.com"
          error={errors.email}
          autoComplete="email"
          disabled={loading}
        />

        <Input
          label="Пароль"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Минимум 6 символов"
          error={errors.password}
          autoComplete="new-password"
          disabled={loading}
        />

        <Input
          label="Подтвердите пароль"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Повторите пароль"
          error={errors.confirmPassword}
          autoComplete="new-password"
          disabled={loading}
        />

        <Checkbox
          label="Регистрация как администратор"
          name="isAdmin"
          checked={formData.isAdmin}
          onChange={handleChange}
          disabled={loading}
        />

        {errors.submit && (
          <div className={styles.submitError} role="alert">
            {errors.submit}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          Зарегистрироваться
        </Button>
      </form>
    </Card>
  );
}
