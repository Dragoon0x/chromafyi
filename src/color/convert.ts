import { type Color, converter, formatHex, formatHsl, formatRgb, parse } from 'culori';
import type { HSL, OKLCH, OKLab, RGB } from './types';

const toOklch = converter('oklch');
const toOklab = converter('oklab');
const toRgb = converter('rgb');
const toHsl = converter('hsl');
const toLab = converter('lab');
const toLch = converter('lch');
const toP3 = converter('p3');

export function normalizeHue(h: number): number {
  const x = h % 360;
  return x < 0 ? x + 360 : x;
}

export function clampOklch(c: OKLCH): OKLCH {
  return {
    l: Math.min(1, Math.max(0, c.l)),
    c: Math.max(0, c.c),
    h: normalizeHue(Number.isFinite(c.h) ? c.h : 0),
    ...(c.alpha !== undefined ? { alpha: c.alpha } : {}),
  };
}

export function parseInput(input: string): OKLCH | null {
  const parsed = parse(input.trim());
  if (!parsed) return null;
  const o = toOklch(parsed);
  if (!o || !Number.isFinite(o.l)) return null;
  return clampOklch({
    l: o.l,
    c: o.c ?? 0,
    h: o.h ?? 0,
    ...(o.alpha !== undefined && o.alpha !== 1 ? { alpha: o.alpha } : {}),
  });
}

export function oklchToOklab(c: OKLCH): OKLab {
  const hRad = (c.h * Math.PI) / 180;
  return {
    l: c.l,
    a: c.c * Math.cos(hRad),
    b: c.c * Math.sin(hRad),
    ...(c.alpha !== undefined ? { alpha: c.alpha } : {}),
  };
}

export function oklchToCuloriColor(c: OKLCH): Color {
  return {
    mode: 'oklch',
    l: c.l,
    c: c.c,
    h: c.h,
    ...(c.alpha !== undefined ? { alpha: c.alpha } : {}),
  };
}

export function oklchToRgb(c: OKLCH): RGB {
  const rgb = toRgb(oklchToCuloriColor(c));
  return {
    r: rgb?.r ?? 0,
    g: rgb?.g ?? 0,
    b: rgb?.b ?? 0,
    ...(rgb?.alpha !== undefined ? { alpha: rgb.alpha } : {}),
  };
}

export function oklchToHsl(c: OKLCH): HSL {
  const hsl = toHsl(oklchToCuloriColor(c));
  return {
    h: hsl?.h ?? 0,
    s: hsl?.s ?? 0,
    l: hsl?.l ?? 0,
    ...(hsl?.alpha !== undefined ? { alpha: hsl.alpha } : {}),
  };
}

export function oklchToHex(c: OKLCH): string {
  const rgb = toRgb(oklchToCuloriColor(c));
  return rgb ? formatHex(rgb) || '#000000' : '#000000';
}

export function oklchToRgbString(c: OKLCH): string {
  const rgb = toRgb(oklchToCuloriColor(c));
  return rgb ? formatRgb(rgb) : 'rgb(0, 0, 0)';
}

export function oklchToHslString(c: OKLCH): string {
  const hsl = toHsl(oklchToCuloriColor(c));
  return hsl ? formatHsl(hsl) : 'hsl(0, 0%, 0%)';
}

export function oklchToCssString(c: OKLCH, precision = 4): string {
  const l = +c.l.toFixed(precision);
  const ch = +c.c.toFixed(precision);
  const h = +c.h.toFixed(Math.max(0, precision - 2));
  const alpha = c.alpha !== undefined && c.alpha !== 1 ? ` / ${+c.alpha.toFixed(3)}` : '';
  return `oklch(${l} ${ch} ${h}${alpha})`;
}

export function oklchToOklabString(c: OKLCH, precision = 4): string {
  const lab = oklchToOklab(c);
  const l = +lab.l.toFixed(precision);
  const a = +lab.a.toFixed(precision);
  const b = +lab.b.toFixed(precision);
  const alpha = c.alpha !== undefined && c.alpha !== 1 ? ` / ${+c.alpha.toFixed(3)}` : '';
  return `oklab(${l} ${a} ${b}${alpha})`;
}

export function oklchToLabString(c: OKLCH): string {
  const lab = toLab(oklchToCuloriColor(c));
  if (!lab) return 'lab(0 0 0)';
  return `lab(${+lab.l.toFixed(2)} ${+lab.a.toFixed(2)} ${+lab.b.toFixed(2)})`;
}

export function oklchToLchString(c: OKLCH): string {
  const lch = toLch(oklchToCuloriColor(c));
  if (!lch) return 'lch(0 0 0)';
  const h = lch.h ?? 0;
  return `lch(${+lch.l.toFixed(2)} ${+(lch.c ?? 0).toFixed(2)} ${+h.toFixed(1)})`;
}

export function oklchToP3String(c: OKLCH, precision = 4): string {
  const p3 = toP3(oklchToCuloriColor(c));
  if (!p3) return 'color(display-p3 0 0 0)';
  const r = +(p3.r ?? 0).toFixed(precision);
  const g = +(p3.g ?? 0).toFixed(precision);
  const b = +(p3.b ?? 0).toFixed(precision);
  return `color(display-p3 ${r} ${g} ${b})`;
}

export function rgbToLinear(x: number): number {
  const abs = Math.abs(x);
  return abs <= 0.04045 ? x / 12.92 : Math.sign(x) * ((abs + 0.055) / 1.055) ** 2.4;
}

export function linearToRgb(x: number): number {
  const abs = Math.abs(x);
  return abs <= 0.0031308 ? x * 12.92 : Math.sign(x) * (1.055 * abs ** (1 / 2.4) - 0.055);
}

export { toOklch, toOklab, toRgb, toHsl };
