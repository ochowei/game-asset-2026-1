# Devlog #2 — Why TypeScript instead of Python

(Publish on D+8.)

When I started Procforge I assumed Python: it's the procedural-generation lingua franca, the math libs are abundant, and the community is right at home with seedable RNGs.

I picked TypeScript instead. Three reasons:

## 1. The same code runs in the browser

The itch.io listing has a live generator embedded as an HTML5 page. Visitors click "Run game" and watch icons regenerate in real time, with theme/seed controls. That conversion lift is enormous — almost no asset pack on itch offers in-page interactivity.

If I'd written the generator in Python I'd have built two separate codebases (Python for the CLI, JS for the embed) and they'd drift.

## 2. Buyers can read the source

Most game devs who'd care about a procedural icon generator are comfortable with JS. They aren't all Python literate. Lowering the barrier to "read and fork the algorithm" is core to the open-source positioning.

## 3. SVG is a string-manipulation problem

There's no need for numpy or geometry libs. Every primitive is `(rng, palette, size) => svgString`. TypeScript handles this natively, with strict types catching shape mistakes at compile time.

## Trade-offs I accepted

- No scientific Python ecosystem (numpy / scipy) — but icons don't need it.
- Smaller procgen community on the TS side — but the algorithms are simple.
- npm dep tree noise — pnpm + a tight `dependencies` list keeps it manageable.

Repo: [github.com/procforge/icons](https://github.com/procforge/icons). The whole pipeline is a few hundred lines of TS.
