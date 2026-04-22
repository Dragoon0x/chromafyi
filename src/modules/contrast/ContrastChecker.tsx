import { apcaContrast, apcaLabel, apcaVerdict } from '@/color/apca';
import { oklchToCssString } from '@/color/convert';
import type { OKLCH } from '@/color/types';
import { wcagContrast, wcagLevel } from '@/color/wcag';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { NativeColorButton } from '@/ui/NativeColorButton';
import { Swatch } from '@/ui/Swatch';
import { ArrowLeftRight } from 'lucide-react';
import { useMemo } from 'react';

export function ContrastChecker() {
  const contrast = useStore((s) => s.contrast);
  const setContrast = useStore((s) => s.setContrast);
  const palette = useStore((s) => s.palette);

  const apca = useMemo(() => apcaContrast(contrast.fg, contrast.bg), [contrast.fg, contrast.bg]);
  const wcag = useMemo(() => wcagContrast(contrast.fg, contrast.bg), [contrast.fg, contrast.bg]);

  const swap = () => setContrast({ fg: contrast.bg, bg: contrast.fg });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        <header>
          <h1 className="text-lg font-medium">Contrast</h1>
          <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
            APCA for modern readable type, WCAG 2 for compliance.
          </p>
        </header>

        {/* Preview */}
        <div
          className="relative rounded-[var(--radius-md)] border border-[color:var(--color-border)] p-10 min-h-[200px] flex flex-col gap-3 justify-center"
          style={{
            background: oklchToCssString(contrast.bg),
            color: oklchToCssString(contrast.fg),
          }}
        >
          <div className="text-[28px] leading-tight font-medium">{contrast.sampleText}</div>
          <div className="text-[14px] opacity-80">
            Large text · small text · the quick brown fox.
          </div>
          <textarea
            value={contrast.sampleText}
            onChange={(e) => setContrast({ sampleText: e.target.value })}
            rows={2}
            className="absolute inset-0 opacity-0 pointer-events-none"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>

        {/* Readings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadingCard
            title="APCA"
            value={apca.toFixed(1)}
            unit="Lc"
            label={apcaLabel(apca)}
            tone={verdictTone(apcaVerdict(apca, 'body'))}
            hints={[
              ['Body text (≥ 75)', apcaVerdict(apca, 'body')],
              ['Content text (≥ 60)', apcaVerdict(apca, 'content')],
              ['Large text (≥ 45)', apcaVerdict(apca, 'large')],
            ]}
          />
          <ReadingCard
            title="WCAG 2.1"
            value={wcag.toFixed(2)}
            unit=":1"
            label={wcagLevel(wcag)}
            tone={wcag >= 4.5 ? 'ok' : wcag >= 3 ? 'warn' : 'danger'}
            hints={[
              ['AA (≥ 4.5)', wcag >= 4.5 ? 'pass' : 'fail'],
              ['AAA (≥ 7)', wcag >= 7 ? 'pass' : 'fail'],
              ['AA large (≥ 3)', wcag >= 3 ? 'pass' : 'fail'],
            ]}
          />
        </div>

        {/* Picker */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_44px_1fr] gap-3 items-center">
          <PickerColumn
            label="Foreground"
            color={contrast.fg}
            onPick={(c) => setContrast({ fg: c })}
          />
          <div className="grid place-items-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={swap}
              iconLeft={<ArrowLeftRight size={13} />}
            >
              Swap
            </Button>
          </div>
          <PickerColumn
            label="Background"
            color={contrast.bg}
            onPick={(c) => setContrast({ bg: c })}
          />
        </div>

        {/* Pick from palette */}
        <section>
          <div className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)] mb-2">
            Pick a pair from the palette
          </div>
          <div className="flex flex-wrap gap-1.5">
            {palette.swatches.map((s) => (
              <div key={s.id} className="flex flex-col gap-1 items-center">
                <Swatch color={s.color} size={36} onClick={() => setContrast({ bg: s.color })} />
                <div className="flex gap-[2px] text-[9px] mono text-[color:var(--color-text-dim)]">
                  <button
                    type="button"
                    onClick={() => setContrast({ fg: s.color })}
                    className="hover:text-[color:var(--color-text)] transition-colors"
                    title="Use as foreground"
                  >
                    fg
                  </button>
                  <button
                    type="button"
                    onClick={() => setContrast({ bg: s.color })}
                    className="hover:text-[color:var(--color-text)] transition-colors"
                    title="Use as background"
                  >
                    bg
                  </button>
                </div>
              </div>
            ))}
            {palette.swatches.length === 0 && (
              <span className="text-xs text-[color:var(--color-text-dim)]">
                Add swatches in the Palette module.
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function verdictTone(v: 'pass' | 'warn' | 'fail'): 'ok' | 'warn' | 'danger' {
  return v === 'pass' ? 'ok' : v === 'warn' ? 'warn' : 'danger';
}

function ReadingCard({
  title,
  value,
  unit,
  label,
  tone,
  hints,
}: {
  title: string;
  value: string;
  unit: string;
  label: string;
  tone: 'ok' | 'warn' | 'danger';
  hints: [string, 'pass' | 'warn' | 'fail' | string][];
}) {
  const color =
    tone === 'ok'
      ? 'var(--color-ok)'
      : tone === 'warn'
        ? 'var(--color-warn)'
        : 'var(--color-danger)';
  return (
    <div className="border border-[color:var(--color-border)] rounded-[var(--radius-md)] p-4">
      <div className="flex items-baseline justify-between mb-2">
        <span className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
          {title}
        </span>
        <span className="text-xs text-[color:var(--color-text-muted)]">{label}</span>
      </div>
      <div className="mono tabular-nums text-[40px] leading-none" style={{ color }}>
        {value}
        <span className="text-[20px] ml-1 text-[color:var(--color-text-muted)]">{unit}</span>
      </div>
      <ul className="mt-3 space-y-1 text-xs">
        {hints.map(([h, v]) => (
          <li key={h} className="flex justify-between gap-2">
            <span className="text-[color:var(--color-text-muted)]">{h}</span>
            <span
              className="mono tabular-nums uppercase text-[10px]"
              style={{
                color:
                  v === 'pass'
                    ? 'var(--color-ok)'
                    : v === 'warn'
                      ? 'var(--color-warn)'
                      : 'var(--color-danger)',
              }}
            >
              {v}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PickerColumn({
  label,
  color,
  onPick,
}: {
  label: string;
  color: OKLCH;
  onPick: (c: OKLCH) => void;
}) {
  const setColor = useStore((s) => s.setColor);
  const current = useStore((s) => s.color);
  return (
    <div className="border border-[color:var(--color-border)] rounded-[var(--radius-sm)] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
          {label}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPick(current)}
            className="text-[10px] mono text-[color:var(--color-text-dim)] hover:text-[color:var(--color-accent)] transition-colors"
            title="Use the Inspector's current color"
          >
            use current
          </button>
          <button
            type="button"
            onClick={() => setColor(color)}
            className="text-[10px] mono text-[color:var(--color-text-dim)] hover:text-[color:var(--color-accent)] transition-colors"
          >
            edit in inspector
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NativeColorButton
          value={color}
          onChange={onPick}
          label={`Edit ${label} color`}
          className="w-8 h-8 rounded-[var(--radius-xs)] border border-black/20 transition-transform hover:scale-105 shrink-0"
          style={{ background: oklchToCssString(color) }}
        />
        <span className="mono text-[11px] truncate flex-1">{oklchToCssString(color)}</span>
      </div>
    </div>
  );
}

export { Chip };
