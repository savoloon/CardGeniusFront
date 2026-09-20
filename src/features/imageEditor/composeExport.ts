import type { TextLayer } from '../../types/infographicEditor';
import {
  ensureInfographicFontsReady,
  normalizeInfographicFont,
} from '../../constants/infographicFonts';
import type { Canvas } from 'fabric';

export type ExportImageFormat = 'png' | 'jpeg' | 'webp';

export const EXPORT_IMAGE_FORMATS: ExportImageFormat[] = ['png', 'jpeg', 'webp'];

export function formatToMime(format: ExportImageFormat): string {
  if (format === 'jpeg') return 'image/jpeg';
  if (format === 'webp') return 'image/webp';
  return 'image/png';
}

export function formatToExtension(format: ExportImageFormat): string {
  if (format === 'jpeg') return 'jpg';
  if (format === 'webp') return 'webp';
  return 'png';
}

export function canvasElementToBlob(
  el: HTMLCanvasElement,
  format: ExportImageFormat,
  quality = 0.92
): Promise<Blob> {
  const mime = formatToMime(format);
  return new Promise((resolve, reject) => {
    el.toBlob(
      (blob) => {
        if (blob && blob.size > 0) {
          resolve(blob);
          return;
        }
        reject(new Error('Export failed'));
      },
      mime,
      format === 'png' ? undefined : quality
    );
  });
}

function getExportCanvasElement(canvas: Canvas): HTMLCanvasElement {
  const fabricCanvas = canvas as Canvas & {
    toCanvasElement?: (multiplier?: number) => HTMLCanvasElement;
    lowerCanvasEl?: HTMLCanvasElement;
    getElement?: () => HTMLCanvasElement;
  };
  if (typeof fabricCanvas.toCanvasElement === 'function') {
    return fabricCanvas.toCanvasElement(1);
  }
  const el = fabricCanvas.lowerCanvasEl ?? fabricCanvas.getElement?.();
  if (!el) throw new Error('No canvas');
  return el;
}

export async function exportFabricCanvas(
  canvas: Canvas,
  format: ExportImageFormat,
  quality = 0.92
): Promise<Blob> {
  await ensureInfographicFontsReady();
  canvas.renderAll();
  const el = getExportCanvasElement(canvas);
  try {
    return await canvasElementToBlob(el, format, quality);
  } catch {
    const dataUrl = canvas.toDataURL({
      format: format === 'png' ? 'png' : format,
      quality,
      multiplier: 1,
    });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (!blob.size) throw new Error('Export failed');
    return blob;
  }
}

export function drawTextLayersOnContext(
  ctx: CanvasRenderingContext2D,
  layers: TextLayer[],
  width: number,
  height: number
): void {
  for (const layer of layers) {
    const family = normalizeInfographicFont(layer.fontFamily);
    const x = (layer.x / 100) * width;
    const y = (layer.y / 100) * height;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    const italic = layer.fontStyle === 'italic' ? 'italic ' : '';
    ctx.font = `${italic}${layer.fontWeight} ${layer.fontSize}px ${family}`;
    ctx.textAlign = layer.textAlign;
    ctx.textBaseline = 'top';
    const lines = layer.text.split('\n');
    const lineHeight = layer.fontSize * 1.2;
    if (layer.backgroundColor && layer.backgroundColor !== 'transparent') {
      const maxWidth = Math.max(0, ...lines.map((line) => ctx.measureText(line).width));
      const pad = 6;
      ctx.fillStyle = layer.backgroundColor;
      ctx.fillRect(-pad, -pad, maxWidth + pad * 2, lineHeight * lines.length + pad * 2);
    }
    ctx.fillStyle = layer.color;
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, i * lineHeight);
    });
    ctx.restore();
  }
}

export async function rasterizeImageElement(
  img: HTMLImageElement,
  format: ExportImageFormat,
  quality = 0.92,
  options?: { width?: number; height?: number; layers?: TextLayer[] }
): Promise<Blob> {
  await ensureInfographicFontsReady();
  const width = Math.max(1, Math.round(options?.width ?? img.naturalWidth ?? img.width));
  const height = Math.max(1, Math.round(options?.height ?? img.naturalHeight ?? img.height));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  if (format === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);
  if (options?.layers?.length) {
    drawTextLayersOnContext(ctx, options.layers, width, height);
  }
  try {
    return await canvasElementToBlob(canvas, format, quality);
  } catch {
    const dataUrl = canvas.toDataURL(formatToMime(format), format === 'png' ? undefined : quality);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (!blob.size) throw new Error('Export failed');
    return blob;
  }
}
