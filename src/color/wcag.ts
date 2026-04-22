// WCAG 2.1 contrast ratio
// ratio ∈ [1, 21]. AA text ≥ 4.5, AAA text ≥ 7, AA large ≥ 3, AAA large ≥ 4.5.

import { rgbToLinear } from './convert';
import { oklchToRgbClamped } from './gamut';
import type { OKLCH } from './types';

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * rgbToLinear(r) + 0.7152 * rgbToLinear(g) + 0.0722 * rgbToLinear(b);
}

export function wcagContrast(fg: OKLCH, bg: OKLCH): number {
  const f = oklchToRgbClamped(fg);
  const b = oklchToRgbClamped(bg);
  const l1 = relativeLuminance(f.r, f.g, f.b);
  const l2 = relativeLuminance(b.r, b.g, b.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WcagLevel = 'AAA' | 'AA' | 'AA large' | 'fail';

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large';
  return 'fail';
}
