import { migrate } from '@/store/migrations';
import { describe, expect, it } from 'vitest';

describe('store migrate()', () => {
  it('produces a complete state from an empty object', () => {
    const s = migrate({});
    expect(s.version).toBe(1);
    expect(s.color.l).toBeGreaterThan(0);
    expect(s.palette.swatches.length).toBeGreaterThan(0);
    expect(Array.isArray(s.matrix.lockedHues)).toBe(true);
  });

  it('preserves user color when present', () => {
    const s = migrate({ color: { l: 0.3, c: 0.15, h: 42 } });
    expect(s.color).toEqual({ l: 0.3, c: 0.15, h: 42 });
  });

  it('handles old snapshots without lockedHues (post-migration)', () => {
    const s = migrate({
      matrix: {
        // deliberately missing lockedHues
        hues: [10, 20],
        lightnessStops: [0.9, 0.5],
        chroma: 0.1,
      } as unknown as import('@/store/types').MatrixConfig,
    });
    expect(Array.isArray(s.matrix.lockedHues)).toBe(true);
  });

  it('ignores garbage recentColors', () => {
    const s = migrate({ recentColors: 'not-an-array' as unknown as never });
    expect(s.recentColors).toEqual([]);
  });
});
