import { apcaContrast, apcaVerdict } from '@/color/apca';
import { clampOklch, oklchToCssString } from '@/color/convert';
import { toGamut, widestGamut } from '@/color/gamut';
import type { OKLCH } from '@/color/types';
import { wcagContrast } from '@/color/wcag';
import { useStore } from '@/store';
import { nextId } from '@/store/defaults';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { Lock, LockOpen, Plus, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';

export function Matrix() {
  const matrix = useStore((s) => s.matrix);
  const setMatrix = useStore((s) => s.setMatrix);
  const pickRecent = useStore((s) => s.pickRecent);
  const setPalette = useStore((s) => s.setPalette);
  const [gamut, setGamut] = useState<'srgb' | 'p3'>('srgb');
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const grid: OKLCH[][] = useMemo(() => {
    return matrix.hues.map((h) =>
      matrix.lightnessStops.map((l) => toGamut(clampOklch({ l, c: matrix.chroma, h }), gamut)),
    );
  }, [matrix.hues, matrix.lightnessStops, matrix.chroma, gamut]);

  const addHue = () => {
    const newHue = (matrix.hues[matrix.hues.length - 1] ?? 0) + 30;
    setMatrix({ hues: [...matrix.hues, newHue % 360] });
  };

  const removeHue = (idx: number) => {
    setMatrix({
      hues: matrix.hues.filter((_, i) => i !== idx),
      lockedHues: matrix.lockedHues
        .filter((i) => i !== idx)
        .map((i) => (i > idx ? i - 1 : i)),
    });
  };

  const toggleHueLock = (idx: number) => {
    const set = new Set(matrix.lockedHues);
    if (set.has(idx)) set.delete(idx);
    else set.add(idx);
    setMatrix({ lockedHues: Array.from(set).sort((a, b) => a - b) });
  };

  const randomize = () => {
    const n = matrix.hues.length;
    const start = Math.random() * 360;
    const fresh = Array.from({ length: n }, (_, i) => (start + (i * 360) / n) % 360);
    const locked = new Set(matrix.lockedHues);
    const hues = matrix.hues.map((existing, i) => (locked.has(i) ? existing : (fresh[i] ?? existing)));
    setMatrix({ hues });
  };

  const exportAsPalette = () => {
    const swatches = grid.flat().map((color) => ({ id: nextId(), color }));
    setPalette({
      id: nextId(),
      name: `Matrix: ${matrix.hues.length}×${matrix.lightnessStops.length}`,
      swatches,
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-5">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-medium">Tonal matrix</h1>
            <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
              Hue × lightness grid. Click a cell to adopt. Hover for contrast.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              role="radiogroup"
              aria-label="Target gamut"
              className="flex items-center border border-[color:var(--color-border)] rounded-[var(--radius-sm)] p-[2px]"
            >
              {(['srgb', 'p3'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={gamut === g}
                  onClick={() => setGamut(g)}
                  className={`h-6 px-2 text-[11px] mono uppercase rounded-[3px] transition-colors ${
                    gamut === g
                      ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]'
                      : 'text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]'
                  }`}
                >
                  {g === 'srgb' ? 'sRGB' : 'P3'}
                </button>
              ))}
            </div>
            <Button size="sm" variant="ghost" iconLeft={<Shuffle size={13} />} onClick={randomize}>
              Randomize hues
            </Button>
            <Button size="sm" variant="ghost" iconLeft={<Plus size={13} />} onClick={addHue}>
              Add hue
            </Button>
            <Button size="sm" onClick={exportAsPalette}>
              Export as palette
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <span className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
            Chroma {matrix.chroma.toFixed(3)}
          </span>
          <Slider
            label="Chroma"
            value={matrix.chroma}
            min={0}
            max={0.3}
            step={0.002}
            keyStep={0.005}
            shiftStep={0.02}
            onChange={(v) => setMatrix({ chroma: v })}
            trackGradient={`linear-gradient(to right, ${matrix.lightnessStops
              .slice()
              .reverse()
              .map(
                (l) =>
                  `oklch(${l} ${matrix.chroma} ${matrix.hues[Math.floor(matrix.hues.length / 2)] ?? 200})`,
              )
              .join(', ')})`}
          />
        </div>

        <div className="border border-[color:var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `72px repeat(${matrix.lightnessStops.length}, minmax(0,1fr))`,
            }}
          >
            <div className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)] p-2 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
              hue \ L
            </div>
            {matrix.lightnessStops.map((l, i) => (
              <div
                key={`ls-${i}`}
                className="mono text-[10px] text-[color:var(--color-text-dim)] text-center p-2 border-b border-l border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
              >
                {(l * 100).toFixed(0)}
              </div>
            ))}
            {matrix.hues.map((h, rowIdx) => (
              <MatrixRow
                key={`hue-${rowIdx}`}
                hue={h}
                rowIdx={rowIdx}
                locked={matrix.lockedHues.includes(rowIdx)}
                cells={grid[rowIdx] ?? []}
                onHueChange={(nextH) =>
                  setMatrix({
                    hues: matrix.hues.map((x, i) => (i === rowIdx ? nextH : x)),
                  })
                }
                onToggleLock={() => toggleHueLock(rowIdx)}
                onRemove={() => removeHue(rowIdx)}
                onCellClick={(c) => pickRecent(c)}
                onCellHover={(col) => setHoveredCell({ row: rowIdx, col })}
                onCellLeave={() => setHoveredCell(null)}
                hoveredCol={hoveredCell?.row === rowIdx ? hoveredCell.col : null}
              />
            ))}
          </div>
        </div>

        {hoveredCell && (
          <div className="fade-in text-xs mono text-[color:var(--color-text-muted)] flex items-center gap-4">
            <CellInspect cell={grid[hoveredCell.row]?.[hoveredCell.col]} />
          </div>
        )}
      </div>
    </div>
  );
}

