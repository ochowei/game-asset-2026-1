# Procforge Icons — Future Work

**Status:** Living document of post-v1.2.0 visual quality improvements that didn't ship in the recognisability pass.
**Date:** 2026-05-04
**Scope:** Two paths to push generated-icon recognisability from "~75–85% identifiable" (v1.2.0 baseline) toward "~95%+ identifiable" without abandoning the procgen architecture.

---

## Why this document exists

The v1.2.0 recognisability pass (composer decoration distribution + 24 primitive affordance/jitter/stroke updates) lifted spot-checked recognisability from roughly 50–60% in v1.1.0 to roughly 75–85% in v1.2.0. The remaining gap is **not** uniformly distributed:

- Subjects whose silhouette was already canonical (sword, shield, animal-head, key, book) are at ceiling — further work has diminishing returns.
- Subjects built from "circle + geometry" primitives (coin, gem, ring, cog, energy-orb, chip) improved but still rely on small details (5-pointed star, radial facets, fixed teeth count) to disambiguate. At 16 px and 32 px those details fade, so per-pack recognisability drops noticeably at the smallest output sizes.
- Per-subject visual *quality* (proportions, weighting, line economy) is bounded by what an engineer-authored geometry can express without art reference.

This file captures **two distinct paths** to close that remaining gap. They are not mutually exclusive — Path A is cheap and incremental, Path B is bigger but unlocks a different positioning and Phase 2 monetisation story.

