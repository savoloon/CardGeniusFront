import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { hexToRgba } from './colorUtils';
import {
  BRUSH_KINDS,
  MAX_BRUSH_WIDTH,
  MIN_BRUSH_WIDTH,
  type BrushKind,
  type EditorTool,
} from './types';
import styles from './ImageEditor.module.css';

const TOOLS: { id: EditorTool; labelKey: string }[] = [
  { id: 'select', labelKey: 'dashboard.toolSelect' },
  { id: 'pencil', labelKey: 'dashboard.toolPencil' },
  { id: 'brush', labelKey: 'dashboard.toolBrush' },
  { id: 'fill', labelKey: 'dashboard.toolFill' },
  { id: 'eraser', labelKey: 'dashboard.toolEraser' },
  { id: 'eyedropper', labelKey: 'dashboard.toolEyedropper' },
  { id: 'text', labelKey: 'dashboard.toolText' },
];

interface ImageEditorToolbarProps {
  tool: EditorTool;
  onToolChange: (t: EditorTool) => void;
  color: string;
  onColorChange: (c: string) => void;
  brushWidth: number;
  onBrushWidthChange: (n: number) => void;
  brushKind: BrushKind;
  onBrushKindChange: (k: BrushKind) => void;
  opacity: number;
  onOpacityChange: (n: number) => void;
  regionSelected: boolean;
  canPaste: boolean;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

function ToolIcon({ id, kind }: { id: EditorTool; kind: BrushKind }) {
  if (id === 'select') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={styles.toolIcon}>
        <rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeDasharray="3 2" />
      </svg>
    );
  }
  if (id === 'pencil') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={styles.toolIcon}>
        <path d="M4 20l1.2-4.2L16.5 4.5a1.8 1.8 0 012.5 2.5L8.2 18.8 4 20z" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path d="M14.8 6.2l3 3" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }
  if (id === 'brush') {
    return <BrushKindIcon kind={kind} />;
  }
  if (id === 'fill') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={styles.toolIcon}>
        <path d="M5 14l7-9 7 9H5z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M8 14c0 2.2 1.8 4 4 4s4-1.8 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }
  if (id === 'eraser') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={styles.toolIcon}>
        <path d="M15.5 5.5l4 4-8.5 8.5H7l-3.5-3.5 12-12z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M7 19h13" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }
  if (id === 'eyedropper') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={styles.toolIcon}>
        <path d="M15 4.5l4.5 4.5-2 1-1.5 1.5-7 7H6v-3l7-7L14 7z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
    );
  }
  return <span className={styles.toolTextIcon}>T</span>;
}

function BrushKindIcon({ kind }: { kind: BrushKind }) {
  if (kind === 'calligraphy') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={styles.toolIcon}>
        <ellipse cx="12" cy="12" rx="9" ry="3.2" transform="rotate(-45 12 12)" fill="currentColor" />
      </svg>
    );
  }
  if (kind === 'spray') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={styles.toolIcon}>
        <circle cx="8" cy="9" r="1.2" fill="currentColor" />
        <circle cx="13" cy="7" r="1" fill="currentColor" />
        <circle cx="16" cy="11" r="1.3" fill="currentColor" />
        <circle cx="10" cy="13" r="1.1" fill="currentColor" />
        <circle cx="15" cy="16" r="1.2" fill="currentColor" />
        <circle cx="7" cy="16" r="0.9" fill="currentColor" />
        <circle cx="12" cy="18" r="1" fill="currentColor" />
        <circle cx="18" cy="8" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  if (kind === 'marker') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={styles.toolIcon}>
        <rect x="5" y="9" width="14" height="6" rx="2.5" transform="rotate(-18 12 12)" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={styles.toolIcon}>
      <circle cx="12" cy="12" r="7" fill="currentColor" />
    </svg>
  );
}

function TipPreview({
  tool,
  kind,
  width,
  color,
  opacity,
}: {
  tool: EditorTool;
  kind: BrushKind;
  width: number;
  color: string;
  opacity: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 64;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, size, size);
    for (let y = 0; y < size; y += 8) {
      for (let x = 0; x < size; x += 8) {
        ctx.fillStyle = (x + y) % 16 === 0 ? '#d4d4d8' : '#f4f4f5';
        ctx.fillRect(x, y, 8, 8);
      }
    }

    const tip = Math.max(2, (width / MAX_BRUSH_WIDTH) * 44);
    const alpha = tool === 'brush' ? opacity : 1;
    ctx.fillStyle = hexToRgba(color, alpha);
    ctx.save();
    ctx.translate(size / 2, size / 2);

    if (tool === 'eraser') {
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, tip / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fafafa';
      ctx.fill();
      ctx.stroke();
    } else if (tool === 'brush' && kind === 'calligraphy') {
      ctx.rotate(-Math.PI / 4);
      ctx.beginPath();
      ctx.ellipse(0, 0, tip / 2, Math.max(1, tip / 9), 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === 'brush' && kind === 'marker') {
      ctx.rotate(-Math.PI / 5);
      const w = tip * 1.15;
      const h = Math.max(3, tip * 0.38);
      const r = h * 0.45;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + r, -h / 2);
      ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, r);
      ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, r);
      ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r);
      ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r);
      ctx.closePath();
      ctx.fill();
    } else if (tool === 'brush' && kind === 'spray') {
      const radius = tip / 2;
      let seed = Math.max(1, Math.round(width * 97 + 13));
      const rnd = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let i = 0; i < 40; i += 1) {
        const a = rnd() * Math.PI * 2;
        const r = Math.sqrt(rnd()) * radius;
        ctx.globalAlpha = alpha * (0.2 + rnd() * 0.6);
        ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, 1.4, 1.4);
      }
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, tip / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [tool, kind, width, color, opacity]);

  return <canvas ref={canvasRef} width={size} height={size} className={styles.tipPreview} />;
}

