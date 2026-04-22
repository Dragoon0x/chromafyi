import { formatColor } from '@/color/format';
import type { Palette } from '@/store/types';
import { slug } from './util';

export function exportJson(palette: Palette): string {
  return JSON.stringify(
    {
      name: palette.name,
      swatches: palette.swatches.map((s, i) => ({
        id: slug(s.label ?? `swatch-${i + 1}`),
        label: s.label ?? `Swatch ${i + 1}`,
        oklch: formatColor(s.color, 'oklch'),
        hex: formatColor(s.color, 'hex'),
        rgb: formatColor(s.color, 'rgb'),
        p3: formatColor(s.color, 'p3'),
      })),
    },
    null,
    2,
  );
}

export function exportDesignTokens(palette: Palette): string {
  // W3C Design Tokens Format Module (draft). See https://design-tokens.github.io/community-group/
  const colors: Record<string, { $value: string; $type: 'color' }> = {};
  palette.swatches.forEach((s, i) => {
    const key = slug(s.label ?? `swatch-${i + 1}`);
    colors[key] = { $value: formatColor(s.color, 'oklch'), $type: 'color' };
  });
  return JSON.stringify({ [slug(palette.name || 'palette')]: colors }, null, 2);
}

export function exportFigmaVariables(palette: Palette): string {
  // Figma Variables JSON (collection format used by Tokens Studio and Figma import)
  const variables: Record<string, { value: string; type: 'color' }> = {};
  palette.swatches.forEach((s, i) => {
    const key = slug(s.label ?? `swatch-${i + 1}`);
    variables[key] = { value: formatColor(s.color, 'hex'), type: 'color' };
  });
  return JSON.stringify(
    {
      collection: palette.name || 'chroma.fyi palette',
      mode: 'default',
      variables,
    },
    null,
    2,
  );
}
