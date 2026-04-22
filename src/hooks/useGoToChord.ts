import { useStore } from '@/store';
import type { TabId } from '@/store/types';
import { useEffect, useRef } from 'react';

const MAP: Record<string, TabId> = {
  i: 'inspector',
  m: 'matrix',
  p: 'palette',
  g: 'gradient',
  c: 'contrast',
  u: 'gamut',
  v: 'cvd',
  h: 'image',
  b: 'bulk',
  e: 'export',
};

// Two-key chord: press 'g' followed by a letter within the window to navigate.
export function useGoToChord(windowMs = 800): void {
  const setActive = useStore((s) => s.setActiveTab);
  const armedAt = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return;
      const now = Date.now();
      if (armedAt.current && now - armedAt.current < windowMs) {
        const target = MAP[e.key.toLowerCase()];
        if (target) {
          e.preventDefault();
          setActive(target);
        }
        armedAt.current = null;
        return;
      }
      if (e.key.toLowerCase() === 'g' && !e.shiftKey) {
        armedAt.current = now;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setActive, windowMs]);
}
