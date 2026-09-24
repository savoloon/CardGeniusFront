import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import { Button } from '../../components/ui';

import { useLanguage } from '../../contexts/LanguageContext';

import {

  saveVariantEdit,

  deleteVariantSave,

  getProcessSavedImageUrl,

} from '../../services/api';

import { getVariantBaseUrl, type ProcessVariant } from '../../types/processVariant';

import type { InfographicRecommendedItem } from '../../types/infographicEditor';

import {

  filterAvailableRecommended,

  recommendedItemKey,

} from '../../lib/recommendedItemKey';

import ImageEditorStage, {

  placeRecommendedOnCanvas,

  type ImageEditorStageHandle,

} from './ImageEditorStage';

import ImageEditorToolbar from './ImageEditorToolbar';

import RecommendedTextsPanel from './RecommendedTextsPanel';

import TextObjectToolbar from './TextObjectToolbar';

import type { FabricTextSnapshot } from './fabricTextTypes';

import { useDrawingTools } from './useDrawingTools';

import { getVariantDraft, setVariantDraft, removeVariantDraft } from './variantDraftStorage';

import { downloadBlob } from '../../utils/downloadBlob';
import { downloadAllVariantsZip } from '../../utils/exportAllVariants';
import { loadImageElement } from '../../lib/loadImageElement';
import { formatToExtension, type ExportImageFormat } from './composeExport';
import { STAGE_MAX_W } from './constants';
import ExportFormatMenu from '../../components/dashboard/ExportFormatMenu';

import styles from './ImageEditor.module.css';

interface VariantEditorProps {

  variant: ProcessVariant;

  variants?: ProcessVariant[];

  variantIndex: number;

  variantCount: number;

  onVariantChange: (id: string, patch: Partial<ProcessVariant>) => void;

  onDirtyChange?: (dirty: boolean) => void;

  onRequestSwitchVariant?: (targetIndex: number) => boolean;

}



