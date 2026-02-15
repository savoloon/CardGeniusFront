import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/features/LoginForm';
import type { ApiUser } from '../../services/api';
import styles from './LoginPage.module.css';

interface SuccessData {
  user?: ApiUser;
}

export default function LoginPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUserFromLogin } = useAuth();

  const handleSuccess = (data?: SuccessData) => {
    if (data?.user) {
      setUserFromLogin({ user: data.user });
    }
    navigate('/dashboard');
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
