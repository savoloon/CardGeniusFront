import { describe, expect, it } from 'vitest';
import {
  DEFAULT_INFOGRAPHIC_FONT,
  INFOGRAPHIC_FONT_OPTIONS,
  infographicFontPrimaryName,
  normalizeInfographicFont,
} from './infographicFonts';

describe('infographic fonts', () => {
  it('lists only embeddable families', () => {
    const names = INFOGRAPHIC_FONT_OPTIONS.map(infographicFontPrimaryName);
    expect(names).toEqual([
      'Inter',
      'Roboto',
      'Montserrat',
      'Manrope',
      'Oswald',
      'PT Serif',
      'JetBrains Mono',
    ]);
    expect(names).not.toContain('Times New Roman');
    expect(names).not.toContain('Courier New');
    expect(names).not.toContain('Arial');
    expect(names).not.toContain('Georgia');
  });

  it('normalizes legacy system stacks', () => {
    expect(normalizeInfographicFont('"Times New Roman", Times, serif')).toBe(
      '"PT Serif", Georgia, serif'
    );
    expect(normalizeInfographicFont('"Courier New", monospace')).toBe(
      '"JetBrains Mono", ui-monospace, monospace'
    );
    expect(normalizeInfographicFont('Arial, sans-serif')).toBe(DEFAULT_INFOGRAPHIC_FONT);
    expect(normalizeInfographicFont('Georgia, serif')).toBe('"PT Serif", Georgia, serif');
  });

  it('keeps known stacks and falls back for empty values', () => {
    expect(normalizeInfographicFont('Roboto, Arial, sans-serif')).toBe(
      'Roboto, Arial, sans-serif'
    );
    expect(normalizeInfographicFont(undefined)).toBe(DEFAULT_INFOGRAPHIC_FONT);
    expect(normalizeInfographicFont('Comic Sans MS')).toBe(DEFAULT_INFOGRAPHIC_FONT);
  });
});
