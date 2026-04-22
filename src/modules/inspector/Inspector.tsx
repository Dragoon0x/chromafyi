import { inGamut, toGamut } from '@/color/gamut';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { useEffect } from 'react';
import { AxisSliders } from './AxisSliders';
import { ColorPreview } from './ColorPreview';
import { FormatList } from './FormatList';
import { InputRow } from './InputRow';
import { RecentColors } from './RecentColors';

export function Inspector() {
  const color = useStore((s) => s.color);
  const setColor = useStore((s) => s.setColor);
  const pickRecent = useStore((s) => s.pickRecent);
  const addSwatch = useStore((s) => s.addSwatch);

  // Track recent colors as a light side-effect — debounce via a short timeout so
  // slider drags don't pollute the list.
  useEffect(() => {
    const t = setTimeout(() => {
      useStore.setState((s) => {
        const recent = s.recentColors;
        const key = `${color.l.toFixed(3)}_${color.c.toFixed(3)}_${color.h.toFixed(1)}`;
        const firstKey = recent[0]
          ? `${recent[0].l.toFixed(3)}_${recent[0].c.toFixed(3)}_${recent[0].h.toFixed(1)}`
          : null;
        if (firstKey === key) return s;
        const next = [
          color,
          ...recent.filter((c) => {
            const k = `${c.l.toFixed(3)}_${c.c.toFixed(3)}_${c.h.toFixed(1)}`;
            return k !== key;
          }),
        ].slice(0, 32);
        return { recentColors: next };
      });
    }, 600);
    return () => clearTimeout(t);
  }, [color]);

  const inSrgb = inGamut(color, 'srgb');
  const inP3 = inGamut(color, 'p3');

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        <header className="flex items-baseline justify-between gap-4">
          <div>
            <h1 className="text-lg font-medium">Inspector</h1>
            <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
              Tune a color in OKLCH. Every format updates live.
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                pickRecent({ l: Math.random(), c: Math.random() * 0.3, h: Math.random() * 360 })
              }
            >
              Random
            </Button>
            <Button size="sm" variant="ghost" onClick={() => addSwatch(color)}>
              Add to palette
            </Button>
          </div>
        </header>

        <InputRow color={color} onCommit={pickRecent} />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6">
          <section className="space-y-6">
            <ColorPreview color={color} />
            <AxisSliders color={color} onChange={setColor} />
            {!inSrgb && (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] border border-[color:var(--color-warn)] bg-[color:color-mix(in_oklab,var(--color-warn)_8%,transparent)]">
                <div className="text-sm">
                  <span className="font-medium text-[color:var(--color-warn)]">Out of sRGB</span>
                  <span className="text-[color:var(--color-text-muted)]">
                    {' '}
                    — {inP3 ? 'this color fits in Display P3.' : 'this color is out of P3 too.'}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setColor(toGamut(color, 'srgb'))}
                >
                  Snap to sRGB
                </Button>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <FormatList color={color} />
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)] mb-2">
                Recent
              </div>
              <RecentColors />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
