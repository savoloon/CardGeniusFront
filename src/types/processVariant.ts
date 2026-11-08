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
  /** Scene text of this frame, sent back when the user replaces it. */
  scenePrompt?: string;
  /** Last known server revision of this frame. Used to notice a finished replacement. */
  imageRevision?: number;
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
  scenePrompt?: string;
  imageRevision?: number;
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
    scenePrompt: params.scenePrompt,
    imageRevision: params.imageRevision,
    usedRecommendedKeys: params.usedRecommendedKeys ?? [],
    dirty: params.dirty ?? false,
  };
}
