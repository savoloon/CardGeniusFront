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

function getExportCanvasElement(canvas: Canvas, multiplier: number): HTMLCanvasElement {
  const fabricCanvas = canvas as Canvas & {
    toCanvasElement?: (multiplier?: number) => HTMLCanvasElement;
    lowerCanvasEl?: HTMLCanvasElement;
    getElement?: () => HTMLCanvasElement;
  };
  if (typeof fabricCanvas.toCanvasElement === 'function') {
    return fabricCanvas.toCanvasElement(multiplier);
  }
  const el = fabricCanvas.lowerCanvasEl ?? fabricCanvas.getElement?.();
  if (!el) throw new Error('No canvas');
  return el;
}

export async function exportFabricCanvas(
  canvas: Canvas,
  format: ExportImageFormat,
  quality = 0.92,
  multiplier = 1
): Promise<Blob> {
  await ensureInfographicFontsReady();
  canvas.renderAll();
  const scale = multiplier > 0 ? multiplier : 1;
  const el = getExportCanvasElement(canvas, scale);
  try {
    return await canvasElementToBlob(el, format, quality);
  } catch {
    const dataUrl = canvas.toDataURL({
      format: format === 'png' ? 'png' : format,
      quality,
      multiplier: scale,
    });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (!blob.size) throw new Error('Export failed');
    return blob;
  }
}

function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter((word) => word.length > 0);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth || !current) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines.length ? lines : [''];
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
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    const boxWidth = layer.width && layer.width > 0 ? layer.width : undefined;
    const lines = boxWidth ? wrapCanvasLines(ctx, layer.text, boxWidth) : layer.text.split('\n');
    const measured = lines.map((line) => ctx.measureText(line).width);
    const contentWidth = boxWidth ?? Math.max(0, ...measured);
    const lineHeight = layer.fontSize * 1.2;
    const hasBg = Boolean(layer.backgroundColor && layer.backgroundColor !== 'transparent');
    const pad = hasBg ? Math.max(4, layer.fontSize * 0.45) : 0;
    if (hasBg) {
      ctx.fillStyle = layer.backgroundColor;
      ctx.fillRect(-pad, -pad, contentWidth + pad * 2, lineHeight * lines.length + pad * 2);
    }
    ctx.fillStyle = layer.color;
    lines.forEach((line, i) => {
      const lineWidth = measured[i] ?? 0;
      let dx = 0;
      if (layer.textAlign === 'center') dx = (contentWidth - lineWidth) / 2;
      else if (layer.textAlign === 'right') dx = contentWidth - lineWidth;
      ctx.fillText(line, dx, i * lineHeight);
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
