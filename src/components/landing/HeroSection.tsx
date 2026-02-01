import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import styles from './HeroSection.module.css';

const SLIDER_ITEMS = [
  {
    before: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
    alt: 'Часы: скучное фото → стильный лукбук',
  },
  {
    before: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    alt: 'Обувь: базовая съёмка → продающий визуал',
  },
  {
    before: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=400&fit=crop',
    alt: 'Электроника: стол → контекстное использование',
  },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDER_ITEMS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.eyebrow}>AI для маркетплейсов</span>
        <h1 className={styles.title}>
          Вдохни жизнь в карточки товаров.<br />
          Искусственный интеллект для продающих изображений.
        </h1>
        <p className={styles.subtitle}>
          Загрузите фото товара - получите десятки вариантов для Wildberries,
          Ozon, Яндекс.Маркет. Автоматическая обработка фона, AI-примерка и
          ретушь в одном сервисе.
        </p>
        <div className={styles.actions}>
          <Link to="/register">
            <Button variant="primary" className={styles.primaryCta}>
              <span>Создать первую карточку бесплатно</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
          <a href="#demo" className={styles.secondaryCta}>
            <span className={styles.playIcon}>▶</span>
            Смотреть демо (60 сек)
          </a>
        </div>
      </div>

      <div id="slider" className={styles.sliderWrapper}>
        <div className={styles.sliderGlow} />
        <div className={styles.slider}>
          {SLIDER_ITEMS.map((item, index) => (
            <div
              key={index}
              className={`${styles.slide} ${index === activeSlide ? styles.slideActive : ''}`}
              onClick={() => setActiveSlide(index)}
            >
              <div className={styles.beforeAfter}>
                <div className={styles.before}>
                  <img src={item.before} alt={`До: ${item.alt}`} />
                  <span className={styles.label}>До</span>
                </div>
                <div className={styles.arrow}>
                  <span className={styles.arrowIcon}>→</span>
                  <span className={styles.arrowPulse} />
                </div>
                <div className={styles.after}>
                  <img src={item.after} alt={`После: ${item.alt}`} />
                  <span className={styles.label}>После</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.dots}>
          {SLIDER_ITEMS.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.dot} ${index === activeSlide ? styles.dotActive : ''}`}
              onClick={() => setActiveSlide(index)}
              aria-label={`Слайд ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
