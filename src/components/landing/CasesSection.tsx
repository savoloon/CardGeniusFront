import { useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './CasesSection.module.css';

const CASES = [
  {
    category: 'Fashion',
    before: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    after: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
    result: '+85% к просмотрам карточки',
    story: 'Платье на вешалке → стильный лукбук в парижском кафе',
  },
  {
    category: 'Electronics',
    before: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=500&fit=crop',
    after: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=500&fit=crop',
    result: '+47% к добавлениям в корзину',
    story: 'Смартфон на столе → в руках на фоне горного хребта',
  },
  {
    category: 'Home Goods',
    before: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop',
    after: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=500&fit=crop',
    result: 'Средний чек +23%',
    story: 'Коврик свёрнутый → в уютной гостиной с питомцем',
  },
];

export default function CasesSection() {
  const [activeCase, setActiveCase] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  const c = CASES[activeCase];

  return (
    <section className={styles.section} id="cases" ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>До и После</span>
        <h2>Не верите? Смотрите, что может AI.</h2>
        <p>Реальные кейсы для разных ниш. Тяните ползунок для сравнения.</p>
      </div>

      <div className={styles.tabs}>
        {CASES.map((item, index) => (
          <button
            key={index}
            type="button"
            className={`${styles.tab} ${index === activeCase ? styles.tabActive : ''}`}
            onClick={() => { setActiveCase(index); setSliderPos(50); }}
          >
            {item.category}
          </button>
        ))}
      </div>

      <div className={`${styles.caseContent} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.sliderContainer}>
          <div
            className={styles.sliderTrack}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              setSliderPos(Math.max(0, Math.min(100, x)));
            }}
          >
            <div className={styles.before}>
              <img src={c.before} alt="До" />
            </div>
            <div
              className={styles.after}
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img src={c.after} alt="После" />
            </div>
            <div
              className={styles.divider}
              style={{ left: `${sliderPos}%` }}
            >
              <span className={styles.dividerHandle} />
            </div>
          </div>
        </div>
        <p className={styles.story}>{c.story}</p>
        <div className={styles.result}>
          <span className={styles.resultLabel}>Результат:</span>
          <strong className={styles.resultValue}>{c.result}</strong>
        </div>
      </div>
    </section>
  );
}
