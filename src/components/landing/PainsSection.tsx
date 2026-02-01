import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './PainsSection.module.css';

const PAINS = [
  {
    icon: '💰',
    text: 'Тратите тысячи на фотосессии и ретушь',
    detail: 'Профессиональная съёмка одного товара - от 5 000 ₽',
  },
  {
    icon: '⏳',
    text: 'Ждёте результатов дизайнера несколько дней',
    detail: 'А пока конкуренты обновляют карточки ежедневно',
  },
  {
    icon: '📉',
    text: 'Ваши фото выглядят хуже, чем у конкурентов',
    detail: 'Визуал решает: пользователь смотрит на картинку 0.5 сек',
  },
  {
    icon: '🛒',
    text: 'Конверсия падает из-за плохого визуала',
    detail: 'До 90% покупателей отказываются из-за качества фото',
  },
];

/* Изображение: хаос — разбросанные товары, напряжённая работа.
   Unsplash: "messy desk", "scattered products", "stress work" */
const CHAOS_IMAGE = 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&h=500&fit=crop';

export default function PainsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={styles.section} id="pains" ref={ref}>
      <div className={styles.content}>
        <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <span className={styles.eyebrow}>Вы теряете деньги</span>
          <h2 className={styles.title}>
            Ваши карточки товаров остаются без внимания?
          </h2>
          <p className={styles.subtitle}>
            Знакомо? Тысячи селлеров сталкиваются с одними и теми же проблемами
          </p>
        </div>

        <div className={`${styles.grid} ${isVisible ? styles.visible : ''}`}>
          {PAINS.map((pain, index) => (
            <div
              key={index}
              className={styles.card}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className={styles.icon}>{pain.icon}</span>
              <div>
                <p className={styles.text}>{pain.text}</p>
                <span className={styles.detail}>{pain.detail}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={`${styles.visual} ${isVisible ? styles.visible : ''}`}>
          <div className={styles.imageWrap}>
            <img src={CHAOS_IMAGE} alt="Хаос: разбросанные товары, дедлайны" />
            <div className={styles.imageOverlay}>
              <span>До Card Genius AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
