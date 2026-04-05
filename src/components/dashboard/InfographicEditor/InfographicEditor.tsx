import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '../../ui';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getZoneCenter } from '../../../lib/infographicZones';
import styles from './InfographicEditor.module.css';

export interface InfographicRecommendedItem {
  text: string;
  position: string;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: 400 | 600 | 700;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  rotation: number;
  zIndex: number;
  textAlign: 'left' | 'center' | 'right';
  direction: 'ltr' | 'rtl';
  /** Text box background (CSS color or transparent) */
  backgroundColor: string;
}

const FONT_OPTIONS = [
  'Inter, system-ui, sans-serif',
  'Georgia, serif',
  'Arial, sans-serif',
  '"Times New Roman", Times, serif',
  '"Courier New", monospace',
];

function newLayer(partial: Partial<TextLayer> & Pick<TextLayer, 'x' | 'y' | 'text'>): TextLayer {
  return {
    id: crypto.randomUUID(),
    fontFamily: FONT_OPTIONS[0],
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: 600 as TextLayer['fontWeight'],
    fontStyle: 'normal',
    textDecoration: 'none',
    rotation: 0,
    zIndex: 10,
    textAlign: 'left',
    direction: 'ltr',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    ...partial,
  };
}

interface InfographicEditorProps {
  imageUrl: string;
  recommendedItems: InfographicRecommendedItem[];
}