Path B was first proposed in the v1.2.0 design conversation (see PR #19 / PR #20 thread); both paths were deliberately deferred until after launch so the launch ship date wasn't compromised by either.

---

## Path A — Lucide / Phosphor reference rewrite

> **Status:** ✅ **Done as of v1.3.0** (2026-05-04). Shipped via PRs #22 (medieval-fantasy), #23 (sci-fi), #24 (cozy-farm), #25 (roguelike-inventory + CHANGELOG/ARCHITECTURE), and #26 (post-release version-string follow-ups). All 24 primitives retuned to a Lucide reference; primitive contract, RNG order, and v1.2.0 affordance hints preserved. Two structural shifts called out in CHANGELOG: medieval-fantasy `gemstone` (hex+spokes → cut-diamond) and `sword-blade` (grip semantic fix). Determinism baseline reset documented; see CHANGELOG v1.3.0 entry.
>
> Sequencing note: executed immediately after launch rather than at the M1 GTM 4-week mark suggested below. Works the same — buyer-feedback-driven decision about Path B remains open.

### Premise

The v1.1.0 spec ([`2026-05-01-game-oriented-primitives-design.md`](./superpowers/specs/2026-05-01-game-oriented-primitives-design.md) §2) named **Lucide / Phosphor / Tabler** as the visual register the icons should match. The current 24 subject primitives were authored by an engineer from intuition, not from those reference icons. Path A closes that gap by translating each primitive's SVG path coordinates from the corresponding Lucide / Phosphor reference, while preserving the procgen variation structure (jitter ranges, RNG consumption order, decoration composer).

### What stays the same

- Architecture: same 24 primitives, same `subject` composer, same `Theme.primitives` array, same CLI / pack pipeline.
- Determinism contract: each primitive remains a `(rng, palette, size, centerX, centerY, strokeWidth) => string` pure function.
- Public API: `@procforge/core` exports unchanged.
- Brand positioning: "No AI / 100% Procedural / Open-source generator" pillars unchanged — these are still hand-coded algorithms producing infinite seeded variants, just with reference-aligned base shapes.

### What changes

For each of the 24 primitives:

1. Open the corresponding Lucide / Phosphor / Tabler icon (e.g. `lucide:sword`, `phosphor:potion`, `tabler:key`) in a vector editor.
2. Extract the canonical SVG path coordinates (the "base shape").
3. Rewrite the primitive's TS file so the base path matches the reference, with the existing jitter sites (proportion, rotation, segment counts) layered on top of the reference geometry instead of engineer-drawn shapes.
4. Re-run per-primitive structural tests (no test contract changes — outputs are byte-different but structure is the same).
5. Spot-check at 16/32/64/128/256 px.

### Effort

- **Per primitive:** ~1–2 hours (find reference, extract paths, port to TS, verify tests, visually QA).
- **Total:** 3–5 days for 24 primitives.
- **Risk:** Low. Same architecture, same tests, same CLI. Only RNG byte-output changes (= determinism baseline reset, third in the project — release as v1.3.0).

### Cost / benefit

| Dimension | Path A |
|---|---|
| Engineering cost | 3–5 days |
| Design / art cost | $0 (uses MIT-licensed reference icons as visual *inspiration*, not as redistributed assets) |
| Brand impact | Positive — finally lives up to "Lucide / Phosphor register" promise in the spec |
| Architecture impact | None |
| Phase 2 impact | None — Phase 2 expansion packs continue to ship as new primitive sets in the same shape |
| Determinism baseline | Reset (v1.2.0 → v1.3.0). Document in CHANGELOG. |
| Recognisability lift (estimate) | 75–85% → 88–93% |
| Reversibility | Trivial — git revert |

### Scope cautions

- **Don't** redistribute Lucide / Phosphor SVG files — only extract path coordinates as inspiration for hand-written TS code. The Lucide ISC licence and Phosphor MIT licence both allow this, but bundling their SVG files into Procforge would create a downstream attribution requirement that doesn't fit our "MIT, no attribution required" promise to buyers.
- **Don't** lock primitives so tightly to their reference that variation collapses. The whole point of procgen is "infinite seeds produce visibly different swords" — if every sword looks like the same Lucide sword, the procgen value proposition collapses. Keep current jitter ranges.

### Dependencies / prerequisites

- A local copy of Lucide and Phosphor icon sets (both available as npm packages or direct downloads, both free) for path coordinate extraction.
- No new runtime dependencies.

### Acceptance criteria

- All 220 existing tests pass (no test changes needed — only output bytes change).
- `pnpm produce-pack` produces 200 SVGs / 1000 PNGs as before.
- Visual spot-check: pick 24 random seeds, one per primitive type, confirm each reads as its named subject at 64 px to a non-author reviewer.
- Update `CHANGELOG.md` and `docs/ARCHITECTURE.md` baseline note.
- Tag and release v1.3.0.

### When to do this

**Pre-Phase 2** is ideal. Phase 2 expansion packs ($4.99 each) inherit the same primitive contract — getting reference quality locked in before Phase 2 means every paid pack benefits without rework.

---

## Path B — Hand-designed base SVG + procedural variation

> **Status:** ⚠️ **Partial — single-theme pilot shipped as v1.4.0** (2026-05-06). medieval-fantasy theme converted to Path B with file-based bases drawn in Lucide-style aesthetic. sci-fi / cozy-farm / roguelike-inventory remain on Path A. Brand pillars restructured to Deterministic Runtime / Procedural Variation / Open-source Generator (the original "No AI" pillar was removed; rationale in `docs/superpowers/specs/2026-05-06-path-b-v1.4.0-design.md`).
>
> Note on the journey: the v1.4.0 PR went through one rejected iteration of LLM-generated bases (PR review identified design drift) before settling on Lucide-style hand-drawn bases. The architecture (file-based bases + applyBaseVariation + procgen variation) is independent of the base-authoring method; future themes may use AI generation, hand-drawing, or icon-library adaptation as fits the author's workflow.
>
> Remaining themes are candidates for follow-up minor releases (v1.5.0–v1.7.0) using the same pipeline.

### Premise

Path A still has each primitive **fully described in code**: the engineer (or Lucide reference, in Path A) writes the SVG path coordinates inline. The expressiveness ceiling is bounded by what a single function body of TS can describe. Path B breaks that ceiling by **separating the "base shape" from the "variation logic"**:

- A **designer** (in Figma, Inkscape, or by hand on paper) produces a `base.svg` for each subject — a clean, intentionally-designed silhouette of e.g. "sword".
- A **build step** transforms each `base.svg` into a TS module exporting the SVG fragment as a string constant.
- The primitive function becomes `variation(rng, palette, size, base) => string` — it consumes the imported base, applies procedural variation (recolour via palette, scale, rotate, add/remove decorative sub-elements, optional stylistic transformations), and returns the final SVG.

This is a strictly more powerful model than Path A. Path A is "engineer draws geometry"; Path B is "designer draws geometry, engineer programs how it varies".

### What stays the same

- Determinism contract: `(theme.id, seed)` → byte-identical SVG. Base SVGs are constants; variation is RNG-driven.
- Composer architecture: subject composer still picks one primitive + 0–2 decorations.
- CLI / pack pipeline: unchanged.
- Open-source positioning: base SVGs are committed to the repo and MIT-licensed alongside the generator.

### What changes

#### Code changes

- New build step: `scripts/build-bases.ts` — reads `packages/themes/<theme>/src/subjects/<subject>.svg`, emits `<subject>.base.ts` next to it (TS module exporting the SVG body as a string constant). Run via `pnpm build` (added to `tsup` pre-step or as a `prebuild` script).
- Each primitive `<subject>.ts` is rewritten:
  - Imports the generated base constant.
  - Function body becomes "transform the base via RNG" instead of "construct the base from scratch".
- Per-primitive tests change shape — instead of asserting structural details of engineer-drawn paths, they assert structural invariants of the variation step (e.g. "the imported base is always present in the output", "decoration count obeys distribution", "palette colours are applied").
- New repo subdir: `packages/themes/<theme>/src/subjects/_assets/` — the source `.svg` files (designer-edited, committed to repo).

#### Workflow changes

- Theme authoring (`docs/THEME-AUTHORING.md`) gains a "Authoring base SVGs" section explaining the design conventions: viewBox 0 0 64 64, 10% padding, neutral-stroke + named-fill for palette substitution targets, etc.
- Designer workflow: Figma / Inkscape → export SVG → drop into `_assets/` → `pnpm build` → `pnpm qa-sample`.

#### Brand positioning

This is the biggest non-engineering change. The current pillars are:
- **No AI** ✅ unchanged (still no AI in the pipeline)
- **100% Procedural** ⚠️ becomes inaccurate — outputs are now "procedurally varied from designer-drawn bases", not "100% generated from code"
- **Open-source generator** ✅ unchanged

A clean reframing: replace "100% Procedural" with **"Designer-seeded procedural"** or **"Hand-designed bases, infinite seeded variants"**. This is *more* defensible against the competitive backdrop (cf. spec §2.2 — "No AI" emerging as a positioning signal) because the artist input becomes a verifiable craftsmanship proof rather than a procgen claim that buyers might suspect is AI-aided.

### Effort

- **Engineering:** ~1 week to build the base-build pipeline, refactor 24 primitives, rewrite tests, update THEME-AUTHORING.
- **Design:** ~24–48 base SVGs (one per subject, optionally 2 variants per subject for richer composition). At a freelance rate of $20–$50 per icon: **$500–$2,400 outsourced**, or 1–2 weeks of self-design work if author has Figma skills.
- **Total:** 2–4 weeks elapsed.
- **Risk:** Medium. Architecture change, brand reframing, requires designer pipeline.

### Cost / benefit

| Dimension | Path B |
|---|---|
| Engineering cost | ~1 week |
| Design / art cost | $500–$2,400 (or self-design) |
| Brand impact | Reframing required — replace "100% Procedural" with "Designer-seeded procedural". Net positive for differentiation but requires marketing copy update. |
| Architecture impact | Adds build step + file-system asset layer. Composer / CLI / pack pipeline unchanged. |
| Phase 2 impact | **Strongly positive** — Phase 2 expansion packs become "X new designer-drawn bases + variation parameters", which is a much clearer paid-value proposition than "X new TS functions". Aligns with spec §8.1's "Generator open-sourced — paid value is *content* not the *engine*" rule. |
| Determinism baseline | Reset (v1.2.0 → v2.0.0 — major bump because the primitive contract changes, not just outputs). |
| Recognisability lift (estimate) | 75–85% → 92–97% (depending on designer quality) |
| Reversibility | Harder — requires unwinding the build pipeline. But the per-primitive TS files can be regenerated from base SVGs if anything goes wrong. |

### Hard constraint: no AI-generated bases

> **Update (v1.4.0):** This constraint was lifted as part of the v1.4.0 brainstorming (see `docs/superpowers/specs/2026-05-06-path-b-v1.4.0-design.md` § 1). The "No AI" brand pillar was removed and replaced with "Deterministic Runtime". The discipline is now "AI in studio (authoring), procgen at runtime", not "no AI anywhere". The unacceptability list below is preserved as historical context for the original spec.

This is non-negotiable for brand consistency. Spec §6.1 sells "No AI" as a competitive differentiator against the AI-flooded itch new-release stream (§2.2). Using Claude / Midjourney / DALL·E / Stable Diffusion etc. to generate base SVGs would void that positioning, and once a single AI-generated base is committed to the repo the trust is gone.

**Acceptable base sources:**
- Hand-drawn by the author (Figma, Inkscape, paper-then-trace).
- Commissioned from a human designer (Fiverr, Upwork, or peer designer) with explicit "no AI tools" terms in the contract.
- Adapted from MIT/CC0/public-domain icon libraries (Lucide, Phosphor, Tabler — same notes as Path A about not bundling the original SVG files).

**Unacceptable base sources:**
- Any generative AI tool, even for "first draft I'll edit later".
- Any source the author can't honestly answer "yes, this was designed by a human" about.

If this constraint is hard to meet, **don't do Path B** — fall back to Path A, which sidesteps the question entirely.

### Phase 2 enabler value

Path B fundamentally changes the Phase 2 unit economics:

| Phase 2 model | Without Path B | With Path B |
|---|---|---|
| What's in a $4.99 pack? | 6 new TS function files | 30–60 designer-drawn base SVGs + palette + variation params |
| Buyer's perception of value | "Why am I paying for code? It's MIT" | "I'm paying for a designer's work on game-ready bases" |
| Reproducibility for buyer | Buyer can re-run with infinite seeds | Same — buyer can re-run with infinite seeds *plus* see the source designer's intent |
| Engineering effort per pack | High (write 6 new TS function files) | Low (drop in N new SVG bases, reuse existing variation primitives) |

The second column is the cleaner monetisation story. Without Path B, the Phase 2 "5 themed packs at $4.99" plan in the original spec (§8.1) sells code that's structurally similar to the freely-available v1.x primitives — buyers might rationally ask why they should pay. With Path B the paid value (designer work) is plainly visible.

### Acceptance criteria

- All existing tests still pass (after restructuring — see "Code changes" above).
- New per-primitive tests verify the imported base is always present in output and is recoloured per palette.
- `pnpm produce-pack` continues to produce 200 SVGs / 1000 PNGs.
- Visual spot-check: 24 base SVGs each yield 5+ visually-distinct seed variants while remaining recognisable as the named subject.
- `docs/THEME-AUTHORING.md` updated with the new authoring workflow.
- README and itch description copy updated for the brand reframe.
- Tag and release v2.0.0.

### When to do this

**Before Phase 2 spec is finalised** — ideally between v1.2.0 launch + first month of GTM and the start of Phase 2 implementation (per spec roadmap §8.1, that's M3–M6). If Path B is going to happen, doing it before any paid pack ships avoids re-doing every paid pack's content model.

---

## Comparison table

| | Current v1.2.0 | + Path A | + Path B |
|---|---|---|---|
| Recognisability (est.) | 75–85% | 88–93% | 92–97% |
| Engineering cost | — | 3–5 days | ~1 week |
| Design / art cost | $0 | $0 | $500–$2,400 (or self) |
| Brand positioning | unchanged | unchanged | reframe required |
| Architecture impact | — | none | build step + asset layer |
| Determinism baseline | v1.2.0 | reset → v1.3.0 | reset → v2.0.0 |
| Phase 2 enabler | weak | weak | strong |
| Risk | — | low | medium |
| AI hard-constraint compatible | yes | yes | yes (with discipline) |
| Reversibility | — | trivial | harder |

## Recommended sequencing

1. **Ship v1.2.0** ✅ done.
2. **Run M1 GTM (4 weeks)** per launch-runbook §D. Collect download / star / follower data + buyer feedback to confirm whether visual quality is the actual conversion blocker (vs cover / GIF / description copy).
3. **If feedback singles out subject quality:** prioritise **Path A** as a v1.3.0 release inside the launch-runbook D+28 "v1.3 recency tag" slot. Cheap, fast, low risk.
4. **If feedback validates the procgen-icon niche generally + author has design bandwidth or budget for designer:** start **Path B** in parallel with M2. Aim to land it before Phase 2 spec is finalised so paid packs use the designer-base model from day one.
5. **If feedback is inconclusive** (low download volume, no clear quality complaints): default to Path A only. Path B is a multi-week investment that only pays back if Phase 2 happens.

---

## Open questions to revisit when this work starts

1. Should Path A and Path B be sequential (A first as a quick win, then B), or does Path B obsolete A's per-primitive work? (Tentative: Path A's reference-aligned coordinates can serve as the *first draft* of Path B's base SVGs, so the work isn't wasted.)
2. For Path B, do palette colours get baked into the base SVG (designer picks colours) or are they substituted at variation time (current model)? Probably the latter, to preserve theme palette flexibility.
3. For Path B, what's the minimum number of bases per subject for the variation to feel non-repetitive? 1 base + procedural variation might be too rigid; 3–5 bases per subject mixed with variation might be the sweet spot.
4. Phase 2 themes that don't have an obvious Lucide / Phosphor analogue (horror-occult runes, cyberpunk neon glyphs) — Path A is harder there, Path B more natural.
