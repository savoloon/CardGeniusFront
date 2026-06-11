import type { IText } from 'fabric';
import type { FabricTextSnapshot } from './fabricTextTypes';

export const TEXT_OBJECT_KEY = 'editorText';

export function snapshotFromIText(obj: IText): FabricTextSnapshot {
  const fill = typeof obj.fill === 'string' ? obj.fill : '#1a1a1a';
  const bg =
    typeof obj.backgroundColor === 'string' && obj.backgroundColor
      ? obj.backgroundColor
      : 'transparent';
  return {
    color: fill.startsWith('#') ? fill : '#1a1a1a',
    fontFamily: String(obj.fontFamily ?? 'Inter, system-ui, sans-serif'),
    fontSize: Number(obj.fontSize ?? 18),
    fontWeight: obj.fontWeight === 'bold' || obj.fontWeight === 700 ? 700 : 400,
    fontStyle: obj.fontStyle === 'italic' ? 'italic' : 'normal',
    textDecoration:
      (obj as IText & { textDecoration?: string }).textDecoration === 'underline'
        ? 'underline'
        : 'none',
    textAlign: (obj.textAlign as FabricTextSnapshot['textAlign']) ?? 'left',
    rotation: obj.angle ?? 0,
    backgroundColor: bg,
  };
}

export function applySnapshotToIText(obj: IText, patch: Partial<FabricTextSnapshot>): void {
  if (patch.color !== undefined) obj.set('fill', patch.color);
  if (patch.fontFamily !== undefined) obj.set('fontFamily', patch.fontFamily);
  if (patch.fontSize !== undefined) obj.set('fontSize', patch.fontSize);
  if (patch.fontWeight !== undefined) {
    obj.set('fontWeight', patch.fontWeight >= 600 ? 'bold' : 'normal');
  }
  if (patch.fontStyle !== undefined) obj.set('fontStyle', patch.fontStyle);
  if (patch.textDecoration !== undefined) {
    obj.set('underline' as keyof IText, patch.textDecoration === 'underline');
  }
  if (patch.textAlign !== undefined) obj.set('textAlign', patch.textAlign);
  if (patch.rotation !== undefined) obj.set('angle', patch.rotation);
  if (patch.backgroundColor !== undefined) {
    obj.set(
      'backgroundColor',
      patch.backgroundColor === 'transparent' ? '' : patch.backgroundColor
    );
  }
  obj.setCoords();
}

export function isTextObject(obj: unknown): obj is IText {
  if (!obj || typeof obj !== 'object') return false;
  const t = (obj as { type?: string }).type;
  return t === 'i-text' || t === 'textbox' || t === 'text';
}
