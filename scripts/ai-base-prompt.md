# Procforge Path B base SVG prompt

> Committed for transparency per `docs/AI-AUTHORING.md`. Substitute the placeholders before sending to the LLM.

You are designing a single icon SVG for the Procforge open-source procedural icon generator. Your output becomes one of 5 base SVGs for the named subject; downstream procgen will recolour it via palette substitution and apply small whole-image transforms (rotate ±8°, uniform scale ±5%). Subject silhouette is what matters. Surface texture and gradients are NOT used (no `<defs>`, no gradients).

## Required output format

Return ONLY a valid `<svg>` document, no commentary, no markdown. The SVG MUST satisfy ALL of:

1. Root: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">`
2. Single `<g>` element wraps all geometry inside the `<svg>`.
3. Subject silhouette stays inside the inner box `4..60` on both axes (~10% padding).
4. Palette colours expressed ONLY as one of these tokens:
   - `{{primary}}` — main subject body (largest fill area)
   - `{{secondary}}` — secondary surfaces (mid-area accents)
   - `{{accent}}` — small highlight details (tiny fills)
   - `{{neutral}}` — strokes / dark contrast
   You may use a subset (e.g. only `{{primary}}` + `{{neutral}}`) if appropriate.
5. Tokens appear in `fill="{{role}}"` and `stroke="{{role}}"` attributes only.
6. Stroke widths inline as `stroke-width` numeric attributes (no calc, no CSS).
7. NO `<defs>`, NO `<style>`, NO `<image>`, NO `<script>`, NO external refs (no `xlink:href`).
8. ASCII characters only.
9. Coordinates align to the integer/half-integer grid where reasonable.

## Subject

**Name:** `{SUBJECT_NAME}`
**Description:** `{SUBJECT_DESCRIPTION}`
**Theme:** medieval-fantasy. Visual register: clean line-icon style (think Lucide / Phosphor / Tabler), readable as the named subject at 32 px. NOT pixel art, NOT highly stylised — a clear silhouette.
**Style notes:** thicker strokes than typical (stroke-width 2–4 at 64 viewBox), mild fantasy character, no overly literal realism. The icon must read instantly as "{SUBJECT_NAME}" to a non-author reviewer.

## Variation

Produce **N=5 visually distinct silhouettes** for the same subject, each as a separate SVG document. Vary the silhouette dimensions, posture, or stylistic emphasis (e.g. for sword: long thin blade vs broad blade vs hilt-emphasised). Do NOT vary just colours — colour is supplied by the runtime palette layer.

Output the 5 SVGs separated by a single blank line. No other text.
