// Guards the built site against README pages. Every README.md in the mounted
// content modules is either remapped to a section index (the semconv mounts)
// or excluded, so a `readme/` page in the output means a mount pattern stopped
// matching. Hugo 0.166.0's new glob engine did exactly that to `**/README.md`
// and the build stayed green: the leak is only visible in the output.
//
// It reads the built site, so it skips when `public/` is absent (convention of
// `tests/public/`, run via `test:public`).

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
    assert.deepEqual(leaked, [], `README pages leaked: ${leaked.join(', ')}`);
  });
}
