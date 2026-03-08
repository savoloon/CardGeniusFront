import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './PricingSection.module.css';

const PLANS = [
  {
    nameKey: 'planStarter',
    price: '0 ₽',
    periodKey: 'planPeriodForever',
    descKey: 'planStarterDesc',
    featureKeys: ['planStarterFeatures', 'planStarterFeatures2', 'planStarterFeatures3'],
    ctaKey: 'planStarterCta',
    highlighted: false,
  },
  {
    nameKey: 'planPro',
    price: '990 ₽',
    periodKey: 'planPeriodMonth',
    descKey: 'planProDesc',
    featureKeys: ['planProFeatures1', 'planProFeatures2', 'planProFeatures3', 'planProFeatures4'],
    ctaKey: 'planProCta',
    highlighted: true,
  },
  {
    nameKey: 'planBusiness',
    price: '2 990 ₽',
    periodKey: 'planPeriodMonth',
    descKey: 'planBusinessDesc',
    featureKeys: ['planBusinessFeatures1', 'planBusinessFeatures2', 'planBusinessFeatures3', 'planBusinessFeatures4'],
    ctaKey: 'planBusinessCta',
    highlighted: false,
  },
];

export default function PricingSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section className={styles.section} id="pricing" ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <h2>{t('landing.pricingTitle')}</h2>
      </div>

      <div className={`${styles.grid} ${isVisible ? styles.visible : ''}`}>
        {PLANS.map((plan, i) => (
          <div
            key={plan.nameKey}
            className={`${styles.card} ${plan.highlighted ? styles.cardHighlighted : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={styles.badge}>{t(`landing.${plan.descKey}`)}</div>
            <h3 className={styles.name}>{t(`landing.${plan.nameKey}`)}</h3>
            <div className={styles.price}>
              <span className={styles.priceValue}>{plan.price}</span>
              <span className={styles.period}>{t(`landing.${plan.periodKey}`)}</span>
            </div>
            <ul className={styles.features}>
              {plan.featureKeys.map((key) => (
                <li key={key}>{t(`landing.${key}`)}</li>
              ))}
            </ul>
            <Link to="/register">
              <Button
                variant={plan.highlighted ? 'primary' : 'outline'}
                fullWidth
                className={styles.cta}
              >
                {t(`landing.${plan.ctaKey}`)}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
