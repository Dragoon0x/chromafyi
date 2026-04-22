import { describe, expect, it } from 'vitest';
import { applyHashIfPresent, getShareableUrl } from '@/store/hash';
import { DEFAULT_STATE } from '@/store/defaults';

function withHash(hash: string, fn: () => void) {
  const prev = window.location.hash;
  window.location.hash = hash;
  try {
    fn();
  } finally {
    window.location.hash = prev;
  }
}

describe('URL hash round-trip', () => {
  it('produces a URL that contains the compressed state', () => {
    const url = getShareableUrl(DEFAULT_STATE);
    expect(url).toContain('#s=');
  });

  it('applyHashIfPresent hydrates from a URL produced by getShareableUrl', () => {
    const custom = {
      ...DEFAULT_STATE,
      color: { l: 0.42, c: 0.19, h: 123 },
      activeTab: 'matrix' as const,
    };
    const url = getShareableUrl(custom);
    const hash = url.slice(url.indexOf('#'));
    withHash(hash, () => {
      const restored = applyHashIfPresent(DEFAULT_STATE);
      expect(restored.color).toEqual({ l: 0.42, c: 0.19, h: 123 });
      expect(restored.activeTab).toBe('matrix');
    });
  });

  it('returns base state unchanged when no hash', () => {
    withHash('', () => {
      const s = applyHashIfPresent(DEFAULT_STATE);
      expect(s).toBe(DEFAULT_STATE);
    });
  });

  it('survives malformed hash payloads', () => {
    withHash('#s=garbage%20not-base64', () => {
      const s = applyHashIfPresent(DEFAULT_STATE);
      expect(s).toBe(DEFAULT_STATE);
    });
  });
});
