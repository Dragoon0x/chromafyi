import { clampChroma, converter, displayable } from 'culori';
import { oklchToCuloriColor } from './convert';
import type { Gamut, OKLCH } from './types';

const toRgb = converter('rgb');
const toP3 = converter('p3');
const toRec2020 = converter('rec2020');

const EPS = 1e-5;

function inGamutRgb(c: OKLCH): boolean {
  return displayable(oklchToCuloriColor(c));
}

function inGamutP3(c: OKLCH): boolean {
  const p3 = toP3(oklchToCuloriColor(c));
  if (!p3) return false;
  return (
    (p3.r ?? 0) >= -EPS &&
    (p3.r ?? 0) <= 1 + EPS &&
    (p3.g ?? 0) >= -EPS &&
    (p3.g ?? 0) <= 1 + EPS &&
    (p3.b ?? 0) >= -EPS &&
    (p3.b ?? 0) <= 1 + EPS
  );
}

function inGamutRec2020(c: OKLCH): boolean {
  const r = toRec2020(oklchToCuloriColor(c));
  if (!r) return false;
  return (
    (r.r ?? 0) >= -EPS &&
    (r.r ?? 0) <= 1 + EPS &&
    (r.g ?? 0) >= -EPS &&
    (r.g ?? 0) <= 1 + EPS &&
    (r.b ?? 0) >= -EPS &&
    (r.b ?? 0) <= 1 + EPS
  );
}

export function inGamut(c: OKLCH, gamut: Gamut): boolean {
  if (gamut === 'srgb') return inGamutRgb(c);
  if (gamut === 'p3') return inGamutP3(c);
  return inGamutRec2020(c);
}

export function toGamut(c: OKLCH, gamut: Gamut): OKLCH {
  if (inGamut(c, gamut)) return c;
  const target = gamut === 'srgb' ? 'rgb' : gamut === 'p3' ? 'p3' : 'rec2020';
  const clamped = clampChroma(oklchToCuloriColor(c), 'oklch', target);
  if (!clamped || clamped.mode !== 'oklch') return c;
  return {
    l: clamped.l ?? c.l,
    c: clamped.c ?? 0,
    h: clamped.h ?? c.h,
    ...(c.alpha !== undefined ? { alpha: c.alpha } : {}),
  };
}

export function widestGamut(c: OKLCH): Gamut | 'out' {
  if (inGamutRgb(c)) return 'srgb';
  if (inGamutP3(c)) return 'p3';
  if (inGamutRec2020(c)) return 'rec2020';
  return 'out';
}

export function oklchToRgbClamped(c: OKLCH): { r: number; g: number; b: number; clipped: boolean } {
  const rgb = toRgb(oklchToCuloriColor(c));
  if (!rgb) return { r: 0, g: 0, b: 0, clipped: true };
  const r = rgb.r ?? 0;
  const g = rgb.g ?? 0;
  const b = rgb.b ?? 0;
  const clipped = r < -EPS || r > 1 + EPS || g < -EPS || g > 1 + EPS || b < -EPS || b > 1 + EPS;
  return {
    r: Math.min(1, Math.max(0, r)),
    g: Math.min(1, Math.max(0, g)),
    b: Math.min(1, Math.max(0, b)),
    clipped,
  };
}
