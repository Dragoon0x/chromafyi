import { clampOklch, normalizeHue } from './convert';
import type { OKLCH } from './types';

export type HarmonyKind =
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'monochromatic';

export function harmony(base: OKLCH, kind: HarmonyKind, count = 5): OKLCH[] {
  const b = clampOklch(base);
  switch (kind) {
    case 'analogous': {
      const span = 60;
      const step = span / Math.max(1, count - 1);
      const start = b.h - span / 2;
      return Array.from({ length: count }, (_, i) =>
        clampOklch({ ...b, h: normalizeHue(start + step * i) }),
      );
    }
    case 'complementary':
      return [b, clampOklch({ ...b, h: normalizeHue(b.h + 180) })];
    case 'triadic':
      return [0, 120, 240].map((off) => clampOklch({ ...b, h: normalizeHue(b.h + off) }));
    case 'tetradic':
      return [0, 90, 180, 270].map((off) => clampOklch({ ...b, h: normalizeHue(b.h + off) }));
    case 'split-complementary':
      return [0, 150, 210].map((off) => clampOklch({ ...b, h: normalizeHue(b.h + off) }));
    case 'monochromatic': {
      const step = 1 / Math.max(1, count + 1);
      return Array.from({ length: count }, (_, i) =>
        clampOklch({ ...b, l: Math.min(0.95, Math.max(0.1, step * (i + 1))) }),
      );
    }
  }
}

export const HARMONY_LABEL: Record<HarmonyKind, string> = {
  analogous: 'Analogous',
  complementary: 'Complementary',
  triadic: 'Triadic',
  tetradic: 'Tetradic',
  'split-complementary': 'Split-complementary',
  monochromatic: 'Monochromatic',
};
