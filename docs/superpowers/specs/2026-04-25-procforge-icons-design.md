# Procforge Icons — Design & Go-To-Market Spec

**Status:** Approved (brainstorming complete)
**Date:** 2026-04-25
**Scope:** Phase 1 in depth; Phase 2/3/4 outlined
**Author brand:** Procforge
**First product:** Procforge Icons

---

## 1. Spec Scope & Success Criteria

### 1.1 In scope (deep spec)
- Phase 1: Procedural Icon Generator + 200-icon starter pack + itch listing assets + first-month GTM playbook.

### 1.2 Outlined only (separate specs to follow)
- Phase 2 themed expansion packs (M3 spec).
- Phase 3 Procforge Dungeons generator (M6 spec).
- Phase 4 Procforge Shaders (deferred, optional).

### 1.3 Out of scope
- Per-pack design of Phase 2 themed packs.
- Phase 3 algorithm-level implementation details.
- Shader pack architecture.

### 1.4 Phase 1 success criteria (M3 checkpoint)

| Metric | Target | Rationale |
|---|---|---|
| Generator downloads | 1,500+ | Niche-fit + algorithmic positioning proof |
| itch followers | 200+ | Conversion pool for Phase 2 paid packs |
| GitHub stars (generator open-source) | 100+ | Validates the open-source / no-AI positioning |
| itch view → download conversion | ≥ 15% | Validates cover, GIF, copywriting |
| User-generated showcases | ≥ 3 | Product-market fit signal — somebody actually used it |

### 1.5 Phase 1 time-box

| Month | Deliverable |
|---|---|
| M1 | Generator core + CLI + 200 starter icons rendered |
| M2 | Web preview (HTML5 embeddable in itch) + docs + listing assets (cover, GIF, screenshots) |
| M3 | Launch + first-month GTM execution + monitoring + iteration |

---

## 2. Strategic Context (Market Findings)

### 2.1 Top-seller patterns observed (via itch-market MCP, 2026-04-25)
- 16x16 / 32x32 pixel-art top-down RPG dominates (LimeZu owns 4+ of top 30).
- Free / NYOP funnel model dominates — over half of top sellers are pay-what-you-want.
- Cute pastel cozy aesthetic over-represented (Sprout Lands, Cute Fantasy).
- 3D segment dominated by free incumbents (Kenney, Quaternius).
- Bundles ($10–$48) sell well (Kenney All-in-1, Pizza Doggy, alkakrab 610-track music bundle).

### 2.2 New-release patterns (the competitive battlefield for new entrants)
- Massive AI-generated content influx (Midjourney anime backgrounds, AI desk wallpapers).
- Tiny character sprite packs at $0.99–$2 are commodity-level competition.
- Tileset niches fragmenting into theme-specific micro-niches (horror dungeon, medieval town).
- "No AI" emerging as a positioning signal (alkakrab music bundle).

### 2.3 Opportunity scores (12 tags scanned, sample 30)

| Tag | Score | Median price | Free ratio | Note |
|---|---|---|---|---|
| shaders | 65 | $15.49 | 67% | Premium, technical barrier |
| sprites | 65 | $11.97 | 63% | Differentiation room remains |
| characters | 60 | $11.50 | 70% | Strong competition, paid market exists |
| fonts | 50 | $10.74 | 80% | Wide price spread $1.94–$79 |
| low-poly | 50 | $10.98 | 87% | Funnel-dominated |
| pixel-art | 40 | $4.97 | 67% | Saturated, low price |
| icons | 25 | $4.95 | 77% | Red ocean — but RhosGFX $19.99 proves premium possible |

### 2.4 Strategic gaps identified
1. **"No AI / hand-crafted" positioning** is rising as AI floods new releases.
2. **Tool-specific niches** (Dungeondraft, Hex Kit asset packs at $7.50–$9.99) have low competition.
3. **Premium pure-paid singletons** (RhosGFX vector icons $19.99, Hawtpixel font bundle $19) prove non-funnel monetization works.

---

## 3. Three-Phase Growth Plan

### 3.1 Logic
itch.io algorithm rewards recent downloads + recency (time-decayed). Free items count toward "top sellers" rankings. Therefore: first product cannot be paid — it must seed the algorithm and audience.

