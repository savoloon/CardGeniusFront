import { STAGE_MAX_W } from './constants';
import type { TextLayer } from '../../types/infographicEditor';

export function stageSizeForImage(
  containerInnerWidth: number,
  naturalWidth: number,
  naturalHeight: number,
  maxWidth = STAGE_MAX_W
): { width: number; height: number } {
  const photoWidth = Math.max(1, naturalWidth);
  const photoHeight = Math.max(1, naturalHeight);
  const available = Number.isFinite(containerInnerWidth) ? containerInnerWidth : maxWidth;
  const width = Math.max(1, Math.round(Math.min(maxWidth, Math.max(available, 1))));
  const height = Math.max(1, Math.round(width * (photoHeight / photoWidth)));
  return { width, height };
}

/** Uniform cover scale. One factor for both axes, image centered so the canvas stays filled. */
export function coverPlacement(
  canvasWidth: number,
  canvasHeight: number,
  photoWidth: number,
  photoHeight: number
): { scale: number; left: number; top: number } {
  const photoW = Math.max(1, photoWidth);
  const photoH = Math.max(1, photoHeight);
  const canvasW = Math.max(1, canvasWidth);
  const canvasH = Math.max(1, canvasHeight);
  const scale = Math.max(canvasW / photoW, canvasH / photoH);
  return {
    scale,
    left: (canvasW - photoW * scale) / 2,
    top: (canvasH - photoH * scale) / 2,
  };
}

/** Saved file uses the photo's pixel width, not the on-screen stage width. */
export function exportPixelMultiplier(photoWidth: number, canvasWidth: number): number {
  if (!(photoWidth > 0) || !(canvasWidth > 0)) return 1;
  return photoWidth / canvasWidth;
}

export function scaleTextLayers(
  layers: TextLayer[] | undefined,
  scale: number
): TextLayer[] | undefined {
  if (!layers?.length) return layers;
  if (!Number.isFinite(scale) || scale <= 0 || Math.abs(scale - 1) < 0.0001) return layers;
  return layers.map((layer) => ({
    ...layer,
    fontSize: layer.fontSize * scale,
    width: layer.width != null ? layer.width * scale : layer.width,
  }));
}
