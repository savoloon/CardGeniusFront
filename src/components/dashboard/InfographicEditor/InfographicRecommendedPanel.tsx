import { Button } from '../../ui';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  filterAvailableRecommended,
  recommendedItemKey,
} from '../../../lib/recommendedItemKey';
import type { InfographicRecommendedItem } from '../../../types/infographicEditor';
import styles from './InfographicEditor.module.css';

interface InfographicRecommendedPanelProps {
  recommendedItems: InfographicRecommendedItem[];
  usedRecommendedKeys?: string[];
  onPlaceRecommended: (item: InfographicRecommendedItem) => void;
  onAddCustomText: () => void;
}

export default function InfographicRecommendedPanel({
  recommendedItems,
  usedRecommendedKeys = [],
  onPlaceRecommended,
  onAddCustomText,
}: InfographicRecommendedPanelProps) {
  const { t } = useLanguage();
  const visibleItems = filterAvailableRecommended(recommendedItems, usedRecommendedKeys);

  return (
    <aside className={styles.aside}>
      <h3 className={styles.asideTitle}>{t('dashboard.infographicRecommended')}</h3>
      <p className={styles.asideHint}>{t('dashboard.infographicRecommendedHint')}</p>
      <p className={styles.canvasHint}>{t('dashboard.infographicDoubleClickHint')}</p>
      {visibleItems.length > 0 ? (
        <ul className={styles.recommendedList}>
          {visibleItems.map((item) => (
            <li key={recommendedItemKey(item)} className={styles.recommendedItem}>
              <span
                className={styles.recommendedText}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(item));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                {item.text}
              </span>
              <Button
                type="button"
                variant="outline"
                className={styles.placeBtn}
                onClick={() => onPlaceRecommended(item)}
              >
                {t('dashboard.infographicPlaceHere')}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.asideHint}>{t('dashboard.allRecommendedPlaced')}</p>
      )}
      <Button type="button" className={styles.addBtn} onClick={onAddCustomText}>
        {t('dashboard.infographicAddText')}
      </Button>
    </aside>
  );
}
