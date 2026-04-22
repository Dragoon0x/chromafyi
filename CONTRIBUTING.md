# Contributing

Thanks for looking at chroma.fyi. A few notes:

## Principles

- **Local-first.** Never add a backend, auth, or analytics beyond Vercel's built-in.
- **URL-shareable.** New state that belongs to the user should round-trip through the URL hash.
- **Correctness > features.** OKLCH math has subtleties. Add a test for every algorithmic change.
- **Keyboard-reachable.** Every new action should be runnable with no pointer (command palette counts).
- **Small bundle.** The initial route must stay under 100 kB gzipped. Lazy-load non-Inspector modules.

## Dev flow

```bash
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

CI will block a PR that fails any of the above.

## Color math rules

- Clamp inputs on ingest: `L ∈ [0,1]`, `C ≥ 0`, `H` normalized to `[0, 360)`.
- Use `culori`'s CSS Color 4 gamut mapping (`clampChroma`) — don't roll your own clipping.
- Interpolate in **OKLab** by default. OKLCH uses shortest-path hue.
- CVD transforms run in linear sRGB. Don't apply matrices to gamma-encoded channels.

## PR checklist

- [ ] Added or updated tests for any changed color math.
- [ ] Typecheck passes (`pnpm typecheck`).
- [ ] Lint passes (`pnpm lint`).
- [ ] Build passes and the initial-route bundle stays under 100 kB gz (`pnpm build` output).
- [ ] Keyboard path documented, if new action.
