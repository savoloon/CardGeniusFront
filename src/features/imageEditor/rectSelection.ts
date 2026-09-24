import { FabricImage, Rect } from 'fabric';
import type { Canvas, FabricObject } from 'fabric';

export const SELECTION_KEY = 'regionSelection';
export const CLIP_KEY = 'clipboardClip';
export const DRAWING_KEY = 'drawing';

export interface RegionBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function createSelectionRect(bounds: RegionBounds): Rect {
  const rect = new Rect({
    left: bounds.left,
    top: bounds.top,
    width: Math.max(1, bounds.width),
    height: Math.max(1, bounds.height),
    fill: 'rgba(0, 120, 215, 0.18)',
    stroke: '#0078d7',
    strokeWidth: 1,
    strokeDashArray: [6, 4],
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    lockRotation: true,
    lockScalingFlip: true,
    lockMovementX: true,
    lockMovementY: true,
    objectCaching: false,
    transparentCorners: false,
    cornerColor: '#0078d7',
    cornerStrokeColor: '#ffffff',
    borderColor: '#0078d7',
    cornerSize: 8,
    originX: 'left',
    originY: 'top',
  });
  rect.set(SELECTION_KEY, true);
  rect.setControlsVisibility({ mtr: false });
  return rect;
}

export function getRectBounds(rect: Rect): RegionBounds {
  return {
    left: rect.left ?? 0,
    top: rect.top ?? 0,
    width: Math.max(1, rect.getScaledWidth()),
    height: Math.max(1, rect.getScaledHeight()),
  };
}

export function normalizeRect(x1: number, y1: number, x2: number, y2: number): RegionBounds {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  return {
    left,
    top,
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function clampBounds(bounds: RegionBounds, canvasW: number, canvasH: number): RegionBounds {
  const left = Math.max(0, Math.min(bounds.left, canvasW - 1));
  const top = Math.max(0, Math.min(bounds.top, canvasH - 1));
  const width = Math.max(1, Math.min(bounds.width, canvasW - left));
  const height = Math.max(1, Math.min(bounds.height, canvasH - top));
  return { left, top, width, height };
}

export function extractRegionElement(
  canvas: Canvas,
  bounds: RegionBounds,
  hide: FabricObject[]
): HTMLCanvasElement {
  const prev = hide.map((o) => o.visible);
  hide.forEach((o) => o.set({ visible: false }));
  canvas.renderAll();
  const el = canvas.toCanvasElement(1, {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
  });
  hide.forEach((o, i) => o.set({ visible: prev[i] !== false }));
  canvas.renderAll();
  return el;
}

export function makeClipImage(el: HTMLCanvasElement, bounds: RegionBounds): FabricImage {
  const img = new FabricImage(el, {
    left: bounds.left,
    top: bounds.top,
    selectable: true,
    evented: true,
    hasControls: true,
    lockRotation: false,
    objectCaching: true,
  });
  img.set(DRAWING_KEY, true);
  img.set(CLIP_KEY, true);
  return img;
}

export function makeCoverRect(bounds: RegionBounds, fill = '#ffffff'): Rect {
  const hole = new Rect({
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
    fill,
    strokeWidth: 0,
    selectable: false,
    evented: false,
  });
  hole.set(DRAWING_KEY, true);
  return hole;
}

export function isSelectionRect(obj: FabricObject | undefined | null): obj is Rect {
  return !!obj && !!obj.get(SELECTION_KEY);
}
