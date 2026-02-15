import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../../components/features/RegistrationForm';
import type { ApiUser } from '../../services/api';
import styles from './RegisterPage.module.css';

interface SuccessData {
  user?: ApiUser;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleSuccess = (_data?: SuccessData) => {
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.page}>
      <RegistrationForm onSuccess={handleSuccess} />
    </div>
  );
}