Author has strong programming and weak art skills. Strategy: pick a niche where programmatic generation produces output that *sidesteps* hand-drawn comparison (geometric procedural icons), build audience, then convert with paid expansions and a flagship tool.

### 3.2 Phase 1 (M1–M3) — Downloads & Awareness
- **Niche:** Procedural Icon Pack
- **Why:** largest buyer pool, strongest visual demo, geometric/SVG style sidesteps hand-drawn comparison.
- **Output:** Free generator (open source, MIT) + 200-icon starter pack.
- **KPIs:** see §1.4.

### 3.3 Phase 2 (M3–M6) — First Paid Conversion
- **Niche:** Themed icon expansion packs (same buyers as Phase 1).
- **Output:** 5 themed packs at $4.99 + bundle at $14.99.
- **Why:** capitalises on Phase 1 followers; proven LimeZu series-pattern (Modern Interiors → Exteriors → Office).
- **KPIs:** 50+ paid units, $300+ revenue, 500+ followers by M6.

### 3.4 Phase 3 (M6–M12) — Premium Flagship
- **Product:** Procforge Dungeons (Godot plugin + standalone CLI), $19.99.
- **Why:** premium needs pre-existing audience; buyer profile overlaps with icon buyers (roguelike devs).
- **KPIs:** 30+ paid units by M12, $1500+ cumulative revenue.

### 3.5 Phase 4 (M12+, optional)
- **Product:** Procforge Shaders (Godot + Unity URP).
- **Trigger:** only if Phase 3 lands. If Phase 3 misses, expand Phase 2 instead.

---

## 4. Phase 1 Product Architecture

### 4.1 Visual style
- **Geometric outlined SVG.** Reference anchors: Lucide / Phosphor / Tabler icons, but with procedural variation and game-oriented subjects (weapons, potions, creatures, UI).
- Why: natural fit for code-generated output; sidesteps pixel-art red ocean; SVG scales infinitely; friendly to non-artist authors.

### 4.2 Tech stack

| Concern | Choice | Reason |
|---|---|---|
| Language | TypeScript | CLI + browser share generator code; buyers can read source easily |
| Runtime | Node.js (CLI) + vanilla browser (preview) | No framework lock-in; easy itch HTML5 embed |
| SVG manipulation | Hand-written SVG strings | Small output, readable, easy for buyers to fork |
| RNG | seedrandom | Same seed → same icon (reproducibility is a procgen selling point) |
| Build | tsup (CLI) + Vite (web preview) | Both targets minimal |
| Testing | Vitest + SVG snapshot | Visual regression via snapshot; algorithms via unit tests |
| Package manager | pnpm | Fast, disk-efficient |
| License | MIT | Required for "open-source generator" positioning |

### 4.3 System components

```
┌─────────────────────────────────────────────────┐
│  CONFIG (theme + seed + count + size)           │
│  ─ JSON / CLI flags / web form                  │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  GENERATOR CORE (engine-agnostic, pure)         │
│  ─ theme registry                               │
│  ─ shape primitives (circle/poly/path/star)     │
│  ─ composition rules (layer / mask / palette)   │
│  ─ SVG string emitter                           │
└────────────────────┬────────────────────────────┘
                     ▼
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│  CLI ADAPTER     │    │  WEB PREVIEW         │
│  ─ batch render  │    │  ─ live regenerate   │
│  ─ output:SVG+PNG│    │  ─ download single   │
│  ─ pack zipper   │    │  ─ embed in itch     │
└──────────────────┘    └──────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────┐
│  OUTPUT PACK                                     │
│  ─ /svg/{theme}/{seed}.svg                       │
│  ─ /png/{size}/{theme}/{seed}.png  (5 sizes)     │
│  ─ index.html (preview gallery)                  │
│  ─ manifest.json (seed → metadata)               │
│  ─ README.md + LICENSE                           │
└──────────────────────────────────────────────────┘
```

### 4.4 Theme system (Phase 2 enabler)

Each theme is a plug-in module:

```ts
interface Theme {
  id: string;             // 'medieval', 'sci-fi', ...
  palette: Palette;
  primitives: Primitive[]; // theme-specific shape building blocks
  composers: Composer[];   // composition rules
  tags: string[];          // 'weapon', 'potion', 'creature', 'ui'
}
```

