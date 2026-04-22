/// <reference lib="webworker" />

import { converter } from 'culori';
import { kmeans, type OKLabPoint } from '@/color/kmeans';
import type { OKLCH } from '@/color/types';

type Request = {
  id: string;
  data: Uint8ClampedArray;
  k: number;
};

type Response =
  | { id: string; ok: true; palette: OKLCH[] }
  | { id: string; ok: false; error: string };

const toOklab = converter('oklab');
const toOklch = converter('oklch');

self.addEventListener('message', (e: MessageEvent<Request>) => {
  const { id, data, k } = e.data;
  try {
    const points: OKLabPoint[] = [];
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] ?? 255;
      if (a < 128) continue;
      const r = (data[i] ?? 0) / 255;
      const g = (data[i + 1] ?? 0) / 255;
      const b = (data[i + 2] ?? 0) / 255;
      const lab = toOklab({ mode: 'rgb', r, g, b });
      points.push({ l: lab.l ?? 0, a: lab.a ?? 0, b: lab.b ?? 0 });
    }
    const centroids = kmeans(points, k, 16);
    const palette: OKLCH[] = centroids
      .map((c) => toOklch({ mode: 'oklab', l: c.l, a: c.a, b: c.b }))
      .map((o) => ({ l: o.l ?? 0, c: o.c ?? 0, h: o.h ?? 0 }))
      .sort((a, b) => a.l - b.l);
    const msg: Response = { id, ok: true, palette };
    (self as DedicatedWorkerGlobalScope).postMessage(msg);
  } catch (err) {
    const msg: Response = { id, ok: false, error: String(err) };
    (self as DedicatedWorkerGlobalScope).postMessage(msg);
  }
});

export {};
