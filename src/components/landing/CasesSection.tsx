import { useState, useCallback } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './CasesSection.module.css';

const CASE_KEYS = [
  {
    categoryKey: 'casesCategory1',
    resultKey: 'casesResult1',
    storyKey: 'casesStory1',
    before: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    after: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
  },
  {
    categoryKey: 'casesCategory2',
    resultKey: 'casesResult2',
    storyKey: 'casesStory2',
    before: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=500&fit=crop',
    after: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=500&fit=crop',
  },
  {
    categoryKey: 'casesCategory3',
    resultKey: 'casesResult3',
    storyKey: 'casesStory3',
    before: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop',
    after: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=500&fit=crop',
  },
];

export default function CasesSection() {
  const [activeCase, setActiveCase] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();

  const c = CASE_KEYS[activeCase];

  const updateSlider = useCallback((clientX: number, rect: DOMRect) => {
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, x)));
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    updateSlider(e.clientX, rect);
  }, [updateSlider]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch) updateSlider(touch.clientX, rect);
  }, [updateSlider]);

  return (
    <section className={styles.section} id="cases" ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>{t('landing.casesEyebrow')}</span>
        <h2>{t('landing.casesTitle')}</h2>
        <p>{t('landing.casesSubtitle')}</p>
      </div>

      <div className={styles.tabs}>
        {CASE_KEYS.map((item, index) => (
          <button
            key={item.categoryKey}
            type="button"
            className={`${styles.tab} ${index === activeCase ? styles.tabActive : ''}`}
            onClick={() => { setActiveCase(index); setSliderPos(50); }}
          >
            {t(`landing.${item.categoryKey}`)}
          </button>
        ))}
      </div>

      <div className={`${styles.caseContent} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.sliderContainer}>
          <div
            className={styles.sliderTrack}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            <div className={styles.before}>
              <img src={c.before} alt={t('landing.casesBefore')} />
            </div>
            <div
              className={styles.after}
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img src={c.after} alt={t('landing.casesAfter')} />
            </div>
            <div
              className={styles.divider}
              style={{ left: `${sliderPos}%` }}
            >
              <span className={styles.dividerHandle} />
            </div>
          </div>
        </div>
        <p className={styles.story}>{t(`landing.${c.storyKey}`)}</p>
        <div className={styles.result}>
          <span className={styles.resultLabel}>{t('landing.casesResultLabel')}</span>
          <strong className={styles.resultValue}>{t(`landing.${c.resultKey}`)}</strong>
        </div>
      </div>
    </section>
  );
}
