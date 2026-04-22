import { DEFAULT_STATE } from './defaults';
import type { StoreState } from './types';

export function migrate(input: Partial<StoreState>): StoreState {
  // Merge unknown/old snapshot with defaults; never throw on bad data.
  const base: StoreState = {
    ...DEFAULT_STATE,
    ...input,
    version: 1,
    color: { ...DEFAULT_STATE.color, ...(input.color ?? {}) },
    palette: input.palette ? { ...DEFAULT_STATE.palette, ...input.palette } : DEFAULT_STATE.palette,
    matrix: { ...DEFAULT_STATE.matrix, ...(input.matrix ?? {}) },
    gradient: { ...DEFAULT_STATE.gradient, ...(input.gradient ?? {}) },
    contrast: { ...DEFAULT_STATE.contrast, ...(input.contrast ?? {}) },
    gamut: { ...DEFAULT_STATE.gamut, ...(input.gamut ?? {}) },
    cvd: { ...DEFAULT_STATE.cvd, ...(input.cvd ?? {}) },
    recentColors: Array.isArray(input.recentColors) ? input.recentColors : [],
  };
  return base;
}
