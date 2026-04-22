// K-means clustering in OKLab for perceptually reasonable palette extraction.
// Input: array of { l, a, b }. Output: k centroids.

export type OKLabPoint = { l: number; a: number; b: number };

function dist(p: OKLabPoint, q: OKLabPoint): number {
  const dl = p.l - q.l;
  const da = p.a - q.a;
  const db = p.b - q.b;
  return dl * dl + da * da + db * db;
}

function randomInit(points: OKLabPoint[], k: number): OKLabPoint[] {
  // k-means++ for better initial centroids
  const seeds: OKLabPoint[] = [];
  const n = points.length;
  if (n === 0) return [];
  const firstIdx = Math.floor(Math.random() * n);
  const first = points[firstIdx];
  if (first) seeds.push({ ...first });
  while (seeds.length < k) {
    const distances = points.map((p) => Math.min(...seeds.map((s) => dist(p, s))));
    const sum = distances.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      const fallback = points[Math.floor(Math.random() * n)];
      if (fallback) seeds.push({ ...fallback });
      continue;
    }
    const target = Math.random() * sum;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      acc += distances[i] ?? 0;
      if (acc >= target) {
        const chosen = points[i];
        if (chosen) seeds.push({ ...chosen });
        break;
      }
    }
  }
  return seeds;
}

export function kmeans(points: OKLabPoint[], k: number, iterations = 12): OKLabPoint[] {
  if (points.length <= k) return points.slice();
  let centroids = randomInit(points, k);
  for (let iter = 0; iter < iterations; iter++) {
    const buckets: OKLabPoint[][] = Array.from({ length: k }, () => []);
    for (const p of points) {
      let best = 0;
      let bestD = Number.POSITIVE_INFINITY;
      for (let i = 0; i < k; i++) {
        const c = centroids[i];
        if (!c) continue;
        const d = dist(p, c);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      buckets[best]?.push(p);
    }
    const next: OKLabPoint[] = [];
    for (let i = 0; i < k; i++) {
      const bucket = buckets[i] ?? [];
      if (bucket.length === 0) {
        const keep = centroids[i];
        if (keep) next.push(keep);
        continue;
      }
      let sl = 0;
      let sa = 0;
      let sb = 0;
      for (const p of bucket) {
        sl += p.l;
        sa += p.a;
        sb += p.b;
      }
      next.push({ l: sl / bucket.length, a: sa / bucket.length, b: sb / bucket.length });
    }
    centroids = next;
  }
  return centroids;
}
