import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './SolutionSection.module.css';

const STEP_KEYS = [
  { num: '01', titleKey: 'solutionStep1Title', descKey: 'solutionStep1Desc' },
  { num: '02', titleKey: 'solutionStep2Title', descKey: 'solutionStep2Desc' },
  { num: '03', titleKey: 'solutionStep3Title', descKey: 'solutionStep3Desc' },
];

/* Визуалы для шагов — примеры результата */
const STEP_IMAGES = [
  'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
];

export default function SolutionSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section className={styles.section} id="how-it-works" ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>{t('landing.solutionEyebrow')}</span>
        <h2>{t('landing.solutionTitle')}</h2>
      </div>

      <div className={styles.steps}>
        {STEP_KEYS.map((step, index) => (
          <div
            key={step.titleKey}
            className={`${styles.step} ${isVisible ? styles.visible : ''}`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div className={styles.stepVisual}>
              <img src={STEP_IMAGES[index]} alt={t(`landing.${step.titleKey}`)} />
              <div className={styles.stepNum}>{step.num}</div>
            </div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>{t(`landing.${step.titleKey}`)}</h3>
              <p className={styles.stepDesc}>{t(`landing.${step.descKey}`)}</p>
            </div>
            {index < STEP_KEYS.length - 1 && (
              <div className={styles.connector} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <div className={`${styles.timeline} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.timelineLine} />
      </div>
    </section>
  );
}
