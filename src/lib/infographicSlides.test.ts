import { describe, expect, it } from 'vitest';
import { itemsForImage } from './infographicSlides';

describe('itemsForImage', () => {
  it('uses the badges of that frame', () => {
    const slides = [
      { imagePrompt: 'a', items: [{ text: 'Хлопок', position: 'top_center' }] },
      { imagePrompt: 'b', items: [{ text: 'Мягкие', position: 'top_left' }] },
    ];
    expect(itemsForImage(1, slides, [{ text: 'Общее', position: 'bottom_center' }])).toEqual([
      { text: 'Мягкие', position: 'top_left' },
    ]);
  });

  it('falls back to the shared list for older tasks', () => {
    const shared = [{ text: 'Общее', position: 'bottom_center' }];
    expect(itemsForImage(0, undefined, shared)).toEqual(shared);
  });
});