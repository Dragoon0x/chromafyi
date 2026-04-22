import { oklchToCssString } from '@/color/convert';
import { type OKLCH, OKLCH_MAX_C } from '@/color/types';
import { Slider } from '@/ui/Slider';

function buildGradient(stops: OKLCH[]): string {
  return `linear-gradient(to right, ${stops.map((s) => oklchToCssString(s)).join(', ')})`;
}

export function AxisSliders({
  color,
  onChange,
}: {
  color: OKLCH;
  onChange: (patch: Partial<OKLCH>) => void;
}) {
  // L gradient: sweep L 0..1 at current C, H
  const lStops: OKLCH[] = Array.from({ length: 9 }, (_, i) => ({
    l: i / 8,
    c: color.c,
    h: color.h,
  }));
  // C gradient: sweep C 0..0.4 at current L, H
  const cStops: OKLCH[] = Array.from({ length: 5 }, (_, i) => ({
    l: color.l,
    c: (i / 4) * OKLCH_MAX_C,
    h: color.h,
  }));
  // H gradient: sweep H 0..360 at current L, C
  const hStops: OKLCH[] = Array.from({ length: 13 }, (_, i) => ({
    l: color.l,
    c: color.c,
    h: (i / 12) * 360,
  }));

  return (
    <div className="space-y-4">
      <Row
        label="L"
        name="Lightness"
        value={color.l}
        display={`${(color.l * 100).toFixed(1)}`}
        unit="%"
      >
        <Slider
          label="Lightness"
          value={color.l}
          min={0}
          max={1}
          step={0.001}
          keyStep={0.005}
          shiftStep={0.05}
          onChange={(v) => onChange({ l: v })}
          trackGradient={buildGradient(lStops)}
          format={(v) => `${(v * 100).toFixed(1)}%`}
        />
      </Row>
      <Row label="C" name="Chroma" value={color.c} display={color.c.toFixed(3)} unit="">
        <Slider
          label="Chroma"
          value={color.c}
          min={0}
          max={OKLCH_MAX_C}
          step={0.001}
          keyStep={0.002}
          shiftStep={0.02}
          onChange={(v) => onChange({ c: v })}
          trackGradient={buildGradient(cStops)}
          format={(v) => v.toFixed(3)}
        />
      </Row>
      <Row label="H" name="Hue" value={color.h} display={color.h.toFixed(1)} unit="°">
        <Slider
          label="Hue"
          value={color.h}
          min={0}
          max={360}
          step={0.1}
          keyStep={1}
          shiftStep={15}
          onChange={(v) => onChange({ h: v })}
          trackGradient={buildGradient(hStops)}
          format={(v) => `${v.toFixed(1)}°`}
        />
      </Row>
    </div>
  );
}

function Row({
  label,
  name,
  display,
  unit,
  children,
}: {
  label: string;
  name: string;
  value: number;
  display: string;
  unit: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[28px_1fr_auto] items-center gap-3">
      <div className="flex flex-col">
        <span
          className="mono text-[11px] text-[color:var(--color-text-dim)] uppercase"
          aria-hidden="true"
        >
          {label}
        </span>
        <span className="sr-only">{name}</span>
      </div>
      <div>{children}</div>
      <div className="mono text-[12px] tabular-nums min-w-[54px] text-right text-[color:var(--color-text-muted)]">
        {display}
        <span className="text-[color:var(--color-text-dim)]">{unit}</span>
      </div>
    </div>
  );
}
