import JSZip from 'jszip';
import type { ProcessVariant } from '../types/processVariant';
import { getVariantBaseUrl } from '../types/processVariant';
import { loadImageElement } from '../lib/loadImageElement';
import { getVariantDraft } from '../features/imageEditor/variantDraftStorage';
import {
  formatToExtension,
  rasterizeImageElement,
  type ExportImageFormat,
} from '../features/imageEditor/composeExport';
import { STAGE_MAX_W } from '../features/imageEditor/constants';
import { downloadBlob } from './downloadBlob';

function createZip(): JSZip {
  const Ctor =
    typeof JSZip === 'function'
      ? JSZip
      : ((JSZip as unknown as { default: typeof JSZip }).default ?? JSZip);
  return new Ctor();
}

async function exportInactiveVariant(
  variant: ProcessVariant,
  format: ExportImageFormat,
  quality: number,
  stageWidth: number
): Promise<Blob> {
  const url = getVariantBaseUrl(variant);
  const img = await loadImageElement(url);
  const aspect = (img.naturalHeight || 1) / (img.naturalWidth || 1);
  const width = Math.max(200, Math.min(STAGE_MAX_W, stageWidth || STAGE_MAX_W));
  const height = Math.max(200, Math.round(width * aspect));
  const draft = getVariantDraft(variant.id);
  const layers = draft?.textLayers?.length ? draft.textLayers : variant.textLayers;
  return rasterizeImageElement(img, format, quality, {
    width,
    height,
    layers,
  });
}

async function fallbackVariantBlob(
  variant: ProcessVariant,
  format: ExportImageFormat,
  quality: number
): Promise<Blob> {
  const img = await loadImageElement(getVariantBaseUrl(variant));
  return rasterizeImageElement(img, format, quality);
}

export async function exportAllVariantsZip(options: {
  variants: ProcessVariant[];
  activeIndex: number;
  exportActive: () => Promise<Blob>;
  format: ExportImageFormat;
  quality?: number;
  stageWidth?: number;
}): Promise<Blob> {
  const { variants, activeIndex, exportActive, format, quality = 0.92, stageWidth = STAGE_MAX_W } =
    options;
  const zip = createZip();
  const ext = formatToExtension(format);

  for (let i = 0; i < variants.length; i++) {
    let blob: Blob;
    try {
      blob =
        i === activeIndex
          ? await exportActive()
          : await exportInactiveVariant(variants[i], format, quality, stageWidth);
    } catch {
      blob = await fallbackVariantBlob(variants[i], format, quality);
    }
    zip.file(`variant-${i + 1}.${ext}`, blob);
  }

  return zip.generateAsync({ type: 'blob' });
}

export async function zipImageUrls(
  urls: string[],
  options?: { filenamePrefix?: string; format?: ExportImageFormat; quality?: number }
): Promise<Blob> {
  const zip = createZip();
  const prefix = options?.filenamePrefix ?? 'variant';
  const format = options?.format;
  const quality = options?.quality ?? 0.92;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (format) {
      const img = await loadImageElement(url);
      const blob = await rasterizeImageElement(img, format, quality);
      zip.file(`${prefix}-${i + 1}.${formatToExtension(format)}`, blob);
    } else {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(`Image load failed (${res.status})`);
      const blob = await res.blob();
      const ext = blob.type.includes('jpeg')
        ? 'jpg'
        : blob.type.includes('webp')
          ? 'webp'
          : 'png';
      zip.file(`${prefix}-${i + 1}.${ext}`, blob);
    }
  }

  return zip.generateAsync({ type: 'blob' });
}

export async function downloadAllVariantsZip(options: {
  variants: ProcessVariant[];
  activeIndex: number;
  exportActive: () => Promise<Blob>;
  format: ExportImageFormat;
  quality?: number;
  stageWidth?: number;
}): Promise<void> {
  const blob = await exportAllVariantsZip(options);
  downloadBlob(blob, 'card-genius-variants.zip');
}
