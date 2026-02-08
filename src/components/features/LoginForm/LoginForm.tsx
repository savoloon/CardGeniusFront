import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '../../ui';
import {
  loginUser,
  type LoginResponse,
  type ApiError,
} from '../../../services/api';
import styles from './LoginForm.module.css';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

interface LoginFormProps {
  onSuccess?: (data: LoginResponse['data']) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        onSuccess?.(response.data);
      } else {
        setErrors({
          submit: response.message ?? 'Ошибка входа',
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
        <h2 className={styles.title}>Вход</h2>
        <p className={styles.subtitle}>
          Войдите в аккаунт для управления карточками товаров
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
          placeholder="Введите пароль"
          error={errors.password}
          autoComplete="current-password"
          disabled={loading}
        />

        {errors.submit && (
          <div className={styles.submitError} role="alert">
            {errors.submit}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          Войти
        </Button>

        <p className={styles.footer}>
          Нет аккаунта?{' '}
          <Link to="/register" className={styles.link}>
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </Card>
  );
}
