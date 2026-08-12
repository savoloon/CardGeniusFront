import { describe, expect, it } from 'vitest';
import { filterAvailableRecommended, recommendedItemKey } from './recommendedItemKey';

describe('recommendedItemKey', () => {
  it('builds a stable key from position and text', () => {
    expect(recommendedItemKey({ position: 'top_left', text: 'Sale' })).toBe('top_left::Sale');
  });

  it('filters out already used recommended items', () => {
    const items = [
      { position: 'top_left', text: 'A' },
      { position: 'top_right', text: 'B' },
      { position: 'bottom_center', text: 'C' },
    ];
    const available = filterAvailableRecommended(items, ['top_right::B']);
    expect(available).toEqual([
      { position: 'top_left', text: 'A' },
      { position: 'bottom_center', text: 'C' },
    ]);
  });
});
