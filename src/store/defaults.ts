import type { OKLCH } from '@/color/types';
import type { GradientStop, Palette, StoreState, Swatch } from './types';

const DEFAULT_COLOR: OKLCH = { l: 0.78, c: 0.17, h: 200 };

let idSeq = 0;
export function nextId(): string {
  idSeq += 1;
  return `id-${Date.now().toString(36)}-${idSeq}`;
}

function swatch(color: OKLCH): Swatch {
  return { id: nextId(), color };
}

function stop(color: OKLCH, position: number): GradientStop {
  return { id: nextId(), color, position };
}

const DEFAULT_PALETTE: Palette = {
  id: nextId(),
  name: 'Untitled palette',
  swatches: [
    swatch({ l: 0.96, c: 0.02, h: 200 }),
    swatch({ l: 0.82, c: 0.12, h: 200 }),
    swatch({ l: 0.68, c: 0.17, h: 200 }),
    swatch({ l: 0.52, c: 0.17, h: 200 }),
    swatch({ l: 0.34, c: 0.11, h: 200 }),
  ],
};

export const DEFAULT_STATE: StoreState = {
  version: 1,
  color: DEFAULT_COLOR,
  palette: DEFAULT_PALETTE,
  recentColors: [],
  matrix: {
    hues: [25, 60, 120, 200, 260, 320],
    lightnessStops: [0.97, 0.9, 0.8, 0.68, 0.55, 0.42, 0.3, 0.2, 0.12],
    chroma: 0.15,
    lockedHues: [],
  },
  gradient: {
    stops: [stop({ l: 0.2, c: 0.18, h: 280 }, 0), stop({ l: 0.85, c: 0.15, h: 30 }, 1)],
    space: 'oklab',
    steps: 9,
  },
  contrast: {
    fg: { l: 0.96, c: 0.02, h: 200 },
    bg: { l: 0.2, c: 0.02, h: 260 },
    sampleText: 'The quick brown fox jumps over the lazy dog.',
  },
  gamut: { slice: 'L', sliceValue: 0.65 },
  cvd: { type: 'deuteranopia' },
  activeTab: 'inspector',
  theme: 'dark',
  preferredFormat: 'oklch',
};
