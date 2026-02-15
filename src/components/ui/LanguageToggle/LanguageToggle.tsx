import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './LanguageToggle.module.css';

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      <button
        type="button"
        className={`${styles.btn} ${locale === 'ru' ? styles.btnActive : ''}`}
        onClick={() => setLocale('ru')}
        aria-label="Русский"
        title="Русский"
      >
        RU
      </button>
      <button
        type="button"
        className={`${styles.btn} ${locale === 'en' ? styles.btnActive : ''}`}
        onClick={() => setLocale('en')}
        aria-label="English"
        title="English"
      >
        EN
      </button>
    </div>
  );
}
