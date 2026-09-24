export const WORKSPACE_STORAGE_KEY = 'card-genius-workspace-v2';

export interface WorkspaceVariantMeta {
  taskId: string;
  resultIndex: number;
  displayBase: 'original' | 'saved';
}

export interface WorkspacePersistedMeta {
  version: 2;
  sessionId: string;
  activeIndex: number;
  variants: WorkspaceVariantMeta[];
}

export function readWorkspaceMeta(): WorkspacePersistedMeta | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspacePersistedMeta;
    if (parsed?.version !== 2 || !parsed.sessionId || !Array.isArray(parsed.variants)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeWorkspaceMeta(meta: WorkspacePersistedMeta): boolean {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(meta));
    return true;
  } catch {
    return false;
  }
}

export function clearWorkspaceMeta(): void {
  try {
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
