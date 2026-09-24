export interface InfographicRecommendedItem {
  text: string;
  position: string;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: 400 | 600 | 700;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  rotation: number;
  zIndex: number;
  textAlign: 'left' | 'center' | 'right';
  direction: 'ltr' | 'rtl';
  backgroundColor: string;
}

export interface InfographicVariantSnapshot {
  layers: TextLayer[];
  selectedId: string | null;
  updatedAt: number;
}

export interface InfographicEditorPersistedState {
  version: 1;
  sessionId: string;
  variants: Record<string, InfographicVariantSnapshot>;
}
