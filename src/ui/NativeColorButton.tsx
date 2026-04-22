import { oklchToHex, parseInput } from '@/color/convert';
import type { OKLCH } from '@/color/types';
import { type ReactNode, useId, useRef } from 'react';

type Props = {
  value: OKLCH;
  onChange: (c: OKLCH) => void;
  label?: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
};

/**
 * A button that opens the browser's native <input type="color"> picker.
 * Uses a <label htmlFor> trigger so the picker opens reliably across
 * browsers (including Safari) — direct `.click()` on a hidden input is
 * sometimes blocked by user-gesture rules.
 */
export function NativeColorButton({
  value,
  onChange,
  label = 'Open color picker',
  title,
  className = '',
  style,
  children,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <>
      <label
        htmlFor={id}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={label}
        title={title ?? label}
        className={`cursor-pointer ${className}`}
        style={style}
      >
        {children}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="color"
        value={oklchToHex(value)}
        onChange={(e) => {
          const parsed = parseInput(e.target.value);
          if (parsed) onChange(parsed);
        }}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </>
  );
}
