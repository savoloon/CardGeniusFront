import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './PainsSection.module.css';

const PAIN_KEYS = [
  { icon: '💰', textKey: 'pains1', detailKey: 'pains1Detail' },
  { icon: '⏳', textKey: 'pains2', detailKey: 'pains2Detail' },
  { icon: '📉', textKey: 'pains3', detailKey: 'pains3Detail' },
  { icon: '🛒', textKey: 'pains4', detailKey: 'pains4Detail' },
];

const CHAOS_IMAGE = '/хаос.png';

export default function PainsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section className={styles.section} id="pains" ref={ref}>
      <div className={styles.content}>
        <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <span className={styles.eyebrow}>{t('landing.painsEyebrow')}</span>
          <h2 className={styles.title}>{t('landing.painsTitle')}</h2>
          <p className={styles.subtitle}>{t('landing.painsSubtitle')}</p>
        </div>

        <div className={`${styles.grid} ${isVisible ? styles.visible : ''}`}>
          {PAIN_KEYS.map((pain, index) => (
            <div
              key={pain.textKey}
              className={styles.card}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className={styles.icon}>{pain.icon}</span>
              <div>
                <p className={styles.text}>{t(`landing.${pain.textKey}`)}</p>
                <span className={styles.detail}>{t(`landing.${pain.detailKey}`)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={`${styles.visual} ${isVisible ? styles.visible : ''}`}>
          <div className={styles.imageWrap}>
            <img src={CHAOS_IMAGE} alt={t('landing.painsImageAlt')} />
            <div className={styles.imageOverlay}>
              <span>{t('landing.painsOverlay')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
