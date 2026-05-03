# Procforge Icons — Launch Runbook（上架運營手冊）

**上架版本：v1.2.0**（recognisability pass，v1.1.0 因 baseline reset 已被取代）。原訂 D-day 因 v1.2.0 的視覺打磨工作後延 2 週；新 D-day 請挑距離 tag 之後最近的週二。見 `CHANGELOG.md`。

> **為何延後**：v1.1.0 雖然已實作 24 個 subject primitives，但內部 QA 發現 coin/gem/ring/cog 等多組 subject 在 64px 下視覺辨識度不足。v1.2.0 在不改架構的前提下做了 affordance hint 強化、subject stroke 加粗 1.4×、RNG jitter 收斂、decoration 分布從 25/50/25 改為 50/40/10。延後 2 週換到「上架就是高品質」，避免 launch 後才補 baseline reset。

這份是工程之外的營運與行銷檢查清單。工程部分已全部完成，涵蓋三個 spec：
- `docs/superpowers/specs/2026-04-25-procforge-icons-design.md`（Phase 1 原始設計，v1.0.0）
- `docs/superpowers/specs/2026-05-01-game-oriented-primitives-design.md`（subject primitives，v1.1.0）
- v1.2.0 為 v1.1.0 的實作層細修，未開新 spec（見 `CHANGELOG.md` 的 v1.2.0 條目）

對應的 plan：`docs/superpowers/plans/2026-04-25-procforge-icons-phase1.md`。

狀態符號：`[ ]` 待辦 · `[x]` 完成 · `[~]` 進行中 · `[-]` 跳過（請註明原因）

---

## A. 視覺素材（spec §6.4、§6.5、§7.2）

這些是 Phase 1 工程明確排除的項目——屬於人工設計，必須在 D-day 之前產出。

> **版本鎖定**：§A 所有視覺素材必須用上架版本（v1.2.0）的 generator 跑出來。v1.1.0 的 seed 在 v1.2.0 產出的 SVG 不同（baseline reset），素材用錯版本會導致封面 / GIF / 截圖跟下載內容對不上。

### A.1 封面圖
- [ ] **縮圖（315×250）** — itch listing 縮圖
- [ ] **完整版（630×500）** — itch listing hero
- [ ] 深色背景 ~#1a1a2e、8×6 icon 排列（每主題 12 個）
- [ ] 標題：「Procforge Icons」；副標：「200 procedural icons · MIT · No AI」
- [ ] 角落徽章：「v1.2」、GitHub star 連結
- [ ] 不放 generator UI 截圖；文字精簡（315×250 縮圖下要可讀）

### A.2 Demo GIF
- [ ] 8–10 秒循環，**< 3 MB**
- [ ] 畫面腳本：seed 滑桿 → 200 個 icon 漸入（主題色循環） → 鏡頭 zoom 進其中一個 icon → 文字疊圖「MIT · Free · No AI」

### A.3 截圖（5 張，每張 < 800 KB，1280×720 或 1920×1080）
- [ ] 每主題各 1 張（medieval-fantasy、sci-fi、cozy-farm、roguelike-inventory）
- [ ] 1 張集合 / 概覽圖

---

## B. 帳號、品牌與法務（spec §6.3、§7.3）

- [ ] Reddit 帳號 `Procforge`（或變體） — 建立完成、karma 已養
- [ ] Twitter / X 帳號 `@procforge`（或變體） — 建立完成
- [ ] Bluesky 帳號 `@procforge.bsky.social`（或變體） — 建立完成
- [ ] 各平台首發貼文草稿備好（角度不同，**不可**直接複製貼上）
- [-] Discord — Phase 1 **不**自建 server，只加入既有社群（依 spec §7.3）
- [x] repo 內 MIT LICENSE 檔（v1.0.0 已交付）
- [ ] 若條款相關，於 itch listing 加入 no-AI-training 聲明

---

## C. 上架前檢查（D-day − 7）（spec §7.3）

工程相關項目已完成（標 `[x]`）；剩下的營運項目標 `[ ]`：

