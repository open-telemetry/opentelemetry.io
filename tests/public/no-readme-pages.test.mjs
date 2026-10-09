// Fails when any README.md renders as a page. Every README in the mounted
// content modules is renamed, remapped, or excluded before Hugo sees it, so a
// `readme/` directory in the output means one of those steps stopped working,
// which the build doesn't report (one such case, Hugo 0.166's glob change:
// https://opentelemetry.io/site/build/dependencies/#hugo). It checks output
// paths only, so a README given a `slug` or `url` passes; without a root
// `index.html`, the check skips.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const publicDir = path.join(repoRoot, 'public');

function readmeDirs(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.toLowerCase() === 'readme') found.push(full);
    else readmeDirs(full, found);
  }
  return found;
}

if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
  test(
    'no README pages (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  test('no README.md rendered as a page', () => {
    const leaked = readmeDirs(publicDir).map((d) =>
      path.relative(publicDir, d),
    );
    assert.deepEqual(
      leaked,
      [],
      'README pages are excluded from the built site',
    );
  });
}
