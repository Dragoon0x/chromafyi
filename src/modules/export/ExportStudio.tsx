import { exportCssVars, exportCssWithFallback, exportTailwindTheme } from '@/export/css';
import { exportDesignTokens, exportFigmaVariables, exportJson } from '@/export/json';
import { exportSvg } from '@/export/svg';
import { exportTailwindConfig } from '@/export/tailwind';
import { useCopy } from '@/hooks/useCopy';
import { useStore } from '@/store';
import { Check, Copy, Download } from 'lucide-react';
import { useState } from 'react';

type Target = {
  id: string;
  label: string;
  ext: string;
  generate: () => string;
  mime: string;
};

export function ExportStudio() {
  const palette = useStore((s) => s.palette);

  const targets: Target[] = [
    {
      id: 'css-vars',
      label: 'CSS variables',
      ext: 'css',
      mime: 'text/css',
      generate: () => exportCssVars(palette),
    },
    {
      id: 'css-fallback',
      label: 'CSS + hex fallback',
      ext: 'css',
      mime: 'text/css',
      generate: () => exportCssWithFallback(palette),
    },
    {
      id: 'tailwind-theme',
      label: 'Tailwind v4 @theme',
      ext: 'css',
      mime: 'text/css',
      generate: () => exportTailwindTheme(palette),
    },
    {
      id: 'tailwind-config',
      label: 'Tailwind config.js',
      ext: 'js',
      mime: 'text/javascript',
      generate: () => exportTailwindConfig(palette),
    },
    {
      id: 'json',
      label: 'JSON',
      ext: 'json',
      mime: 'application/json',
      generate: () => exportJson(palette),
    },
    {
      id: 'tokens',
      label: 'W3C Design Tokens',
      ext: 'json',
      mime: 'application/json',
      generate: () => exportDesignTokens(palette),
    },
    {
      id: 'figma',
      label: 'Figma Variables',
      ext: 'json',
      mime: 'application/json',
      generate: () => exportFigmaVariables(palette),
    },
    {
      id: 'svg',
      label: 'SVG swatch sheet',
      ext: 'svg',
      mime: 'image/svg+xml',
      generate: () => exportSvg(palette),
    },
  ];

  const [active, setActive] = useState(targets[0]?.id ?? 'css-vars');
  const current = targets.find((t) => t.id === active) ?? targets[0];
  const output = current ? current.generate() : '';
  const { copied, copy } = useCopy();

  const download = () => {
    if (!current) return;
    const blob = new Blob([output], { type: current.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${palette.name.replace(/\s+/g, '-').toLowerCase() || 'palette'}.${current.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        <header>
          <h1 className="text-lg font-medium">Export</h1>
          <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
            Ship your palette. Copy or download in the format you need.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-4">
          <aside className="space-y-[2px]">
            {targets.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={`w-full text-left h-8 px-2.5 rounded-[var(--radius-sm)] text-sm transition-colors ${
                    isActive
                      ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]'
                      : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </aside>

          <section className="relative border border-[color:var(--color-border)] rounded-[var(--radius-md)] bg-[color:var(--color-surface)] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[color:var(--color-border)]">
              <span className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
                {current?.label}
              </span>
              <span className="mono text-[10px] text-[color:var(--color-text-dim)]">
                .{current?.ext}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void copy(output)}
                  className="inline-flex items-center gap-1.5 h-7 px-2 text-xs rounded-[var(--radius-sm)] hover:bg-[color:var(--color-surface-2)] transition-colors"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'copied' : 'copy'}
                </button>
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex items-center gap-1.5 h-7 px-2 text-xs rounded-[var(--radius-sm)] hover:bg-[color:var(--color-surface-2)] transition-colors"
                >
                  <Download size={13} /> download
                </button>
              </div>
            </div>
            <pre className="mono text-[12px] leading-relaxed p-4 overflow-x-auto whitespace-pre max-h-[60vh]">
              {output}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
