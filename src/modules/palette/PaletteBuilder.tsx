import { oklchToCssString } from '@/color/convert';
import { formatCompactOklch } from '@/color/format';
import { HARMONY_LABEL, type HarmonyKind, harmony } from '@/color/harmony';
import { useStore } from '@/store';
import { nextId } from '@/store/defaults';
import { Button } from '@/ui/Button';
import { CopyButton } from '@/ui/CopyButton';
import { Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
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

export { Trash2 };
