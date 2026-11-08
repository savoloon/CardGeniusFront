import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Canvas, FabricImage, PencilBrush, IText, Textbox, FabricObject, Rect } from 'fabric';
import type { TextLayer } from '../../types/infographicEditor';
import type { InfographicRecommendedItem } from '../../types/infographicEditor';
import type { EditorTool } from './types';
import {
  TEXT_OBJECT_KEY,
  applySnapshotToIText,
  applyTextLayersToCanvas,
  isTextObject,
  snapshotFromIText,
} from './fabricTextUtils';
import type { FabricTextSnapshot } from './fabricTextTypes';
import { loadImageElement } from '../../lib/loadImageElement';
import { DEFAULT_INFOGRAPHIC_FONT, normalizeInfographicFont } from '../../constants/infographicFonts';
import { exportFabricCanvas, type ExportImageFormat } from './composeExport';
import { coverPlacement, exportPixelMultiplier } from './imageFit';
import { fitInfographicBadge, readImageLuminance, type FittedBadge } from './fitInfographicBadge';
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
  exportBlob: (format: ExportImageFormat, quality?: number) => Promise<Blob>;
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

function sourcePixelSize(el: HTMLImageElement | HTMLCanvasElement | undefined): {
  width: number;
  height: number;
} {
  if (!el) return { width: 0, height: 0 };
  const width = 'naturalWidth' in el && el.naturalWidth ? el.naturalWidth : el.width;
  const height = 'naturalHeight' in el && el.naturalHeight ? el.naturalHeight : el.height;
  return { width, height };
}

function fitBackgroundImage(bg: FabricImage, width: number, height: number) {
  const source = sourcePixelSize(bg.getElement() as HTMLImageElement | HTMLCanvasElement | undefined);
  const placed = coverPlacement(width, height, source.width || width, source.height || height);
  bg.set({
    originX: 'left',
    originY: 'top',
    left: placed.left,
    top: placed.top,
    scaleX: placed.scale,
    scaleY: placed.scale,
  });
  bg.setCoords();
}

function rescaleBackground(canvas: Canvas, width: number, height: number) {
  const bg = canvas.getObjects().find((o) => o.get(BACKGROUND_KEY));
  if (!(bg instanceof FabricImage)) return;
  fitBackgroundImage(bg, width, height);
}

function backgroundExportMultiplier(canvas: Canvas): number {
  const bg = canvas.getObjects().find((o) => o.get(BACKGROUND_KEY));
  if (!(bg instanceof FabricImage)) return 1;
  const source = sourcePixelSize(bg.getElement() as HTMLImageElement | HTMLCanvasElement | undefined);
  return exportPixelMultiplier(source.width, canvas.getWidth());
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

      try {
        const el = await loadImageElement(url);
        const current = canvasRef.current;
        if (loadId !== bgLoadIdRef.current || !current) return;

        const existing = current.getObjects().find((o) => o.get(BACKGROUND_KEY));
        if (existing) current.remove(existing);

        const img = new FabricImage(el, {
          selectable: false,
          evented: false,
        });
        img.set(BACKGROUND_KEY, true);
        fitBackgroundImage(img, current.getWidth(), current.getHeight());
        current.insertAt(0, img);
        current.renderAll();
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
            return await exportFabricCanvas(c, format, quality, backgroundExportMultiplier(c));
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
              const scaleX = Number(o.scaleX ?? 1) || 1;
              const scaleY = Number(o.scaleY ?? 1) || 1;
              let left = o.left ?? 0;
              let top = o.top ?? 0;
              if (o.originX === 'center') left -= (Number(o.width ?? 0) * scaleX) / 2;
              if (o.originY === 'center') top -= (Number(o.height ?? 0) * scaleY) / 2;
              const align = it.textAlign;
              const background =
                typeof it.backgroundColor === 'string' && it.backgroundColor
                  ? it.backgroundColor
                  : 'transparent';
              return {
                id: crypto.randomUUID(),
                text: it.text ?? '',
                x: (left / cw) * 100,
                y: (top / ch) * 100,
                fontFamily: normalizeInfographicFont(String(it.fontFamily ?? DEFAULT_INFOGRAPHIC_FONT)),
                fontSize: Number(it.fontSize ?? 18) * scaleY,
                color: String(it.fill ?? '#1a1a1a'),
                fontWeight: it.fontWeight === 'bold' || it.fontWeight === 700 ? 700 : 400,
                fontStyle: it.fontStyle === 'italic' ? 'italic' : 'normal',
                textDecoration: 'none' as const,
                rotation: o.angle ?? 0,
                zIndex: 10,
                textAlign: align === 'center' || align === 'right' ? align : 'left',
                direction: 'ltr' as const,
                backgroundColor: background,
                width: o.type === 'textbox' ? Number(o.width ?? 0) * scaleX : undefined,
              };
            });
        },
        applyTextLayers: (layers: TextLayer[]) => {
          const c = canvasRef.current;
          if (!c) return;
          applyTextLayersToCanvas(c, layers);
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
          fontFamily: DEFAULT_INFOGRAPHIC_FONT,
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

function sampleBadgeLuminance(canvas: Canvas, badge: FittedBadge): number | null {
  const bg = canvas.getObjects().find((o) => o.get(BACKGROUND_KEY));
  if (!(bg instanceof FabricImage)) return null;
  const el = bg.getElement() as HTMLImageElement | HTMLCanvasElement | undefined;
  const source = sourcePixelSize(el);
  if (!el || source.width <= 0 || source.height <= 0) return null;
  const scaleX = bg.scaleX || 1;
  const scaleY = bg.scaleY || 1;
  const visualLeft = badge.left - badge.padding;
  const visualTop = badge.top - badge.padding;
  const sx = (visualLeft - (bg.left ?? 0)) / scaleX;
  const sy = (visualTop - (bg.top ?? 0)) / scaleY;
  return readImageLuminance(
    el,
    sx,
    sy,
    (badge.width + badge.padding * 2) / scaleX,
    (badge.height + badge.padding * 2) / scaleY,
    source.width,
    source.height
  );
}

export function placeRecommendedOnCanvas(canvas: Canvas, item: InfographicRecommendedItem) {
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();
  const base = {
    canvasWidth: cw,
    canvasHeight: ch,
    position: item.position,
    text: item.text,
    font: item.font,
    tone: item.tone,
    badge: item.badge,
  };
  const probed = fitInfographicBadge(base);
  const fitted = fitInfographicBadge({
    ...base,
    luminance: sampleBadgeLuminance(canvas, probed),
  });
  const it = new Textbox(item.text, {
    left: fitted.left,
    top: fitted.top,
    width: Math.max(1, fitted.width),
    fontFamily: fitted.fontFamily,
    fontSize: fitted.fontSize,
    fill: fitted.fill,
    fontWeight: fitted.fontWeight,
    textAlign: fitted.textAlign,
    lineHeight: fitted.lineHeight,
    backgroundColor: fitted.backgroundColor,
    padding: fitted.padding,
    originX: 'left',
    originY: 'top',
  });
  it.set(TEXT_OBJECT_KEY, true);
  canvas.add(it);
  canvas.setActiveObject(it);
  canvas.renderAll();
}
