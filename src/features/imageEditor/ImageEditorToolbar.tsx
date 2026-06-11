import { useLanguage } from '../../contexts/LanguageContext';
import type { EditorTool } from './types';
import styles from './ImageEditor.module.css';

const TOOLS: { id: EditorTool; labelKey: string; icon: string }[] = [
  { id: 'select', labelKey: 'dashboard.toolSelect', icon: '↖' },
  { id: 'pencil', labelKey: 'dashboard.toolPencil', icon: '✎' },
  { id: 'brushSoft', labelKey: 'dashboard.toolBrushSoft', icon: '○' },
  { id: 'brushMedium', labelKey: 'dashboard.toolBrushMedium', icon: '◉' },
  { id: 'brushHard', labelKey: 'dashboard.toolBrushHard', icon: '●' },
  { id: 'eraser', labelKey: 'dashboard.toolEraser', icon: '⌫' },
  { id: 'blur', labelKey: 'dashboard.toolBlur', icon: '≋' },
  { id: 'eyedropper', labelKey: 'dashboard.toolEyedropper', icon: '◐' },
  { id: 'text', labelKey: 'dashboard.toolText', icon: 'T' },
];

interface ImageEditorToolbarProps {
  tool: EditorTool;
  onToolChange: (t: EditorTool) => void;
  color: string;
  onColorChange: (c: string) => void;
  brushWidth: number;
  onBrushWidthChange: (n: number) => void;
  blurRadius: number;
  onBlurRadiusChange: (n: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function ImageEditorToolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  brushWidth,
  onBrushWidthChange,
  blurRadius,
  onBlurRadiusChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ImageEditorToolbarProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.toolRail} role="toolbar" aria-label={t('dashboard.editorToolsAria')}>
      {TOOLS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`${styles.toolBtn} ${tool === item.id ? styles.toolBtnActive : ''}`}
          title={t(item.labelKey)}
          aria-pressed={tool === item.id}
          onClick={() => onToolChange(item.id)}
        >
          {item.icon}
        </button>
      ))}
      <div className={styles.toolDivider} aria-hidden />
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
      <div className={styles.propsPanel}>
        <label className={styles.propLabel}>
          {t('dashboard.infographicColor')}
          <input
            type="color"
            className={styles.propInput}
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
          />
        </label>
        <label className={styles.propLabel}>
          {t('dashboard.brushSize')}
          <input
            type="number"
            className={styles.propInput}
            min={1}
            max={80}
            value={brushWidth}
            onChange={(e) => onBrushWidthChange(Number(e.target.value) || 4)}
          />
        </label>
        {tool === 'blur' && (
          <label className={styles.propLabel}>
            {t('dashboard.blurStrength')}
            <input
              type="number"
              className={styles.propInput}
              min={2}
              max={40}
              value={blurRadius}
              onChange={(e) => onBlurRadiusChange(Number(e.target.value) || 8)}
            />
          </label>
        )}
      </div>
    </div>
  );
}
