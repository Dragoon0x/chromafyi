import { useCallback, useRef } from 'react';

type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  trackGradient?: string; // CSS background for track
  label: string;
  format?: (v: number) => string;
  keyStep?: number;
  shiftStep?: number;
};

export function Slider({
  value,
  min,
  max,
  step = 0.001,
  onChange,
  trackGradient,
  label,
  format,
  keyStep,
  shiftStep,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const toValue = useCallback(
    (clientX: number): number => {
      const el = ref.current;
      if (!el) return value;
      const rect = el.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const raw = min + pct * (max - min);
      const snap = Math.round(raw / step) * step;
      return Math.min(max, Math.max(min, snap));
    },
    [min, max, step, value],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    draggingRef.current = true;
    el.setPointerCapture(e.pointerId);
    onChange(toValue(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    onChange(toValue(e.clientX));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    try {
      ref.current?.releasePointerCapture(e.pointerId);
    } catch {
      // noop
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const kStep = e.shiftKey ? (shiftStep ?? keyStep ?? step * 10) : (keyStep ?? step);
    let next = value;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = Math.max(min, value - kStep);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        next = Math.min(max, value + kStep);
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      case 'PageDown':
        next = Math.max(min, value - (max - min) * 0.1);
        break;
      case 'PageUp':
        next = Math.min(max, value + (max - min) * 0.1);
        break;
      default:
        return;
    }
    e.preventDefault();
    onChange(next);
  };

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={ref}
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={format ? format(value) : value.toFixed(3)}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className="relative h-6 select-none touch-none outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] rounded-[var(--radius-sm)]"
      style={{ cursor: 'ew-resize' }}
    >
      <div
        className="absolute inset-0 rounded-[var(--radius-sm)] border border-[color:var(--color-border)]"
        style={{
          background:
            trackGradient ??
            'linear-gradient(to right, var(--color-surface), var(--color-surface-2))',
        }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-[22px] w-[10px] rounded-[3px] bg-white border border-black/40 shadow-[0_1px_3px_rgb(0_0_0_/_0.4)] pointer-events-none"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}
