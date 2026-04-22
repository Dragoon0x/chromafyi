// APCA 0.1.9 / W3 — Accessible Perceptual Contrast Algorithm
// Port of the reference algorithm by Andrew Somers (Myndex).
// Computes Lc contrast (-108..+106) for text (fg) on background (bg).
// Values: |Lc| >= 75 = excellent body text; >= 60 = content text; >= 45 = large text.

import { oklchToRgbClamped } from './gamut';
import type { OKLCH } from './types';

const MAIN_TRC = 2.4;
const NORM_BG = 0.56;
const NORM_TXT = 0.57;
const REV_TXT = 0.62;
const REV_BG = 0.65;
const BLK_THRS = 0.022;
const BLK_CLMP = 1.414;
const SCALE_BOW = 1.14;
const LO_BOW_OFFSET = 0.027;
const SCALE_WOB = 1.14;
const LO_WOB_OFFSET = 0.027;
const DELTA_Y_MIN = 0.0005;
const LO_CLIP = 0.1;

const SRGB_R = 0.2126729;
const SRGB_G = 0.7151522;
const SRGB_B = 0.072175;

function sRGBtoY(r: number, g: number, b: number): number {
  const simpleY = SRGB_R * r ** MAIN_TRC + SRGB_G * g ** MAIN_TRC + SRGB_B * b ** MAIN_TRC;
  if (simpleY < BLK_THRS) {
    return simpleY + (BLK_THRS - simpleY) ** BLK_CLMP;
  }
  return simpleY;
}

function APCAcontrast(yText: number, yBack: number): number {
  if (Math.abs(yText - yBack) < DELTA_Y_MIN) return 0;
  let outputContrast: number;
  if (yBack > yText) {
    // Normal polarity: dark text on light background
    const sapc = (yBack ** NORM_BG - yText ** NORM_TXT) * SCALE_BOW;
    outputContrast = sapc < LO_CLIP ? 0 : sapc - LO_BOW_OFFSET;
  } else {
    // Reverse polarity: light text on dark background
    const sapc = (yBack ** REV_BG - yText ** REV_TXT) * SCALE_WOB;
    outputContrast = sapc > -LO_CLIP ? 0 : sapc + LO_WOB_OFFSET;
  }
  return outputContrast * 100;
}

export function apcaContrast(fg: OKLCH, bg: OKLCH): number {
  const f = oklchToRgbClamped(fg);
  const b = oklchToRgbClamped(bg);
  const yFg = sRGBtoY(f.r, f.g, f.b);
  const yBg = sRGBtoY(b.r, b.g, b.b);
  return APCAcontrast(yFg, yBg);
}

export function apcaLabel(lc: number): string {
  const a = Math.abs(lc);
  if (a < 15) return 'invisible';
  if (a < 30) return 'very low';
  if (a < 45) return 'low';
  if (a < 60) return 'ok (large text)';
  if (a < 75) return 'good (body text)';
  if (a < 90) return 'excellent';
  return 'maximum';
}

export function apcaVerdict(
  lc: number,
  use: 'body' | 'content' | 'large' | 'non-text' = 'body',
): 'pass' | 'warn' | 'fail' {
  const a = Math.abs(lc);
  const thresh = use === 'body' ? 75 : use === 'content' ? 60 : use === 'large' ? 45 : 30;
  if (a >= thresh) return 'pass';
  if (a >= thresh - 15) return 'warn';
  return 'fail';
}
