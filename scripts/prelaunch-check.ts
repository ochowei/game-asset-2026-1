/**
 * Pre-launch checklist runner.
 *
 * Validates the automatable subset of the spec §7.3 pre-launch checklist
 * (docs/superpowers/specs/2026-04-25-procforge-icons-design.md). Prints a
 * markdown report and exits non-zero if any required check fails.
 *
 * Manual-only items (visual QA, social-account creation, itch HTML5 sandbox
 * upload, GIF loop quality) are listed at the end as ⏳ reminders.
 *
 * Usage:
 *   pnpm prelaunch-check            # full report, fails on any required miss
 *   pnpm prelaunch-check --ci       # skip checks that need pre-built assets
 *   pnpm prelaunch-check --strict   # fail on warnings too
 */
import { readFileSync, statSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

type Status = 'ok' | 'fail' | 'warn' | 'todo';

interface Result {
  id: string;
  label: string;
  status: Status;
  detail: string;
  required: boolean;
}

const results: Result[] = [];
const args = new Set(process.argv.slice(2));
const CI_MODE = args.has('--ci');
const STRICT = args.has('--strict');

const ROOT = process.cwd();
const STARTER_DIR = join(ROOT, 'starter-pack');
const STARTER_ZIP = join(ROOT, 'starter-pack.zip');
const ITCH_DIR = join(ROOT, 'itch-page');

function record(r: Result) {
  results.push(r);
}

function ok(id: string, label: string, detail = '', required = true) {
  record({ id, label, status: 'ok', detail, required });
}
function fail(id: string, label: string, detail: string, required = true) {
  record({ id, label, status: 'fail', detail, required });
}
function warn(id: string, label: string, detail: string) {
  record({ id, label, status: 'warn', detail, required: false });
}
function todo(id: string, label: string, detail: string) {
  record({ id, label, status: 'todo', detail, required: false });
}

function fileSize(path: string): number {
  return statSync(path).size;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readPngDims(path: string): { w: number; h: number } | null {
  const buf = readFileSync(path);
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function readGifDims(path: string): { w: number; h: number } | null {
  const buf = readFileSync(path);
  if (buf.length < 10) return null;
  const sig = buf.toString('ascii', 0, 6);
  if (sig !== 'GIF87a' && sig !== 'GIF89a') return null;
  return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
}

// ─── §7.3 starter pack ─────────────────────────────────────────────
function checkStarterPack() {
  if (CI_MODE && !existsSync(STARTER_ZIP)) {
    todo('zip-size', 'starter-pack.zip < 6 MB', 'Skipped (--ci): run `pnpm produce-pack` first');
  } else if (!existsSync(STARTER_ZIP)) {
    fail('zip-size', 'starter-pack.zip < 6 MB', 'starter-pack.zip not found — run `pnpm produce-pack`');
  } else {
    const size = fileSize(STARTER_ZIP);
    const limit = 6 * 1024 * 1024;
    if (size < limit) ok('zip-size', 'starter-pack.zip < 6 MB', fmtSize(size));
    else fail('zip-size', 'starter-pack.zip < 6 MB', `${fmtSize(size)} exceeds 6 MB limit`);
  }

  if (!existsSync(STARTER_DIR)) {
    fail('starter-dir', 'starter-pack/ exists', 'directory missing — run `pnpm produce-pack`');
    return;
  }

  // 200 SVGs (50 per theme × 4 themes)
  const svgDir = join(STARTER_DIR, 'svg');
  if (!existsSync(svgDir)) {
    fail('svg-count', '200 SVG icons rendered', 'starter-pack/svg/ missing');
  } else {
    const themes = readdirSync(svgDir).filter((d) => statSync(join(svgDir, d)).isDirectory());
    const total = themes.reduce(
      (n, t) => n + readdirSync(join(svgDir, t)).filter((f) => f.endsWith('.svg')).length,
      0,
    );
    if (total === 200) ok('svg-count', '200 SVG icons rendered', `${themes.length} themes × 50 = 200`);
    else fail('svg-count', '200 SVG icons rendered', `found ${total} across ${themes.length} themes`);
  }

  // 5 PNG sizes × 200 each = 1000 PNGs
  const pngRoot = join(STARTER_DIR, 'png');
  const expectedSizes = [16, 32, 64, 128, 256];
  if (!existsSync(pngRoot)) {
    fail('png-sizes', 'PNG renders at 5 sizes', 'starter-pack/png/ missing');
  } else {
    const dirs = readdirSync(pngRoot)
      .map((s) => Number(s))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
    const missing = expectedSizes.filter((s) => !dirs.includes(s));
    let totalPng = 0;
    for (const s of dirs) {
      const themeDirs = readdirSync(join(pngRoot, String(s))).filter((d) =>
        statSync(join(pngRoot, String(s), d)).isDirectory(),
      );
      for (const t of themeDirs) {
        totalPng += readdirSync(join(pngRoot, String(s), t)).filter((f) => f.endsWith('.png')).length;
      }
    }
    if (missing.length === 0 && totalPng === 1000) {
      ok('png-sizes', 'PNG renders at 5 sizes', `${dirs.join(', ')} px · 1000 files`);
    } else if (missing.length === 0) {
      fail('png-sizes', 'PNG renders at 5 sizes', `expected 1000 PNGs, found ${totalPng}`);
    } else {
      fail('png-sizes', 'PNG renders at 5 sizes', `missing sizes: ${missing.join(', ')}`);
    }
  }

  // manifest.json parseable + 4 themes
  const manifestPath = join(STARTER_DIR, 'manifest.json');
  if (!existsSync(manifestPath)) {
    fail('manifest', 'manifest.json present & parseable', 'missing');
  } else {
    try {
      const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
      const themeCount = Array.isArray(m.themes) ? m.themes.length : 0;
      if (themeCount === 4) ok('manifest', 'manifest.json present & parseable', `4 themes`);
      else fail('manifest', 'manifest.json present & parseable', `expected 4 themes, found ${themeCount}`);
    } catch (e) {
      fail('manifest', 'manifest.json present & parseable', `JSON parse error: ${(e as Error).message}`);
    }
  }

  // index.html offline gallery
  if (existsSync(join(STARTER_DIR, 'index.html'))) {
    ok('gallery', 'starter-pack/index.html offline gallery', '');
  } else {
    fail('gallery', 'starter-pack/index.html offline gallery', 'missing');
  }

  // pack LICENSE includes MIT
  const packLicense = join(STARTER_DIR, 'LICENSE');
  if (!existsSync(packLicense)) {
    fail('pack-license', 'starter-pack/LICENSE present', 'missing');
  } else if (readFileSync(packLicense, 'utf8').toUpperCase().includes('MIT')) {
    ok('pack-license', 'starter-pack/LICENSE present', 'MIT');
  } else {
    fail('pack-license', 'starter-pack/LICENSE present', 'does not look like MIT');
  }

  // README inside pack
  if (existsSync(join(STARTER_DIR, 'README.md'))) {
    ok('pack-readme', 'starter-pack/README.md present', '');
  } else {
    fail('pack-readme', 'starter-pack/README.md present', 'missing');
  }
}

// ─── §6.4 + §7.3 itch listing assets ───────────────────────────────
function checkCoverImages() {
  const expected: Array<[string, number, number]> = [
    ['cover-315x250.png', 315, 250],
    ['cover-630x500.png', 630, 500],
  ];
  for (const [name, w, h] of expected) {
    const p = join(ITCH_DIR, name);
    if (!existsSync(p)) {
      if (CI_MODE) {
        todo(`cover-${w}x${h}`, `itch cover ${w}×${h}`, `Skipped (--ci): author must export ${name} before launch`);
      } else {
        fail(`cover-${w}x${h}`, `itch cover ${w}×${h}`, `missing — author must export ${name}`);
      }
      continue;
    }
    const dims = readPngDims(p);
    if (!dims) fail(`cover-${w}x${h}`, `itch cover ${w}×${h}`, 'not a valid PNG');
    else if (dims.w === w && dims.h === h) ok(`cover-${w}x${h}`, `itch cover ${w}×${h}`, fmtSize(fileSize(p)));
    else fail(`cover-${w}x${h}`, `itch cover ${w}×${h}`, `wrong dims: ${dims.w}×${dims.h}`);
  }
}

function checkDemoGif() {
  const p = join(ITCH_DIR, 'demo.gif');
  if (!existsSync(p)) {
    if (CI_MODE) {
      todo('demo-gif', 'demo.gif < 3 MB, 8–10 s loop', 'Skipped (--ci): author must produce demo.gif before launch');
    } else {
      fail('demo-gif', 'demo.gif < 3 MB, 8–10 s loop', 'missing — author must produce demo.gif');
    }
    return;
  }
  const size = fileSize(p);
  const limit = 3 * 1024 * 1024;
  if (size >= limit) {
    fail('demo-gif', 'demo.gif < 3 MB', `${fmtSize(size)} exceeds 3 MB`);
    return;
  }
  const dims = readGifDims(p);
  if (!dims) {
    warn('demo-gif', 'demo.gif valid', `size ok (${fmtSize(size)}) but GIF header unreadable`);
    return;
  }
  ok('demo-gif', 'demo.gif < 3 MB', `${fmtSize(size)} · ${dims.w}×${dims.h}`);
  todo('demo-gif-loop', 'demo.gif loops cleanly, 8–10 s', 'Manual visual check (decoder not wired)');
}

function checkScreenshots() {
  const dir = join(ITCH_DIR, 'screenshots');
  if (!existsSync(dir)) {
    if (CI_MODE) {
      todo('screenshots', '5 screenshots present', 'Skipped (--ci): author must add itch-page/screenshots/ before launch');
    } else {
      fail('screenshots', '5 screenshots present', 'itch-page/screenshots/ missing');
    }
    return;
  }
  const pngs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'));
  if (pngs.length === 0) {
    if (CI_MODE) {
      todo('screenshots', '5 screenshots present', 'Skipped (--ci): no PNGs yet');
    } else {
      fail('screenshots', '5 screenshots present', 'no PNGs in itch-page/screenshots/');
    }
    return;
  }
  const allowed: Array<[number, number]> = [
    [1280, 720],
    [1920, 1080],
  ];
  const issues: string[] = [];
  for (const f of pngs) {
    const p = join(dir, f);
    const sz = fileSize(p);
    if (sz >= 800 * 1024) issues.push(`${f}: ${fmtSize(sz)} > 800 KB`);
    const dims = readPngDims(p);
    if (!dims) {
      issues.push(`${f}: not a PNG`);
      continue;
    }
    if (!allowed.some(([w, h]) => dims.w === w && dims.h === h)) {
      issues.push(`${f}: ${dims.w}×${dims.h} not 1280×720 or 1920×1080`);
    }
  }
  if (pngs.length !== 5) {
    warn('screenshots-count', '5 screenshots present', `found ${pngs.length} (target 5 per spec §7.2)`);
  } else {
    ok('screenshots-count', '5 screenshots present', `${pngs.length} files`);
  }
  if (issues.length === 0) ok('screenshots-quality', 'screenshots size + dims', 'all <800 KB and at allowed dims');
  else fail('screenshots-quality', 'screenshots size + dims', issues.join('; '));
}

function checkItchCopy() {
  const desc = join(ITCH_DIR, 'description.md');
  const tags = join(ITCH_DIR, 'tags.md');
  if (existsSync(desc)) ok('itch-desc', 'itch description.md', '');
  else fail('itch-desc', 'itch description.md', 'missing');
  if (existsSync(tags)) ok('itch-tags', 'itch tags.md', '');
  else fail('itch-tags', 'itch tags.md', 'missing');
}

function checkDevlogs() {
  const dir = join(ITCH_DIR, 'devlog-templates');
  if (!existsSync(dir)) {
    fail('devlogs', '4 devlog drafts queued', 'itch-page/devlog-templates/ missing');
    return;
  }
  const mds = readdirSync(dir).filter((f) => f.endsWith('.md'));
  if (mds.length >= 4) ok('devlogs', '4 devlog drafts queued', `${mds.length} files`);
  else fail('devlogs', '4 devlog drafts queued', `found ${mds.length}, expected ≥ 4`);
}

// ─── repo / release ────────────────────────────────────────────────
function checkLicense() {
  const p = join(ROOT, 'LICENSE');
  if (!existsSync(p)) fail('repo-license', 'root LICENSE present', 'missing');
  else if (readFileSync(p, 'utf8').toUpperCase().includes('MIT')) ok('repo-license', 'root LICENSE present', 'MIT');
  else fail('repo-license', 'root LICENSE present', 'does not look like MIT');
}

function checkV1Tag() {
  try {
    const required = ['v1.0.0', 'v1.1.0'];
    const tags = execSync('git tag -l', { encoding: 'utf8' })
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    const missing = required.filter((r) => !tags.includes(r));
    if (missing.length === 0) ok('git-tag', 'release tags pushed', required.join(', '));
    else
      fail(
        'git-tag',
        'release tags pushed',
        `missing: ${missing.join(', ')} — run \`git tag <name> && git push --tags\``,
      );
  } catch (e) {
    warn('git-tag', 'release tags pushed', `git unavailable: ${(e as Error).message}`);
  }
}

function checkPackages() {
  const required = [
    'packages/core/package.json',
    'packages/cli/package.json',
    'packages/web-preview/package.json',
    'packages/themes/medieval-fantasy/package.json',
    'packages/themes/sci-fi/package.json',
    'packages/themes/cozy-farm/package.json',
    'packages/themes/roguelike-inventory/package.json',
  ];
  const missing = required.filter((p) => !existsSync(join(ROOT, p)));
  if (missing.length === 0) ok('packages', 'workspace packages present', `${required.length} packages`);
  else fail('packages', 'workspace packages present', `missing: ${missing.join(', ')}`);
}

// ─── manual reminders (spec §7.3) ──────────────────────────────────
function manualReminders() {
  todo('html5-sandbox', 'web preview runs in itch HTML5 sandbox', 'Manual: upload to itch as draft, click play');
  todo('visual-qa', 'sample 30 icons per theme', 'Run `pnpm qa-sample` and eyeball output');
  todo('social-accounts', 'Procforge accounts created (Reddit/Twitter/Bluesky)', 'Manual setup, draft first posts');
  todo('spell-check', 'description.md spell-checked', 'Manual proofread before launch');
  todo('no-ai-decl', 'no-AI-training declaration', 'Confirm wording in LICENSE / description');
}

// ─── run ───────────────────────────────────────────────────────────
checkStarterPack();
checkCoverImages();
checkDemoGif();
checkScreenshots();
checkItchCopy();
checkDevlogs();
checkLicense();
checkV1Tag();
checkPackages();
manualReminders();

// ─── render report ─────────────────────────────────────────────────
const ICON: Record<Status, string> = { ok: 'OK  ', fail: 'FAIL', warn: 'WARN', todo: 'TODO' };
const groups: Record<Status, Result[]> = { ok: [], fail: [], warn: [], todo: [] };
for (const r of results) groups[r.status].push(r);

console.log('# Procforge Icons — Pre-launch Check\n');
console.log(`Spec: docs/superpowers/specs/2026-04-25-procforge-icons-design.md §7.3\n`);

const order: Status[] = ['fail', 'warn', 'ok', 'todo'];
for (const s of order) {
  if (groups[s].length === 0) continue;
  const heading =
    s === 'ok'
      ? '## Passing'
      : s === 'fail'
        ? '## Blocking failures'
        : s === 'warn'
          ? '## Warnings'
          : '## Manual / TODO';
  console.log(heading);
  for (const r of groups[s]) {
    console.log(`- [${ICON[r.status]}] ${r.label}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  console.log('');
}

const failed = groups.fail.length;
const warned = groups.warn.length;
console.log(`Summary: ${groups.ok.length} ok · ${failed} fail · ${warned} warn · ${groups.todo.length} todo\n`);

if (failed > 0) {
  console.error(`Pre-launch check FAILED: ${failed} blocking item(s).`);
  process.exit(1);
}
if (STRICT && warned > 0) {
  console.error(`Pre-launch check FAILED (strict mode): ${warned} warning(s).`);
  process.exit(1);
}
console.log('Pre-launch check passed (manual TODOs still required before launch).');
