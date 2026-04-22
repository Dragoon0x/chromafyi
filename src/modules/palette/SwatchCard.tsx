import { oklchToCssString } from '@/color/convert';
import { formatPercent } from '@/color/format';
import { useStore } from '@/store';
import type { Swatch } from '@/store/types';
import { CopyButton } from '@/ui/CopyButton';
import { Lock, LockOpen, Trash2 } from 'lucide-react';

export function SwatchCard({ swatch }: { swatch: Swatch }) {
  const update = useStore((s) => s.updateSwatch);
  const remove = useStore((s) => s.removeSwatch);
  const pick = useStore((s) => s.pickRecent);

  const { l, c, h } = formatPercent(swatch.color);
  const css = oklchToCssString(swatch.color);
  const textColor = swatch.color.l > 0.58 ? 'oklch(0.12 0 0)' : 'oklch(0.98 0 0)';

  return (
    <div className="group relative rounded-[var(--radius-md)] overflow-hidden border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <button
        type="button"
        onClick={() => pick(swatch.color)}
        aria-label={`Use ${css}`}
        className="block w-full h-28 transition-transform group-hover:scale-[1.01]"
        style={{ background: css, color: textColor }}
      >
        <span className="sr-only">Use this color</span>
      </button>

      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton
          value={css}
          label="Copy OKLCH"
          className="w-6 h-6 bg-black/30 hover:bg-black/50 text-white"
        />
        <button
          type="button"
          onClick={() => remove(swatch.id)}
          aria-label="Remove swatch"
          className="w-6 h-6 inline-flex items-center justify-center rounded-[var(--radius-xs)] bg-black/30 hover:bg-[color:var(--color-danger)] text-white transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="px-3 py-2 space-y-1.5">
        <div className="mono text-[11px] text-[color:var(--color-text)] truncate">{css}</div>
        <div className="flex items-center gap-2 mono text-[10px] text-[color:var(--color-text-muted)]">
          <Axis
            label="L"
            value={l}
            locked={!!swatch.lockL}
            onToggle={() => update(swatch.id, { lockL: !swatch.lockL })}
          />
          <Axis
            label="C"
            value={c}
            locked={!!swatch.lockC}
            onToggle={() => update(swatch.id, { lockC: !swatch.lockC })}
          />
          <Axis
            label="H"
            value={h}
            locked={!!swatch.lockH}
            onToggle={() => update(swatch.id, { lockH: !swatch.lockH })}
          />
        </div>
      </div>
    </div>
  );
}

function Axis({
  label,
  value,
  locked,
  onToggle,
}: {
  label: string;
  value: string;
  locked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${label} ${locked ? 'locked' : 'unlocked'}`}
      title={`${label}: ${value} — ${locked ? 'locked' : 'unlocked'}`}
      className={`inline-flex items-center gap-0.5 px-1 h-5 rounded-[var(--radius-xs)] transition-colors ${
        locked
          ? 'bg-[color:color-mix(in_oklab,var(--color-accent)_15%,transparent)] text-[color:var(--color-accent)]'
          : 'hover:bg-[color:var(--color-surface-2)]'
      }`}
    >
      {locked ? <Lock size={9} /> : <LockOpen size={9} />}
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </button>
  );
}
