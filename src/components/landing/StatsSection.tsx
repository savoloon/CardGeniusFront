import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './StatsSection.module.css';

const STATS = [
  { value: '50K+', label: 'Обработано изображений' },
  { value: '2 мин', label: 'Среднее время на карточку' },
  { value: '+47%', label: 'Рост конверсии в среднем' },
  { value: '24', label: 'Бесплатных генераций' },
];

export default function StatsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={styles.section} ref={ref}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        {STATS.map((stat, index) => (
          <div key={index} className={styles.stat} style={{ animationDelay: `${index * 0.1}s` }}>
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
