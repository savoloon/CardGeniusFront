import { describe, expect, it } from 'vitest';
import {
  coverPlacement,
  exportPixelMultiplier,
  scaleTextLayers,
  stageSizeForImage,
} from './imageFit';
import type { TextLayer } from '../../types/infographicEditor';

const layer = (fontSize: number, width?: number): TextLayer => ({
  id: '1',
  text: 'Хлопок',
  x: 10,
  y: 10,
  fontFamily: 'Inter, Arial, sans-serif',
  fontSize,
  color: '#111',
  fontWeight: 700,
  fontStyle: 'normal',
  textDecoration: 'none',
  rotation: 0,
  zIndex: 10,
  textAlign: 'center',
  direction: 'ltr',
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  width,
});

describe('image fit', () => {
  it('sizes the stage with the photo aspect and without a height floor', () => {
    expect(stageSizeForImage(800, 900, 1200)).toEqual({ width: 720, height: 960 });
    expect(stageSizeForImage(1000, 1600, 400)).toEqual({ width: 720, height: 180 });
  });

  it('covers a 3:4 frame and a slightly off frame with one scale', () => {
    const exact = coverPlacement(720, 960, 900, 1200);
    expect(exact.scale).toBeCloseTo(720 / 900);
    expect(exact.scale).toBeCloseTo(960 / 1200);
    expect(900 * exact.scale).toBeGreaterThanOrEqual(720 - 0.01);
    expect(1200 * exact.scale).toBeGreaterThanOrEqual(960 - 0.01);

    const off = coverPlacement(720, 961, 900, 1200);
    expect(off.scale).toBeCloseTo(Math.max(720 / 900, 961 / 1200));
    expect(900 * off.scale).toBeGreaterThanOrEqual(720 - 0.01);
    expect(1200 * off.scale).toBeGreaterThanOrEqual(961 - 0.01);
    expect(off.scale).toBe(Math.max(720 / 900, 961 / 1200));
  });

  it('exports at the photo pixel width and scales badge text with it', () => {
    expect(exportPixelMultiplier(1536, 720)).toBeCloseTo(1536 / 720);
    const scaled = scaleTextLayers([layer(18, 120)], 1536 / 720);
    expect(scaled?.[0].fontSize).toBeCloseTo(18 * (1536 / 720));
    expect(scaled?.[0].width).toBeCloseTo(120 * (1536 / 720));
  });
});
