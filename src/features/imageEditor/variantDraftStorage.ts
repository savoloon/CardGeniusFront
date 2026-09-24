import type { TextLayer } from '../../types/infographicEditor';

export interface VariantDraft {
  canvasJson: string | null;
  textLayers: TextLayer[];
  usedRecommendedKeys: string[];
  dirty: boolean;
}

const drafts = new Map<string, VariantDraft>();

export function getVariantDraft(id: string): VariantDraft | undefined {
  return drafts.get(id);
}

export function setVariantDraft(id: string, draft: VariantDraft): void {
  drafts.set(id, draft);
}

export function clearAllDrafts(): void {
  drafts.clear();
}

export function removeVariantDraft(id: string): void {
  drafts.delete(id);
}
