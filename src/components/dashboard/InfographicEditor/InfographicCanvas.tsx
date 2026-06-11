import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { InfographicRecommendedItem, TextLayer } from '../../../types/infographicEditor';
import InfographicTextLayer from './InfographicTextLayer';
import InfographicLayerToolbar from './InfographicLayerToolbar';
import styles from './InfographicEditor.module.css';

export interface InfographicCanvasHandle {
  getDisplayWidth: () => number;
}

interface InfographicCanvasProps {
  imageUrl: string;
  layers: TextLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<TextLayer>) => void;
  onRemoveLayer: (id: string) => void;
  onMoveLayer: (id: string, x: number, y: number) => void;
  onAddLayerAt: (x: number, y: number, text: string) => void;
  onDropRecommended: (item: InfographicRecommendedItem, x: number, y: number) => void;
}

const InfographicCanvas = forwardRef<InfographicCanvasHandle, InfographicCanvasProps>(
  function InfographicCanvas(
    {
      imageUrl,
      layers,
      selectedId,
      onSelect,
      onUpdateLayer,
      onRemoveLayer,
      onMoveLayer,
      onAddLayerAt,
      onDropRecommended,
    },
    ref
  ) {
    const { t } = useLanguage();
    const [dragOver, setDragOver] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{
      id: string;
      startX: number;
      startY: number;
      origX: number;
      origY: number;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      getDisplayWidth: () => containerRef.current?.getBoundingClientRect().width ?? 0,
    }));

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
        onSelect(id);
      },
      [layers, onSelect]
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
        onMoveLayer(dragRef.current.id, nx, ny);
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
    }, [onMoveLayer]);

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
          onDropRecommended(item, x, y);
        } catch {
          /* ignore */
        }
      },
      [onDropRecommended]
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
        onAddLayerAt(
          Math.min(100, Math.max(0, x)),
          Math.min(100, Math.max(0, y)),
          t('dashboard.infographicNewText')
        );
      },
      [onAddLayerAt, t]
    );

    const onCanvasClick = useCallback(
      (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest(`.${styles.layer}`)) return;
        onSelect(null);
      },
      [onSelect]
    );

    const selected = layers.find((l) => l.id === selectedId) ?? null;

    return (
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
            <InfographicTextLayer
              key={layer.id}
              layer={layer}
              selected={selectedId === layer.id}
              onSelect={onSelect}
              onUpdate={onUpdateLayer}
              onRemove={onRemoveLayer}
              onPointerDownHandle={onPointerDownHandle}
            />
          ))}
        </div>
        {selected && <InfographicLayerToolbar layer={selected} onUpdate={onUpdateLayer} />}
      </div>
    );
  }
);

export default InfographicCanvas;
