import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './FinalCTASection.module.css';

const GUARANTEE_KEYS = [
  { icon: '🛡️', key: 'ctaGuarantee1' },
  { icon: '🔒', key: 'ctaGuarantee2' },
  { icon: '↩️', key: 'ctaGuarantee3' },
];

export default function FinalCTASection() {
  const [email, setEmail] = useState('');
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section className={styles.section} ref={ref}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        <h2 className={styles.title}>{t('landing.ctaTitle')}</h2>
        <p className={styles.subtitle}>{t('landing.ctaSubtitle')}</p>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder={t('landing.ctaPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <Link to="/register">
            <Button type="button" variant="primary" className={styles.cta}>
              {t('landing.ctaButton')}
            </Button>
          </Link>
        </form>

        <div className={styles.guarantees}>
          {GUARANTEE_KEYS.map((g) => (
            <span key={g.key} className={styles.guarantee}>
              <span className={styles.gIcon}>{g.icon}</span>
              {t(`landing.${g.key}`)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
