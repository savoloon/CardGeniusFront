import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './ToolsSection.module.css';

const TOOL_KEYS = [
  { titleKey: 'toolAiBg', descKey: 'toolAiBgDesc', img: '/AI-Фон.svg' },
  { titleKey: 'toolRemoveBg', descKey: 'toolRemoveBgDesc', img: '/Удаление фона.svg' },
  { titleKey: 'toolTryOn', descKey: 'toolTryOnDesc', img: '/Примерка на модель.svg' },
  { titleKey: 'toolRetouch', descKey: 'toolRetouchDesc', img: '/Ретушь и улучшение.svg' },
  { titleKey: 'toolFaceSwap', descKey: 'toolFaceSwapDesc', img: '/Замена лица модели.svg' },
  { titleKey: 'toolInfographic', descKey: 'toolInfographicDesc', img: '/Инфографика.svg' },
  { titleKey: 'toolBatch', descKey: 'toolBatchDesc', img: '/Пакетная обработка.svg' },
  { titleKey: 'toolApi', descKey: 'toolApiDesc', img: '/API.svg' },
];

export default function ToolsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section className={styles.section} id="tools" ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.eyebrow}>{t('landing.toolsEyebrow')}</span>
        <h2>{t('landing.toolsTitle')}</h2>
        <p>{t('landing.toolsSubtitle')}</p>
      </div>

      <div className={`${styles.grid} ${isVisible ? styles.visible : ''}`}>
        {TOOL_KEYS.map((tool, index) => (
          <div
            key={tool.titleKey}
            className={styles.card}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={styles.cardImage}>
              <img src={tool.img} alt={t(`landing.${tool.titleKey}`)} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.title}>{t(`landing.${tool.titleKey}`)}</h3>
              <p className={styles.desc}>{t(`landing.${tool.descKey}`)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
