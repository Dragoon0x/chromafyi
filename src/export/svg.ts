import { oklchToCssString, oklchToHex } from '@/color/convert';
import type { Palette } from '@/store/types';
import { slug } from './util';

export function exportSvg(palette: Palette): string {
  const cell = 96;
  const gap = 8;
  const labelH = 40;
  const n = palette.swatches.length;
  const width = n * cell + (n - 1) * gap + 40;
  const height = cell + labelH + 60;
  const cells = palette.swatches
    .map((s, i) => {
      const x = 20 + i * (cell + gap);
      const label = s.label ?? slug(`swatch ${i + 1}`);
      return `
  <g>
    <rect x="${x}" y="30" width="${cell}" height="${cell}" rx="6" fill="${oklchToHex(s.color)}" />
    <text x="${x + cell / 2}" y="${30 + cell + 18}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="currentColor" opacity="0.6">${label}</text>
    <text x="${x + cell / 2}" y="${30 + cell + 32}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="9" fill="currentColor" opacity="0.4">${oklchToCssString(s.color)}</text>
  </g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="font-family: ui-monospace, monospace;">
  <title>${palette.name}</title>${cells}
</svg>
`;
}
