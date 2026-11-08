import { describe, expect, it } from 'vitest';
import { averageLuminance, fitInfographicBadge } from './fitInfographicBadge';

const measure = (text: string, fontSize: number) => text.length * fontSize * 0.55;

describe('fitInfographicBadge', () => {
  const frame = { canvasWidth: 720, canvasHeight: 960, measure };

  it('shrinks a long line so the badge stays inside the frame', () => {
    const short = fitInfographicBadge({
      ...frame,
      position: 'top_left',
      text: 'Хлопок',
      tone: 'dark',
      luminance: 20,
    });
    const long = fitInfographicBadge({
      ...frame,
      position: 'top_left',
      text: 'Очень длинная характеристика мягкого хлопка и плотной вязки',
      tone: 'dark',
      luminance: 20,
    });

    expect(long.fontSize).toBeLessThan(short.fontSize);

    for (const badge of [short, long]) {
      const left = badge.left - badge.padding;
      const top = badge.top - badge.padding;
      const right = badge.left + badge.width + badge.padding;
      const bottom = badge.top + badge.height + badge.padding;
      expect(left).toBeGreaterThanOrEqual(-0.5);
      expect(top).toBeGreaterThanOrEqual(-0.5);
      expect(right).toBeLessThanOrEqual(frame.canvasWidth + 0.5);
      expect(bottom).toBeLessThanOrEqual(frame.canvasHeight + 0.5);
    }
  });

  it('uses a light plate when the photo under the badge is dark', () => {
    const dark = new Uint8ClampedArray([12, 18, 24, 255, 8, 10, 14, 255]);
    expect(averageLuminance(dark)).toBeLessThan(40);

    const badge = fitInfographicBadge({
      ...frame,
      position: 'middle_right',
      text: 'Хлопок',
      font: 'Oswald',
      tone: 'dark',
      badge: 'pill',
      luminance: averageLuminance(dark),
    });

    expect(badge.fontFamily).toContain('Oswald');
    expect(badge.fill).toBe('#1a1a1a');
    expect(badge.backgroundColor).toContain('255, 255, 255');
  });

  it('flips a light plate to dark text on a bright photo and can omit the plate', () => {
    const bright = fitInfographicBadge({
      ...frame,
      position: 'bottom_center',
      text: 'Шёлк',
      tone: 'light',
      badge: 'pill',
      luminance: 230,
    });
    expect(bright.fill).toBe('#ffffff');
    expect(bright.backgroundColor).toContain('20, 20, 20');

    const plain = fitInfographicBadge({
      ...frame,
      position: 'top_center',
      text: 'Шёлк',
      badge: 'plain',
      luminance: 20,
    });
    expect(plain.backgroundColor).toBe('');
    expect(plain.fill).toBe('#1a1a1a');
  });
});
