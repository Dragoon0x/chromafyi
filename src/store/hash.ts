import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { migrate } from './migrations';
import type { StoreState } from './types';

const HASH_KEY = 's';

// The "shareable" subset — enough to reconstruct an intent, but not raw recentColors etc.
type Shareable = Pick<
  StoreState,
  | 'color'
  | 'palette'
  | 'matrix'
  | 'gradient'
  | 'contrast'
  | 'gamut'
  | 'cvd'
  | 'activeTab'
  | 'preferredFormat'
>;

function toShareable(s: StoreState): Shareable {
  return {
    color: s.color,
    palette: s.palette,
    matrix: s.matrix,
    gradient: s.gradient,
    contrast: s.contrast,
    gamut: s.gamut,
    cvd: s.cvd,
    activeTab: s.activeTab,
    preferredFormat: s.preferredFormat,
  };
}

function parseHash(): Partial<StoreState> | null {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash.replace(/^#/, '');
  if (!h) return null;
  const params = new URLSearchParams(h);
  const payload = params.get(HASH_KEY);
  if (!payload) return null;
  try {
    const raw = decompressFromEncodedURIComponent(payload);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    return parsed;
  } catch {
    return null;
  }
}

export function applyHashIfPresent(base: StoreState): StoreState {
  const h = parseHash();
  if (!h) return base;
  const merged = migrate({ ...base, ...h });
  return merged;
}

let hashTimer: ReturnType<typeof setTimeout> | null = null;
let lastHash = '';

export function scheduleHashSync(state: StoreState, delay = 250): void {
  if (typeof window === 'undefined') return;
  if (hashTimer) clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    const payload = compressToEncodedURIComponent(JSON.stringify(toShareable(state)));
    const next = `#${HASH_KEY}=${payload}`;
    if (next !== lastHash && next !== window.location.hash) {
      lastHash = next;
      // Use replaceState so back-button isn't spammed
      history.replaceState(null, '', next);
    }
  }, delay);
}

export function getShareableUrl(state: StoreState): string {
  const payload = compressToEncodedURIComponent(JSON.stringify(toShareable(state)));
  const loc = typeof window !== 'undefined' ? window.location : null;
  const base = loc ? `${loc.protocol}//${loc.host}${loc.pathname}` : 'https://chroma.fyi/';
  return `${base}#${HASH_KEY}=${payload}`;
}