export default function InfographicEditor({ imageUrl, recommendedItems }: InfographicEditorProps) {
  const { t } = useLanguage();
  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(
    null
  );

  const selected = layers.find((l) => l.id === selectedId) ?? null;

  const placeRecommended = useCallback((item: InfographicRecommendedItem) => {
    const { x, y } = getZoneCenter(item.position);
    setLayers((prev) => [...prev, newLayer({ text: item.text, x, y })]);
  }, []);

  const addCustomText = useCallback(() => {
    setLayers((prev) => [...prev, newLayer({ text: t('dashboard.infographicNewText'), x: 50, y: 50 })]);
  }, [t]);

  const addTextAtPercent = useCallback(
    (x: number, y: number) => {
      const layer = newLayer({ text: t('dashboard.infographicNewText'), x, y });
      setLayers((prev) => [...prev, layer]);
      setSelectedId(layer.id);
    },
    [t]
  );

  const updateLayer = useCallback((id: string, patch: Partial<TextLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const removeLayer = useCallback((id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }, []);

  const onPointerDownHandle = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      const layer = layers.find((l) => l.id === id);
      if (!layer || !containerRef.current) return;
      dragRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        origX: layer.x,
        origY: layer.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setSelectedId(id);
    },
    [layers]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w < 1 || h < 1) return;
      const dx = ((e.clientX - dragRef.current.startX) / w) * 100;
      const dy = ((e.clientY - dragRef.current.startY) / h) * 100;
      const nx = Math.min(100, Math.max(0, dragRef.current.origX + dx));
      const ny = Math.min(100, Math.max(0, dragRef.current.origY + dy));
      setLayers((prev) =>
        prev.map((l) => (l.id === dragRef.current!.id ? { ...l, x: nx, y: ny } : l))
      );
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const onDropCanvas = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!containerRef.current) return;
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      try {
        const item = JSON.parse(raw) as InfographicRecommendedItem;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setLayers((prev) => [...prev, newLayer({ text: item.text, x, y })]);
      } catch {
        /* ignore */
      }
    },
    []
  );

  const onDragOverCanvas = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  }, []);

  const onDragLeaveCanvas = useCallback((e: React.DragEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  }, []);

  const onCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest(`.${styles.layer}`)) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width < 1 || rect.height < 1) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      addTextAtPercent(
        Math.min(100, Math.max(0, x)),
        Math.min(100, Math.max(0, y))
      );
    },
    [addTextAtPercent]
  );

  const onCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.layer}`)) return;
    setSelectedId(null);
  }, []);

  const fillPickerValue =
    selected && selected.backgroundColor !== 'transparent'
      ? selected.backgroundColor.startsWith('#')
        ? selected.backgroundColor
        : '#ffffff'
      : '#ffffff';

  return (
    <div className={styles.root}>
      <aside className={styles.aside}>
        <h3 className={styles.asideTitle}>{t('dashboard.infographicRecommended')}</h3>
        <p className={styles.asideHint}>{t('dashboard.infographicRecommendedHint')}</p>
        <p className={styles.canvasHint}>{t('dashboard.infographicDoubleClickHint')}</p>
        <ul className={styles.recommendedList}>
          {recommendedItems.map((item, idx) => (
            <li key={idx} className={styles.recommendedItem}>
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
                onClick={() => placeRecommended(item)}
              >
                {t('dashboard.infographicPlaceHere')}
              </Button>
            </li>
          ))}
        </ul>
        <Button type="button" className={styles.addBtn} onClick={addCustomText}>
          {t('dashboard.infographicAddText')}
        </Button>
      </aside>

      <div className={styles.workspace}>
        <div
          ref={containerRef}
          className={`${styles.canvas} ${dragOver ? styles.canvasDragOver : ''}`}
          onDrop={onDropCanvas}
          onDragOver={onDragOverCanvas}
          onDragLeave={onDragLeaveCanvas}
          onClick={onCanvasClick}
          onDoubleClick={onCanvasDoubleClick}
        >
          <img src={imageUrl} alt="" className={styles.canvasImg} draggable={false} />
          {layers.map((layer) => (
            <div
              key={layer.id}
              className={`${styles.layer} ${selectedId === layer.id ? styles.layerSelected : ''}`}
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                zIndex: layer.zIndex,
                transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(layer.id);
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
                  onChange={(e) => updateLayer(layer.id, { text: e.target.value })}
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
              {selectedId === layer.id && (
                <button
                  type="button"
                  className={styles.removeLayer}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLayer(layer.id);
                  }}
                  aria-label={t('dashboard.infographicRemoveLayer')}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {selected && (
          <div className={styles.toolbar} onClick={(e) => e.stopPropagation()}>
            <label className={styles.toolLabel}>
              {t('dashboard.infographicFont')}
              <select
                className={styles.toolSelect}
                value={selected.fontFamily}
                onChange={(e) => updateLayer(selected.id, { fontFamily: e.target.value })}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f.split(',')[0].replace(/"/g, '')}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.toolLabel}>
              {t('dashboard.infographicSize')}
              <input
                type="number"
                className={styles.toolInput}
                min={8}
                max={120}
                value={selected.fontSize}
                onChange={(e) =>
                  updateLayer(selected.id, {
                    fontSize: Math.max(8, Math.min(120, Number(e.target.value) || 16)),
                  })
                }
              />
            </label>
            <label className={styles.toolLabel}>
              {t('dashboard.infographicColor')}
              <input
                type="color"
                className={styles.colorInput}
                value={selected.color.startsWith('#') ? selected.color : '#1a1a1a'}
                onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
              />
            </label>
            <label className={styles.toolLabel}>
              {t('dashboard.infographicFillColor')}
              <input
                type="color"
                className={styles.colorInput}
                value={fillPickerValue}
                disabled={selected.backgroundColor === 'transparent'}
                onChange={(e) => updateLayer(selected.id, { backgroundColor: e.target.value })}
              />
            </label>
            <label className={styles.toolCheck}>
              <input
                type="checkbox"
                checked={selected.backgroundColor === 'transparent'}
                onChange={(e) =>
                  updateLayer(selected.id, {
                    backgroundColor: e.target.checked ? 'transparent' : 'rgba(255,255,255,0.92)',
                  })
                }
              />
              <span>{t('dashboard.infographicTransparentFill')}</span>
            </label>
            <div className={styles.toolGroup} role="group" aria-label={t('dashboard.infographicAlignGroup')}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${selected.textAlign === 'left' ? styles.toggleActive : ''}`}
                onClick={() => updateLayer(selected.id, { textAlign: 'left' })}
                title={t('dashboard.infographicAlignLeft')}
              >
                L
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${selected.textAlign === 'center' ? styles.toggleActive : ''}`}
                onClick={() => updateLayer(selected.id, { textAlign: 'center' })}
                title={t('dashboard.infographicAlignCenter')}
              >
                C
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${selected.textAlign === 'right' ? styles.toggleActive : ''}`}
                onClick={() => updateLayer(selected.id, { textAlign: 'right' })}
                title={t('dashboard.infographicAlignRight')}
              >
                R
              </button>
            </div>
            <button
              type="button"
              className={`${styles.toggleBtn} ${selected.direction === 'rtl' ? styles.toggleActive : ''}`}
              onClick={() =>
                updateLayer(selected.id, { direction: selected.direction === 'rtl' ? 'ltr' : 'rtl' })
              }
              title={t('dashboard.infographicRtl')}
            >
              RTL
            </button>
            <label className={styles.toolLabel}>
              {t('dashboard.infographicRotation')}
              <input
                type="number"
                className={styles.toolInput}
                min={-180}
                max={180}
                value={selected.rotation}
                onChange={(e) => updateLayer(selected.id, { rotation: Number(e.target.value) || 0 })}
              />
            </label>
            <div className={styles.toolGroup}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${selected.fontWeight >= 600 ? styles.toggleActive : ''}`}
                onClick={() =>
                  updateLayer(selected.id, { fontWeight: selected.fontWeight >= 600 ? 400 : 700 })
                }
              >
                B
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${selected.fontStyle === 'italic' ? styles.toggleActive : ''}`}
                onClick={() =>
                  updateLayer(selected.id, {
                    fontStyle: selected.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
              >
                I
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${selected.textDecoration === 'underline' ? styles.toggleActive : ''}`}
                onClick={() =>
                  updateLayer(selected.id, {
                    textDecoration: selected.textDecoration === 'underline' ? 'none' : 'underline',
                  })
                }
              >
                U
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
