import { DEFAULT_INFOGRAPHIC_FONT } from '../constants/infographicFonts';
import type { TextLayer } from '../types/infographicEditor';

export function createTextLayer(
  partial: Partial<TextLayer> & Pick<TextLayer, 'x' | 'y' | 'text'>
): TextLayer {
  return {
    id: crypto.randomUUID(),
    fontFamily: DEFAULT_INFOGRAPHIC_FONT,
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: 600,
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
