import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Canvas, FabricImage, PencilBrush, IText, FabricObject, Rect } from 'fabric';
import type { TextLayer } from '../../types/infographicEditor';
import type { InfographicRecommendedItem } from '../../types/infographicEditor';
import { getZoneCenter } from '../../lib/infographicZones';
import type { EditorTool } from './types';
import {
  TEXT_OBJECT_KEY,
  applySnapshotToIText,
  isTextObject,
  snapshotFromIText,
} from './fabricTextUtils';
import type { FabricTextSnapshot } from './fabricTextTypes';
import { loadImageElement } from '../../lib/loadImageElement';
import { hexToRgb, rgbToHex } from './colorUtils';
import { floodFillOverlay } from './floodFill';
import {
  CLIP_KEY,
  DRAWING_KEY,
  clampBounds,
  createSelectionRect,
  extractRegionElement,
  getRectBounds,
  isSelectionRect,
  makeClipImage,
  makeCoverRect,
  normalizeRect,
} from './rectSelection';
import styles from './ImageEditor.module.css';

const BACKGROUND_KEY = 'bgImage';

function cloneCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const copy = document.createElement('canvas');
  copy.width = src.width;
  copy.height = src.height;
  copy.getContext('2d')?.drawImage(src, 0, 0);
  return copy;
}

export interface ImageEditorStageHandle {
  getCanvas: () => Canvas | null;
  exportBlob: (format: 'png' | 'jpeg', quality?: number) => Promise<Blob>;
  clearDrawing: () => void;
  loadBackground: (url: string) => Promise<void>;
  serialize: () => string;
  deserialize: (json: string) => Promise<void>;
  collectTextLayers: () => TextLayer[];
  applyTextLayers: (layers: TextLayer[]) => void;
  setDirtyListener: (fn: (dirty: boolean) => void) => void;
  getSelectedTextSnapshot: () => FabricTextSnapshot | null;
  updateSelectedText: (patch: Partial<FabricTextSnapshot>) => void;
  deleteSelectedText: () => void;
  copySelection: () => boolean;
  cutSelection: () => boolean;
  pasteClipboard: () => boolean;
  deleteSelection: () => boolean;
}

interface ImageEditorStageProps {
  imageUrl: string;
  width: number;
  height: number;
  tool: EditorTool;
  brushColor: string;
  onEyedropperColor: (hex: string) => void;
  onTextSelectionChange?: (selected: boolean) => void;
  onRegionSelectionChange?: (active: boolean) => void;
  onClipboardChange?: (has: boolean) => void;
  onBackgroundReady?: () => void;
}

function rescaleBackground(canvas: Canvas, width: number, height: number) {
  const bg = canvas.getObjects().find((o) => o.get(BACKGROUND_KEY));
  if (!(bg instanceof FabricImage)) return;
  const el = bg.getElement() as HTMLImageElement | undefined;
  const nw = el?.naturalWidth || width;
  const nh = el?.naturalHeight || height;
  bg.set({
    left: 0,
    top: 0,
    scaleX: width / nw,
    scaleY: height / nh,
  });
  bg.setCoords();
}

