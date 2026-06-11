export type EditorTool =
  | 'select'
  | 'pencil'
  | 'brushSoft'
  | 'brushMedium'
  | 'brushHard'
  | 'eraser'
  | 'blur'
  | 'eyedropper'
  | 'text';

export interface BrushSettings {
  color: string;
  width: number;
  opacity: number;
}

export const BRUSH_PRESETS: Record<
  'brushSoft' | 'brushMedium' | 'brushHard',
  { width: number; opacity: number }
> = {
  brushSoft: { width: 12, opacity: 0.35 },
  brushMedium: { width: 20, opacity: 0.55 },
  brushHard: { width: 28, opacity: 0.85 },
};
