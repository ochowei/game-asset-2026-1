# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Procforge Icons — a TypeScript pnpm monorepo that procedurally generates SVG/PNG game icons across 4 themes (medieval-fantasy, sci-fi, cozy-farm, roguelike-inventory). Output is a 200-icon `starter-pack.zip` plus an open-source generator. Node 22, pnpm 9.

## Common commands

All run from the repo root unless noted. Top-level scripts fan out to packages via pnpm filters.

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Build everything | `pnpm build` (required before running the CLI; populates each package's `dist/`) |
| Lint | `pnpm lint` (eslint at root, ignores `dist/`, `node_modules/`, `coverage/`) |
| Typecheck | `pnpm typecheck` |
| Format | `pnpm format` |
| Test all packages | `pnpm test` |
| Test one package | `pnpm --filter @procforge/core test` (likewise for `@procforge/cli`, `@procforge/theme-medieval-fantasy`, etc.) |
| Run a single test file | `pnpm --filter @procforge/core exec vitest run tests/generator.test.ts` |
| Watch mode | `pnpm --filter @procforge/core test:watch` |
| Build the official 200-icon pack | `pnpm produce-pack` (writes `starter-pack/` and `starter-pack.zip`) |
| Build the itch cover images | `pnpm produce-cover` (writes `itch-page/cover-315x250.png` and `cover-630x500.png`) |
| Visual QA sample | `pnpm qa-sample` |
| Pre-launch checklist | `pnpm prelaunch-check` (or `--ci` to skip checks needing built assets, `--strict` to fail on warnings) |
| Run the CLI | `node packages/cli/dist/cli.js --theme medieval-fantasy --count 50 --seed myseed --out my-icons --sizes 64,128` (build first) |
| Web preview dev server | `pnpm --filter @procforge/web-preview dev` (Vite at `localhost:5173`) |

CI runs: `install → build → lint → typecheck → test → produce-pack → prelaunch-check --ci`. Anything that passes locally with that sequence will pass CI.

## Architecture

The monorepo is structured around one strict invariant: **deterministic generation**. `(theme.id, seed)` produces byte-identical SVG. Changing a primitive, composer, or palette breaks that determinism by design — treat such edits as a versioning concern.

### Package roles (read in this order to understand the data flow)

- `packages/core` — pure SVG-emitting library. No IO, no DOM, no Node-only APIs. Exports `generateOne` / `generateMany`, the `Theme` and `Palette` types, primitives (`circle`, `polygon`, `path`, `star`), composers (`layer`, `mask`), and `makeRng`. **Must remain runnable in both Node and the browser** — adding a Node-only import here will break `web-preview`.
- `packages/themes/*` — thin packages that combine a palette with subsets of core's primitives/composers. Each is its own pnpm workspace package depending on `@procforge/core`. New themes are added as new packages and (optionally) registered in the CLI's `THEMES` map.
- `packages/cli` — Node-only CLI (`icongen` bin). Uses `@resvg/resvg-js` for SVG→PNG, `jszip` for packaging, `mri` for arg parsing. Exposes subpath exports (`./render`, `./pack`, `./generate`) consumed by `scripts/produce-starter-pack.ts`.
- `packages/web-preview` — Vite SPA, also packaged as an itch HTML5 zip embed.
- `scripts/produce-starter-pack.ts` — the canonical pack builder; iterates all 4 themes × 50 icons × 5 PNG sizes and writes the manifest + offline gallery + LICENSE/README that ship inside the zip.
- `scripts/prelaunch-check.ts` — automated subset of the launch checklist (zip <6 MB, 200 SVGs, 1000 PNGs, manifest shape, itch assets, repo LICENSE, v1.0.0 git tag). Source of truth for "is this releasable."

### Generation pipeline (core)

```
config (theme + seed + count + size)
  → makeRng(theme.id + ":" + seed)      # deterministic per-icon RNG
  → pick(rng, theme.composers)          # one composer per icon
  → composer(ctx { rng, palette, size, primitives })
  → SVG body string
  → svgDocument({ size, body })          # wraps in <svg viewBox …>
```

Output is consumed three ways: returned as a string (core API), written to disk + rasterised (CLI), or injected into the DOM (web-preview).

### Constraints worth knowing before editing

- **Workspace deps use `workspace:*`.** When adding a new theme package, mirror the `package.json` shape from any existing theme and add the dep to `packages/cli/package.json` + the `THEMES` map in `packages/cli/src/cli.ts` to make it CLI-selectable.
- **Each package owns its own `tsup` build, `vitest` config, and `tsconfig.json`** that extends `tsconfig.base.json`. `tsconfig.base.json` enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `verbatimModuleSyntax` — type changes that "look fine" can fail typecheck under these flags.
- **Vitest tests live in each package's `tests/` directory** (matched by `tests/**/*.test.ts`) — not colocated with sources.
- **The CLI ships pre-built `dist/`** — running the CLI without `pnpm build` first will fail because `packages/cli/dist/cli.js` won't exist or will be stale.
- **`pnpm produce-pack` must be run before `pnpm prelaunch-check`** locally (CI uses `--ci` to skip the asset-dependent checks).
- **Theme authoring details** (palette role rules, primitive function signature, registration steps): see `docs/THEME-AUTHORING.md`.

## Documentation

- `README.md` — public-facing intro and quick starts.
- `docs/ARCHITECTURE.md` — design rationale (why TS, why monorepo, why hand-written SVG strings, testing strategy).
- `docs/USAGE.md` — full CLI flag reference and output structure.
- `docs/THEME-AUTHORING.md` — step-by-step for adding a new theme package.
