import { useCallback, useState } from 'react';
import { PencilBrush } from 'fabric';
import type { Canvas } from 'fabric';
import { Airbrush, StampBrush } from './paintBrushes';
import { hexToRgba } from './colorUtils';
import type { BrushSettings, EditorTool } from './types';

const DEFAULT_BRUSH: BrushSettings = {
  color: '#e11d48',
  width: 8,
  opacity: 1,
  kind: 'round',
};

const DRAWING_TOOLS: EditorTool[] = ['pencil', 'brush', 'eraser'];

export function useDrawingTools() {
  const [tool, setTool] = useState<EditorTool>('select');
  const [brush, setBrush] = useState<BrushSettings>(DEFAULT_BRUSH);

  const applyToolToCanvas = useCallback(
    (canvas: Canvas | null) => {
      if (!canvas) return;

      canvas.isDrawingMode = false;
      canvas.selection = tool === 'text';
      canvas.skipTargetFind = tool === 'fill' || tool === 'eyedropper';
      canvas.defaultCursor =
        tool === 'eyedropper' || tool === 'fill' || tool === 'select' ? 'crosshair' : 'default';

      if (!DRAWING_TOOLS.includes(tool)) return;

      canvas.isDrawingMode = true;
      canvas.defaultCursor = 'crosshair';

      if (tool === 'pencil' || tool === 'eraser' || (tool === 'brush' && brush.kind === 'round')) {
        const pencil = new PencilBrush(canvas);
        pencil.width = Math.max(1, brush.width);
        pencil.decimate = tool === 'pencil' ? 0.5 : 0.35;
        pencil.strokeLineCap = tool === 'pencil' ? 'round' : 'round';
        pencil.strokeLineJoin = 'round';
        pencil.limitedToCanvasSize = true;
        if (tool === 'eraser') {
          pencil.color = 'rgba(0,0,0,1)';
          // @ts-expect-error fabric brush composite
          pencil.globalCompositeOperation = 'destination-out';
        } else {
          pencil.color = hexToRgba(brush.color, tool === 'pencil' ? 1 : brush.opacity);
          // @ts-expect-error fabric brush composite
          pencil.globalCompositeOperation = 'source-over';
        }
        canvas.freeDrawingBrush = pencil;
        return;
      }

      if (tool === 'brush' && brush.kind === 'spray') {
        const spray = new Airbrush(canvas);
        spray.width = Math.max(4, brush.width);
        spray.color = hexToRgba(brush.color, brush.opacity);
        spray.limitedToCanvasSize = true;
        canvas.freeDrawingBrush = spray;
        return;
      }

      if (tool === 'brush') {
        const stamp = new StampBrush(canvas, brush.kind === 'marker' ? 'marker' : 'calligraphy');
        stamp.width = Math.max(2, brush.width);
        stamp.color = hexToRgba(brush.color, brush.opacity);
        stamp.limitedToCanvasSize = true;
        canvas.freeDrawingBrush = stamp;
      }
    },
    [tool, brush]
  );

  return {
    tool,
    setTool,
    brush,
    setBrush,
    applyToolToCanvas,
  };
}
