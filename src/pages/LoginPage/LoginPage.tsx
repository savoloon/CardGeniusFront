import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/features/LoginForm';
import type { ApiUser } from '../../services/api';
import styles from './LoginPage.module.css';

interface SuccessData {
  user?: ApiUser;
}

export default function LoginPage() {
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
      <LoginForm onSuccess={handleSuccess} />
    </div>
  );
}
