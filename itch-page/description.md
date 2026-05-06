# Procforge Icons — 200 procedural game icons + open source generator

**200 hand-coded procedural game icons + open-source generator. No AI, infinite variants, MIT-licensed.**

🎲 **Click "Run game" above to generate icons live in your browser.**

## What you get

- **200 icons** across 4 themes (50 per theme):
  - 🗡️ Medieval Fantasy — swords, shields, potions, gemstones
  - 🚀 Sci-Fi / Cyberpunk — guns, chips, energy, HUD
  - 🌾 Cozy Farm — food, seeds, tools, animals
  - 🎒 Roguelike Inventory — items, runes, buffs
- **Scalable SVG** + rasterised PNG at 16, 32, 64, 128, 256 px
- **Offline HTML gallery** included
- **MIT license** — free for commercial and non-commercial use, no attribution required
- **Open-source generator** on [GitHub](https://github.com/procforge/icons) — fork it, run it, generate your own variants

## What's inside the pack

```
svg/{theme}/{seed}.svg
png/{16,32,64,128,256}/{theme}/{seed}.png
index.html         (offline gallery)
manifest.json      (seed → file paths)
README.md
LICENSE            (MIT)
```

## Use the generator

The pack is just the starting point. Clone the open-source generator to produce unlimited variants:

```bash
git clone https://github.com/procforge/icons
cd icons
pnpm install && pnpm build
node packages/cli/dist/cli.js --theme cozy-farm --count 200 --seed mygame
```

Same seed → same icons (deterministic). Different seed → different icons. Forever.

## Why "no AI"?

itch.io's new-uploads feed is being flooded with AI-generated assets. Procforge is the opposite: every icon comes from hand-written algorithms you can read on GitHub. No diffusion model, no LLM, just code.

## Roadmap

- **Phase 2 (May 2026):** Themed expansion packs — Weapons Mega, Cyberpunk UI, Cozy Everything, Roguelike Pro, Horror Occult ($4.99 each, $14.99 bundle)
- **Phase 3 (later):** Procforge Dungeons — procedural dungeon generator (Godot plugin)

Follow [@procforge](https://procforge.itch.io) here for updates.

## License

MIT — commercial use OK, no attribution required (but appreciated).

## Credits

Inspired by [Kenney](https://kenney.itch.io)'s open ethos. Built with ❤️ in TypeScript.

⭐ [Star us on GitHub](https://github.com/procforge/icons) | 💬 [Open an issue](https://github.com/procforge/icons/issues) for feedback or theme requests
