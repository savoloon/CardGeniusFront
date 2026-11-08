import { normalizeInfographicFont } from '../../constants/infographicFonts';
import { getZoneCenter } from '../../lib/infographicZones';

const HEIGHT_FRACTION = 0.18;
const MARGIN_FRACTION = 0.04;
const MAX_FONT_FRACTION = 0.045;
const MIN_FONT_FRACTION = 0.028;
const LINE_HEIGHT = 1.2;
const PADDING_RATIO = 0.45;
const MAX_LINES = 2;
const LIGHT_LUMINANCE = 170;
const DARK_LUMINANCE = 90;

const LIGHT_FILL = '#1a1a1a';
const LIGHT_BG = 'rgba(255, 255, 255, 0.92)';
const DARK_FILL = '#ffffff';
const DARK_BG = 'rgba(20, 20, 20, 0.78)';

export type MeasureBadgeText = (text: string, fontSize: number, fontFamily: string) => number;

export interface FitBadgeInput {
  canvasWidth: number;
  canvasHeight: number;
  position: string;
  text: string;
  font?: string | null;
  tone?: string | null;
  badge?: string | null;
  luminance?: number | null;
  measure?: MeasureBadgeText;
}

export interface FittedBadge {
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  backgroundColor: string;
  padding: number;
  textAlign: 'center';
  fontWeight: 'bold';
  lineHeight: number;
}

export function averageLuminance(data: Uint8ClampedArray): number | null {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    if (alpha < 0.2) continue;
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    count += 1;
  }
  if (count === 0) return null;
  return sum / count;
}

export function readImageLuminance(
  image: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  imageWidth: number,
  imageHeight: number
): number | null {
  if (typeof document === 'undefined' || imageWidth <= 0 || imageHeight <= 0) return null;
  const left = Math.max(0, Math.min(imageWidth - 1, sx));
  const top = Math.max(0, Math.min(imageHeight - 1, sy));
  const right = Math.max(left + 1, Math.min(imageWidth, sx + sw));
  const bottom = Math.max(top + 1, Math.min(imageHeight, sy + sh));
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  try {
    ctx.drawImage(image, left, top, right - left, bottom - top, 0, 0, 24, 24);
    return averageLuminance(ctx.getImageData(0, 0, 24, 24).data);
  } catch {
    return null;
  }
}

export function badgePaint(
  tone: string | null | undefined,
  badge: string | null | undefined,
  luminance: number | null | undefined
): { fill: string; backgroundColor: string } {
  const asked = tone === 'dark' ? 'dark' : 'light';
  let resolved: 'light' | 'dark' = asked;
  if (luminance != null && Number.isFinite(luminance)) {
    if (asked === 'light' && luminance >= LIGHT_LUMINANCE) resolved = 'dark';
    else if (asked === 'dark' && luminance <= DARK_LUMINANCE) resolved = 'light';
  }
  const plain = badge === 'plain';
  if (resolved === 'dark') {
    return { fill: DARK_FILL, backgroundColor: plain ? '' : DARK_BG };
  }
  return { fill: LIGHT_FILL, backgroundColor: plain ? '' : LIGHT_BG };
}

function zoneWidthFraction(position: string): number {
  return position.endsWith('_center') ? 0.42 : 0.34;
}

function approximateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.56;
}

let measureCanvas: HTMLCanvasElement | null = null;

function defaultMeasure(text: string, fontSize: number, fontFamily: string): number {
  if (typeof document !== 'undefined') {
    measureCanvas = measureCanvas ?? document.createElement('canvas');
    const ctx = measureCanvas.getContext('2d');
    if (ctx) {
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      return ctx.measureText(text).width;
    }
  }
  return approximateTextWidth(text, fontSize);
}

function wrapLines(
  text: string,
  fontSize: number,
  innerWidth: number,
  fontFamily: string,
  measure: MeasureBadgeText
): string[] | null {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (measure(word, fontSize, fontFamily) > innerWidth) return null;
    const next = current ? `${current} ${word}` : word;
    if (measure(next, fontSize, fontFamily) <= innerWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > MAX_LINES) return null;
  return lines;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function fitInfographicBadge(input: FitBadgeInput): FittedBadge {
  const canvasWidth = Math.max(1, input.canvasWidth);
  const canvasHeight = Math.max(1, input.canvasHeight);
  const fontFamily = normalizeInfographicFont(input.font);
  const measure = input.measure ?? defaultMeasure;
  const maxBoxWidth = canvasWidth * zoneWidthFraction(input.position);
  const maxBoxHeight = canvasHeight * HEIGHT_FRACTION;
  const marginX = canvasWidth * MARGIN_FRACTION;
  const marginY = canvasHeight * MARGIN_FRACTION;
  const maxFont = Math.max(8, Math.floor(canvasHeight * MAX_FONT_FRACTION));
  const minFont = Math.min(maxFont, Math.max(8, Math.ceil(canvasHeight * MIN_FONT_FRACTION)));

  const layoutAt = (fontSize: number) => {
    const padding = fontSize * PADDING_RATIO;
    const innerWidth = Math.max(1, maxBoxWidth - padding * 2);
    const lines = wrapLines(input.text, fontSize, innerWidth, fontFamily, measure);
    if (!lines) return null;
    const textHeight = lines.length * fontSize * LINE_HEIGHT;
    if (textHeight + padding * 2 > maxBoxHeight) return null;
    const contentWidth = Math.max(
      1,
      ...lines.map((line) => measure(line, fontSize, fontFamily))
    );
    return {
      fontSize,
      padding,
      width: Math.min(innerWidth, Math.ceil(contentWidth)),
      height: textHeight,
    };
  };

  let layout = layoutAt(maxFont);
  if (!layout) {
    for (let size = maxFont - 1; size >= minFont; size -= 1) {
      layout = layoutAt(size);
      if (layout) break;
    }
  }
  if (!layout) {
    const padding = minFont * PADDING_RATIO;
    const innerWidth = Math.max(1, maxBoxWidth - padding * 2);
    layout = {
      fontSize: minFont,
      padding,
      width: innerWidth,
      height: minFont * LINE_HEIGHT,
    };
  }

  const paint = badgePaint(input.tone, input.badge, input.luminance);
  const visualW = layout.width + layout.padding * 2;
  const visualH = layout.height + layout.padding * 2;
  const zone = getZoneCenter(input.position);
  const minLeft = Math.min(marginX, Math.max(0, canvasWidth - visualW));
  const maxLeft = Math.max(minLeft, canvasWidth - marginX - visualW);
  const minTop = Math.min(marginY, Math.max(0, canvasHeight - visualH));
  const maxTop = Math.max(minTop, canvasHeight - marginY - visualH);
  const visualLeft = clamp((zone.x / 100) * canvasWidth - visualW / 2, minLeft, maxLeft);
  const visualTop = clamp((zone.y / 100) * canvasHeight - visualH / 2, minTop, maxTop);

  return {
    left: visualLeft + layout.padding,
    top: visualTop + layout.padding,
    width: layout.width,
    height: layout.height,
    fontSize: layout.fontSize,
    fontFamily,
    fill: paint.fill,
    backgroundColor: paint.backgroundColor,
    padding: layout.padding,
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: LINE_HEIGHT,
  };
}
