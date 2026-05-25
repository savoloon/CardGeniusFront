import type { ProcessMode } from '../services/api';

/** Translation keys under `dashboard.*` */
export const PROCESS_MODE_LABEL_KEYS: Record<ProcessMode, string> = {
  remove_background: 'modeRemoveBg',
  generate_background: 'modeGenerateBg',
  generate_exposure: 'modeGenerateExposure',
  generate_exposition_by_request: 'modeExposureByRequest',
  improve_image: 'modeImprove',
  generate_infographic: 'modeInfographic',
};

export const PROCESS_MODE_OPTIONS: { value: ProcessMode; labelKey: string }[] = (
  Object.entries(PROCESS_MODE_LABEL_KEYS) as [ProcessMode, string][]
).map(([value, labelKey]) => ({ value, labelKey }));

export const HISTORY_STATUS_LABEL_KEYS: Record<string, string> = {
  pending: 'history.statusPending',
  completed: 'history.statusCompleted',
  failed: 'history.statusFailed',
};

export function getProcessModeLabelKey(mode: string): string {
  const key = PROCESS_MODE_LABEL_KEYS[mode as ProcessMode];
  return key ? `dashboard.${key}` : mode;
}
