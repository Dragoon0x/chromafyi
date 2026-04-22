import { useCopy } from '@/hooks/useCopy';
import { Check, Copy } from 'lucide-react';

type Props = {
  value: string;
  label?: string;
  className?: string;
  onCopy?: () => void;
};

export function CopyButton({ value, label, className = '', onCopy }: Props) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      aria-label={label ?? 'Copy'}
      title={copied ? 'Copied' : 'Copy'}
      onClick={async () => {
        const ok = await copy(value);
        if (ok) onCopy?.();
      }}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] transition-colors hover:bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] ${className}`}
    >
      {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
    </button>
  );
}
