import type { InfographicRecommendedItem } from '../types/infographicEditor';

/** Stable key for a recommended infographic line (position + text). */
export function recommendedItemKey(item: InfographicRecommendedItem): string {
  return `${item.position}::${item.text}`;
}

export function filterAvailableRecommended(
  items: InfographicRecommendedItem[],
  usedKeys: string[]
): InfographicRecommendedItem[] {
  const used = new Set(usedKeys);
  return items.filter((item) => !used.has(recommendedItemKey(item)));
}
