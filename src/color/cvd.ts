// Color Vision Deficiency simulation via Brettel/Viénot 1999 matrices.
// Matrices operate on linear-sRGB. Values from Viénot, Brettel, Mollon (1999).

import { converter } from 'culori';
import { linearToRgb, rgbToLinear } from './convert';
import { oklchToCuloriColor } from './convert';
import { toGamut } from './gamut';
import type { OKLCH } from './types';

const toRgb = converter('rgb');
const toOklch = converter('oklch');

export type CVDType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

// Each matrix is [[r_r, r_g, r_b], [g_r, g_g, g_b], [b_r, b_g, b_b]]
const MATRIX: Record<Exclude<CVDType, 'none'>, number[][]> = {
  // Brettel / Viénot / Mollon 1999 — linearized sRGB
  protanopia: [
    [0.152, 1.052, -0.204],
    [0.114, 0.786, 0.099],
    [-0.003, -0.048, 1.051],
  ],
  deuteranopia: [
    [0.367, 0.861, -0.228],
    [0.28, 0.673, 0.047],
    [-0.011, 0.042, 0.969],
  ],
  tritanopia: [
    [1.255, -0.077, -0.178],
    [-0.078, 0.931, 0.147],
    [0.004, 0.691, 0.304],
  ],
};

function applyMatrix(m: number[][], v: [number, number, number]): [number, number, number] {
  return [
    (m[0]?.[0] ?? 0) * v[0] + (m[0]?.[1] ?? 0) * v[1] + (m[0]?.[2] ?? 0) * v[2],
    (m[1]?.[0] ?? 0) * v[0] + (m[1]?.[1] ?? 0) * v[1] + (m[1]?.[2] ?? 0) * v[2],
    (m[2]?.[0] ?? 0) * v[0] + (m[2]?.[1] ?? 0) * v[1] + (m[2]?.[2] ?? 0) * v[2],
  ];
}

export function simulateCVD(color: OKLCH, type: CVDType): OKLCH {
  if (type === 'none') return color;
  const rgb = toRgb(oklchToCuloriColor(color));
  if (!rgb) return color;
  const r = Math.min(1, Math.max(0, rgb.r ?? 0));
  const g = Math.min(1, Math.max(0, rgb.g ?? 0));
  const b = Math.min(1, Math.max(0, rgb.b ?? 0));
  const lin: [number, number, number] = [rgbToLinear(r), rgbToLinear(g), rgbToLinear(b)];
  const m = MATRIX[type];
  const transformed = applyMatrix(m, lin);
  const outR = Math.min(1, Math.max(0, linearToRgb(transformed[0] ?? 0)));
  const outG = Math.min(1, Math.max(0, linearToRgb(transformed[1] ?? 0)));
  const outB = Math.min(1, Math.max(0, linearToRgb(transformed[2] ?? 0)));
  const o = toOklch({ mode: 'rgb', r: outR, g: outG, b: outB });
  if (!o) return color;
  return toGamut(
    {
      l: o.l ?? 0,
      c: o.c ?? 0,
      h: o.h ?? 0,
    },
    'srgb',
  );
}

export const CVD_TYPES: CVDType[] = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];

export const CVD_LABEL: Record<CVDType, string> = {
  none: 'Normal vision',
  protanopia: 'Protanopia (no red cones)',
  deuteranopia: 'Deuteranopia (no green cones)',
  tritanopia: 'Tritanopia (no blue cones)',
};

export const CVD_PREVALENCE: Record<Exclude<CVDType, 'none'>, string> = {
  protanopia: '~1% of men',
  deuteranopia: '~6% of men',
  tritanopia: '~0.01%',
};
