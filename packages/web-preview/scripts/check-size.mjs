import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../dist/', import.meta.url).pathname;
const limit = 1_000_000;

let total = 0;
const breakdown = [];

function walk(d) {
  for (const name of readdirSync(d, { withFileTypes: true })) {
    const full = join(d, name.name);
    if (name.isDirectory()) walk(full);
    else {
      const sz = statSync(full).size;
      total += sz;
      breakdown.push({ file: full.slice(dir.length), bytes: sz });
    }
  }
}
walk(dir);

breakdown.sort((a, b) => b.bytes - a.bytes);
for (const b of breakdown) console.log(`${b.bytes.toString().padStart(8)}  ${b.file}`);
console.log(`---\n${total.toString().padStart(8)}  TOTAL  (limit ${limit})`);
if (total > limit) {
  console.error(`FAIL: bundle exceeds ${limit} bytes`);
  process.exit(1);
}
console.log('OK: under budget');
