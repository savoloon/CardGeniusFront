import { IText, type Canvas } from 'fabric';
import type { FabricTextSnapshot } from './fabricTextTypes';
import type { TextLayer } from '../../types/infographicEditor';
import {
  DEFAULT_INFOGRAPHIC_FONT,
  normalizeInfographicFont,
} from '../../constants/infographicFonts';

export const TEXT_OBJECT_KEY = 'editorText';

export function snapshotFromIText(obj: IText): FabricTextSnapshot {
  const fill = typeof obj.fill === 'string' ? obj.fill : '#1a1a1a';
  const bg =
    typeof obj.backgroundColor === 'string' && obj.backgroundColor
      ? obj.backgroundColor
      : 'transparent';
  return {
    color: fill.startsWith('#') ? fill : '#1a1a1a',
    fontFamily: normalizeInfographicFont(String(obj.fontFamily ?? DEFAULT_INFOGRAPHIC_FONT)),
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
  if (patch.fontFamily !== undefined) obj.set('fontFamily', normalizeInfographicFont(patch.fontFamily));
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

export function applyTextLayersToCanvas(canvas: Canvas, layers: TextLayer[]): void {
  canvas
    .getObjects()
    .filter((o) => o.type === 'i-text' || o.type === 'textbox')
    .forEach((o) => canvas.remove(o));
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();
  for (const layer of layers) {
    const it = new IText(layer.text, {
      left: (layer.x / 100) * cw,
      top: (layer.y / 100) * ch,
      fontFamily: normalizeInfographicFont(layer.fontFamily),
      fontSize: layer.fontSize,
      fill: layer.color,
      fontWeight: layer.fontWeight >= 600 ? 'bold' : 'normal',
      fontStyle: layer.fontStyle,
      angle: layer.rotation,
      backgroundColor: layer.backgroundColor === 'transparent' ? '' : layer.backgroundColor,
    });
    it.set(TEXT_OBJECT_KEY, true);
    canvas.add(it);
  }
  canvas.renderAll();
}
