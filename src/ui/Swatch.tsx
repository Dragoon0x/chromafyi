import { oklchToCssString } from '@/color/convert';
import { widestGamut } from '@/color/gamut';
import type { OKLCH } from '@/color/types';

type Props = {
  color: OKLCH;
  size?: number | 'full';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  bordered?: boolean;
  onClick?: () => void;
  label?: string;
  className?: string;
};

const radiusMap = {
  sm: '4px',
  md: '6px',
  lg: '10px',
  full: '999px',
} as const;

export function Swatch({
  color,
  size = 32,
  rounded = 'sm',
  bordered = true,
  onClick,
  label,
  className = '',
}: Props) {
  const css = oklchToCssString(color);
  const gamut = widestGamut(color);
  const outOfSrgb = gamut !== 'srgb';
  const style: React.CSSProperties = {
    background: css,
    borderRadius: radiusMap[rounded],
    width: size === 'full' ? '100%' : `${size}px`,
    height: size === 'full' ? '100%' : `${size}px`,
    border: bordered ? '1px solid color-mix(in oklab, black 30%, transparent)' : 'none',
    boxShadow: bordered ? 'inset 0 0 0 1px color-mix(in oklab, white 15%, transparent)' : 'none',
    flexShrink: 0,
    position: 'relative',
  };
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={label ?? `color ${css}`}
      title={label ?? css}
      style={style}
      className={`${onClick ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''} ${className}`}
    >
      {outOfSrgb && size !== 'full' && (size as number) > 18 && (
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0.5 text-[8px] font-medium"
          style={{
            color: 'oklch(1 0 0)',
            textShadow: '0 0 2px oklch(0 0 0 / 0.6)',
          }}
        >
          {gamut === 'p3' ? 'P3' : gamut === 'rec2020' ? '2020' : '⚠'}
        </span>
      )}
    </Tag>
  );
}
