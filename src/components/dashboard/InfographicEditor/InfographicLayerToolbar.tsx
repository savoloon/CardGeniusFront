import { useLanguage } from '../../../contexts/LanguageContext';
import { INFOGRAPHIC_FONT_OPTIONS } from '../../../constants/infographicFonts';
import type { TextLayer } from '../../../types/infographicEditor';
import styles from './InfographicEditor.module.css';

interface InfographicLayerToolbarProps {
  layer: TextLayer;
  onUpdate: (id: string, patch: Partial<TextLayer>) => void;
}

export default function InfographicLayerToolbar({ layer, onUpdate }: InfographicLayerToolbarProps) {
  const { t } = useLanguage();

  const fillPickerValue =
    layer.backgroundColor !== 'transparent'
      ? layer.backgroundColor.startsWith('#')
        ? layer.backgroundColor
        : '#ffffff'
      : '#ffffff';

  return (
    <div className={styles.toolbar} onClick={(e) => e.stopPropagation()}>
      <label className={styles.toolLabel}>
        {t('dashboard.infographicFont')}
        <select
          className={styles.toolSelect}
          value={layer.fontFamily}
          onChange={(e) => onUpdate(layer.id, { fontFamily: e.target.value })}
        >
          {INFOGRAPHIC_FONT_OPTIONS.map((f) => (
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
          value={layer.fontSize}
          onChange={(e) =>
            onUpdate(layer.id, {
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
          value={layer.color.startsWith('#') ? layer.color : '#1a1a1a'}
          onChange={(e) => onUpdate(layer.id, { color: e.target.value })}
        />
      </label>
      <label className={styles.toolLabel}>
        {t('dashboard.infographicFillColor')}
        <input
          type="color"
          className={styles.colorInput}
          value={fillPickerValue}
          disabled={layer.backgroundColor === 'transparent'}
          onChange={(e) => onUpdate(layer.id, { backgroundColor: e.target.value })}
        />
      </label>
      <label className={styles.toolCheck}>
        <input
          type="checkbox"
          checked={layer.backgroundColor === 'transparent'}
          onChange={(e) =>
            onUpdate(layer.id, {
              backgroundColor: e.target.checked ? 'transparent' : 'rgba(255,255,255,0.92)',
            })
          }
        />
        <span>{t('dashboard.infographicTransparentFill')}</span>
      </label>
      <div className={styles.toolDivider} aria-hidden />
      <div className={styles.toolGroup} role="group" aria-label={t('dashboard.infographicAlignGroup')}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${layer.textAlign === 'left' ? styles.toggleActive : ''}`}
          onClick={() => onUpdate(layer.id, { textAlign: 'left' })}
          title={t('dashboard.infographicAlignLeft')}
        >
          L
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${layer.textAlign === 'center' ? styles.toggleActive : ''}`}
          onClick={() => onUpdate(layer.id, { textAlign: 'center' })}
          title={t('dashboard.infographicAlignCenter')}
        >
          C
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${layer.textAlign === 'right' ? styles.toggleActive : ''}`}
          onClick={() => onUpdate(layer.id, { textAlign: 'right' })}
          title={t('dashboard.infographicAlignRight')}
        >
          R
        </button>
      </div>
      <button
        type="button"
        className={`${styles.toggleBtn} ${layer.direction === 'rtl' ? styles.toggleActive : ''}`}
        onClick={() =>
          onUpdate(layer.id, { direction: layer.direction === 'rtl' ? 'ltr' : 'rtl' })
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
          value={layer.rotation}
          onChange={(e) => onUpdate(layer.id, { rotation: Number(e.target.value) || 0 })}
        />
      </label>
      <div className={styles.toolDivider} aria-hidden />
      <div className={styles.toolGroup}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${layer.fontWeight >= 600 ? styles.toggleActive : ''}`}
          onClick={() =>
            onUpdate(layer.id, { fontWeight: layer.fontWeight >= 600 ? 400 : 700 })
          }
        >
          B
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${layer.fontStyle === 'italic' ? styles.toggleActive : ''}`}
          onClick={() =>
            onUpdate(layer.id, {
              fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic',
            })
          }
        >
          I
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${layer.textDecoration === 'underline' ? styles.toggleActive : ''}`}
          onClick={() =>
            onUpdate(layer.id, {
              textDecoration: layer.textDecoration === 'underline' ? 'none' : 'underline',
            })
          }
        >
          U
        </button>
      </div>
    </div>
  );
}
