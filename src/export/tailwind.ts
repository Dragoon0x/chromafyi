import { oklchToCssString } from '@/color/convert';
import type { Palette } from '@/store/types';
import { slug } from './util';

export function exportTailwindConfig(palette: Palette): string {
  const entries = palette.swatches
    .map((s, i) => {
      const key = slug(s.label ?? `swatch-${i + 1}`);
      return `    '${key}': '${oklchToCssString(s.color)}'`;
    })
    .join(',\n');
  return `/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
${entries}
      },
    },
  },
};
`;
}
