import type { InfographicRecommendedItem } from './infographicEditor';
import type { TextLayer } from './infographicEditor';

export type VariantDisplayBase = 'original' | 'saved';

export interface ProcessVariant {
  id: string;
  taskId: string;
  resultIndex: number;
  originalUrl: string;
  displayBase: VariantDisplayBase;
  savedUrl?: string;
  savedRevision?: number;
  textLayers: TextLayer[];
  infographicItems: InfographicRecommendedItem[];
  /** Keys of recommended lines already placed via «На место» (hidden from list). */
  usedRecommendedKeys: string[];
  dirty: boolean;
}

export function variantId(taskId: string, resultIndex: number): string {
  return `${taskId}:${resultIndex}`;
}

export function getVariantBaseUrl(v: ProcessVariant): string {
  if (v.displayBase === 'saved' && v.savedUrl) return v.savedUrl;
  return v.originalUrl;
}

export function buildProcessVariant(params: {
  taskId: string;
  resultIndex: number;
  originalUrl: string;
  infographicItems?: InfographicRecommendedItem[];
  displayBase?: VariantDisplayBase;
  savedUrl?: string;
  savedRevision?: number;
  textLayers?: TextLayer[];
  usedRecommendedKeys?: string[];
  dirty?: boolean;
}): ProcessVariant {
  const { taskId, resultIndex } = params;
  return {
    id: variantId(taskId, resultIndex),
    taskId,
    resultIndex,
    originalUrl: params.originalUrl,
    displayBase: params.displayBase ?? 'original',
    savedUrl: params.savedUrl,
    savedRevision: params.savedRevision,
    textLayers: params.textLayers ?? [],
    infographicItems: params.infographicItems ?? [],
    usedRecommendedKeys: params.usedRecommendedKeys ?? [],
    dirty: params.dirty ?? false,
  };
}
