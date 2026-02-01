import { useScrollReveal } from '../../hooks/useScrollReveal';
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

const TESTIMONIALS = [
  {
    quote: 'С Card Genius мы запускаем новые карточки в 5 раз быстрее. Раньше ждали дизайнера неделю — теперь получаем десятки вариантов за час. Конверсия выросла на 40%.',
    name: 'Алексей М.',
    role: 'Селлер на Wildberries, товары для дома',
    avatar: 'А',
  },
  {
    quote: 'Пакетная обработка спасла нас при загрузке нового каталога. 200 фото обработали за вечер. Раньше бы ушла неделя на ретушь.',
    name: 'Мария К.',
    role: 'Владелица бренда одежды',
    avatar: 'М',
  },
  {
    quote: 'Удаление фона в один клик — это магия. Раньше вырезали в Photoshop по часу на каждое фото. Теперь за минуту получаем чистый PNG для всех карточек.',
    name: 'Дмитрий В.',
    role: 'Продавец электроники на Ozon',
    avatar: 'Д',
  },
  {
    quote: 'Попробовали бесплатно — зацепило. Оформили Pro и не жалеем. Карточки выглядят как у крупных брендов, а бюджет в разы меньше.',
    name: 'Елена С.',
    role: 'Маркетолог, интернет-магазин',
    avatar: 'Е',
  },
];

export default function TrustSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={styles.section} ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>Нам доверяют</span>
        <h2>Card Genius AI выбирают те, кто продаёт больше</h2>
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
      <p className={styles.badge}>Первые 100+ селлеров уже с нами</p>

      <div className={styles.testimonials}>
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className={`${styles.testimonial} ${isVisible ? styles.visible : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={styles.quote}>«{t.quote}»</div>
            <div className={styles.author}>
              <div className={styles.avatar}>{t.avatar}</div>
              <div>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
