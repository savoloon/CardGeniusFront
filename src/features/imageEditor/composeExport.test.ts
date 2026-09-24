import { describe, expect, it } from 'vitest';
import { formatToExtension, formatToMime } from './composeExport';

describe('export format helpers', () => {
  it('maps mime types and extensions', () => {
    expect(formatToMime('png')).toBe('image/png');
    expect(formatToMime('jpeg')).toBe('image/jpeg');
    expect(formatToMime('webp')).toBe('image/webp');
    expect(formatToExtension('png')).toBe('png');
    expect(formatToExtension('jpeg')).toBe('jpg');
    expect(formatToExtension('webp')).toBe('webp');
  });
});
