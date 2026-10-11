import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './GrantorsSection.module.css';

export default function GrantorsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section className={styles.section} ref={ref} aria-label={t('landing.grantorsAria')}>
      <div className={`${styles.inner} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.logos}>
          <img
            className={styles.fsiLogo}
            src="/fsi.png"
            alt={t('landing.grantorsFsiAlt')}
          />
          <div className={styles.platformMark}>
            <img
              className={styles.platformLogo}
              src="/platform-logo.svg"
              alt={t('landing.grantorsPlatformAlt')}
            />
          </div>
        </div>
        <p className={styles.text}>{t('landing.grantorsText')}</p>
      </div>
    </section>
  );
}
