import type { InfographicItemApi, InfographicSlideApi } from '../services/api';

/** Badges for frame `index`. Older tasks only have one shared list. */
export function itemsForImage(
  index: number,
  slides: InfographicSlideApi[] | undefined,
  fallback: InfographicItemApi[] | undefined
): InfographicItemApi[] {
  const fromSlide = slides?.[index]?.items;
  if (fromSlide && fromSlide.length > 0) return fromSlide;
  return fallback ?? [];
}
