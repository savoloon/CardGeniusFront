export type EditorTool =
  | 'select'
  | 'pencil'
  | 'brush'
  | 'eraser'
  | 'fill'
  | 'eyedropper'
  | 'text';

export type BrushKind = 'round' | 'calligraphy' | 'spray' | 'marker';

export interface BrushSettings {
  color: string;
  width: number;
  opacity: number;
  kind: BrushKind;
}

export const MIN_BRUSH_WIDTH = 1;
export const MAX_BRUSH_WIDTH = 64;

export const BRUSH_KINDS: { id: BrushKind; labelKey: string }[] = [
  { id: 'round', labelKey: 'dashboard.toolBrushRound' },
  { id: 'calligraphy', labelKey: 'dashboard.toolBrushCalligraphy' },
  { id: 'spray', labelKey: 'dashboard.toolBrushSpray' },
  { id: 'marker', labelKey: 'dashboard.toolBrushMarker' },
];
