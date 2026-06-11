import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Canvas, FabricImage, PencilBrush, IText, FabricObject, filters } from 'fabric';
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
import styles from './ImageEditor.module.css';

const BACKGROUND_KEY = 'bgImage';
const DRAWING_KEY = 'drawing';

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
}

interface ImageEditorStageProps {
  imageUrl: string;
  width: number;
  height: number;
  tool: EditorTool;
  brushColor: string;
  blurRadius: number;
  onEyedropperColor: (hex: string) => void;
  onTextSelectionChange?: (selected: boolean) => void;
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
      blurRadius,
      onEyedropperColor,
      onTextSelectionChange,
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
    const onBackgroundReadyRef = useRef(onBackgroundReady);
    onBackgroundReadyRef.current = onBackgroundReady;
    const selectedTextRef = useRef<IText | null>(null);
    const toolRef = useRef(tool);
    toolRef.current = tool;
    const blurRadiusRef = useRef(blurRadius);
    blurRadiusRef.current = blurRadius;
    const onEyedropperRef = useRef(onEyedropperColor);
    onEyedropperRef.current = onEyedropperColor;
    const imageUrlRef = useRef(imageUrl);
    imageUrlRef.current = imageUrl;
    const bgLoadIdRef = useRef(0);

    const notifyTextSelection = useCallback(() => {
      onTextSelectionRef.current?.(selectedTextRef.current != null);
    }, []);

    const syncTextSelection = useCallback(
      (canvas: Canvas) => {
        const active = canvas.getActiveObject();
        if (active && isTextObject(active)) {
          selectedTextRef.current = active;
        } else {
          selectedTextRef.current = null;
        }
        notifyTextSelection();
      },
      [notifyTextSelection]
    );

    const markDirty = useCallback(() => {
      dirtyListenerRef.current?.(true);
    }, []);

    const applyBlurToPath = useCallback((canvas: Canvas, path: FabricObject) => {
      try {
        const blurFilter = new filters.Blur({ blur: blurRadiusRef.current / 12 });
        const target = path as FabricObject & {
          filters?: unknown[];
          applyFilters?: () => void;
        };
        target.filters = [blurFilter];
        target.applyFilters?.();
        canvas.renderAll();
      } catch {
        /* blur optional */
      }
    }, []);

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
        if (toolRef.current === 'blur') {
          applyBlurToPath(canvas, e.path);
        }
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
      });

      const onMouseDown = (opt: { e: MouseEvent | TouchEvent }) => {
        if (toolRef.current !== 'eyedropper') return;
        const ctx = canvas.getContext();
        if (!ctx) return;
        const pointer = canvas.getScenePoint(opt.e);
        const x = Math.round(pointer.x);
        const y = Math.round(pointer.y);
        const data = ctx.getImageData(x, y, 1, 1).data;
        const hex = `#${[data[0], data[1], data[2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        onEyedropperRef.current(hex);
      };

      canvas.on('mouse:down', onMouseDown);

      if (imageUrlRef.current) {
        void setBackground(imageUrlRef.current);
      }

      return () => {
        bgLoadIdRef.current += 1;
        canvas.dispose();
        canvasRef.current = null;
      };
    }, [applyBlurToPath, notifyTextSelection, setBackground, syncTextSelection]);

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

    useImperativeHandle(
      ref,
      () => ({
        getCanvas: () => canvasRef.current,
        exportBlob: async (format, quality = 0.92) => {
          const c = canvasRef.current;
          if (!c) throw new Error('No canvas');
          const dataUrl =
            format === 'jpeg'
              ? c.toDataURL({ format: 'jpeg', quality, multiplier: 1 })
              : c.toDataURL({ format: 'png', multiplier: 1 });
          const res = await fetch(dataUrl);
          return res.blob();
        },
        clearDrawing: () => {
          const c = canvasRef.current;
          if (!c) return;
          c.getObjects()
            .filter((o) => o.get(DRAWING_KEY))
            .forEach((o) => c.remove(o));
          c.renderAll();
        },
        loadBackground: setBackground,
        serialize: () => {
          const c = canvasRef.current;
          if (!c) return '';
          return JSON.stringify(c.toJSON());
        },
        deserialize: async (json: string) => {
          const c = canvasRef.current;
          if (!c || !json) return;
          await c.loadFromJSON(json);
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
      }),
      [setBackground, markDirty, notifyTextSelection]
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
