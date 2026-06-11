import { useCallback, useState } from 'react';
import type { Canvas, PencilBrush } from 'fabric';
import { BRUSH_PRESETS, type BrushSettings, type EditorTool } from './types';

const DEFAULT_BRUSH: BrushSettings = {
  color: '#e11d48',
  width: 4,
  opacity: 1,
};

export function useDrawingTools() {
  const [tool, setTool] = useState<EditorTool>('select');
  const [brush, setBrush] = useState<BrushSettings>(DEFAULT_BRUSH);
  const [blurRadius, setBlurRadius] = useState(8);

  const applyToolToCanvas = useCallback(
    (canvas: Canvas | null) => {
      if (!canvas) return;

      canvas.isDrawingMode = false;
      canvas.selection = tool === 'select' || tool === 'text';
      canvas.defaultCursor = tool === 'eyedropper' ? 'crosshair' : 'default';

      const drawingTools: EditorTool[] = [
        'pencil',
        'brushSoft',
        'brushMedium',
        'brushHard',
        'eraser',
        'blur',
      ];

      if (!drawingTools.includes(tool)) return;

      canvas.isDrawingMode = true;
      const pencil = canvas.freeDrawingBrush as PencilBrush;
      if (!pencil) return;

      let width = brush.width;
      let opacity = brush.opacity;
      if (tool === 'brushSoft' || tool === 'brushMedium' || tool === 'brushHard') {
        const preset = BRUSH_PRESETS[tool];
        width = preset.width;
        opacity = preset.opacity;
      }
      if (tool === 'pencil') {
        width = Math.max(1, brush.width);
        opacity = brush.opacity;
      }

      pencil.width = width;
      pencil.color =
        tool === 'eraser'
          ? 'rgba(255,255,255,1)'
          : hexToRgba(brush.color, opacity);

      if (tool === 'eraser') {
        // @ts-expect-error fabric brush composite
        pencil.globalCompositeOperation = 'destination-out';
      } else {
        // @ts-expect-error fabric brush composite
        pencil.globalCompositeOperation = 'source-over';
      }
    },
    [tool, brush]
  );

  return {
    tool,
    setTool,
    brush,
    setBrush,
    blurRadius,
    setBlurRadius,
    applyToolToCanvas,
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
