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
import { loadImageElement } from '../../lib/loadImageElement';

import styles from './ImageEditor.module.css';



const STAGE_MAX_W = 720;



interface VariantEditorProps {

  variant: ProcessVariant;

  variantIndex: number;

  variantCount: number;

  onVariantChange: (id: string, patch: Partial<ProcessVariant>) => void;

  onDirtyChange?: (dirty: boolean) => void;

  onRequestSwitchVariant?: (targetIndex: number) => boolean;

}



export default function VariantEditor({

  variant,

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

  const [canUndo, setCanUndo] = useState(false);

  const [canRedo] = useState(false);

  const [textSelected, setTextSelected] = useState(false);

  const [textSnapshot, setTextSnapshot] = useState<FabricTextSnapshot | null>(null);
  const [imageAspect, setImageAspect] = useState(1);
  const [bgReady, setBgReady] = useState(false);

  const {

    tool,

    setTool,

    brush,

    setBrush,

    blurRadius,

    setBlurRadius,

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
    setDirty(false);
    onDirtyChange?.(false);
    setTextSelected(false);
    setTextSnapshot(null);
    setBgReady(false);
  }, [variant.id, onDirtyChange]);

  useEffect(() => {
    if (!bgReady || !stageRef.current) return;

    const draft = getVariantDraft(variant.id);
    if (draft?.usedRecommendedKeys?.length) {
      onVariantChange(variant.id, { usedRecommendedKeys: draft.usedRecommendedKeys });
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
  }, [variant.id, bgReady, variant.textLayers, onVariantChange, onDirtyChange]);



  useEffect(() => {

    stageRef.current?.setDirtyListener((d) => {

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

      stageRef.current?.clearDrawing();

      await stageRef.current?.loadBackground(savedUrl);

      onVariantChange(variant.id, {

        displayBase: 'saved',

        savedUrl,

        savedRevision: res.data.revision,

        textLayers: textLayers as ProcessVariant['textLayers'],

        dirty: false,

      });

      removeVariantDraft(variant.id);

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

      stageRef.current?.clearDrawing();

      await stageRef.current?.loadBackground(variant.originalUrl);

      onVariantChange(variant.id, {

        displayBase: 'original',

        savedUrl: undefined,

        savedRevision: undefined,

        usedRecommendedKeys: [],

        dirty: false,

      });

      removeVariantDraft(variant.id);

      setDirty(false);

      onDirtyChange?.(false);

    } catch (e) {

      setError(e instanceof Error ? e.message : t('dashboard.revertOriginalError'));

    }

  };



  const handleExport = async (format: 'png' | 'jpeg') => {

    setExporting(true);

    setError(null);

    try {

      const blob = await stageRef.current?.exportBlob(format, jpegQuality);

      if (!blob) throw new Error('Export failed');

      const ext = format === 'jpeg' ? 'jpg' : 'png';

      downloadBlob(blob, `variant-${variantIndex + 1}.${ext}`);

    } catch {

      setError(t('dashboard.downloadResultError'));

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

        <div className={styles.actionBtns}>

          <Button type="button" variant="outline" loading={exporting} onClick={() => handleExport('png')}>

            {t('dashboard.exportPng')}

          </Button>

          <Button type="button" variant="outline" loading={exporting} onClick={() => handleExport('jpeg')}>

            {t('dashboard.exportJpeg')}

          </Button>

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

          blurRadius={blurRadius}

          onBlurRadiusChange={setBlurRadius}

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

              blurRadius={blurRadius}

              onEyedropperColor={(c) => setBrush((b) => ({ ...b, color: c }))}
              onTextSelectionChange={handleTextSelectionChange}
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

          <label className={styles.propLabel}>

            {t('dashboard.jpegQuality')}

            <input

              type="range"

              min={60}

              max={100}

              value={Math.round(jpegQuality * 100)}

              onChange={(e) => setJpegQuality(Number(e.target.value) / 100)}

            />

          </label>

        </div>

      </div>

    </div>

  );

}


