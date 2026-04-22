import { parseInput } from '@/color/convert';
import { FORMAT_LABELS, formatColor } from '@/color/format';
import type { ColorFormat, OKLCH } from '@/color/types';
import { useStore } from '@/store';
import { nextId } from '@/store/defaults';
import { Button } from '@/ui/Button';
import { CopyButton } from '@/ui/CopyButton';
import { Swatch } from '@/ui/Swatch';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

const FORMATS: ColorFormat[] = ['oklch', 'oklab', 'hex', 'rgb', 'hsl', 'p3', 'lab', 'lch'];

type Row = { input: string; color: OKLCH | null };

function parseAll(input: string): Row[] {
  const tokens = input
    .split(/[\n,;]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return tokens.map((t) => ({ input: t, color: parseInput(t) }));
}

export function BulkConverter() {
  const [input, setInput] = useState('#1e90ff\nhsl(30 100% 60%)\noklch(0.78 0.17 200)\n#eab308');
  const [target, setTarget] = useState<ColorFormat>('oklch');
  const rows = useMemo(() => parseAll(input), [input]);
  const addSwatch = useStore((s) => s.addSwatch);
  const setPalette = useStore((s) => s.setPalette);

  const parsedRows = rows.filter((r): r is Row & { color: OKLCH } => !!r.color);
  const output = parsedRows.map((r) => formatColor(r.color, target)).join('\n');

  const importToPalette = () => {
    const swatches = parsedRows.map((r) => ({ id: nextId(), color: r.color }));
    setPalette({
      id: nextId(),
      name: `Imported (${swatches.length})`,
      swatches,
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        <header>
          <h1 className="text-lg font-medium">Bulk convert</h1>
          <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
            Paste colors (one per line, comma, or semicolon). Accepts any CSS color.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)] mb-1.5">
              Input
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={14}
              spellCheck={false}
              className="mono w-full text-[12px] p-3 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-[var(--radius-sm)] outline-none focus-visible:border-[color:var(--color-accent)] resize-none"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
                Output as
              </span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as ColorFormat)}
                className="h-6 px-1 text-xs bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-[var(--radius-xs)] outline-none"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABELS[f]}
                  </option>
                ))}
              </select>
              <div className="ml-auto flex items-center gap-1">
                <CopyButton value={output} label="Copy all output" />
              </div>
            </div>
            <textarea
              readOnly
              value={output}
              rows={14}
              spellCheck={false}
              className="mono w-full text-[12px] p-3 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-[var(--radius-sm)] outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="mono text-[11px] text-[color:var(--color-text-muted)]">
            {parsedRows.length} parsed
            {rows.length > parsedRows.length && (
              <span className="text-[color:var(--color-danger)]">
                {' '}
                · {rows.length - parsedRows.length} failed
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={importToPalette}
              iconLeft={<Plus size={13} />}
              disabled={parsedRows.length === 0}
            >
              Import to palette
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => parsedRows.forEach((r) => addSwatch(r.color))}
              disabled={parsedRows.length === 0}
            >
              Append to palette
            </Button>
          </div>
        </div>

        {/* Parsed preview */}
        {rows.length > 0 && (
          <div className="border border-[color:var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[color:var(--color-text-dim)] text-[10px] uppercase tracking-wider">
                  <th className="text-left font-normal px-3 py-2 border-b border-[color:var(--color-border)]">
                    Input
                  </th>
                  <th className="text-left font-normal px-3 py-2 border-b border-[color:var(--color-border)] w-14">
                    Preview
                  </th>
                  <th className="text-left font-normal px-3 py-2 border-b border-[color:var(--color-border)]">
                    {FORMAT_LABELS[target]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={`${r.input}-${i}`}
                    className="border-b border-[color:var(--color-border)]/60 last:border-0"
                  >
                    <td className="mono px-3 py-1.5 text-[12px] text-[color:var(--color-text-muted)]">
                      {r.input}
                    </td>
                    <td className="px-3 py-1.5">
                      {r.color ? (
                        <Swatch color={r.color} size={22} rounded="sm" />
                      ) : (
                        <span className="text-[color:var(--color-danger)] text-xs">fail</span>
                      )}
                    </td>
                    <td className="mono px-3 py-1.5 text-[12px] text-[color:var(--color-text)]">
                      {r.color ? formatColor(r.color, target) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