- [x] 200 個 icon 全部產出 + 視覺 QA — 由 `pnpm produce-pack` + `pnpm qa-sample` 涵蓋（已用 v1.2.0 重產）
- [x] starter-pack.zip < 6 MB 已驗證 — `pnpm prelaunch-check` 在 CI 強制（v1.2.0 為 1.92 MB）
- [x] GitHub repo 公開、README 完整、v1.0.0 tag 已 push（2026-04-28）、v1.1.0 tag 已 push（2026-05-01）、v1.2.0 tag 待 push（recognisability pass）
- [x] 4 篇 devlog 草稿備好 — `itch-page/devlog-templates/` 已交付
- [x] repo 內 MIT LICENSE 檔
- [ ] **`scripts/produce-starter-pack.ts` 內硬寫的版本字串改為 v1.2.0**（zip 內 README）
- [x] **重跑 `pnpm produce-pack` 用 v1.2.0 產 starter-pack.zip**（v1.1.0 的 zip 已過時 — baseline reset）
- [ ] **Web preview 在 itch HTML5 sandbox 內可運作** — 需上傳測試 listing 驗證（無法自動化）
- [ ] **封面圖兩個尺寸備好**（見 §A.1，須用 v1.2.0 產出）
- [ ] **Demo GIF < 3 MB、循環無痕**（見 §A.2，須用 v1.2.0 產出）
- [ ] **5 張截圖備好**（見 §A.3，須用 v1.2.0 產出）
- [ ] **itch description 拼字檢查** — `itch-page/description.md` 貼到正式 listing 前再過一次
- [ ] **Reddit / Twitter / Bluesky 帳號建好、首發貼文草稿備好**（見 §B）

---

## D. D-day 與首月 GTM（spec §7.4）

挑一個週二當 D-day。實際排程時請把每列的相對日期換算成絕對日期。**v1.2.0 的 D-day 比原 v1.1.0 規劃延後 2 週**(因為視覺打磨工作);所有 D+N 相對日期不變,只是基準週二往後挪兩週。

### D.1 Week 1 — 集中曝光

| Day | 動作 | 完成 |
|---|---|---|
| D-day（週二） | itch listing 09:00 ET 上線；GitHub v1.2.0 release 已 push（取代 v1.1.0 為公開上架版本） | [ ] |
| D-day | 發 r/proceduralgeneration；Twitter / Bluesky 第一波貼文 | [ ] |
| D+1 | 發 r/IndieDev、r/gamedev — 每個 sub 換不同切角 | [ ] |
| D+2 | 發 r/godot、r/Unity3D — 引擎中立、兩邊都吃 | [ ] |
| D+3 | 發 Devlog #1 「How I generated 200 icons procedurally」（有 HN 潛力） | [ ] |
| D+5 | 投稿 ~5 個社群 — ProcJam Discord、PixelDailies、Game Dev League | [ ] |
| D+7 | 週總結貼文 — 「Week 1 stats: N downloads, M followers」 | [ ] |

### D.2 Week 2 — 跨社群擴散

| Day | 動作 | 完成 |
|---|---|---|
| D+8 | Devlog #2 「Why TypeScript instead of Python」（吃 web-dev 流量） | [ ] |
| D+10 | Show HN — 「Procforge — open-source procedural game icon generator」 | [ ] |
| D+12 | 轉貼到 Lobsters、Dev.to、Hashnode | [ ] |
| D+14 | 冷信 5 位 game-dev YouTuber（免費素材，門檻低） | [ ] |

### D.3 Week 3 — 複利 + 傾聽

| Day | 動作 | 完成 |
|---|---|---|
| D+15 | Devlog #3 「Adding 50 more icons — themed by community votes」 | [ ] |
| D+18 | 接洽 itch jam 主辦方，把 generator 註冊為官方工具 | [ ] |
| D+21 | 公開三週更新 — downloads / followers / stars | [ ] |

### D.4 Week 4 — Phase 2 過渡準備

