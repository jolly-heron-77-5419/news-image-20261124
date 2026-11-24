// news-image-20261124 entry (Node 22, standard library only).
// The front page is the entry.png beside this file; the program copies
// it to /output/entry.png, byte for byte, so both grader runs agree.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, 'entry.png');
const src = new URL('./entry.png', import.meta.url);
const srcBytes = statSync(src).size;

// The entry is a PNG: refuse to ship anything else if the file ever
// gets replaced by mistake (the gate tells PNG and JPEG apart by
// their first bytes).
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!readFileSync(src).subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png is not a PNG file');
}
copyFileSync(src, dest);

// The gate takes at most 1 MiB: fail loudly instead of shipping a
// too-large image.
const bytes = statSync(dest).size;
if (bytes !== srcBytes) {
  throw new Error(`copied ${bytes} bytes but source is ${srcBytes}`);
}
if (bytes > 1048576) {
  throw new Error(`entry.png is ${bytes} bytes, over the 1 MiB limit`);
}
console.log(`wrote ${dest} (${bytes} bytes)`);
