import { Button } from '../../components/ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { recommendedItemKey } from '../../lib/recommendedItemKey';
import type { InfographicRecommendedItem } from '../../types/infographicEditor';
import styles from './ImageEditor.module.css';

interface RecommendedTextsPanelProps {
  items: InfographicRecommendedItem[];
  onPlace: (item: InfographicRecommendedItem) => void;
}

export default function RecommendedTextsPanel({ items, onPlace }: RecommendedTextsPanelProps) {
  const { t } = useLanguage();

  if (items.length === 0) return null;

  return (
    <aside className={styles.aside}>
      <h3 className={styles.asideTitle}>{t('dashboard.infographicRecommended')}</h3>
      <p className={styles.asideHint}>{t('dashboard.infographicRecommendedHint')}</p>
      <ul className={styles.recommendedList}>
        {items.map((item) => (
          <li key={recommendedItemKey(item)} className={styles.recommendedItem}>
            <span className={styles.recommendedText}>{item.text}</span>
            <Button
              type="button"
              variant="outline"
              className={styles.placeBtn}
              onClick={() => onPlace(item)}
            >
              {t('dashboard.infographicPlaceHere')}
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
