import type { TextLayer } from '../types/infographicEditor';
import { downloadBlob } from './downloadBlob';

const MAX_LAYER_WIDTH_CSS = 352; // ~22rem
const LAYER_PADDING_CSS = 8;
const TEXT_PADDING_CSS = 6;
const BORDER_RADIUS_CSS = 6;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function buildFont(layer: TextLayer, scaledSize: number): string {
  const style = layer.fontStyle === 'italic' ? 'italic ' : '';
  const weight = `${layer.fontWeight} `;
  return `${style}${weight}${scaledSize}px ${layer.fontFamily}`;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push('');
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth || !current) {
        current = test;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }

  return lines.length > 0 ? lines : [''];
}

function measureLayerBlock(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  scale: number
): { width: number; height: number; lines: string[]; lineHeight: number; fontSize: number } {
  const fontSize = layer.fontSize * scale;
  const lineHeight = fontSize * 1.35;
  const maxWidth = Math.min(MAX_LAYER_WIDTH_CSS * scale, 400 * scale);
  ctx.font = buildFont(layer, fontSize);
  const lines = wrapLines(ctx, layer.text, maxWidth);
  let maxLineW = 0;
  for (const line of lines) {
    maxLineW = Math.max(maxLineW, ctx.measureText(line).width);
  }
  const innerW = maxLineW + TEXT_PADDING_CSS * 2 * scale;
  const innerH = lines.length * lineHeight + TEXT_PADDING_CSS * 2 * scale;
  const width = innerW + LAYER_PADDING_CSS * scale;
  const height = innerH + LAYER_PADDING_CSS * scale;
  return { width, height, lines, lineHeight, fontSize };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  imgW: number,
  imgH: number,
  scale: number
) {
  const cx = (layer.x / 100) * imgW;
  const cy = (layer.y / 100) * imgH;
  const { width, height, lines, lineHeight, fontSize } = measureLayerBlock(ctx, layer, scale);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((layer.rotation * Math.PI) / 180);

  const left = -width / 2;
  const top = -height / 2;

  if (layer.backgroundColor !== 'transparent') {
    drawRoundedRect(
      ctx,
      left + (LAYER_PADDING_CSS * scale) / 2,
      top + (LAYER_PADDING_CSS * scale) / 2,
      width - LAYER_PADDING_CSS * scale,
      height - LAYER_PADDING_CSS * scale,
      BORDER_RADIUS_CSS * scale
    );
    ctx.fillStyle = layer.backgroundColor;
    ctx.fill();
  }

  ctx.font = buildFont(layer, fontSize);
  ctx.fillStyle = layer.color;
  ctx.textBaseline = 'top';

  const innerLeft = left + LAYER_PADDING_CSS * scale + TEXT_PADDING_CSS * scale;
  const innerTop = top + LAYER_PADDING_CSS * scale + TEXT_PADDING_CSS * scale;
  const maxTextW = width - (LAYER_PADDING_CSS + TEXT_PADDING_CSS * 2) * scale;

  let textX = innerLeft;
  if (layer.textAlign === 'center') textX = left + width / 2;
  else if (layer.textAlign === 'right') textX = left + width - LAYER_PADDING_CSS * scale - TEXT_PADDING_CSS * scale;

  ctx.textAlign = layer.textAlign;

  lines.forEach((line, i) => {
    const y = innerTop + i * lineHeight;
    if (layer.textDecoration === 'underline' && line) {
      const m = ctx.measureText(line);
      const underlineY = y + fontSize + 2 * scale;
      let ux = textX;
      if (layer.textAlign === 'center') ux -= m.width / 2;
      else if (layer.textAlign === 'right') ux -= m.width;
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = Math.max(1, scale);
      ctx.beginPath();
      ctx.moveTo(ux, underlineY);
      ctx.lineTo(ux + m.width, underlineY);
      ctx.stroke();
    }
    if (layer.direction === 'rtl') {
      ctx.direction = 'rtl';
    }
    ctx.fillText(line, textX, y, maxTextW);
    ctx.direction = 'ltr';
  });

  ctx.restore();
}

export interface ExportInfographicOptions {
  imageUrl: string;
  layers: TextLayer[];
  displayWidth: number;
  filename?: string;
}

export async function exportInfographicToBlob({
  imageUrl,
  layers,
  displayWidth,
}: Omit<ExportInfographicOptions, 'filename'>): Promise<Blob> {
  await document.fonts.ready;
  const img = await loadImage(imageUrl);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const scale = displayWidth > 0 ? imgW / displayWidth : 1;

  const canvas = document.createElement('canvas');
  canvas.width = imgW;
  canvas.height = imgH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(img, 0, 0, imgW, imgH);

  const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  for (const layer of sorted) {
    drawLayer(ctx, layer, imgW, imgH, scale);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Export failed'));
      },
      'image/png',
      1
    );
  });
}

export async function exportAndDownloadInfographic(
  options: ExportInfographicOptions
): Promise<void> {
  const blob = await exportInfographicToBlob(options);
  downloadBlob(blob, options.filename ?? 'infographic-result.png');
}
