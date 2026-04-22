import type { ReactNode } from 'react';

type Tone = 'default' | 'ok' | 'warn' | 'danger' | 'accent';

const toneClass: Record<Tone, string> = {
  default:
    'bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)] border-[color:var(--color-border)]',
  ok: 'bg-transparent text-[color:var(--color-ok)] border-[color:var(--color-ok)]',
  warn: 'bg-transparent text-[color:var(--color-warn)] border-[color:var(--color-warn)]',
  danger: 'bg-transparent text-[color:var(--color-danger)] border-[color:var(--color-danger)]',
  accent: 'bg-transparent text-[color:var(--color-accent)] border-[color:var(--color-accent)]',
};

export function Chip({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 h-5 px-1.5 text-[10px] font-medium uppercase tracking-wider rounded-[var(--radius-xs)] border ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