**Phase 1 starter themes (4):**
1. Medieval Fantasy — weapons, potions, shields, scrolls.
2. Sci-Fi / Cyberpunk — guns, chips, energy, HUD.
3. Cozy / Farm — tools, food, seeds, animal heads.
4. Roguelike Inventory — generic RPG inventory icons.

### 4.5 Why CLI + Web preview (not just CLI)
- Web preview embeds as HTML5 iframe in itch listing → visitors can interact live → strongest conversion lift available on the platform.
- CLI is the real usage mode for buyers who batch-generate locally.
- Both share the same generator core — no maintenance overhead.

---

## 5. Repository & Deliverables

### 5.1 Repo layout

```
game-asset-2026-1/
├── README.md                    # public face, demo GIF, quick start
├── LICENSE                       # MIT
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── .github/workflows/
│   ├── ci.yml                   # lint + test + build
│   └── release.yml              # tag → auto-package starter pack zip
│
├── packages/
│   ├── core/                    # generator engine (pure, no IO)
│   │   ├── src/
│   │   │   ├── primitives/
│   │   │   ├── composers/
│   │   │   ├── palette/
│   │   │   ├── svg-emitter.ts
│   │   │   ├── seed.ts
│   │   │   └── index.ts
│   │   └── tests/
│   │
│   ├── themes/                  # 4 starter themes (plug-in pattern)
│   │   ├── medieval-fantasy/
│   │   ├── sci-fi/
│   │   ├── cozy-farm/
│   │   └── roguelike-inventory/
│   │
│   ├── cli/                     # Node CLI
│   │   ├── src/
│   │   │   ├── render.ts        # SVG → PNG via sharp or resvg
│   │   │   ├── pack.ts          # zip
│   │   │   └── cli.ts
│   │   └── bin/icongen          # binary name provisional — see §10
│   │
│   └── web-preview/             # Vite SPA, embeddable in itch
│       └── src/
│
├── starter-pack/                # pre-generated 200-icon ship contents
│   ├── svg/
│   ├── png/{16,32,64,128,256}/
│   ├── index.html               # offline gallery
│   ├── manifest.json
│   ├── README.md
│   └── LICENSE                   # MIT
│
├── itch-page/                   # listing assets (not shipped to buyers)
│   ├── cover.png                # 630×500 itch cover
│   ├── screenshots/             # 5 showcase images
│   ├── demo.gif                 # main GIF (generator scrolling)
│   ├── description.md           # itch listing markdown
│   ├── tags.md                  # tag list
│   └── devlog-templates/        # 4 devlog drafts for first month
│
└── docs/
    ├── superpowers/specs/2026-04-25-procforge-icons-design.md
    ├── ARCHITECTURE.md          # for contributors
    ├── THEME-AUTHORING.md       # how to write a new theme (Phase 2 enabler)
    └── USAGE.md                 # end-user docs
```

### 5.2 Buyer-facing deliverables (single itch listing, single free download)

| File | Contents | Purpose |
|---|---|---|
| `starter-pack.zip` (~5 MB) | 200 icons in SVG + PNG (5 sizes), `index.html` gallery, manifest, README | Unzip-and-use, zero dependencies |
| GitHub repo link (no zipped source on itch) | Full TypeScript source | Power users who want to fork / regenerate. Avoids duplicate maintenance and reinforces "open source" positioning. |

### 5.3 GitHub repo bidirectional link
- itch listing links to GitHub; GitHub README links back to itch.
- "⭐ Star us on GitHub" CTA in itch description routes traffic to GitHub.
- GitHub Issues open for buyer requests → Phase 2 demand signal.

### 5.4 Phase 1 release cadence

| Version | Time | Contents |
|---|---|---|
| v0.1.0 | M1 end (internal) | Generator running, core + 1 theme |
| v0.5.0 | M2 end (beta) | 4 themes complete, CLI complete, web preview complete |
| v1.0.0 | M3 launch day | itch listing + GitHub release + GTM wave 1 |
| v1.1–1.3 | M3 weekly | Devlog + bugfixes + small features (algorithmic recency signal) |

---

## 6. Positioning, Brand & Messaging

