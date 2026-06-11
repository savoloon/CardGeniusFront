import type { Canvas } from 'fabric';

export type ExportImageFormat = 'png' | 'jpeg';

export async function exportFabricCanvas(
  canvas: Canvas,
  format: ExportImageFormat,
  quality = 0.92
): Promise<Blob> {
  const multiplier = 1;
  const dataUrl =
    format === 'jpeg'
      ? canvas.toDataURL({ format: 'jpeg', quality, multiplier })
      : canvas.toDataURL({ format: 'png', multiplier });

  const res = await fetch(dataUrl);
  return res.blob();
}
