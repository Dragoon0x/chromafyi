import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'ghost' | 'accent' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

const variantClass: Record<Variant, string> = {
  default:
    'bg-[color:var(--color-surface-2)] hover:bg-[color:var(--color-border)] text-[color:var(--color-text)] border border-[color:var(--color-border)]',
  ghost:
    'bg-transparent hover:bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]',
  accent:
    'bg-[color:var(--color-accent)] hover:brightness-110 text-[color:var(--color-bg)] font-medium',
  danger:
    'bg-transparent hover:bg-[color:var(--color-danger)] hover:text-[color:var(--color-bg)] text-[color:var(--color-danger)] border border-[color:var(--color-danger)]',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-7 px-2 text-xs',
  md: 'h-8 px-3 text-sm',
  lg: 'h-10 px-4 text-sm',
};

export function Button({
  variant = 'default',
  size = 'md',
  iconLeft,
  iconRight,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      type={rest.type ?? 'button'}
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] transition-colors disabled:opacity-40 disabled:pointer-events-none ${variantClass[variant]} ${sizeClass[size]} ${className}`}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
