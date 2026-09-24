import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../../components/features/RegistrationForm';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.page}>
      <RegistrationForm onSuccess={handleSuccess} />
    </div>
  );
}
