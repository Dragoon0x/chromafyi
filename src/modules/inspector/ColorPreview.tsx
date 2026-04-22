import { oklchToCssString, oklchToHex, parseInput } from '@/color/convert';
import { widestGamut } from '@/color/gamut';
import type { OKLCH } from '@/color/types';
import { useStore } from '@/store';
import { Chip } from '@/ui/Chip';
import { Pipette } from 'lucide-react';
import { useId, useRef } from 'react';

export function ColorPreview({ color }: { color: OKLCH }) {
  const gamut = widestGamut(color);
  const css = oklchToCssString(color);
  const hex = oklchToHex(color);
  const pickRecent = useStore((s) => s.pickRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  // Pick a contrasting text color for the badge
  const textOn = color.l > 0.6 ? 'oklch(0.12 0 0)' : 'oklch(0.98 0 0)';

  const open = () => inputRef.current?.click();

  return (
    <div className="relative rounded-[var(--radius-md)] overflow-hidden border border-[color:var(--color-border)] group">
      <button
        type="button"
        onClick={open}
        aria-label="Open native color picker"
        className="block h-56 sm:h-60 w-full transition-opacity cursor-crosshair focus-visible:outline-none"
        style={{ background: css }}
      />
      {/* Hidden native color input — the source of truth for the OS picker */}
      <label htmlFor={inputId} className="sr-only">
        Color picker
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="color"
        value={hex}
        onChange={(e) => {
          const parsed = parseInput(e.target.value);
          if (parsed) pickRecent(parsed);
        }}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Pick hint — visible on hover */}
      <div
        aria-hidden="true"
        className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] text-[11px] opacity-0 group-hover:opacity-100 transition-opacity mono pointer-events-none"
        style={{
          color: textOn,
          background: 'color-mix(in oklab, currentColor 6%, transparent)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Pipette size={11} />
        click to pick
      </div>

      <div className="absolute top-2 right-2 flex gap-1">
        {gamut === 'srgb' && <Chip tone="ok">sRGB</Chip>}
        {gamut === 'p3' && <Chip tone="accent">Display P3</Chip>}
        {gamut === 'rec2020' && <Chip tone="warn">Rec 2020</Chip>}
        {gamut === 'out' && <Chip tone="danger">out of gamut</Chip>}
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-2 left-2 mono text-[11px] px-2 py-1 rounded-[var(--radius-xs)] pointer-events-none"
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
