import { FORMAT_LABELS, formatColor } from '@/color/format';
import type { ColorFormat, OKLCH } from '@/color/types';
import { CopyButton } from '@/ui/CopyButton';

const ORDER: ColorFormat[] = ['oklch', 'oklab', 'p3', 'hex', 'rgb', 'hsl', 'lab', 'lch'];

export function FormatList({ color }: { color: OKLCH }) {
  return (
    <div className="border border-[color:var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
      <div className="px-3 py-2 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        <span className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
          Formats
        </span>
      </div>
      <ul className="divide-y divide-[color:var(--color-border)]">
        {ORDER.map((fmt) => {
          const value = formatColor(color, fmt);
          return (
            <li
              key={fmt}
              className="grid grid-cols-[64px_1fr_auto] items-center gap-2 px-3 py-1.5 hover:bg-[color:var(--color-surface)] transition-colors"
            >
              <span className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
                {FORMAT_LABELS[fmt]}
              </span>
              <span className="mono text-[12px] text-[color:var(--color-text)] truncate">
                {value}
              </span>
              <CopyButton value={value} label={`Copy ${FORMAT_LABELS[fmt]}`} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
