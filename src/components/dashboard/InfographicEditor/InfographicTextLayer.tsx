import { useLanguage } from '../../../contexts/LanguageContext';
import type { TextLayer } from '../../../types/infographicEditor';
import styles from './InfographicEditor.module.css';

interface InfographicTextLayerProps {
  layer: TextLayer;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<TextLayer>) => void;
  onRemove: (id: string) => void;
  onPointerDownHandle: (e: React.PointerEvent, id: string) => void;
}

export default function InfographicTextLayer({
  layer,
  selected,
  onSelect,
  onUpdate,
  onRemove,
  onPointerDownHandle,
}: InfographicTextLayerProps) {
  const { t } = useLanguage();

  return (
    <div
      className={`${styles.layer} ${selected ? styles.layerSelected : ''}`}
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        zIndex: layer.zIndex,
        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(layer.id);
      }}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={t('dashboard.infographicDrag')}
        onPointerDown={(e) => onPointerDownHandle(e, layer.id)}
      >
        ⋮⋮
      </button>
      <div
        className={styles.layerInner}
        style={{
          backgroundColor:
            layer.backgroundColor === 'transparent' ? 'transparent' : layer.backgroundColor,
        }}
      >
        <textarea
          className={styles.layerText}
          dir={layer.direction}
          value={layer.text}
          onChange={(e) => onUpdate(layer.id, { text: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          rows={Math.min(8, Math.max(2, layer.text.split('\n').length))}
          style={{
            fontFamily: layer.fontFamily,
            fontSize: `${layer.fontSize}px`,
            color: layer.color,
            fontWeight: layer.fontWeight,
            fontStyle: layer.fontStyle,
            textDecoration: layer.textDecoration,
            textAlign: layer.textAlign,
          }}
        />
      </div>
      {selected && (
        <button
          type="button"
          className={styles.removeLayer}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(layer.id);
          }}
          aria-label={t('dashboard.infographicRemoveLayer')}
        >
          ×
        </button>
      )}
    </div>
  );
}
