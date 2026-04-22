# chroma.fyi

A modern **OKLCH color studio**. Local-first, URL-shareable, keyboard-driven. Free. Open source. No sign-in. Ever.

Ten modules for working with color in the OKLCH space — inspector, tonal matrix, palette builder, gradient lab, contrast checker, gamut visualizer, color-vision-deficiency simulator, image extractor, bulk converter, export studio.

## Features

- **Inspector** — tune any color with L/C/H sliders; see every format (OKLCH, OKLab, RGB, HEX, HSL, P3, CIE Lab, CIE LCH) update live.
- **Tonal Matrix** — huetone-style grid of hue × lightness; APCA + WCAG 2 contrast on hover; export whole grid as a palette.
- **Palette Builder** — 2–12 swatches with analogous / complementary / triadic / tetradic / split-complementary / monochromatic harmony helpers; per-swatch L/C/H locks.
- **Gradient Lab** — multi-stop gradient rendered in OKLab, OKLCH, and sRGB side-by-side so you can see why OKLab is perceptually uniform.
- **Contrast Checker** — APCA (correct for type) and WCAG 2 side-by-side with live preview and "pick a pair from your palette".
- **Gamut Visualizer** — chroma × hue slice at fixed L, shaded by sRGB / Display-P3 / Rec 2020 membership.
- **CVD Simulator** — preview the palette through deuteranopia, protanopia, tritanopia (Brettel/Viénot 1999 in linear sRGB).
- **Image Extract** — drag in an image, get a palette via k-means clustering in OKLab.
- **Bulk Converter** — paste a list of any CSS colors, get any format out.
- **Export Studio** — CSS variables (with `@supports` fallback), Tailwind v4 `@theme`, Tailwind config.js, JSON, W3C Design Tokens, Figma Variables, SVG swatch sheet.

Cross-cutting:

- **Everything is URL-shareable** via `#s=…` hash (lz-string compressed). Copy a link, paste it in another browser, see the same palette — no account required.
- **Everything persists locally** via `localStorage` (no quota worries).
- **⌘K command palette** — navigate, copy, paste, everything.
- **Keyboard-first** — `g i`, `g m`, `g p`, `g g`, `g c`, `g e` etc. to navigate; arrow keys nudge sliders; `?` shows shortcuts.
- **PWA** — installable, works offline.
- **Dark / light / system** themes. The app dogfoods its own OKLCH palette.

## Stack

- **Vite 6 + React 19 + TypeScript (strict)**
- **Tailwind CSS v4** — native OKLCH tokens via `@theme`
- **Zustand 5** — ~1 kB state store
- **culori 4** — color math, gamut mapping (CSS Color 4 algorithm)
- **cmdk** — command palette
- **lz-string** — URL hash state compression
- **vite-plugin-pwa** — offline + installable
- **Biome** — lint + format in one tool
- **Vitest 3** — unit tests (46 color-math tests)

## Getting started

Requires Node 20 or newer. pnpm recommended.

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # run unit tests
pnpm typecheck    # strict TS check
pnpm lint         # Biome lint
pnpm build        # production build to dist/
pnpm preview      # serve the built app
```

## Deploy to Vercel

Push this repo to GitHub, then import into Vercel. Framework preset: **Vite**. No configuration needed.

```bash
vercel deploy     # or just connect the repo in the Vercel dashboard
```

Output directory is `dist/`, build command is `pnpm build`.

## Architecture

```
src/
├─ color/            color math — conversion, gamut, APCA, WCAG, CVD, interpolation, harmony, k-means
├─ store/            zustand store + localStorage + URL hash sync + migrations
├─ shell/            LeftRail, Workspace, StatusBar, CommandPalette, ShortcutsSheet, ThemeController
├─ modules/          the ten tool panels (each lazy-loaded)
│  ├─ inspector/
│  ├─ matrix/
│  ├─ palette/
│  ├─ gradient/
│  ├─ contrast/
│  ├─ gamut/
│  ├─ cvd/
│  ├─ image/
│  ├─ bulk/
│  └─ export/
├─ ui/               Slider, Swatch, Button, Chip, CopyButton
├─ hooks/            useCopy, useHotkey, useGoToChord
├─ export/           output generators (css, tailwind, json, figma, svg)
└─ styles/           `@import "tailwindcss"` + `@theme` tokens
tests/
└─ color/            unit tests for all color math
```

State lives in a single Zustand store. The store persists a full snapshot to `localStorage` (debounced) and a shareable subset to the URL hash (debounced). Hash wins on load, so URLs are always shareable.

## OKLCH correctness notes

- L ∈ [0, 1], C ∈ [0, ~0.4], H ∈ [0, 360). All inputs clamped on ingest.
- Gamut mapping uses culori's CSS Color 4 algorithm (`clampChroma` with ΔE thresholds).
- Hue interpolation uses shortest path across 0°.
- APCA implementation is ported from Andrew Somers' published `apca-w3`.
- CVD transforms are applied in linear sRGB (Viénot/Brettel/Mollon 1999).
- When a color is out of sRGB, the inspector surfaces a "Snap to sRGB" action that returns a ΔE-minimized in-gamut nearest color.

## Contributing

Issues and PRs welcome. Keep PRs small, include tests for any color math changes, and don't add a backend.

## License

MIT — see [LICENSE](./LICENSE).