export default function ImageEditorToolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  brushWidth,
  onBrushWidthChange,
  brushKind,
  onBrushKindChange,
  opacity,
  onOpacityChange,
  regionSelected,
  canPaste,
  onCopy,
  onCut,
  onPaste,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ImageEditorToolbarProps) {
  const { t } = useLanguage();
  const [brushMenuOpen, setBrushMenuOpen] = useState(false);
  const brushWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!brushMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!brushWrapRef.current?.contains(e.target as Node)) {
        setBrushMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [brushMenuOpen]);

  const showSize = tool === 'pencil' || tool === 'brush' || tool === 'eraser';
  const showOpacity = tool === 'brush';
  const showSelectActions = tool === 'select';

  return (
    <div className={styles.toolColumn}>
      <div className={styles.toolRail} role="toolbar" aria-label={t('dashboard.editorToolsAria')}>
        {TOOLS.map((item) => {
          if (item.id === 'brush') {
            return (
              <div key={item.id} className={styles.toolBtnWrap} ref={brushWrapRef}>
                <button
                  type="button"
                  className={`${styles.toolBtn} ${tool === 'brush' ? styles.toolBtnActive : ''}`}
                  title={t(item.labelKey)}
                  aria-pressed={tool === 'brush'}
                  aria-haspopup="menu"
                  aria-expanded={brushMenuOpen}
                  onClick={() => {
                    if (tool === 'brush') {
                      setBrushMenuOpen((open) => !open);
                    } else {
                      onToolChange('brush');
                      setBrushMenuOpen(true);
                    }
                  }}
                >
                  <ToolIcon id="brush" kind={brushKind} />
                </button>
                {brushMenuOpen && (
                  <div className={styles.brushMenu} role="menu">
                    {BRUSH_KINDS.map((kind) => (
                      <button
                        key={kind.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={brushKind === kind.id}
                        className={`${styles.brushMenuItem} ${brushKind === kind.id ? styles.brushMenuItemActive : ''}`}
                        onClick={() => {
                          onBrushKindChange(kind.id);
                          onToolChange('brush');
                          setBrushMenuOpen(false);
                        }}
                      >
                        <BrushKindIcon kind={kind.id} />
                        <span>{t(kind.labelKey)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.toolBtn} ${tool === item.id ? styles.toolBtnActive : ''}`}
              title={t(item.labelKey)}
              aria-pressed={tool === item.id}
              onClick={() => {
                setBrushMenuOpen(false);
                onToolChange(item.id);
              }}
            >
              <ToolIcon id={item.id} kind={brushKind} />
            </button>
          );
        })}
        <div className={styles.toolRailDivider} aria-hidden />
        <button
          type="button"
          className={styles.toolBtn}
          title={t('dashboard.undo')}
          disabled={!canUndo}
          onClick={onUndo}
        >
          ↶
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title={t('dashboard.redo')}
          disabled={!canRedo}
          onClick={onRedo}
        >
          ↷
        </button>
      </div>

      <div className={styles.toolOptions}>
        <label className={styles.propLabel}>
          {t('dashboard.infographicColor')}
          <input
            type="color"
            className={styles.colorSwatch}
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
          />
        </label>

        {showSize && (
          <div className={styles.sizeBlock}>
            <span className={styles.propLabel}>{t('dashboard.brushSize')}</span>
            <TipPreview
              tool={tool}
              kind={brushKind}
              width={brushWidth}
              color={color}
              opacity={opacity}
            />
            <input
              type="range"
              className={styles.sizeSlider}
              min={MIN_BRUSH_WIDTH}
              max={MAX_BRUSH_WIDTH}
              value={brushWidth}
              aria-label={t('dashboard.brushSize')}
              onChange={(e) => onBrushWidthChange(Number(e.target.value))}
            />
          </div>
        )}

        {showOpacity && (
          <label className={styles.propLabel}>
            {t('dashboard.brushOpacity')}
            <input
              type="range"
              className={styles.sizeSlider}
              min={5}
              max={100}
              value={Math.round(opacity * 100)}
              onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
            />
            <span className={styles.opacityValue}>{Math.round(opacity * 100)}%</span>
          </label>
        )}

        {showSelectActions && (
          <div className={styles.selectActions}>
            <p className={styles.selectHint}>{t('dashboard.selectionHint')}</p>
            <button type="button" className={styles.actionMini} disabled={!regionSelected} onClick={onCopy}>
              {t('dashboard.selectionCopy')}
            </button>
            <button type="button" className={styles.actionMini} disabled={!regionSelected} onClick={onCut}>
              {t('dashboard.selectionCut')}
            </button>
            <button type="button" className={styles.actionMini} disabled={!canPaste} onClick={onPaste}>
              {t('dashboard.selectionPaste')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
