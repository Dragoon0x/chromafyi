import { oklchToCssString, parseInput } from '@/color/convert';
import type { OKLCH } from '@/color/types';
import { useEffect, useState } from 'react';

export function InputRow({
  color,
  onCommit,
}: {
  color: OKLCH;
  onCommit: (c: OKLCH) => void;
}) {
  const [value, setValue] = useState(oklchToCssString(color));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setValue(oklchToCssString(color));
    setInvalid(false);
  }, [color]);

  const commit = () => {
    const parsed = parseInput(value);
    if (parsed) {
      setInvalid(false);
      onCommit(parsed);
    } else {
      setInvalid(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="color-input">
        Paste any color
      </label>
      <input
        id="color-input"
        type="text"
        spellCheck={false}
        autoComplete="off"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setInvalid(false);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
            (e.target as HTMLInputElement).select();
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            setValue(oklchToCssString(color));
            setInvalid(false);
          }
        }}
        placeholder="oklch(0.78 0.17 200) · #1e90ff · hsl(210 100% 50%)"
        className={`flex-1 mono h-9 px-3 rounded-[var(--radius-sm)] bg-[color:var(--color-surface)] border text-sm text-[color:var(--color-text)] placeholder-[color:var(--color-text-dim)] focus-visible:border-[color:var(--color-accent)] focus-visible:outline-none transition-colors ${
          invalid ? 'border-[color:var(--color-danger)]' : 'border-[color:var(--color-border)]'
        }`}
      />
      {invalid && (
        <span
          role="alert"
          className="mono text-[11px] text-[color:var(--color-danger)] whitespace-nowrap"
        >
          can't parse
        </span>
      )}
    </div>
  );
}
