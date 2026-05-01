# Changelog

## v1.1.0 — 2026-05-01

### Breaking — determinism baseline reset

The `(theme.id, seed)` byte-stable invariant resumes from a new baseline at v1.1.0. Seeds used against v1.0.0 produce different SVG output against v1.1.0+. Buyers pinning specific seeds need to regenerate.

### Features

- Each theme now ships 6 game-oriented subject primitives (24 total) instead of generic shape collages.
  - **medieval-fantasy:** sword, shield, potion, scroll, axe, gemstone
  - **sci-fi:** blaster, chip, energy orb, HUD reticle, cog, antenna
  - **cozy-farm:** hoe, fruit, seed pouch, animal head, watering can, wheat
  - **roguelike-inventory:** coin, gem, key, book, ring, dagger
- New `subject` composer in `@procforge/core` places one centred subject + 0–2 background decorations.
- New `round2(n)` helper exported from `@procforge/core`.

### Spec

- §3.4 contract updated with stroke-only silhouette carve-out (HUD reticles, antennas).

See `docs/superpowers/specs/2026-05-01-game-oriented-primitives-design.md` for full design rationale.

## v1.0.0 — 2026-04-28

Initial release: 200 procedural game icons, 4 themes, MIT-licensed generator.
