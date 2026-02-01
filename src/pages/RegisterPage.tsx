import { useState } from 'react';
import RegistrationForm from '../components/features/RegistrationForm';
import type { ApiUser } from '../services/api';
import styles from './RegisterPage.module.css';

interface SuccessData {
  user?: ApiUser;
}

export default function RegisterPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSuccess = (data?: SuccessData) => {
    setSuccessMessage(
      `Регистрация успешна! Добро пожаловать, ${data?.user?.email ?? 'пользователь'}`
    );
  };

  return (
    <div className={styles.page}>
      {successMessage ? (
        <div className={styles.successMessage}>{successMessage}</div>
      ) : (
        <RegistrationForm onSuccess={handleSuccess} />
      )}
    </div>
  );
}
