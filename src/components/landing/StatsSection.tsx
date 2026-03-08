import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './StatsSection.module.css';

const STAT_KEYS = ['statsProcessed', 'statsAvgTime', 'statsConversion', 'statsFreeGen'] as const;
const STAT_VALUES = ['50K+', '2 мин', '+47%', '24'];

export default function StatsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section className={styles.section} ref={ref}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        {STAT_KEYS.map((key, index) => (
          <div key={key} className={styles.stat} style={{ animationDelay: `${index * 0.1}s` }}>
            <span className={styles.value}>{STAT_VALUES[index]}</span>
            <span className={styles.label}>{t(`landing.${key}`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
