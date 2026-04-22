import {
  oklchToCssString,
  oklchToHex,
  oklchToHsl,
  oklchToHslString,
  oklchToLabString,
  oklchToLchString,
  oklchToOklabString,
  oklchToP3String,
  oklchToRgb,
  oklchToRgbString,
} from './convert';
import type { ColorFormat, OKLCH } from './types';

export function formatColor(c: OKLCH, format: ColorFormat): string {
  switch (format) {
    case 'oklch':
      return oklchToCssString(c);
    case 'oklab':
      return oklchToOklabString(c);
    case 'rgb':
      return oklchToRgbString(c);
    case 'hex':
      return oklchToHex(c);
    case 'hsl':
      return oklchToHslString(c);
    case 'p3':
      return oklchToP3String(c);
    case 'lab':
      return oklchToLabString(c);
    case 'lch':
      return oklchToLchString(c);
  }
}

export function formatCompactOklch(c: OKLCH): string {
  return `${(c.l * 100).toFixed(1)} ${(c.c * 100).toFixed(1)}% ${c.h.toFixed(0)}`;
}

export function formatPercent(c: OKLCH): { l: string; c: string; h: string } {
  return {
    l: `${(c.l * 100).toFixed(1)}%`,
    c: c.c.toFixed(3),
    h: `${c.h.toFixed(1)}°`,
  };
}

export function formatRgbBytes(c: OKLCH): string {
  const { r, g, b } = oklchToRgb(c);
  return `${Math.round(Math.max(0, Math.min(1, r)) * 255)}, ${Math.round(Math.max(0, Math.min(1, g)) * 255)}, ${Math.round(Math.max(0, Math.min(1, b)) * 255)}`;
}

export function formatHslParts(c: OKLCH): { h: number; s: number; l: number } {
  const { h, s, l } = oklchToHsl(c);
  return { h, s: s * 100, l: l * 100 };
}

export const FORMAT_LABELS: Record<ColorFormat, string> = {
  oklch: 'OKLCH',
  oklab: 'OKLab',
  rgb: 'RGB',
  hex: 'HEX',
  hsl: 'HSL',
  p3: 'Display P3',
  lab: 'CIE Lab',
  lch: 'CIE LCH',
};
