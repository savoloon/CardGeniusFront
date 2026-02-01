import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './VideoSection.module.css';

/* Секция для демо-видео. Замените placeholder на iframe с YouTube/Vimeo:
   <iframe src="https://www.youtube.com/embed/VIDEO_ID" ... />
   Или вставьте собственное видео о продукте */
export default function VideoSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={styles.section} id="demo" ref={ref}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>60 секунд</span>
        <h2>Как работает Card Genius AI</h2>
        <p>Посмотрите, как за минуту превратить обычное фото в продающую карточку</p>
        <div className={styles.videoWrap}>
          <div className={styles.videoPlaceholder}>
            <div className={styles.playButton}>
              <span>▶</span>
            </div>
            <span className={styles.placeholderText}>
              Демо-видео: загрузка фото → выбор шаблона → готовый результат
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
