// Guards the built site against README pages. Every README.md in the mounted
// content modules is renamed or remapped to a section index, or excluded,
// before Hugo sees it, so a `readme/` page in the output means one of those
// steps stopped working. Hugo 0.166.0's glob change did exactly that with a
// green build (site/build/dependencies.md § Hugo).

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
    assert.deepEqual(leaked, [], 'no README pages in the built site');
  });
}
