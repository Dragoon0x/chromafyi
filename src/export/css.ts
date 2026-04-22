import { oklchToCssString, oklchToHex } from '@/color/convert';
import { inGamut, toGamut } from '@/color/gamut';
import type { Palette } from '@/store/types';
import { slug } from './util';

export function exportCssVars(palette: Palette, prefix = '--color'): string {
  const lines = [':root {'];
  for (const s of palette.swatches) {
    const key = slug(s.label ?? `swatch-${palette.swatches.indexOf(s) + 1}`);
    lines.push(`  ${prefix}-${key}: ${oklchToCssString(s.color)};`);
  }
  lines.push('}');
  return lines.join('\n');
}

export function exportCssWithFallback(palette: Palette, prefix = '--color'): string {
  const lines = [':root {'];
  for (const s of palette.swatches) {
    const key = slug(s.label ?? `swatch-${palette.swatches.indexOf(s) + 1}`);
    const hex = oklchToHex(inGamut(s.color, 'srgb') ? s.color : toGamut(s.color, 'srgb'));
    lines.push(`  ${prefix}-${key}: ${hex};`);
  }
  lines.push('}');
  lines.push('');
  lines.push('@supports (color: oklch(0 0 0)) {');
  lines.push('  :root {');
  for (const s of palette.swatches) {
    const key = slug(s.label ?? `swatch-${palette.swatches.indexOf(s) + 1}`);
    lines.push(`    ${prefix}-${key}: ${oklchToCssString(s.color)};`);
  }
  lines.push('  }');
  lines.push('}');
  return lines.join('\n');
}

export function exportTailwindTheme(palette: Palette): string {
  const lines = ['@theme {'];
  for (const s of palette.swatches) {
    const key = slug(s.label ?? `swatch-${palette.swatches.indexOf(s) + 1}`);
    lines.push(`  --color-${key}: ${oklchToCssString(s.color)};`);
  }
  lines.push('}');
  return lines.join('\n');
}
