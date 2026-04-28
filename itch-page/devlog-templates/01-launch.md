# Devlog #1 — How I generated 200 icons procedurally

(Publish on D+3.)

## The problem

I wanted to ship a free icon pack for indie game devs, but I'm not an artist. The two obvious paths — hand-drawing or AI — both seemed wrong:

- **Hand-drawing** would produce ~10 icons before I gave up.
- **AI** would produce slop indistinguishable from the dozen "Anime Backgrounds Vol. 47" packs flooding new releases.

There's a third path: **write the algorithm**.

## The pipeline

Each icon comes from this simple loop:

1. Seed an RNG with `(theme + seed)`.
2. Pick a *composer* (layer, mask).
3. The composer picks 2–4 *primitives* (circle, polygon, path, star).
4. Each primitive emits an SVG element, sampling colors from the theme's palette.
5. Wrap in `<svg viewBox="0 0 64 64">` and write to disk.

200 icons = 4 themes × 50 seeds. Same seed always produces the same icon.

## The "No AI" pitch

I'm not anti-AI. I am anti-slop. Every icon Procforge ships came from code I wrote and you can read: [github.com/procforge/icons](https://github.com/procforge/icons). MIT, fork it, run it, generate your own.

## Stats so far

- Day 1: TBD downloads
- Day 1: TBD followers
- GitHub stars: TBD

## Next up

Phase 2: themed expansion packs (weapons, cyberpunk UI, cozy everything, roguelike pro, horror). $4.99 each, bundle for $14.99. Existing 200-icon pack stays free forever.

Follow for updates.
