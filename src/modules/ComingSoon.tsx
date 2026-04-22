import type { TabId } from '@/store/types';

const HINTS: Partial<Record<TabId, string>> = {
  matrix: 'Tonal matrix — flagship view. Hue × lightness grid with APCA overlays.',
  palette: 'Palette builder with harmony helpers and per-swatch locks.',
  gradient: 'Gradient lab: OKLab vs OKLCH vs sRGB side by side.',
  contrast: 'APCA + WCAG 2 contrast, paired from your palette.',
  gamut: 'Gamut visualizer: 2D slice, sRGB / P3 / Rec 2020 boundaries.',
  cvd: 'CVD simulator: preview palettes through deuteranopia, protanopia, tritanopia.',
  image: 'Drag an image, extract a palette via k-means in OKLab.',
  bulk: 'Paste a list of colors, get all formats.',
  export: 'Export to CSS vars, Tailwind v4, Design Tokens, Figma, SVG.',
};

export function ComingSoon({ tab }: { tab: TabId }) {
  return (
    <div className="h-full grid place-items-center">
      <div className="max-w-md text-center px-6">
        <div className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)] mb-3">
          {tab}
        </div>
        <h2 className="text-lg mb-2">Coming in the next milestone</h2>
        <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
          {HINTS[tab] ?? 'This module is being crafted. Use the Inspector in the meantime.'}
        </p>
      </div>
    </div>
  );
}
