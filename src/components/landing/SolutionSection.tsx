import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './SolutionSection.module.css';

const STEPS = [
  {
    num: '01',
    title: 'Загрузите',
    desc: 'Сфотографируйте товар на любом фоне - даже на полу или диване. Никакой студии не нужно.',
  },
  {
    num: '02',
    title: 'Выберите волшебство',
    desc: 'Удалите фон, поместите в интерьер, наденьте на модель, добавьте инфографику. Всё в один клик.',
  },
  {
    num: '03',
    title: 'Качайте и выигрывайте',
    desc: 'Получите десятки готовых вариантов за минуты. Экспортируйте в PNG и заливайте на маркетплейс.',
  },
];

/* Визуалы для шагов — примеры результата */
const STEP_IMAGES = [
  'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
];

export default function SolutionSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={styles.section} id="how-it-works" ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>Всё гениальное - просто</span>
        <h2>3 шага к идеальной карточке</h2>
      </div>

      <div className={styles.steps}>
        {STEPS.map((step, index) => (
          <div
            key={index}
            className={`${styles.step} ${isVisible ? styles.visible : ''}`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div className={styles.stepVisual}>
              <img src={STEP_IMAGES[index]} alt={step.title} />
              <div className={styles.stepNum}>{step.num}</div>
            </div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
            {index < STEPS.length - 1 && (
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
