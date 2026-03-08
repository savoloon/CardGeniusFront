import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './TrustSection.module.css';

const MARKETPLACES = [
  { name: 'Wildberries', color: '#cb11ab' },
  { name: 'Ozon', color: '#005bff' },
  { name: 'Яндекс.Маркет', color: '#ffcc00' },
  { name: 'Amazon', color: '#ff9900' },
  { name: 'AliExpress', color: '#e62e04' },
  { name: 'Lamoda', color: '#000000' },
  { name: 'eBay', color: '#0064d2' },
];

const TESTIMONIAL_KEYS = [
  { quoteKey: 'trust1', nameKey: 'trust1Name', roleKey: 'trust1Role', avatar: 'А' },
  { quoteKey: 'trust2', nameKey: 'trust2Name', roleKey: 'trust2Role', avatar: 'М' },
  { quoteKey: 'trust3', nameKey: 'trust3Name', roleKey: 'trust3Role', avatar: 'Д' },
  { quoteKey: 'trust4', nameKey: 'trust4Name', roleKey: 'trust4Role', avatar: 'Е' },
];

export default function TrustSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section className={styles.section} ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>{t('landing.trustEyebrow')}</span>
        <h2>{t('landing.trustTitle')}</h2>
      </div>

      <div className={styles.marqueeWrap}>
        <div className={styles.marquee}>
          <div className={styles.marqueeInner}>
            {[...MARKETPLACES, ...MARKETPLACES].map((mp, i) => (
              <span
                key={`${mp.name}-${i}`}
                className={styles.logoText}
                style={{ borderColor: mp.color }}
              >
                {mp.name}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className={styles.badge}>{t('landing.trustBadge')}</p>

      <div className={styles.testimonials}>
        {TESTIMONIAL_KEYS.map((item, i) => (
          <div
            key={item.quoteKey}
            className={`${styles.testimonial} ${isVisible ? styles.visible : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={styles.quote}>«{t(`landing.${item.quoteKey}`)}»</div>
            <div className={styles.author}>
              <div className={styles.avatar}>{item.avatar}</div>
              <div>
                <strong>{t(`landing.${item.nameKey}`)}</strong>
                <span>{t(`landing.${item.roleKey}`)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
