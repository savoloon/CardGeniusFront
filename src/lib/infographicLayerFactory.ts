import { INFOGRAPHIC_FONT_OPTIONS } from '../constants/infographicFonts';
import type { TextLayer } from '../types/infographicEditor';

export function createTextLayer(
  partial: Partial<TextLayer> & Pick<TextLayer, 'x' | 'y' | 'text'>
): TextLayer {
  return {
    id: crypto.randomUUID(),
    fontFamily: INFOGRAPHIC_FONT_OPTIONS[0],
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