| Day | 動作 | 完成 |
|---|---|---|
| D+22 | Devlog #4 「What's next: Phase 2 themed expansion packs」（付費前奏） | [ ] |
| D+25 | Discord / itch 投票 — 「Which expansion theme do you want next?」 | [ ] |
| D+28 | Release **v1.3**（recency 用,內容待 D+25 投票結果決定 — 例:擴量 50 icons、palette tweak、或新 composer) | [ ] |
| D+30 | M1-end KPI 檢查 + 內部 post-mortem | [ ] |

> 註:原規劃中的「D+28 v1.1」已於 2026-05-01 以 v1.1.0 出貨(subject primitives + baseline reset),v1.2.0 為 launch 前的 recognisability pass(再次 baseline reset),故 D+28 的「launch 後 recency tag」順延至 v1.3。

---

## E. KPI 追蹤（每週）（spec §7.5）

Week 1–4 每週五各記一次，之後改月度。

| 指標 | 來源 | 健康訊號 |
|---|---|---|
| 每日下載量 | itch dashboard | 衰減斜率 ≥ −20% / 週 |
| 追蹤人數 | itch dashboard | 淨 +30 / 週 |
| GitHub stars | GitHub | +20 / 週 |
| Reddit upvote ratio | Reddit（launch-week 平均） | ≥ 80%（小眾命中度） |
| 用戶秀作品 | Discord / 留言 / Twitter mention | ≥ 1 / 兩週 |
| view→download 轉換率 | itch analytics | ≥ 15% |

建議的追蹤表欄位：`week, downloads_total, downloads_delta, followers, gh_stars, reddit_ratio, conversion_pct, notes`。

---

## F. 早期警訊（spec §7.6）

| 訊號 | 對應動作 |
|---|---|
| M1-end < 500 downloads | 封面 / GIF 沒打中 — 重拍素材，換切角再發 Reddit |
| 高下載、零追蹤 | 描述沒給人追蹤理由 — 改寫 hook + Phase 2 teaser |
| GitHub stars 遠低於下載量（< 1 / 30） | open-source 訊號沒落地 — 在 README 與 itch description 強化「contribute / fork」CTA |

---

## G. 反例（spec §7.7）— **不要做這些**

- **不要**在 Day 1 同時 cross-post 到 6 個 subreddit — 看起來像 spam，可能被 ban
- **不要**在上架日同步推付費版 — 演算法位置在免費榜，付費 = 排名扣分
- **不要**冷貼產品連結到 Discord — 先參與社群，被問了再貼
- **不要**講「AI-powered」或「ChatGPT-assisted」— 違反三個定位主軸

---

## H. 上架後 follow-up（M1+）

- [x] **v1.1.0 發布** — 已於 2026-05-01 上架前完成（subject primitives + baseline reset，見 `CHANGELOG.md`）
- [x] **v1.2.0 發布** — launch 前 recognisability pass(affordance + jitter + decoration distribution),baseline 第三次 reset。tag 待 push。
- [ ] **v1.3 發布**(D+28) — 內容由 D+25 社群投票決定,與 devlog #4 互連
- [ ] **開放 GitHub Issues 收社群主題請求**（Phase 2 需求訊號 — spec §5.3）
- [ ] **M1 post-mortem 文件**（D+30） — 哪些做對、哪些沒打中、Phase 2 啟動決策
- [ ] **Phase 2 spec** — 主題擴充包（spec §8.1） — 若訊號健康，D+25 開始草擬

---

## 來源參考

- Spec（v1.0.0，GTM 章節）：`docs/superpowers/specs/2026-04-25-procforge-icons-design.md` §6.4、§6.5、§7.2–7.7、§5.3
- Spec（v1.1.0 subject primitives）：`docs/superpowers/specs/2026-05-01-game-oriented-primitives-design.md`
- Phase 1 plan（工程，已完成）：`docs/superpowers/plans/2026-04-25-procforge-icons-phase1.md`
- 版本歷程：`CHANGELOG.md`
- itch listing 文案：`itch-page/description.md`、`itch-page/tags.md`
- Devlog 草稿：`itch-page/devlog-templates/`
