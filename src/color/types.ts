export type OKLCH = {
  l: number;
  c: number;
  h: number;
  alpha?: number;
};

export type OKLab = {
  l: number;
  a: number;
  b: number;
  alpha?: number;
};

export type RGB = {
  r: number;
  g: number;
  b: number;
  alpha?: number;
};

export type HSL = {
  h: number;
  s: number;
  l: number;
  alpha?: number;
};

export type ColorFormat = 'oklch' | 'oklab' | 'rgb' | 'hex' | 'hsl' | 'p3' | 'lab' | 'lch';

export type Gamut = 'srgb' | 'p3' | 'rec2020';

export const OKLCH_MAX_C = 0.4;
