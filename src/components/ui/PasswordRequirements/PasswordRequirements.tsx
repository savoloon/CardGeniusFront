import type { PasswordCheck } from '../../../utils/passwordValidation';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './PasswordRequirements.module.css';

interface PasswordRequirementsProps {
  checks: PasswordCheck[];
}

export default function PasswordRequirements({ checks }: PasswordRequirementsProps) {
  const { t } = useLanguage();
  return (
    <ul className={styles.list} role="list" aria-label={t('validation.requirementsLabel')}>
      {checks.map((check) => (
        <li
          key={check.id}
          className={`${styles.item} ${check.passed ? styles.itemPassed : ''}`}
        >
          <span className={styles.icon} aria-hidden />
          <span>{t(check.labelKey, check.params)}</span>
        </li>
      ))}
    </ul>
  );
}