function MatrixRow({
  hue,
  rowIdx,
  locked,
  cells,
  onHueChange,
  onToggleLock,
  onRemove,
  onCellClick,
  onCellHover,
  onCellLeave,
  hoveredCol,
}: {
  hue: number;
  rowIdx: number;
  locked: boolean;
  cells: OKLCH[];
  onHueChange: (h: number) => void;
  onToggleLock: () => void;
  onRemove: () => void;
  onCellClick: (c: OKLCH) => void;
  onCellHover: (col: number) => void;
  onCellLeave: () => void;
  hoveredCol: number | null;
}) {
  return (
    <>
      <div className="p-1.5 border-l-0 border-t border-[color:var(--color-border)] flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleLock}
          aria-label={locked ? 'Unlock hue row' : 'Lock hue row (skip on randomize)'}
          title={locked ? 'Locked — randomize skips this row' : 'Lock to skip on randomize'}
          className={`w-5 h-5 inline-flex items-center justify-center rounded-[var(--radius-xs)] transition-colors ${
            locked
              ? 'text-[color:var(--color-accent)] bg-[color:color-mix(in_oklab,var(--color-accent)_15%,transparent)]'
              : 'text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]'
          }`}
        >
          {locked ? <Lock size={10} /> : <LockOpen size={10} />}
        </button>
        <input
          aria-label={`Hue row ${rowIdx + 1}`}
          type="number"
          min={0}
          max={360}
          value={Math.round(hue)}
          onChange={(e) => {
            const next = Number.parseFloat(e.target.value);
            if (Number.isFinite(next)) onHueChange(((next % 360) + 360) % 360);
          }}
          className="mono w-12 h-6 px-1 text-[11px] text-right bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-[var(--radius-xs)] outline-none focus-visible:border-[color:var(--color-accent)]"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove hue row"
          className="w-5 h-5 inline-flex items-center justify-center text-[color:var(--color-text-dim)] hover:text-[color:var(--color-danger)] transition-colors"
        >
          ×
        </button>
      </div>
      {cells.map((color, col) => (
        <button
          key={`${rowIdx}-${col}`}
          type="button"
          onClick={() => onCellClick(color)}
          onMouseEnter={() => onCellHover(col)}
          onMouseLeave={onCellLeave}
          className={`relative h-14 border-t border-l border-[color:var(--color-border)] transition-all ${
            hoveredCol === col ? 'ring-1 ring-inset ring-[color:var(--color-accent)] z-10' : ''
          }`}
          style={{ background: oklchToCssString(color) }}
          aria-label={`color at row ${rowIdx + 1}, col ${col + 1}: ${oklchToCssString(color)}`}
        />
      ))}
    </>
  );
}

function CellInspect({ cell }: { cell: OKLCH | undefined }) {
  if (!cell) return null;
  const white = { l: 1, c: 0, h: 0 };
  const black = { l: 0, c: 0, h: 0 };
  const apcaOnWhite = apcaContrast(cell, white);
  const apcaOnBlack = apcaContrast(cell, black);
  const wcagOnWhite = wcagContrast(cell, white);
  const wcagOnBlack = wcagContrast(cell, black);
  const gamut = widestGamut(cell);
  return (
    <>
      <span
        className="w-4 h-4 rounded-[var(--radius-xs)] border border-black/20"
        style={{ background: oklchToCssString(cell) }}
      />
      <span>{oklchToCssString(cell)}</span>
      <span className="text-[color:var(--color-text-dim)]">·</span>
      <span>
        APCA on white{' '}
        <strong className={stat(apcaVerdict(apcaOnWhite))}>{apcaOnWhite.toFixed(0)}</strong>
      </span>
      <span>
        · on black{' '}
        <strong className={stat(apcaVerdict(apcaOnBlack))}>{apcaOnBlack.toFixed(0)}</strong>
      </span>
      <span className="text-[color:var(--color-text-dim)]">·</span>
      <span>
        WCAG {wcagOnWhite.toFixed(1)}:1 / {wcagOnBlack.toFixed(1)}:1
      </span>
      <span className="text-[color:var(--color-text-dim)]">·</span>
      <span>{gamut}</span>
    </>
  );
}

function stat(v: 'pass' | 'warn' | 'fail'): string {
  return v === 'pass'
    ? 'text-[color:var(--color-ok)]'
    : v === 'warn'
      ? 'text-[color:var(--color-warn)]'
      : 'text-[color:var(--color-danger)]';
}
