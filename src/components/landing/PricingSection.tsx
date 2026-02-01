import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './PricingSection.module.css';

const PLANS = [
  {
    name: 'Starter',
    price: '0 ₽',
    period: 'навсегда',
    desc: 'Бесплатный старт',
    features: ['24 генерации бесплатно', 'Базовые инструменты', 'Экспорт в PNG'],
    cta: 'Попробовать',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '990 ₽',
    period: '/мес',
    desc: 'Самый популярный',
    features: [
      '200 генераций в месяц',
      'Все инструменты AI',
      'Приоритетная обработка',
      'Поддержка 24/7',
    ],
    cta: 'Создать карточку бесплатно',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '2 990 ₽',
    period: '/мес',
    desc: 'Для агентств',
    features: [
      'Безлимит генераций',
      'API доступ',
      'Свои модели',
      'Выделенный менеджер',
    ],
    cta: 'Связаться с нами',
    highlighted: false,
  },
];

export default function PricingSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={styles.section} id="pricing" ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <h2>Начните с 24 бесплатных генераций. Платите только когда растите.</h2>
      </div>

      <div className={`${styles.grid} ${isVisible ? styles.visible : ''}`}>
        {PLANS.map((plan, i) => (
          <div
            key={plan.name}
            className={`${styles.card} ${plan.highlighted ? styles.cardHighlighted : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={styles.badge}>{plan.desc}</div>
            <h3 className={styles.name}>{plan.name}</h3>
            <div className={styles.price}>
              <span className={styles.priceValue}>{plan.price}</span>
              <span className={styles.period}>{plan.period}</span>
            </div>
            <ul className={styles.features}>
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <Link to="/register">
              <Button
                variant={plan.highlighted ? 'primary' : 'outline'}
                fullWidth
                className={styles.cta}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