export default function VariantEditor({

  variant,

  variants,

  variantIndex,

  variantCount,

  onVariantChange,

  onDirtyChange,

}: VariantEditorProps) {

  const { t } = useLanguage();

  const stageRef = useRef<ImageEditorStageHandle>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const [stageSize, setStageSize] = useState({ width: 400, height: 400 });

  const [dirty, setDirty] = useState(false);

  const [saving, setSaving] = useState(false);

  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [jpegQuality, setJpegQuality] = useState(0.92);
  const [exportMenu, setExportMenu] = useState<'one' | 'all' | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const [canUndo, setCanUndo] = useState(false);

  const [canRedo] = useState(false);

  const [textSelected, setTextSelected] = useState(false);

  const [textSnapshot, setTextSnapshot] = useState<FabricTextSnapshot | null>(null);
  const [imageAspect, setImageAspect] = useState(1);
  const [bgReady, setBgReady] = useState(false);
  const [regionSelected, setRegionSelected] = useState(false);
  const [canPaste, setCanPaste] = useState(false);
  const skipDraftPersistRef = useRef(false);
  const allVariants = variants?.length ? variants : [variant];
  const canExportAll = allVariants.length > 1;

  const {

    tool,

    setTool,

    brush,

    setBrush,

    applyToolToCanvas,

  } = useDrawingTools();



  const baseUrl = `${getVariantBaseUrl(variant)}${variant.displayBase === 'saved' ? `?r=${variant.savedRevision ?? 0}` : ''}`;



  const availableRecommended = useMemo(

    () => filterAvailableRecommended(variant.infographicItems, variant.usedRecommendedKeys),

    [variant.infographicItems, variant.usedRecommendedKeys]

  );



  const refreshTextSnapshot = useCallback(() => {

    const snap = stageRef.current?.getSelectedTextSnapshot() ?? null;

    setTextSnapshot(snap);
  }, []);



  useEffect(() => {
    let cancelled = false;
    setBgReady(false);
    loadImageElement(baseUrl)
      .then((img) => {
        if (!cancelled && img.naturalWidth > 0) {
          setImageAspect(img.naturalHeight / img.naturalWidth);
        }
      })
      .catch(() => {
        if (!cancelled) setImageAspect(1);
      });
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = Math.min(STAGE_MAX_W, el.clientWidth - 16);
      const width = Math.max(200, w);
      const height = Math.max(200, Math.round(width * imageAspect));
      setStageSize({ width, height });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [imageAspect]);

  useEffect(() => {
    skipDraftPersistRef.current = false;
    setDirty(false);
    onDirtyChange?.(false);
    setTextSelected(false);
    setTextSnapshot(null);
    setBgReady(false);
    setRegionSelected(false);
  }, [variant.id, onDirtyChange]);

  useEffect(() => {
    if (!bgReady || !stageRef.current) return;

    const draft = getVariantDraft(variant.id);
    const savedFlattened = variant.displayBase === 'saved' && !draft?.dirty;

    if (draft?.usedRecommendedKeys?.length && !savedFlattened) {
      onVariantChange(variant.id, { usedRecommendedKeys: draft.usedRecommendedKeys });
    }

    if (savedFlattened) {
      return;
    }

    if (draft?.textLayers.length) {
      stageRef.current.applyTextLayers(draft.textLayers);
    } else if (variant.textLayers.length) {
      stageRef.current.applyTextLayers(variant.textLayers);
    }

    if (draft?.dirty) {
      setDirty(true);
      onDirtyChange?.(true);
    }
  }, [variant.id, bgReady, variant.displayBase, variant.textLayers, onVariantChange, onDirtyChange]);



  useEffect(() => {

    stageRef.current?.setDirtyListener((d) => {
      if (d) skipDraftPersistRef.current = false;

      setDirty(d);

      onDirtyChange?.(d);

    });

  }, [onDirtyChange]);



  useEffect(() => {
    if (!bgReady) return;
    const canvas = stageRef.current?.getCanvas();
    applyToolToCanvas(canvas ?? null);
  }, [tool, brush, applyToolToCanvas, bgReady]);



  const persistDraft = useCallback(() => {
    if (skipDraftPersistRef.current) return;

    const json = stageRef.current?.serialize() ?? null;

    const textLayers = stageRef.current?.collectTextLayers() ?? [];

    setVariantDraft(variant.id, {

      canvasJson: json,

      textLayers,

      usedRecommendedKeys: variant.usedRecommendedKeys,

      dirty,

    });

  }, [variant.id, variant.usedRecommendedKeys, dirty]);



  useEffect(() => {

    return () => {

      persistDraft();

    };

  }, [variant.id, persistDraft]);

  useEffect(() => {
    if (!exportMenu) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!exportMenuRef.current?.contains(event.target as Node)) {
        setExportMenu(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExportMenu(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [exportMenu]);



  const handleSave = async () => {

    setSaving(true);

    setError(null);

    try {

      const blob = await stageRef.current?.exportBlob('png');

      if (!blob) throw new Error('Export failed');

      const textLayers = stageRef.current?.collectTextLayers() ?? [];

      const res = await saveVariantEdit(variant.taskId, variant.resultIndex, blob, textLayers);

      if (!res.success || !res.data) throw new Error(res.message ?? 'Save failed');

      const savedUrl = getProcessSavedImageUrl(variant.taskId, variant.resultIndex);

      skipDraftPersistRef.current = true;
      removeVariantDraft(variant.id);
      stageRef.current?.clearDrawing();

      await stageRef.current?.loadBackground(savedUrl);

      onVariantChange(variant.id, {

        displayBase: 'saved',

        savedUrl,

        savedRevision: res.data.revision,

        textLayers: textLayers as ProcessVariant['textLayers'],

        dirty: false,

      });

      setDirty(false);

      onDirtyChange?.(false);

    } catch (e) {

      setError(e instanceof Error ? e.message : t('dashboard.saveVariantError'));

    } finally {

      setSaving(false);

    }

  };



  const handleRevert = async () => {

    if (dirty && !window.confirm(t('dashboard.revertOriginalConfirm'))) return;

    setError(null);

    try {

      await deleteVariantSave(variant.taskId, variant.resultIndex);

      skipDraftPersistRef.current = true;
      removeVariantDraft(variant.id);
      stageRef.current?.clearDrawing();

      await stageRef.current?.loadBackground(variant.originalUrl);

      onVariantChange(variant.id, {

        displayBase: 'original',

        savedUrl: undefined,

        savedRevision: undefined,

        usedRecommendedKeys: [],

        textLayers: [],

        dirty: false,

      });

      setDirty(false);

      onDirtyChange?.(false);

    } catch (e) {

      setError(e instanceof Error ? e.message : t('dashboard.revertOriginalError'));

    }

  };



  const handleExport = async (format: ExportImageFormat) => {
    setExportMenu(null);
    setExporting(true);
    setError(null);
    try {
      const blob = await stageRef.current?.exportBlob(format, jpegQuality);
      if (!blob) throw new Error('Export failed');
      downloadBlob(blob, `variant-${variantIndex + 1}.${formatToExtension(format)}`);
    } catch {
      setError(t('dashboard.downloadResultError'));
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = async (format: ExportImageFormat) => {
    persistDraft();
    setExportMenu(null);
    setExporting(true);
    setError(null);
    try {
      await downloadAllVariantsZip({
        variants: allVariants,
        activeIndex: variantIndex,
        exportActive: async () => {
          const blob = await stageRef.current?.exportBlob(format, jpegQuality);
          if (!blob) throw new Error('Export failed');
          return blob;
        },
        format,
        quality: jpegQuality,
        stageWidth: stageSize.width,
      });
    } catch {
      setError(t('dashboard.downloadAllError'));
    } finally {
      setExporting(false);
    }
  };



  const handleUndo = () => {

    const c = stageRef.current?.getCanvas();

    if (c && (c as unknown as { undo?: () => void }).undo) {

      (c as unknown as { undo: () => void }).undo();

      setCanUndo(!!(c as unknown as { _historyUndo: unknown[] })._historyUndo?.length);

    }

  };



  const handleRedo = () => {

    const c = stageRef.current?.getCanvas();

    if (c && (c as unknown as { redo?: () => void }).redo) {

      (c as unknown as { redo: () => void }).redo();

    }

  };



  const placeRecommended = (item: InfographicRecommendedItem) => {

    const key = recommendedItemKey(item);

    if (variant.usedRecommendedKeys.includes(key)) return;



    const c = stageRef.current?.getCanvas();

    if (!c) return;

    placeRecommendedOnCanvas(c, item);



    const nextUsed = [...variant.usedRecommendedKeys, key];

    onVariantChange(variant.id, { usedRecommendedKeys: nextUsed });

    setDirty(true);

    onDirtyChange?.(true);

  };



  const handleTextSelectionChange = (selected: boolean) => {

    setTextSelected(selected);

    if (selected) {

      refreshTextSnapshot();

    } else {

      setTextSnapshot(null);

    }

  };



  const handleTextChange = (patch: Partial<FabricTextSnapshot>) => {

    stageRef.current?.updateSelectedText(patch);

    refreshTextSnapshot();

  };



  const handleDeleteText = () => {

    stageRef.current?.deleteSelectedText();

    setTextSelected(false);

    setTextSnapshot(null);

    setDirty(true);

    onDirtyChange?.(true);

  };



  return (

    <div className={styles.root}>

      <div className={styles.actionBar}>

        <div className={styles.actionMeta}>

          <span className={styles.actionTitle}>{t('dashboard.infographicEditorTitle')}</span>

          {variantCount > 1 && (

            <span className={styles.actionVariant}>

              {t('dashboard.infographicVariantOf', {

                current: variantIndex + 1,

                total: variantCount,

              })}

            </span>

          )}

          <span

            className={

              variant.displayBase === 'saved' ? styles.badgeSaved : styles.badgeOriginal

            }

          >

            {variant.displayBase === 'saved'

              ? t('dashboard.badgeSaved')

              : t('dashboard.badgeOriginal')}

          </span>

          {dirty && (

            <span className={styles.actionVariant}>{t('dashboard.unsavedChanges')}</span>

          )}

        </div>

        <div className={styles.actionBtns} ref={exportMenuRef}>

          <div className={styles.exportWrap}>

            <Button
              type="button"
              variant="outline"
              loading={exporting}
              disabled={exporting}
              onClick={() => setExportMenu((open) => (open === 'one' ? null : 'one'))}
            >

              {t('dashboard.downloadImage')}

            </Button>

            {exportMenu === 'one' && (

              <ExportFormatMenu
                quality={jpegQuality}
                onQualityChange={setJpegQuality}
                onSelect={(format) => void handleExport(format)}
              />

            )}

          </div>

          {canExportAll && (

            <div className={styles.exportWrap}>

              <Button
                type="button"
                variant="outline"
                loading={exporting}
                disabled={exporting}
                onClick={() => setExportMenu((open) => (open === 'all' ? null : 'all'))}
              >

                {t('dashboard.saveAllSlides')}

              </Button>

              {exportMenu === 'all' && (

                <ExportFormatMenu
                  quality={jpegQuality}
                  onQualityChange={setJpegQuality}
                  onSelect={(format) => void handleExportAll(format)}
                />

              )}

            </div>

          )}

          <Button type="button" variant="outline" onClick={handleRevert}>

            {t('dashboard.revertOriginal')}

          </Button>

          <Button type="button" loading={saving} onClick={handleSave}>

            {t('dashboard.saveVariant')}

          </Button>

        </div>

      </div>

      {error && (

        <p className={styles.error} role="alert">

          {error}

        </p>

      )}

      <div className={styles.body}>

        <ImageEditorToolbar

          tool={tool}

          onToolChange={setTool}

          color={brush.color}

          onColorChange={(c) => setBrush((b) => ({ ...b, color: c }))}

          brushWidth={brush.width}

          onBrushWidthChange={(w) => setBrush((b) => ({ ...b, width: w }))}

          brushKind={brush.kind}

          onBrushKindChange={(kind) => setBrush((b) => ({ ...b, kind }))}

          opacity={brush.opacity}

          onOpacityChange={(opacity) => setBrush((b) => ({ ...b, opacity }))}

          regionSelected={regionSelected}

          canPaste={canPaste}

          onCopy={() => {
            if (stageRef.current?.copySelection()) setCanPaste(true);
          }}

          onCut={() => {
            if (stageRef.current?.cutSelection()) setCanPaste(true);
          }}

          onPaste={() => {
            stageRef.current?.pasteClipboard();
          }}

          onUndo={handleUndo}

          onRedo={handleRedo}

          canUndo={canUndo}

          canRedo={canRedo}

        />

        <div className={styles.mainCol} ref={containerRef}>

          <div className={styles.stageOuter}>

            <ImageEditorStage

              ref={stageRef}

              imageUrl={baseUrl}

              width={stageSize.width}

              height={stageSize.height}

              tool={tool}

              brushColor={brush.color}

              onEyedropperColor={(c) => setBrush((b) => ({ ...b, color: c }))}
              onTextSelectionChange={handleTextSelectionChange}
              onRegionSelectionChange={setRegionSelected}
              onClipboardChange={setCanPaste}
              onBackgroundReady={() => setBgReady(true)}
            />

          </div>

          {textSelected && textSnapshot && (

            <TextObjectToolbar

              snapshot={textSnapshot}

              onChange={handleTextChange}

              onDelete={handleDeleteText}

            />

          )}

          <RecommendedTextsPanel items={availableRecommended} onPlace={placeRecommended} />

          {tool === 'text' && (

            <p className={styles.actionVariant}>{t('dashboard.infographicDoubleClickHint')}</p>

          )}

        </div>

      </div>

    </div>

  );

}


