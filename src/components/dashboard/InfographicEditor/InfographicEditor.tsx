import { useRef, useCallback } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getZoneCenter } from '../../../lib/infographicZones';
import type { InfographicRecommendedItem, TextLayer } from '../../../types/infographicEditor';
import InfographicRecommendedPanel from './InfographicRecommendedPanel';
import InfographicCanvas, { type InfographicCanvasHandle } from './InfographicCanvas';
import InfographicEditorActions from './InfographicEditorActions';
import styles from './InfographicEditor.module.css';

export type { InfographicRecommendedItem, TextLayer };

interface InfographicEditorProps {
  imageUrl: string;
  recommendedItems: InfographicRecommendedItem[];
  variantIndex: number;
  variantCount: number;
  layers: TextLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<TextLayer>) => void;
  onRemoveLayer: (id: string) => void;
  onAddLayer: (partial: Partial<TextLayer> & Pick<TextLayer, 'x' | 'y' | 'text'>) => void;
  onMoveLayer: (id: string, x: number, y: number) => void;
}

export default function InfographicEditor({
  imageUrl,
  recommendedItems,
  variantIndex,
  variantCount,
  layers,
  selectedId,
  onSelect,
  onUpdateLayer,
  onRemoveLayer,
  onAddLayer,
  onMoveLayer,
}: InfographicEditorProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<InfographicCanvasHandle>(null);

  const placeRecommended = useCallback(
    (item: InfographicRecommendedItem) => {
      const { x, y } = getZoneCenter(item.position);
      onAddLayer({ text: item.text, x, y });
    },
    [onAddLayer]
  );

  const addCustomText = useCallback(() => {
    onAddLayer({ text: t('dashboard.infographicNewText'), x: 50, y: 50 });
  }, [onAddLayer, t]);

  const handleAddLayerAt = useCallback(
    (x: number, y: number, text: string) => {
      onAddLayer({ text, x, y });
    },
    [onAddLayer]
  );

  const handleDropRecommended = useCallback(
    (item: InfographicRecommendedItem, x: number, y: number) => {
      onAddLayer({ text: item.text, x, y });
    },
    [onAddLayer]
  );

  return (
    <div className={styles.root}>
      <InfographicEditorActions
        variantIndex={variantIndex}
        variantCount={variantCount}
        imageUrl={imageUrl}
        layers={layers}
        getDisplayWidth={() => canvasRef.current?.getDisplayWidth() ?? 0}
      />
      <div className={styles.editorBody}>
        <InfographicRecommendedPanel
          recommendedItems={recommendedItems}
          onPlaceRecommended={placeRecommended}
          onAddCustomText={addCustomText}
        />
        <InfographicCanvas
          ref={canvasRef}
          imageUrl={imageUrl}
          layers={layers}
          selectedId={selectedId}
          onSelect={onSelect}
          onUpdateLayer={onUpdateLayer}
          onRemoveLayer={onRemoveLayer}
          onMoveLayer={onMoveLayer}
          onAddLayerAt={handleAddLayerAt}
          onDropRecommended={handleDropRecommended}
        />
      </div>
    </div>
  );
}
