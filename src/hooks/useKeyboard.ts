import { useEffect } from 'react';

export type Chord = {
  key: string; // 'k', 'ArrowLeft', '?'
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
};

function match(e: KeyboardEvent, c: Chord): boolean {
  if (c.key.length === 1 ? e.key.toLowerCase() !== c.key.toLowerCase() : e.key !== c.key) {
    return false;
  }
  if ((c.meta ?? false) !== e.metaKey) return false;
  if ((c.ctrl ?? false) !== e.ctrlKey) return false;
  if ((c.shift ?? false) !== e.shiftKey) return false;
  if ((c.alt ?? false) !== e.altKey) return false;
  return true;
}

export function useHotkey(chord: Chord, handler: (e: KeyboardEvent) => void, active = true): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isEditable =
        tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable === true;
      // Always allow chords with a modifier, even in editable fields
      const hasMod = chord.meta || chord.ctrl || chord.alt;
      if (isEditable && !hasMod) return;
      if (match(e, chord)) {
        if (chord.preventDefault ?? true) e.preventDefault();
        handler(e);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chord, handler, active]);
}
