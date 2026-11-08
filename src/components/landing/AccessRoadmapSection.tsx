import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AccessRoadmapSection.module.css';

const STEPS = [
  { titleKey: 'roadmapStep1Title', descKey: 'roadmapStep1Desc' },
  { titleKey: 'roadmapStep2Title', descKey: 'roadmapStep2Desc' },
  { titleKey: 'roadmapStep3Title', descKey: 'roadmapStep3Desc' },
  { titleKey: 'roadmapStep4Title', descKey: 'roadmapStep4Desc' },
] as const;

export default function AccessRoadmapSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <section className={styles.section} id="access" ref={ref} aria-labelledby="access-title">
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>{t('landing.roadmapEyebrow')}</span>
        <h2 id="access-title">{t('landing.roadmapTitle')}</h2>
        <p className={styles.subtitle}>{t('landing.roadmapSubtitle')}</p>
      </div>

      <ol className={`${styles.steps} ${isVisible ? styles.visible : ''}`}>
        {STEPS.map((step, index) => (
          <li key={step.titleKey} className={styles.step} style={{ animationDelay: `${index * 0.12}s` }}>
            <span className={styles.index} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className={styles.card}>
              <h3 className={styles.stepTitle}>{t(`landing.${step.titleKey}`)}</h3>
              <p className={styles.stepDesc}>{t(`landing.${step.descKey}`)}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className={`${styles.note} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.noteMark} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v6M12 8h.01" strokeLinecap="round" />
          </svg>
        </span>
        <p>{t('landing.roadmapNote')}</p>
      </div>

      <div className={`${styles.actions} ${isVisible ? styles.visible : ''}`}>
        <a href="#pricing" className={styles.pricingLink}>
          {t('landing.roadmapCtaPricing')}
        </a>
        <Link to={isAuthenticated ? '/dashboard' : '/register'}>
          <Button variant="primary">
            {isAuthenticated ? t('landing.roadmapCtaAccount') : t('landing.roadmapCtaRegister')}
          </Button>
        </Link>
      </div>
    </section>
  );
}
