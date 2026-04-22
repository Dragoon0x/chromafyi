import { oklchToCssString } from '@/color/convert';
import { widestGamut } from '@/color/gamut';
import { useCopy } from '@/hooks/useCopy';
import { useStore } from '@/store';
import { getShareableUrl } from '@/store/hash';
import { Chip } from '@/ui/Chip';
import { Link2, Monitor, Moon, Sun } from 'lucide-react';

export function StatusBar() {
  const color = useStore((s) => s.color);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const { copied, copy } = useCopy(2000);

  const gamut = widestGamut(color);
  const gamutLabel =
    gamut === 'srgb'
      ? 'sRGB'
      : gamut === 'p3'
        ? 'Display P3'
        : gamut === 'rec2020'
          ? 'Rec 2020'
          : 'Out of gamut';
  const gamutTone =
    gamut === 'srgb' ? 'ok' : gamut === 'p3' ? 'accent' : gamut === 'rec2020' ? 'warn' : 'danger';

  return (
    <footer
      className="h-9 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] flex items-center gap-3 px-4 text-[11px] text-[color:var(--color-text-muted)]"
      role="status"
    >
      <div className="flex items-center gap-2">
        <span
          className="w-3.5 h-3.5 rounded-[3px] border border-black/20"
          style={{ background: oklchToCssString(color) }}
          aria-hidden="true"
        />
        <span className="mono">{oklchToCssString(color)}</span>
      </div>

      <Chip tone={gamutTone}>{gamutLabel}</Chip>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const url = getShareableUrl(useStore.getState());
            void copy(url);
          }}
          className="inline-flex items-center gap-1.5 hover:text-[color:var(--color-text)] transition-colors"
          title="Copy share URL"
        >
          <Link2 size={13} />
          {copied ? 'copied!' : 'share url'}
        </button>

        <div
          role="radiogroup"
          aria-label="Theme"
          className="flex items-center border border-[color:var(--color-border)] rounded-[var(--radius-sm)] p-[2px]"
        >
          {(['light', 'system', 'dark'] as const).map((t) => {
            const Icon = t === 'light' ? Sun : t === 'system' ? Monitor : Moon;
            const active = theme === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`Theme: ${t}`}
                onClick={() => setTheme(t)}
                className={`w-6 h-5 inline-flex items-center justify-center rounded-[3px] transition-colors ${
                  active
                    ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]'
                    : 'text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]'
                }`}
              >
                <Icon size={12} />
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
