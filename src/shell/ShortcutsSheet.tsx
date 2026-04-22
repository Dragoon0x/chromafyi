import { useHotkey } from '@/hooks/useKeyboard';
import { X } from 'lucide-react';
import { useState } from 'react';

const SHORTCUTS: { keys: string[]; desc: string }[] = [
  { keys: ['⌘', 'K'], desc: 'Command palette' },
  { keys: ['?'], desc: 'This shortcuts sheet' },
  { keys: ['g', 'i'], desc: 'Go to Inspector' },
  { keys: ['g', 'm'], desc: 'Go to Matrix' },
  { keys: ['g', 'p'], desc: 'Go to Palette' },
  { keys: ['g', 'g'], desc: 'Go to Gradient Lab' },
  { keys: ['g', 'e'], desc: 'Go to Export' },
  { keys: ['g', 'c'], desc: 'Go to Contrast' },
  { keys: ['←', '→'], desc: 'Nudge slider' },
  { keys: ['Shift', '←'], desc: 'Nudge slider larger' },
  { keys: ['Home'], desc: 'Slider minimum' },
  { keys: ['End'], desc: 'Slider maximum' },
];

export function ShortcutsSheet() {
  const [open, setOpen] = useState(false);
  useHotkey({ key: '?', shift: true }, () => setOpen((v) => !v));
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-40 grid place-items-end bg-black/40 backdrop-blur-[2px] fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-[color:var(--color-bg)] border-l border-[color:var(--color-border)] p-6 overflow-y-auto"
      >
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Keyboard shortcuts</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="w-7 h-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[color:var(--color-surface)]"
          >
            <X size={14} />
          </button>
        </header>
        <ul className="space-y-1.5 text-sm">
          {SHORTCUTS.map((s) => (
            <li
              key={s.desc}
              className="flex items-center justify-between py-1.5 border-b border-[color:var(--color-border)]/60 last:border-0"
            >
              <span className="text-[color:var(--color-text-muted)]">{s.desc}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="mono inline-flex items-center justify-center min-w-[22px] h-6 px-1.5 text-[10px] font-medium rounded-[var(--radius-xs)] bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)]"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
