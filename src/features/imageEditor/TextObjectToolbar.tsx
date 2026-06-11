import { Button } from '../../components/ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { INFOGRAPHIC_FONT_OPTIONS } from '../../constants/infographicFonts';
import type { FabricTextSnapshot } from './fabricTextTypes';
import styles from './ImageEditor.module.css';

interface TextObjectToolbarProps {
  snapshot: FabricTextSnapshot;
  onChange: (patch: Partial<FabricTextSnapshot>) => void;
  onDelete: () => void;
}

export default function TextObjectToolbar({
  snapshot,
  onChange,
  onDelete,
}: TextObjectToolbarProps) {
  const { t } = useLanguage();

  const fillPickerValue =
    snapshot.backgroundColor !== 'transparent'
      ? snapshot.backgroundColor.startsWith('#')
        ? snapshot.backgroundColor
        : '#ffffff'
      : '#ffffff';

  return (
    <div className={styles.textToolbar} onClick={(e) => e.stopPropagation()}>
      <span className={styles.textToolbarTitle}>{t('dashboard.textEditTitle')}</span>
      <label className={styles.toolLabel}>
        {t('dashboard.infographicFont')}
        <select
          className={styles.toolSelect}
          value={snapshot.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
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
          value={snapshot.fontSize}
          onChange={(e) =>
            onChange({
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
          value={snapshot.color.startsWith('#') ? snapshot.color : '#1a1a1a'}
          onChange={(e) => onChange({ color: e.target.value })}
        />
      </label>
      <label className={styles.toolLabel}>
        {t('dashboard.infographicFillColor')}
        <input
          type="color"
          className={styles.colorInput}
          value={fillPickerValue}
          disabled={snapshot.backgroundColor === 'transparent'}
          onChange={(e) => onChange({ backgroundColor: e.target.value })}
        />
      </label>
      <label className={styles.toolCheck}>
        <input
          type="checkbox"
          checked={snapshot.backgroundColor === 'transparent'}
          onChange={(e) =>
            onChange({
              backgroundColor: e.target.checked ? 'transparent' : 'rgba(255,255,255,0.92)',
            })
          }
        />
        <span>{t('dashboard.infographicTransparentFill')}</span>
      </label>
      <div className={styles.toolDivider} aria-hidden />
      <div className={styles.toolGroup} role="group" aria-label={t('dashboard.infographicAlignGroup')}>
        {(['left', 'center', 'right'] as const).map((align, i) => (
          <button
            key={align}
            type="button"
            className={`${styles.toggleBtn} ${snapshot.textAlign === align ? styles.toggleActive : ''}`}
            onClick={() => onChange({ textAlign: align })}
            title={t(
              align === 'left'
                ? 'dashboard.infographicAlignLeft'
                : align === 'center'
                  ? 'dashboard.infographicAlignCenter'
                  : 'dashboard.infographicAlignRight'
            )}
          >
            {['L', 'C', 'R'][i]}
          </button>
        ))}
      </div>
      <label className={styles.toolLabel}>
        {t('dashboard.infographicRotation')}
        <input
          type="number"
          className={styles.toolInput}
          min={-180}
          max={180}
          value={snapshot.rotation}
          onChange={(e) => onChange({ rotation: Number(e.target.value) || 0 })}
        />
      </label>
      <div className={styles.toolGroup}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${snapshot.fontWeight >= 600 ? styles.toggleActive : ''}`}
          onClick={() => onChange({ fontWeight: snapshot.fontWeight >= 600 ? 400 : 700 })}
        >
          B
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${snapshot.fontStyle === 'italic' ? styles.toggleActive : ''}`}
          onClick={() =>
            onChange({ fontStyle: snapshot.fontStyle === 'italic' ? 'normal' : 'italic' })
          }
        >
          I
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${snapshot.textDecoration === 'underline' ? styles.toggleActive : ''}`}
          onClick={() =>
            onChange({
              textDecoration: snapshot.textDecoration === 'underline' ? 'none' : 'underline',
            })
          }
        >
          U
        </button>
      </div>
      <div className={styles.toolDivider} aria-hidden />
      <Button type="button" variant="outline" className={styles.deleteTextBtn} onClick={onDelete}>
        {t('dashboard.infographicRemoveLayer')}
      </Button>
    </div>
  );
}