const ImageEditorStage = forwardRef<ImageEditorStageHandle, ImageEditorStageProps>(
  function ImageEditorStage(
    {
      imageUrl,
      width,
      height,
      tool,
      brushColor,
      onEyedropperColor,
      onTextSelectionChange,
      onRegionSelectionChange,
      onClipboardChange,
      onBackgroundReady,
    },
    ref
  ) {
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<Canvas | null>(null);
    const sizeRef = useRef({ width, height });
    sizeRef.current = { width, height };
    const dirtyListenerRef = useRef<((d: boolean) => void) | null>(null);
    const onTextSelectionRef = useRef(onTextSelectionChange);
    onTextSelectionRef.current = onTextSelectionChange;
    const onRegionSelectionRef = useRef(onRegionSelectionChange);
    onRegionSelectionRef.current = onRegionSelectionChange;
    const onClipboardChangeRef = useRef(onClipboardChange);
    onClipboardChangeRef.current = onClipboardChange;
    const onBackgroundReadyRef = useRef(onBackgroundReady);
    onBackgroundReadyRef.current = onBackgroundReady;
    const selectedTextRef = useRef<IText | null>(null);
    const toolRef = useRef(tool);
    toolRef.current = tool;
    const brushColorRef = useRef(brushColor);
    brushColorRef.current = brushColor;
    const onEyedropperRef = useRef(onEyedropperColor);
    onEyedropperRef.current = onEyedropperColor;
    const imageUrlRef = useRef(imageUrl);
    imageUrlRef.current = imageUrl;
    const bgLoadIdRef = useRef(0);
    const selectionRectRef = useRef<Rect | null>(null);
    const clipboardRef = useRef<HTMLCanvasElement | null>(null);
    const pasteOffsetRef = useRef(0);
    const dragRef = useRef<{
      mode: 'draw' | 'lift';
      startX: number;
      startY: number;
      originLeft: number;
      originTop: number;
      moved: boolean;
    } | null>(null);

    const notifyTextSelection = useCallback(() => {
      onTextSelectionRef.current?.(selectedTextRef.current != null);
    }, []);

    const notifyRegionSelection = useCallback((active: boolean) => {
      onRegionSelectionRef.current?.(active);
    }, []);

    const storeClipboard = useCallback((el: HTMLCanvasElement) => {
      clipboardRef.current = el;
      onClipboardChangeRef.current?.(true);
    }, []);

    const markDirty = useCallback(() => {
      dirtyListenerRef.current?.(true);
    }, []);

    const removeSelectionRect = useCallback(() => {
      const canvas = canvasRef.current;
      const rect = selectionRectRef.current;
      if (canvas && rect) {
        canvas.remove(rect);
        if (canvas.getActiveObject() === rect) canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
      selectionRectRef.current = null;
      notifyRegionSelection(false);
    }, [notifyRegionSelection]);

    const copySelection = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      const rect = selectionRectRef.current;
      if (rect) {
        const bounds = clampBounds(getRectBounds(rect), canvas.getWidth(), canvas.getHeight());
        if (bounds.width < 2 || bounds.height < 2) return false;
        storeClipboard(extractRegionElement(canvas, bounds, [rect]));
        pasteOffsetRef.current = 0;
        return true;
      }
      const active = canvas.getActiveObject();
      if (active instanceof FabricImage && active.get(CLIP_KEY)) {
        storeClipboard(active.toCanvasElement());
        pasteOffsetRef.current = 0;
        return true;
      }
      return false;
    }, [storeClipboard]);

    const cutSelection = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      const rect = selectionRectRef.current;
      if (rect) {
        const bounds = clampBounds(getRectBounds(rect), canvas.getWidth(), canvas.getHeight());
        if (bounds.width < 2 || bounds.height < 2) return false;
        storeClipboard(extractRegionElement(canvas, bounds, [rect]));
        canvas.add(makeCoverRect(bounds, canvas.backgroundColor as string | undefined));
        const img = makeClipImage(cloneCanvas(clipboardRef.current as HTMLCanvasElement), bounds);
        canvas.remove(rect);
        selectionRectRef.current = null;
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        notifyRegionSelection(false);
        markDirty();
        pasteOffsetRef.current = 0;
        return true;
      }
      const active = canvas.getActiveObject();
      if (active instanceof FabricImage && active.get(CLIP_KEY)) {
        storeClipboard(active.toCanvasElement());
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        markDirty();
        pasteOffsetRef.current = 0;
        return true;
      }
      return false;
    }, [markDirty, notifyRegionSelection, storeClipboard]);

    const pasteClipboard = useCallback(() => {
      const canvas = canvasRef.current;
      const clip = clipboardRef.current;
      if (!canvas || !clip) return false;
      const offset = 8 + pasteOffsetRef.current;
      pasteOffsetRef.current = (pasteOffsetRef.current + 12) % 48;
      const img = makeClipImage(cloneCanvas(clip), {
        left: offset,
        top: offset,
        width: clip.width,
        height: clip.height,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
      markDirty();
      return true;
    }, [markDirty]);

    const deleteSelection = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      const rect = selectionRectRef.current;
      if (rect) {
        const bounds = clampBounds(getRectBounds(rect), canvas.getWidth(), canvas.getHeight());
        canvas.add(makeCoverRect(bounds, canvas.backgroundColor as string | undefined));
        canvas.remove(rect);
        selectionRectRef.current = null;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        notifyRegionSelection(false);
        markDirty();
        return true;
      }
      const active = canvas.getActiveObject();
      if (active && (active.get(CLIP_KEY) || isTextObject(active))) {
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        if (isTextObject(active)) {
          selectedTextRef.current = null;
          notifyTextSelection();
        }
        markDirty();
        return true;
      }
      return false;
    }, [markDirty, notifyRegionSelection, notifyTextSelection]);

    const syncTextSelection = useCallback(
      (canvas: Canvas) => {
        const active = canvas.getActiveObject();
        if (active && isTextObject(active)) {
          selectedTextRef.current = active;
        } else {
          selectedTextRef.current = null;
        }
        notifyTextSelection();
        notifyRegionSelection(isSelectionRect(active));
      },
      [notifyTextSelection, notifyRegionSelection]
    );

    const applyFill = useCallback(
      (canvas: Canvas, sceneX: number, sceneY: number) => {
        canvas.discardActiveObject();
        const rect = selectionRectRef.current;
        if (rect) rect.set({ visible: false });
        canvas.renderAll();

        const w = canvas.getWidth();
        const h = canvas.getHeight();
        const snap = document.createElement('canvas');
        snap.width = w;
        snap.height = h;
        const sctx = snap.getContext('2d');
        if (!sctx) {
          if (rect) rect.set({ visible: true });
          return;
        }
        sctx.drawImage(canvas.getElement(), 0, 0, w, h);
        const { r, g, b } = hexToRgb(brushColorRef.current);
        const result = floodFillOverlay(sctx.getImageData(0, 0, w, h), sceneX, sceneY, r, g, b, 255);
        if (rect) rect.set({ visible: true });
        if (!result) {
          canvas.requestRenderAll();
          return;
        }
        const img = new FabricImage(result.canvas, {
          left: result.left,
          top: result.top,
          selectable: false,
          evented: false,
        });
        img.set(DRAWING_KEY, true);
        canvas.add(img);
        canvas.requestRenderAll();
        markDirty();
      },
      [markDirty]
    );

    const setBackground = useCallback(async (url: string) => {
      const canvas = canvasRef.current;
      if (!canvas || !url) return;

      const loadId = ++bgLoadIdRef.current;
      const { width: w, height: h } = sizeRef.current;

      try {
        const el = await loadImageElement(url);
        if (loadId !== bgLoadIdRef.current || !canvasRef.current) return;

        const existing = canvas.getObjects().find((o) => o.get(BACKGROUND_KEY));
        if (existing) canvas.remove(existing);

        const scaleX = w / (el.naturalWidth || w);
        const scaleY = h / (el.naturalHeight || h);
        const img = new FabricImage(el, {
          left: 0,
          top: 0,
          scaleX,
          scaleY,
          selectable: false,
          evented: false,
        });
        img.set(BACKGROUND_KEY, true);
        canvas.insertAt(0, img);
        canvas.renderAll();
        onBackgroundReadyRef.current?.();
      } catch {
        /* background load failed */
      }
    }, []);

    useEffect(() => {
      if (!canvasElRef.current) return;

      const canvas = new Canvas(canvasElRef.current, {
        width: Math.max(1, sizeRef.current.width),
        height: Math.max(1, sizeRef.current.height),
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
      });
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvasRef.current = canvas;

      const onPathCreated = (e: { path?: FabricObject }) => {
        if (!e.path) return;
        e.path.set({ selectable: false, evented: false });
        e.path.set(DRAWING_KEY, true);
        dirtyListenerRef.current?.(true);
      };

      canvas.on('path:created', onPathCreated);
      canvas.on('object:modified', (e) => {
        dirtyListenerRef.current?.(true);
        if (e.target && isTextObject(e.target)) {
          selectedTextRef.current = e.target;
          notifyTextSelection();
        }
      });
      canvas.on('selection:created', () => syncTextSelection(canvas));
      canvas.on('selection:updated', () => syncTextSelection(canvas));
      canvas.on('selection:cleared', () => {
        selectedTextRef.current = null;
        notifyTextSelection();
        if (!selectionRectRef.current) notifyRegionSelection(false);
      });

      const onMouseDown = (opt: { e: MouseEvent | TouchEvent | PointerEvent; target?: FabricObject; transform?: { corner?: string } | null }) => {
        const current = toolRef.current;
        const pointer = canvas.getScenePoint(opt.e);

        if (current === 'eyedropper') {
          canvas.renderAll();
          const el = canvas.getElement();
          const ctx = el.getContext('2d');
          if (!ctx) return;
          const scaleX = el.width / Math.max(1, canvas.getWidth());
          const scaleY = el.height / Math.max(1, canvas.getHeight());
          const x = Math.round(pointer.x * scaleX);
          const y = Math.round(pointer.y * scaleY);
          const data = ctx.getImageData(x, y, 1, 1).data;
          onEyedropperRef.current(rgbToHex(data[0], data[1], data[2]));
          return;
        }

        if (current === 'fill') {
          applyFill(canvas, pointer.x, pointer.y);
          return;
        }

        if (current !== 'select') return;

        const target = opt.target;
        if (isSelectionRect(target) && !opt.transform?.corner) {
          const bounds = getRectBounds(target);
          dragRef.current = {
            mode: 'lift',
            startX: pointer.x,
            startY: pointer.y,
            originLeft: bounds.left,
            originTop: bounds.top,
            moved: false,
          };
          return;
        }

        if (target && (target.get(CLIP_KEY) || isTextObject(target))) {
          removeSelectionRect();
          return;
        }

        if (opt.transform?.corner) return;

        removeSelectionRect();
        canvas.discardActiveObject();
        dragRef.current = {
          mode: 'draw',
          startX: pointer.x,
          startY: pointer.y,
          originLeft: pointer.x,
          originTop: pointer.y,
          moved: false,
        };
        const rect = createSelectionRect({ left: pointer.x, top: pointer.y, width: 1, height: 1 });
        rect.set({ hasControls: false });
        canvas.add(rect);
        selectionRectRef.current = rect;
        canvas.requestRenderAll();
      };

      const onMouseMove = (opt: { e: MouseEvent | TouchEvent | PointerEvent }) => {
        const drag = dragRef.current;
        if (!drag || toolRef.current !== 'select') return;
        const pointer = canvas.getScenePoint(opt.e);

        if (drag.mode === 'draw') {
          const rect = selectionRectRef.current;
          if (!rect) return;
          const bounds = clampBounds(
            normalizeRect(drag.startX, drag.startY, pointer.x, pointer.y),
            canvas.getWidth(),
            canvas.getHeight()
          );
          rect.set({
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height,
            scaleX: 1,
            scaleY: 1,
            hasControls: false,
          });
          rect.setCoords();
          canvas.requestRenderAll();
          return;
        }

        const dx = pointer.x - drag.startX;
        const dy = pointer.y - drag.startY;
        if (!drag.moved && Math.hypot(dx, dy) < 4) return;

        if (!drag.moved) {
          const rect = selectionRectRef.current;
          if (!rect) return;
          const bounds = clampBounds(getRectBounds(rect), canvas.getWidth(), canvas.getHeight());
          if (bounds.width < 2 || bounds.height < 2) return;
          const el = extractRegionElement(canvas, bounds, [rect]);
          storeClipboard(cloneCanvas(el));
          canvas.add(makeCoverRect(bounds, canvas.backgroundColor as string | undefined));
          const img = makeClipImage(el, bounds);
          canvas.remove(rect);
          selectionRectRef.current = null;
          canvas.add(img);
          canvas.setActiveObject(img);
          notifyRegionSelection(false);
          markDirty();
          drag.moved = true;
          drag.originLeft = bounds.left;
          drag.originTop = bounds.top;
          (drag as { clip?: FabricImage }).clip = img;
        }

        const clip = canvas.getActiveObject();
        if (clip instanceof FabricImage && clip.get(CLIP_KEY)) {
          clip.set({ left: drag.originLeft + dx, top: drag.originTop + dy });
          clip.setCoords();
          canvas.requestRenderAll();
        }
      };

      const onMouseUp = () => {
        const drag = dragRef.current;
        dragRef.current = null;
        if (!drag || drag.mode !== 'draw') return;
        const rect = selectionRectRef.current;
        if (!rect) return;
        const bounds = getRectBounds(rect);
        if (bounds.width < 4 || bounds.height < 4) {
          removeSelectionRect();
          return;
        }
        canvas.setActiveObject(rect);
        rect.set({ hasControls: true });
        rect.setCoords();
        canvas.requestRenderAll();
        notifyRegionSelection(true);
      };

      canvas.on('mouse:down', onMouseDown as never);
      canvas.on('mouse:move', onMouseMove as never);
      canvas.on('mouse:up', onMouseUp);

      if (imageUrlRef.current) {
        void setBackground(imageUrlRef.current);
      }

      return () => {
        bgLoadIdRef.current += 1;
        canvas.dispose();
        canvasRef.current = null;
        selectionRectRef.current = null;
      };
    }, [
      applyFill,
      markDirty,
      notifyRegionSelection,
      notifyTextSelection,
      removeSelectionRect,
      setBackground,
      storeClipboard,
      syncTextSelection,
    ]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || width < 1 || height < 1) return;
      canvas.setDimensions({ width, height });
      rescaleBackground(canvas, width, height);
      canvas.renderAll();
    }, [width, height]);

    useEffect(() => {
      if (!imageUrl) return;
      void setBackground(imageUrl);
    }, [imageUrl, setBackground]);

    useEffect(() => {
      if (tool !== 'select') {
        removeSelectionRect();
      }
    }, [tool, removeSelectionRect]);

    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        const el = e.target as HTMLElement | null;
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
          return;
        }
        const mod = e.ctrlKey || e.metaKey;
        if (mod && e.key.toLowerCase() === 'c') {
          if (copySelection()) e.preventDefault();
          return;
        }
        if (mod && e.key.toLowerCase() === 'x') {
          if (cutSelection()) e.preventDefault();
          return;
        }
        if (mod && e.key.toLowerCase() === 'v') {
          if (pasteClipboard()) e.preventDefault();
          return;
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (deleteSelection()) e.preventDefault();
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [copySelection, cutSelection, deleteSelection, pasteClipboard]);

    useImperativeHandle(
      ref,
      () => ({
        getCanvas: () => canvasRef.current,
        exportBlob: async (format, quality = 0.92) => {
          const c = canvasRef.current;
          if (!c) throw new Error('No canvas');
          const rect = selectionRectRef.current;
          if (rect) rect.set({ visible: false });
          c.renderAll();
          try {
            const dataUrl =
              format === 'jpeg'
                ? c.toDataURL({ format: 'jpeg', quality, multiplier: 1 })
                : c.toDataURL({ format: 'png', multiplier: 1 });
            const res = await fetch(dataUrl);
            return res.blob();
          } finally {
            if (rect) {
              rect.set({ visible: true });
              c.renderAll();
            }
          }
        },
        clearDrawing: () => {
          const c = canvasRef.current;
          if (!c) return;
          removeSelectionRect();
          c.getObjects()
            .filter((o) => !o.get(BACKGROUND_KEY))
            .forEach((o) => c.remove(o));
          c.renderAll();
        },
        loadBackground: setBackground,
        serialize: () => {
          const c = canvasRef.current;
          if (!c) return '';
          const rect = selectionRectRef.current;
          if (rect) c.remove(rect);
          const json = JSON.stringify(c.toJSON());
          if (rect) {
            c.add(rect);
            c.bringObjectToFront(rect);
          }
          return json;
        },
        deserialize: async (json: string) => {
          const c = canvasRef.current;
          if (!c || !json) return;
          await c.loadFromJSON(json);
          selectionRectRef.current = null;
          c.renderAll();
        },
        collectTextLayers: (): TextLayer[] => {
          const c = canvasRef.current;
          if (!c) return [];
          const cw = c.getWidth();
          const ch = c.getHeight();
          return c
            .getObjects()
            .filter((o) => o.type === 'i-text' || o.type === 'textbox')
            .map((o) => {
              const it = o as IText;
              return {
                id: crypto.randomUUID(),
                text: it.text ?? '',
                x: ((o.left ?? 0) / cw) * 100,
                y: ((o.top ?? 0) / ch) * 100,
                fontFamily: String(it.fontFamily ?? 'Inter, sans-serif'),
                fontSize: Number(it.fontSize ?? 18),
                color: String(it.fill ?? '#1a1a1a'),
                fontWeight: it.fontWeight === 'bold' ? 700 : 400,
                fontStyle: it.fontStyle === 'italic' ? 'italic' : 'normal',
                textDecoration: 'none',
                rotation: o.angle ?? 0,
                zIndex: 10,
                textAlign: 'left',
                direction: 'ltr',
                backgroundColor: 'transparent',
              };
            });
        },
        applyTextLayers: (layers: TextLayer[]) => {
          const c = canvasRef.current;
          if (!c) return;
          c.getObjects()
            .filter((o) => o.type === 'i-text')
            .forEach((o) => c.remove(o));
          const cw = c.getWidth();
          const ch = c.getHeight();
          for (const layer of layers) {
            const it = new IText(layer.text, {
              left: (layer.x / 100) * cw,
              top: (layer.y / 100) * ch,
              fontFamily: layer.fontFamily,
              fontSize: layer.fontSize,
              fill: layer.color,
              fontWeight: layer.fontWeight >= 600 ? 'bold' : 'normal',
              fontStyle: layer.fontStyle,
              angle: layer.rotation,
              backgroundColor:
                layer.backgroundColor === 'transparent' ? '' : layer.backgroundColor,
            });
            it.set(TEXT_OBJECT_KEY, true);
            c.add(it);
          }
          c.renderAll();
        },
        setDirtyListener: (fn) => {
          dirtyListenerRef.current = fn;
        },
        getSelectedTextSnapshot: () => {
          const obj = selectedTextRef.current;
          return obj ? snapshotFromIText(obj) : null;
        },
        updateSelectedText: (patch) => {
          const obj = selectedTextRef.current;
          if (!obj) return;
          applySnapshotToIText(obj, patch);
          canvasRef.current?.renderAll();
          markDirty();
        },
        deleteSelectedText: () => {
          const c = canvasRef.current;
          const obj = selectedTextRef.current;
          if (!c || !obj) return;
          c.remove(obj);
          c.discardActiveObject();
          c.renderAll();
          selectedTextRef.current = null;
          notifyTextSelection();
          markDirty();
        },
        copySelection,
        cutSelection,
        pasteClipboard,
        deleteSelection,
      }),
      [
        setBackground,
        markDirty,
        notifyTextSelection,
        removeSelectionRect,
        copySelection,
        cutSelection,
        pasteClipboard,
        deleteSelection,
      ]
    );

    useEffect(() => {
      const c = canvasRef.current;
      if (!c || tool !== 'text') return;
      const onDblClick = (opt: { e: MouseEvent | TouchEvent }) => {
        const pointer = c.getScenePoint(opt.e);
        const it = new IText('Text', {
          left: pointer.x,
          top: pointer.y,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 18,
          fill: brushColor,
        });
        it.set(TEXT_OBJECT_KEY, true);
        c.add(it);
        c.setActiveObject(it);
        c.renderAll();
        markDirty();
      };
      c.on('mouse:dblclick', onDblClick);
      return () => {
        c.off('mouse:dblclick', onDblClick);
      };
    }, [tool, brushColor, markDirty]);

    return (
      <div className={styles.stageWrap}>
        <canvas ref={canvasElRef} />
      </div>
    );
  }
);

export default ImageEditorStage;

export function placeRecommendedOnCanvas(canvas: Canvas, item: InfographicRecommendedItem) {
  const { x, y } = getZoneCenter(item.position);
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();
  const it = new IText(item.text, {
    left: (x / 100) * cw,
    top: (y / 100) * ch,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 18,
    fill: '#1a1a1a',
    fontWeight: 'bold',
  });
  it.set(TEXT_OBJECT_KEY, true);
  canvas.add(it);
  canvas.setActiveObject(it);
  canvas.renderAll();
}
