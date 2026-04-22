import { clampOklch, normalizeHue, oklchToCssString } from '@/color/convert';
import { formatCompactOklch } from '@/color/format';
import { HARMONY_LABEL, type HarmonyKind, harmony } from '@/color/harmony';
import { useStore } from '@/store';
import { nextId } from '@/store/defaults';
import { Button } from '@/ui/Button';
import { CopyButton } from '@/ui/CopyButton';
import { Plus, Redo2, RotateCcw, Sparkles, Sun, SunDim, Undo2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { SwatchCard } from './SwatchCard';

export function PaletteBuilder() {
  const palette = useStore((s) => s.palette);
  const color = useStore((s) => s.color);
  const setPalette = useStore((s) => s.setPalette);
  const addSwatch = useStore((s) => s.addSwatch);
  const resetPalette = useStore((s) => s.resetPalette);
  const renamePalette = useStore((s) => s.renamePalette);

  const [harmonyKind, setHarmonyKind] = useState<HarmonyKind>('analogous');

  const generate = () => {
    const hues = harmony(color, harmonyKind, 5);
    setPalette({
      id: nextId(),
      name: `${HARMONY_LABEL[harmonyKind]} of ${formatCompactOklch(color)}`,
      swatches: hues.map((c) => ({ id: nextId(), color: c })),
      harmony: harmonyKind,
    });
  };

  // Bulk shift ops — respect per-swatch L/C/H locks.
  const shiftAll = (patch: { l?: number; c?: number; h?: number }) => {
    setPalette({
      ...palette,
      swatches: palette.swatches.map((s) => {
        const l = s.lockL ? s.color.l : s.color.l + (patch.l ?? 0);
        const ch = s.lockC ? s.color.c : s.color.c + (patch.c ?? 0);
        const h = s.lockH ? s.color.h : s.color.h + (patch.h ?? 0);
        return {
          ...s,
          color: clampOklch({ l, c: ch, h: normalizeHue(h) }),
        };
      }),
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <input
              value={palette.name}
              onChange={(e) => renamePalette(e.target.value)}
              className="bg-transparent text-lg font-medium outline-none focus-visible:bg-[color:var(--color-surface)] px-1 -mx-1 rounded-[var(--radius-sm)] w-full"
              aria-label="Palette name"
            />
            <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
              {palette.swatches.length} swatch{palette.swatches.length === 1 ? '' : 'es'}
              {' · '}
              <CopyIt value={palette.swatches.map((s) => oklchToCssString(s.color)).join('\n')} />
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <select
              value={harmonyKind}
              onChange={(e) => setHarmonyKind(e.target.value as HarmonyKind)}
              className="h-8 px-2 text-sm bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-[var(--radius-sm)] outline-none focus-visible:border-[color:var(--color-accent)]"
            >
              {(Object.keys(HARMONY_LABEL) as HarmonyKind[]).map((k) => (
                <option key={k} value={k}>
                  {HARMONY_LABEL[k]}
                </option>
              ))}
            </select>
            <Button size="sm" iconLeft={<Sparkles size={13} />} onClick={generate}>
              Generate
            </Button>
            <Button
              size="sm"
              variant="ghost"
              iconLeft={<Plus size={13} />}
              onClick={() => addSwatch(color)}
            >
              Add current
            </Button>
            <Button
              size="sm"
              variant="ghost"
              iconLeft={<RotateCcw size={13} />}
              onClick={resetPalette}
            >
              Reset
            </Button>
          </div>
        </header>

        {palette.swatches.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap text-[11px] text-[color:var(--color-text-muted)]">
            <span className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
              Shift (respects locks)
            </span>
            <div className="flex items-center gap-0.5">
              <IconBtn onClick={() => shiftAll({ h: -15 })} label="Rotate hue -15°">
                <Undo2 size={13} />
                <span className="mono text-[10px]">H</span>
              </IconBtn>
              <IconBtn onClick={() => shiftAll({ h: 15 })} label="Rotate hue +15°">
                <span className="mono text-[10px]">H</span>
                <Redo2 size={13} />
              </IconBtn>
            </div>
            <div className="flex items-center gap-0.5">
              <IconBtn onClick={() => shiftAll({ l: -0.04 })} label="Darken">
                <SunDim size={13} />
                <span className="mono text-[10px]">L−</span>
              </IconBtn>
              <IconBtn onClick={() => shiftAll({ l: 0.04 })} label="Lighten">
                <Sun size={13} />
                <span className="mono text-[10px]">L+</span>
              </IconBtn>
            </div>
            <div className="flex items-center gap-0.5">
              <IconBtn onClick={() => shiftAll({ c: -0.02 })} label="Desaturate">
                <span className="mono text-[10px]">C−</span>
              </IconBtn>
              <IconBtn onClick={() => shiftAll({ c: 0.02 })} label="Saturate">
                <span className="mono text-[10px]">C+</span>
              </IconBtn>
            </div>
          </div>
        )}

        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
          {palette.swatches.map((s) => (
            <SwatchCard key={s.id} swatch={s} />
          ))}
          {palette.swatches.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-[color:var(--color-text-muted)] border border-dashed border-[color:var(--color-border)] rounded-[var(--radius-md)]">
              Add a swatch to get started.
            </div>
          )}
        </div>

        {palette.swatches.length > 0 && (
          <div className="border border-[color:var(--color-border)] rounded-[var(--radius-md)] p-4">
            <div className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)] mb-3">
              Bar preview
            </div>
            <div className="flex h-12 rounded-[var(--radius-sm)] overflow-hidden border border-[color:var(--color-border)]">
              {palette.swatches.map((s) => (
                <div
                  key={s.id}
                  className="flex-1"
                  style={{ background: oklchToCssString(s.color) }}
                  title={oklchToCssString(s.color)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CopyIt({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <CopyButton value={value} label="Copy all as OKLCH" className="w-5 h-5" />
    </span>
  );
}

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex items-center gap-1 h-7 px-2 rounded-[var(--radius-sm)] border border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-2)] transition-colors text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
    >
      {children}
    </button>
  );
}
