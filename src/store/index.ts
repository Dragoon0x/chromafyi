import { clampOklch, normalizeHue } from '@/color/convert';
import type { ColorFormat, OKLCH } from '@/color/types';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DEFAULT_STATE, nextId } from './defaults';
import { applyHashIfPresent, scheduleHashSync } from './hash';
import { loadPersisted, schedulePersist } from './persistence';
import type {
  CVDConfig,
  ContrastPair,
  GamutConfig,
  GradientConfig,
  MatrixConfig,
  Palette,
  StoreState,
  Swatch,
  TabId,
  Theme,
} from './types';

type Actions = {
  setColor: (next: Partial<OKLCH>) => void;
  setActiveTab: (tab: TabId) => void;
  setTheme: (theme: Theme) => void;
  setPreferredFormat: (f: ColorFormat) => void;
  pickRecent: (c: OKLCH) => void;
  setPalette: (p: Palette) => void;
  addSwatch: (c: OKLCH) => void;
  updateSwatch: (id: string, patch: Partial<Swatch>) => void;
  removeSwatch: (id: string) => void;
  setMatrix: (patch: Partial<MatrixConfig>) => void;
  setGradient: (patch: Partial<GradientConfig>) => void;
  setContrast: (patch: Partial<ContrastPair>) => void;
  setGamut: (patch: Partial<GamutConfig>) => void;
  setCVD: (patch: Partial<CVDConfig>) => void;
  hydrateFromHash: () => void;
  renamePalette: (name: string) => void;
  resetPalette: () => void;
};

type Store = StoreState & Actions;

const initial: StoreState = (() => {
  const persisted = loadPersisted();
  const base = persisted ?? DEFAULT_STATE;
  return applyHashIfPresent(base);
})();

function pushRecent(list: OKLCH[], c: OKLCH, cap = 32): OKLCH[] {
  const key = (x: OKLCH) => `${x.l.toFixed(3)}_${x.c.toFixed(3)}_${normalizeHue(x.h).toFixed(1)}`;
  const k = key(c);
  const filtered = list.filter((x) => key(x) !== k);
  return [c, ...filtered].slice(0, cap);
}

export const useStore = create<Store>()(
  subscribeWithSelector((set, get) => ({
    ...initial,

    setColor: (next) => {
      const prev = get().color;
      const merged = clampOklch({ ...prev, ...next });
      set({ color: merged });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    setTheme: (theme) => set({ theme }),

    setPreferredFormat: (preferredFormat) => set({ preferredFormat }),

    pickRecent: (c) => {
      const recent = pushRecent(get().recentColors, c);
      set({ color: clampOklch(c), recentColors: recent });
    },

    setPalette: (palette) => set({ palette }),

    addSwatch: (c) => {
      const p = get().palette;
      set({
        palette: {
          ...p,
          swatches: [...p.swatches, { id: nextId(), color: clampOklch(c) }],
        },
      });
    },

    updateSwatch: (id, patch) => {
      const p = get().palette;
      set({
        palette: {
          ...p,
          swatches: p.swatches.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...patch,
                  color: patch.color ? clampOklch(patch.color) : s.color,
                }
              : s,
          ),
        },
      });
    },

    removeSwatch: (id) => {
      const p = get().palette;
      set({
        palette: { ...p, swatches: p.swatches.filter((s) => s.id !== id) },
      });
    },

    setMatrix: (patch) => set({ matrix: { ...get().matrix, ...patch } }),

    setGradient: (patch) => set({ gradient: { ...get().gradient, ...patch } }),

    setContrast: (patch) => set({ contrast: { ...get().contrast, ...patch } }),

    setGamut: (patch) => set({ gamut: { ...get().gamut, ...patch } }),

    setCVD: (patch) => set({ cvd: { ...get().cvd, ...patch } }),

    renamePalette: (name) => set({ palette: { ...get().palette, name } }),

    resetPalette: () => set({ palette: { ...DEFAULT_STATE.palette, id: nextId() } }),

    hydrateFromHash: () => {
      const next = applyHashIfPresent(get());
      set(next);
    },
  })),
);

// Subscribe: persist full state (debounced) and sync shareable slice to hash (debounced)
if (typeof window !== 'undefined') {
  useStore.subscribe(
    (s) => s,
    (s) => {
      schedulePersist(s);
      scheduleHashSync(s);
    },
  );
}

export type { Store };
