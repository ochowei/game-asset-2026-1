# Base Authoring Pipeline

> Status: introduced in v1.4.0 for the medieval-fantasy theme. Other themes remain on the v1.3.1 hand-coded primitive model documented in `THEME-AUTHORING.md`.

## What this is

Procforge's authoring pipeline for "Path B" themes separates the **base SVG** (the silhouette of e.g. "sword") from the **runtime variation logic** (palette swap, light transform, decoration). Bases are committed SVG files; the runtime never reads files at request time.

```
AUTHORING TIME (one-time, by author)        RUNTIME (in buyer's machine)
────────────────────────────────────        ──────────────────────────────
Draft candidate SVG silhouettes              generateOne({theme, seed, size})
  (typically inspired by Lucide /                 ↓ deterministic RNG
   Phosphor / Tabler icon libraries,             ↓ pick base (RNG)
   adapted to the 64-viewBox conventions)        ↓ palette substitution
   ↓                                              ↓ light transform (RNG)
author curates (accept/reject)                   ↓ emit final SVG fragment
   ↓                                              ↓ no AI involvement
SVG committed → build:bases → *.bases.ts          ↓ no network calls
   ↓
pnpm test + visual QA
```

## When to use

Use this pipeline when authoring a new theme (or converting an existing theme) if you have a clear set of subject silhouettes and want runtime palette/transform variation on top. The hand-coded primitive model from v1.3.1 is still valid; pick whichever fits your workflow.

## Recommended base sources

- **Open-source icon libraries** (Lucide / ISC, Phosphor / MIT, Tabler / MIT) — proven recognizability at small sizes; adapt the path data into the 64-viewBox convention. Attribute the upstream library in the repo's NOTICE / README.
- **Hand-drawn in Figma / Inkscape** — if you have design bandwidth and want full ownership of the silhouette. Export as SVG, drop into `_assets/`.
- **Adapted from public-domain icon sets** — same as above, with PD / CC0 attribution as appropriate.

The medieval-fantasy theme's bases (v1.4.0) are drawn in Lucide-style aesthetic — clean line-icon silhouettes — without verbatim copying upstream path data. They are released under MIT alongside the rest of the codebase.

## End-to-end loop

1. **Pick subject silhouette concepts.** For each subject, identify 5 silhouette-distinct concepts (e.g. for "sword": longsword, broadsword, dagger, greatsword, crossed-swords). Aim for shape diversity, not just colour diversity (colour comes from the runtime palette layer).
2. **Set up scratch dir.** `mkdir -p /tmp/path-b-candidates/<subject>`
3. **Draft each base SVG** as a complete `<svg>` document at `viewBox="0 0 64 64"`. Use palette placeholder tokens (`{{primary}}`, `{{secondary}}`, `{{accent}}`, `{{neutral}}`) in `fill=` and `stroke=` attributes only. Save to `/tmp/path-b-candidates/<subject>/cand-N.svg`.
4. **Render previews:** `pnpm tsx scripts/qa-base-preview.ts /tmp/path-b-candidates/<subject>` writes PNGs at 16/32/64/128 plus an `index.html` for browser inspection.
5. **Curate.** Apply the rubric below. Re-draft as needed.
6. **Copy curated bases** into `packages/themes/<theme>/src/subjects/_assets/<subject>-{1..5}.svg`.
7. **Run** `pnpm build:bases` to regenerate `<subject>.bases.ts`.
8. **Run tests:** `pnpm --filter @procforge/theme-<theme> test`
9. **Commit** SVGs + bases + (if newly converting a primitive) the rewritten `<subject>.ts` and test together.

## SVG conventions (non-negotiable)

Every committed base SVG must satisfy:

1. `viewBox="0 0 64 64"` exactly.
2. Subject silhouette stays inside the inner box `4..60` (~10% padding).
3. Single `<g>` element wraps all geometry inside the `<svg>`.
4. Drawn in **canonical orientation** (sword point UP, axe haft VERTICAL, potion bottle UPRIGHT). The runtime ±8° transform handles small variation; bases drawn slanted compound to ugly angles.
5. Palette colours expressed only as placeholder tokens:
   - `{{primary}}`, `{{secondary}}`, `{{accent}}`, `{{neutral}}`
6. Tokens appear in `fill="{{role}}"` and `stroke="{{role}}"` attributes.
7. Stroke widths inline as `stroke-width` numeric values, **≥ 2** (legibility at 32 px).
8. No `<defs>`, `<style>`, `<image>`, `<script>`, no `xlink:href`.
9. ASCII characters only.

`scripts/build-bases.ts` validates these on build; `bases-validation.test.ts` re-validates in the test suite.

## Curation rubric (rejection conditions)

A candidate base is rejected if any of:

- Silhouette doesn't read as the named subject at 32 px to a non-author reviewer. (This is the highest-stakes test — if the silhouette is ambiguous, the icon fails its core purpose.)
- The base silhouette could be mistaken for an off-theme subject (e.g. a "scroll" that reads as a flag, or a "gemstone" that reads as a leaf or egg). The icon must be **only** the named subject.
- A palette token is missing or wired to the wrong semantic role (e.g. `{{accent}}` used as the main body fill).
- Path data is messy: duplicate or zero-area subpaths, off-grid coordinates more than 0.5 unit from the integer/half-integer grid, attribute noise, unused wrapper `<g>`s.
- Visual similarity to another already-shipped base for the same subject is too high — the 5 bases must be visually distinct **in silhouette**, not just colour assignment.
- Violates any SVG convention above.

## Per-subject mirror eligibility

Each primitive declares `allowMirror: boolean` when calling `applyBaseVariation`. Set to `false` for asymmetric subjects (sword, axe, scroll, anything with a directional handle or one-sided detail). Set to `true` only when the subject is left-right symmetric (shield, gem, potion, ring).

## License posture

The repo is MIT.

Base SVGs in `_assets/` are author-drawn (or adapted from open-source icon libraries with appropriate attribution) and released under MIT alongside the rest of the codebase. If you adapt path data from Lucide (ISC), Phosphor (MIT), or Tabler (MIT), include the upstream attribution in a NOTICE file.

No AI is invoked at runtime. Buyers' generated icons depend only on Procforge code and the committed bases.

## A note on the v1.4.0 base history

The v1.4.0 medieval-fantasy bases went through one rejected iteration:

- Initial draft: 30 bases generated by an LLM under a free-design prompt. Rejected at PR review for design drift (off-theme silhouettes, missing facet detail on gemstones, repeated potion silhouettes).
- Final shipped: 30 bases drawn to **prescriptive silhouette specifications** (specific Lucide-style shape briefs per base), addressing the review concerns.

The takeaway: an LLM in the authoring loop is acceptable as a tool, but design-taste decisions (which silhouette concepts to ship, how to enforce subject-name integrity) belong to the author. Free-design prompts produce drift; prescriptive prompts produce reliable transcription.