### 6.1 Three positioning pillars

| Pillar | Message | Purpose |
|---|---|---|
| No AI | "Hand-coded algorithms. Zero generative AI in the pipeline." | Counter the new-release AI flood; appeal to craftsmanship-focused buyers |
| 100% Procedural | "Every icon is generated by code. Infinite seeds, reproducible output." | Explains why 200 icons is just the start; suggests infinite variants |
| Open-Source Generator | "Pack is free. Generator is MIT-licensed on GitHub." | Reverses the "code-generated asset = AI slop" suspicion via transparency |

### 6.2 One-line pitch

> **"200 hand-coded procedural game icons + open-source generator. No AI, infinite variants, MIT-licensed."**

### 6.3 Branding decisions
- **Author handle:** `Procforge` (umbrella brand for icons → dungeons → shaders).
- **First product name:** `Procforge Icons`.
- **Series naming:** `Procforge {category}` (Procforge Dungeons, Procforge Shaders).

### 6.4 Cover art direction
- Dark background (~#1a1a2e) for contrast on itch's neutral UI.
- 8×6 grid of representative icons (12 per theme).
- Title text: "Procforge Icons".
- Sub-text: "200 procedural icons · MIT · No AI".
- Corner badges: "v1.0", GitHub star link.
- Avoid generator UI screenshots (buyers want icons, not tooling shots).
- Keep text minimal (cover thumbnail is 315×250).

### 6.5 Demo GIF spec
- 8–10 second loop, < 3 MB.
- Frames: seed slider → 200 icons fade in (theme color cycles) → zoom into one icon → text overlay "MIT · Free · No AI".

### 6.6 itch tag strategy (10 tags)
1. `icons`
2. `procedural-generation`
3. `vector`
4. `svg`
5. `open-source`
6. `inventory`
7. `rpg`
8. `fantasy`
9. `ui`
10. `free`

### 6.7 Competitive positioning
- **vs RhosGFX Vector Icon Pack ($19.99):** different segment — we are free + open-source + procedural. Not stealing buyers.
- **vs Kenney (free incumbent):** acknowledge inspiration in README ("inspired by Kenney's open ethos"). No conflict.
- **vs Quaternius / Pixel Frog:** community peers — possible cross-promotion.

---

## 7. Launch Playbook

### 7.1 Pricing
- Phase 1 listing: **NYOP, suggested $0, minimum $0.**
- Reason: NYOP qualifies for "top sellers" ranking while still presenting as free; donations from convinced buyers signal Phase 2 high-value prospects.
- **Do not** anchor at $5 suggested — too high will scare off volume buyers.

### 7.2 itch listing layout (top to bottom)

```
1. Cover image (315×250 thumb / 630×500 full)
2. Title: "Procforge Icons — 200 procedural game icons + open source generator"
3. NYOP price button
4. Demo GIF (first attached image)
5. One-line pitch (bold)
6. Web preview HTML5 embed
   "🎲 Click to generate icons live in your browser"
7. Feature bullets (5–7)
   - 200 hand-crafted procedural icons
   - 4 themes (medieval, sci-fi, cozy farm, roguelike)
   - 5 PNG sizes + scalable SVG
   - MIT license — free for commercial use
   - Open-source generator → infinite custom variants
   - No AI in the pipeline
8. 5 screenshots (one per theme + collage)
9. "What's inside the pack"
10. "Use the generator" (CLI usage + GitHub link)
11. "Roadmap" (Phase 2/3 teaser → builds anticipation)
12. License + credits
13. Footer: "⭐ Star on GitHub | 🐦 Follow @procforge | 💬 Discord"
```

The HTML5 embed is the differentiator — almost no asset pack on itch offers in-page interactive demo.

### 7.3 Pre-launch checklist (D-day−7)

- [ ] All 200 icons generated + visual QA (sample 30 per theme).
- [ ] starter-pack.zip < 6 MB verified.
- [ ] Web preview runs inside itch HTML5 sandbox (verify with itch test upload).
- [ ] Cover image both sizes ready (315×250, 630×500).
- [ ] Demo GIF < 3 MB, loops cleanly.
- [ ] 5 screenshots ready (each < 800 KB, 1280×720 or 1920×1080).
- [ ] itch description.md spell-checked.
- [ ] GitHub repo public, README complete, v1.0.0 tag pushed.
- [ ] 4 devlog drafts queued.
- [ ] Procforge-branded Reddit / Twitter / Bluesky accounts created; first-post drafts prepared. (Discord: join existing communities only — no own server in Phase 1.)
- [ ] Legal: MIT LICENSE file, no-AI-training declaration if relevant.

### 7.4 First-month GTM (D-day → D+30)

#### Week 1 — Concentrated exposure

| Day | Action |
|---|---|
| D-day (Tue) | itch listing 09:00 ET; GitHub release pushed simultaneously |
| D+0 same day | Post r/proceduralgeneration; first Twitter/Bluesky wave |
| D+1 | Post r/IndieDev, r/gamedev (different angles per sub) |
| D+2 | Post r/godot, r/Unity3D (engine-agnostic, both relevant) |
| D+3 | Devlog #1: "How I generated 200 icons procedurally" (HN potential) |
| D+5 | Submit to ProcJam Discord, PixelDailies, Game Dev League — ~5 communities |
| D+7 | Weekly summary post: "Week 1 stats — N downloads, M followers" (transparency drives shares) |

#### Week 2 — Cross-community spread

| Day | Action |
|---|---|
| D+8 | Devlog #2: "Why TypeScript instead of Python" (web-dev cross-over) |
| D+10 | Show HN: "Procforge — open-source procedural game icon generator" |
| D+12 | Cross-post to Lobsters, Dev.to, Hashnode |
| D+14 | Cold email 5 game-dev YouTubers (free asset = low ask) |

#### Week 3 — Compound + listen

| Day | Action |
|---|---|
| D+15 | Devlog #3: "Adding 50 more icons — themed by community votes" (engagement loop) |
| D+18 | Approach itch jam organisers to register generator as official tool |
| D+21 | Public 3-week update: downloads / followers / stars |

#### Week 4 — Phase 2 transition prep

| Day | Action |
|---|---|
| D+22 | Devlog #4: "What's next — Phase 2 themed expansion packs" (first paid teaser) |
| D+25 | Discord/itch poll: "Which expansion theme do you want next?" |
| D+28 | Release v1.1 (50 more icons + small fixes) — algorithmic recency boost |
| D+30 | M1-end KPI checkpoint; internal post-mortem |

### 7.5 KPI monitoring (weekly)

| Metric | Source | Healthy signal |
|---|---|---|
| Daily downloads | itch dashboard | Decay slope ≥ −20% / week |
| Followers | itch dashboard | Net +30 / week |
| GitHub stars | GitHub | +20 / week |
| Reddit upvote ratio | Reddit (averaged across all launch-week posts) | ≥ 80% (niche fit) |
| User showcases | Discord / comments / Twitter mentions | ≥ 1 / fortnight |
| view→download conversion | itch analytics | ≥ 15% |

### 7.6 Early warning signs

| Signal | Action |
|---|---|
| M1-end < 500 downloads | Cover/GIF missed — re-shoot assets, re-post to Reddit |
| High downloads, 0 followers | Description gives no reason to follow — rewrite |
| GitHub stars far below downloads (< 1/30) | Open-source signal not landing — strengthen "contribute / fork" CTA |

### 7.7 Anti-patterns
- Do not cross-post to 6 subreddits on Day 1 — looks like spam, risks ban.
- Do not launch paid version on listing day — algorithm position is on free leaderboards; paid = lost ranking points.
- Do not drop product links in Discord cold — participate first, link only when asked.
- Do not say "AI-powered" or "ChatGPT-assisted" — violates the three pillars.

---

## 8. Phase 2 / 3 / 4 Outline

### 8.1 Phase 2 (M3–M6) — Themed Expansion Packs

5 packs at $4.99 each + bundle "Procforge Icons Megapack" $14.99.

| Pack | Theme | Icons | Target buyer |
|---|---|---|---|
| `weapons-mega` | Weapons (sword, bow, gun, staff) | 300 | RPG / action devs |
| `cyberpunk-ui` | HUD, grids, neon glyphs | 250 | Sci-fi / cyber devs |
| `cozy-everything` | Food, seeds, furniture, pets | 350 | Cozy / farm devs |
| `roguelike-pro` | Inventory, buffs, status | 400 | Roguelike devs |
| `horror-occult` | Runes, creatures, ritual items | 200 | Horror devs |

**Phase 1 must leave behind:**
- Theme = plug-in module (new theme = new package, no core changes).
- Manifest schema standardised.
- CLI supports `--theme path/to/external-theme`.
- Generator open-sourced (so paid value is *content*, not the *engine*).
- GitHub Issues capturing demand signal for theme prioritisation.

**Phase 2 GTM:**
- Push update + email to Phase 1 followers (200+).
- First themed pack listing referenced in the Phase 1 starter pack ("🎁 Themed expansions now available").
- Bundle in two tiers: 3-pack starter vs. all-in.

**Phase 2 KPIs (M6 end):** 50+ paid units, $300+ revenue, 500+ followers, ≥ 1 pack in tag-top-30.

### 8.2 Phase 3 (M6–M12) — Procforge Dungeons

Godot plugin + standalone CLI, $19.99, source included.

**Why Phase 3:**
- High ticket needs pre-existing audience (Phase 1+2 follower pool).
- Multi-month dev cycle (not a 1-month launch).
- Buyer profile overlaps with icon buyers (roguelike devs need both).

**Phase 1 must leave behind:**
- Procforge brand established → "From the maker of Procforge Icons" carries weight.
- GitHub org structure ready for new repo.
- Discord / follower pool for pre-sales.
- Theme system pattern transferable to algorithm plug-ins.

**Phase 3 algorithms included:**
1. BSP (binary space partitioning) — classic rooms + corridors.
2. Cellular automata — caves.
3. Wave function collapse — stylised structure.

**Phase 3 GTM:**
- 1 month before launch: free lite demo (1 algorithm).
- Dual channel: itch + Godot Asset Library.
- Long technical devlog → submit HN (dungeon generation is reliably trending tech topic).

**Phase 3 KPIs (M9 launch, M12 end):** 30+ paid units, $1500+ Phase 1+2+3 cumulative revenue, Godot Asset Library listing live.

### 8.3 Phase 4 (M12+, optional) — Procforge Shaders

Triggered only after Phase 3 stabilises. Cross-engine (Godot + Unity URP). Higher technical investment. If Phase 3 misses, skip Phase 4 and expand Phase 2 packs instead.

### 8.4 Roadmap diagram

```
M1 ─── M2 ─── M3 ──┬─ M4 ─── M5 ─── M6 ──┬─ M7 ─── M9 ─────── M12 ─── (M13+)
                   │                       │                            │
[Phase 1: Free Icons + Generator]          │                            │
  Build / Launch / GTM                     │                            │
                   │                       │                            │
                   └─ [Phase 2: Themed Expansion Packs $4.99 × 5]       │
                       Convert audience to paid                         │
                                           │                            │
                                           └─ [Phase 3: Dungeon Gen $19.99]
                                                Premium flagship        │
                                                                        │
                                                                        └─ [Phase 4: Shaders, optional]
```

---

## 9. Failure Scenarios & Pivots

| Scenario | Trigger | Pivot |
|---|---|---|
| Phase 1 misses badly | M3 end, < 500 downloads | Hold Phase 2; re-position / re-shoot main GIF / re-post GTM. Allow 1 month for correction before next decision. |
| Phase 1 hits, Phase 2 first pack flops | M4 end, < 5 paid units | Drop price to $1.99 and retest. Still flat → bundle-only model (no individual pack sales). |
| Phase 2 hits, Phase 3 pre-sale demo flops | M7, < 100 demo downloads | Shrink dungeon generator to expansion-style $4.99 module; preserve Phase 4 optionality. |

---

## 10. Open Questions Deferred to Implementation Phase

These are not strategic decisions — they will be resolved while writing the implementation plan:

1. CLI command name: `icongen` vs `procforge` vs `pf-icons`.
2. PNG rasteriser library: `sharp` vs `resvg-js`.
3. itch HTML5 embed format: zipped HTML or single-file build.
4. Domain registration: `procforge.dev` / `procforge.io` / GitHub-only.
5. Cover GIF capture pipeline: real-time browser screen-record vs. headless render-to-frames pipeline.
