import { oklchToCssString } from '@/color/convert';
import { CVD_LABEL, CVD_PREVALENCE, CVD_TYPES, simulateCVD } from '@/color/cvd';
import { useStore } from '@/store';
import { useMemo } from 'react';

export function CVDSimulator() {
  const palette = useStore((s) => s.palette);
  const cvd = useStore((s) => s.cvd);
  const setCVD = useStore((s) => s.setCVD);

  const rows = useMemo(() => {
    return CVD_TYPES.map((t) => ({
      type: t,
      swatches: palette.swatches.map((s) => simulateCVD(s.color, t)),
    }));
  }, [palette.swatches]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        <header>
          <h1 className="text-lg font-medium">Color vision</h1>
          <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
            Preview the current palette through each major CVD type.
          </p>
        </header>

        <div className="flex gap-1.5 flex-wrap">
          {CVD_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCVD({ type: t })}
              className={`h-8 px-3 text-xs rounded-[var(--radius-sm)] transition-colors border ${
                cvd.type === t
                  ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-text)] border-[color:var(--color-border-strong)]'
                  : 'text-[color:var(--color-text-muted)] border-[color:var(--color-border)] hover:text-[color:var(--color-text)]'
              }`}
            >
              {CVD_LABEL[t]}
            </button>
          ))}
        </div>

        <section className="space-y-6">
          {rows.map((row) => {
            const focus = row.type === cvd.type;
            return (
              <div
                key={row.type}
                className={`rounded-[var(--radius-md)] border p-4 transition-colors ${
                  focus
                    ? 'border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]'
                    : 'border-[color:var(--color-border)]'
                }`}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-sm font-medium">{CVD_LABEL[row.type]}</span>
                    {row.type !== 'none' && (
                      <span className="ml-2 text-[11px] text-[color:var(--color-text-dim)]">
                        {CVD_PREVALENCE[row.type]}
                      </span>
                    )}
                  </div>
                </div>
                {palette.swatches.length === 0 ? (
                  <div className="text-xs text-[color:var(--color-text-dim)]">
                    Add palette swatches to preview.
                  </div>
                ) : (
                  <div className="flex rounded-[var(--radius-sm)] overflow-hidden h-20 border border-[color:var(--color-border)]">
                    {row.swatches.map((c, i) => (
                      <div
                        key={`${row.type}-${i}`}
                        className="flex-1 relative group"
                        style={{ background: oklchToCssString(c) }}
                        title={oklchToCssString(c)}
                      >
                        <div className="absolute bottom-1 left-1 mono text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-white mix-blend-difference">
                          {oklchToCssString(c)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
