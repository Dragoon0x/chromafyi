import { type Color, converter, interpolate as culoriInterpolate } from 'culori';
import { oklchToCuloriColor } from './convert';
import type { OKLCH } from './types';

export type InterpolationSpace = 'oklab' | 'oklch' | 'lab' | 'rgb' | 'hsl';

const toOklch = converter('oklch');

type OklchBag = { mode: 'oklch'; l?: number; c?: number; h?: number };

function resolve(raw: unknown): OKLCH {
  if (!raw || typeof raw !== 'object') return { l: 0, c: 0, h: 0 };
  const bag = raw as OklchBag;
  if (bag.mode === 'oklch') {
    return { l: bag.l ?? 0, c: bag.c ?? 0, h: bag.h ?? 0 };
  }
  const o = toOklch(raw as Color);
  return { l: o.l ?? 0, c: o.c ?? 0, h: o.h ?? 0 };
}

export function mix(a: OKLCH, b: OKLCH, t: number, space: InterpolationSpace = 'oklab'): OKLCH {
  const interp = culoriInterpolate([oklchToCuloriColor(a), oklchToCuloriColor(b)], space);
  return resolve(interp(t));
}

export function sampleGradient(
  stops: OKLCH[],
  steps: number,
  space: InterpolationSpace = 'oklab',
): OKLCH[] {
  if (stops.length < 2) return stops;
  if (steps < 2) return [stops[0] ?? { l: 0, c: 0, h: 0 }];
  const interp = culoriInterpolate(stops.map(oklchToCuloriColor), space);
  const out: OKLCH[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    out.push(resolve(interp(t)));
  }
  return out;
}

export function shortestHueDelta(h1: number, h2: number): number {
  let d = h2 - h1;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}
