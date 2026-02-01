import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './ToolsSection.module.css';

const TOOLS = [
  {title: 'AI-Фон', desc: 'Поместите товар в любой мир - от пляжа до космоса.', img: '/AI-Фон.svg' },
  {title: 'Удаление фона', desc: 'Чистое PNG в один клик. Никакого фотошопа.', img: '/Удаление фона.svg' },
  {title: 'Примерка на модель', desc: 'Покажите посадку на фигуре, не сшивая образец.', img: '/Примерка на модель.svg' },
  {title: 'Ретушь и улучшение', desc: 'Upscale, Inpaint, Outpaint - простыми словами.', img: '/Ретушь и улучшение.svg' },
  {title: 'Замена лица модели', desc: 'Персонализируйте карточки под целевую аудиторию.', img: '/Замена лица модели.svg' },
  {title: 'Инфографика', desc: 'Добавьте размеры, фичи и преимущества на фото.', img: '/Инфографика.svg' },
  {title: 'Пакетная обработка', desc: 'Обработайте 100 фото разом. Экономьте часы.', img: '/Пакетная обработка.svg' },
  {title: 'API', desc: 'Встройте Card Genius в ваш workflow автоматически.', img: '/API.svg' },
];

export default function ToolsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={styles.section} id="tools" ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>Полный арсенал</span>
        <h2>Инструменты для создания продающих изображений</h2>
        <p>Всё необходимое для карточек маркетплейсов в одном месте</p>
      </div>

      <div className={`${styles.grid} ${isVisible ? styles.visible : ''}`}>
        {TOOLS.map((tool, index) => (
          <div
            key={index}
            className={styles.card}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={styles.cardImage}>
              <img src={tool.img} alt={tool.title} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.title}>{tool.title}</h3>
              <p className={styles.desc}>{tool.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
