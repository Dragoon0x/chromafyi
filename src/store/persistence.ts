import { DEFAULT_STATE } from './defaults';
import { migrate } from './migrations';
import type { StoreState } from './types';

const KEY = 'chromaFyi:v1';

export function loadPersisted(): StoreState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    return migrate(parsed as Partial<StoreState>);
  } catch {
    return null;
  }
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let lastWrite = 0;

export function schedulePersist(state: StoreState, delay = 200): void {
  if (typeof localStorage === 'undefined') return;
  if (writeTimer) {
    clearTimeout(writeTimer);
  }
  const now = Date.now();
  const sinceLast = now - lastWrite;
  // Leading edge: if last write was long ago, persist immediately
  const actualDelay = sinceLast > delay ? 0 : delay;
  writeTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      lastWrite = Date.now();
    } catch {
      // quota exceeded or locked — swallow
    }
  }, actualDelay);
}

export function clearPersisted(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // noop
  }
}

export { DEFAULT_STATE };
