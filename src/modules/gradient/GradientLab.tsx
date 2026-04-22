import { oklchToCssString } from '@/color/convert';
import { type InterpolationSpace, sampleGradient } from '@/color/interpolate';
import { useStore } from '@/store';
import { nextId } from '@/store/defaults';
import { Button } from '@/ui/Button';
import { CopyButton } from '@/ui/CopyButton';
import { Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

const SPACES: { id: InterpolationSpace; label: string; hint: string }[] = [
  { id: 'oklab', label: 'OKLab', hint: 'perceptually uniform — recommended' },
  { id: 'oklch', label: 'OKLCH', hint: 'keeps chroma; hue rotates shortest path' },
  { id: 'rgb', label: 'sRGB', hint: 'the old default — prone to gray dead-zone' },
];

export function GradientLab() {
  const gradient = useStore((s) => s.gradient);
  const setGradient = useStore((s) => s.setGradient);
  const pickRecent = useStore((s) => s.pickRecent);
  const color = useStore((s) => s.color);

  const addStop = () => {
    const newStop = {
      id: nextId(),
      color,
      position: 0.5,
    };
    setGradient({ stops: [...gradient.stops, newStop].sort((a, b) => a.position - b.position) });
  };
  const removeStop = (id: string) => {
    setGradient({ stops: gradient.stops.filter((s) => s.id !== id) });
  };
  const updateStop = (id: string, patch: Partial<{ position: number }>) => {
    setGradient({
      stops: gradient.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const panels = useMemo(() => {
    const sorted = [...gradient.stops].sort((a, b) => a.position - b.position);
    const cssStops = sorted
      .map((s) => `${oklchToCssString(s.color)} ${(s.position * 100).toFixed(1)}%`)
      .join(', ');
    return SPACES.map((sp) => {
      const samples = sampleGradient(
        sorted.map((s) => s.color),
        gradient.steps,
        sp.id,
      );
      const cssSpace = sp.id === 'oklch' ? 'in oklch' : sp.id === 'oklab' ? 'in oklab' : 'in srgb';
      return {
        ...sp,
        cssGradient: `linear-gradient(to right ${cssSpace}, ${cssStops})`,
        cssGradientSwatchStrip: `linear-gradient(to right, ${samples.map((c) => oklchToCssString(c)).join(', ')})`,
        samples,
      };
    });
  }, [gradient.stops, gradient.steps]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-medium">Gradient lab</h1>
            <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
              Compare interpolation spaces. OKLab is perceptually uniform.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
              steps
            </label>
            <input
              type="number"
              min={2}
              max={32}
              value={gradient.steps}
              onChange={(e) =>
                setGradient({
                  steps: Math.max(2, Math.min(32, Number.parseInt(e.target.value, 10) || 9)),
                })
              }
              className="mono h-7 w-14 px-1.5 text-xs bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-[var(--radius-sm)] outline-none"
            />
            <Button size="sm" iconLeft={<Plus size={13} />} onClick={addStop}>
              Add stop
            </Button>
          </div>
        </header>

        {/* Stops editor */}
        <div className="space-y-2">
          <div className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
            stops
          </div>
          <div className="space-y-2">
            {gradient.stops.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 h-10 px-2 border border-[color:var(--color-border)] rounded-[var(--radius-sm)]"
              >
                <button
                  type="button"
                  onClick={() => pickRecent(s.color)}
                  aria-label={`Select ${oklchToCssString(s.color)}`}
                  className="w-6 h-6 rounded-[var(--radius-xs)] border border-black/20 transition-transform hover:scale-105"
                  style={{ background: oklchToCssString(s.color) }}
                />
                <span className="mono text-xs text-[color:var(--color-text)] w-44 truncate">
                  {oklchToCssString(s.color)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={s.position}
                  onChange={(e) =>
                    updateStop(s.id, { position: Number.parseFloat(e.target.value) })
                  }
                  className="flex-1 accent-[color:var(--color-accent)]"
                  aria-label={`position ${(s.position * 100).toFixed(1)}%`}
                />
                <span className="mono text-xs tabular-nums text-[color:var(--color-text-muted)] w-12 text-right">
                  {(s.position * 100).toFixed(0)}%
                </span>
                <button
                  type="button"
                  onClick={() => removeStop(s.id)}
                  aria-label="Remove stop"
                  disabled={gradient.stops.length <= 2}
                  className="w-7 h-7 inline-flex items-center justify-center text-[color:var(--color-text-dim)] hover:text-[color:var(--color-danger)] disabled:opacity-20 disabled:pointer-events-none transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Side-by-side spaces */}
        <div className="space-y-4">
          {panels.map((p) => (
            <div
              key={p.id}
              className="border border-[color:var(--color-border)] rounded-[var(--radius-md)] overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[color:var(--color-border)]">
                <span className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text)]">
                  {p.label}
                </span>
                <span className="text-[11px] text-[color:var(--color-text-dim)]">{p.hint}</span>
                <div className="ml-auto">
                  <CopyButton value={p.cssGradient} label={`Copy ${p.label} gradient CSS`} />
                </div>
              </div>
              <div
                className="h-16"
                style={{ background: p.cssGradient }}
                aria-label={`${p.label} gradient (continuous)`}
              />
              <div className="h-8 flex" aria-label={`${p.label} gradient sampled`}>
                {p.samples.map((c, i) => (
                  <button
                    key={`${p.id}-s-${i}`}
                    type="button"
                    onClick={() => pickRecent(c)}
                    aria-label={`Sampled ${oklchToCssString(c)}`}
                    className="flex-1 hover:ring-1 hover:ring-inset hover:ring-white/40 transition-all"
                    style={{ background: oklchToCssString(c) }}
                  />
                ))}
              </div>
              <div className="px-3 py-2 border-t border-[color:var(--color-border)]">
                <code className="mono text-[11px] text-[color:var(--color-text-muted)] break-all">
                  {p.cssGradient}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
