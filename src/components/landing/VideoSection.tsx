import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './VideoSection.module.css';

export default function VideoSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section className={styles.section} id="demo" ref={ref}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>{t('landing.videoEyebrow')}</span>
        <h2>{t('landing.videoTitle')}</h2>
        <p>{t('landing.videoSubtitle')}</p>
        <div className={styles.videoWrap}>
          <div className={styles.videoPlaceholder}>
            <div className={styles.playButton}>
              <span>▶</span>
            </div>
            <span className={styles.placeholderText}>
              {t('landing.videoPlaceholder')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
