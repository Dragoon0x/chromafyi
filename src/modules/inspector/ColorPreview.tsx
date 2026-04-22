import { oklchToCssString } from '@/color/convert';
import { widestGamut } from '@/color/gamut';
import type { OKLCH } from '@/color/types';
import { Chip } from '@/ui/Chip';

export function ColorPreview({ color }: { color: OKLCH }) {
  const gamut = widestGamut(color);
  const css = oklchToCssString(color);
  // Pick a contrasting text color for the badge
  const textOn = color.l > 0.6 ? 'oklch(0.12 0 0)' : 'oklch(0.98 0 0)';
  return (
    <div className="relative rounded-[var(--radius-md)] overflow-hidden border border-[color:var(--color-border)]">
      <div
        className="h-56 sm:h-60 w-full transition-colors"
        style={{ background: css }}
        aria-label={`Preview of ${css}`}
      />
      <div className="absolute top-2 right-2 flex gap-1">
        {gamut === 'srgb' && <Chip tone="ok">sRGB</Chip>}
        {gamut === 'p3' && <Chip tone="accent">Display P3</Chip>}
        {gamut === 'rec2020' && <Chip tone="warn">Rec 2020</Chip>}
        {gamut === 'out' && <Chip tone="danger">out of gamut</Chip>}
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-2 left-2 mono text-[11px] px-2 py-1 rounded-[var(--radius-xs)]"
        style={{
          color: textOn,
          background: 'color-mix(in oklab, currentColor 6%, transparent)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {css}
      </div>
    </div>
  );
}
