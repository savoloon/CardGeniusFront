import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/features/LoginForm';
import type { ApiUser } from '../services/api';
import styles from './LoginPage.module.css';

interface SuccessData {
  user?: ApiUser;
}

export default function LoginPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSuccess = (data?: SuccessData) => {
    setSuccessMessage(
      `Вход выполнен! Добро пожаловать, ${data?.user?.email ?? 'пользователь'}`
    );
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className={styles.page}>
      {successMessage ? (
        <div className={styles.successMessage}>{successMessage}</div>
      ) : (
        <LoginForm onSuccess={handleSuccess} />
      )}
    </div>
  );
}
