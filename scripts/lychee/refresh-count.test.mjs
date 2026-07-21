// The default refcache refresh/prune count lives in two places that cannot
// derive from each other: the `${PRUNE_N:-N}` fallback in the
// `fix:refcache:refresh` npm script (shell), and the
// `number_of_entries_to_refresh` workflow-dispatch input default in
// refcache-refresh.yml (a YAML literal). This guard keeps the copies in
// agreement.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (relPath) =>
  readFileSync(new URL(relPath, import.meta.url), 'utf8');

test('default refresh count agrees across package.json and refcache-refresh.yml', () => {
  const script = JSON.parse(read('../../package.json')).scripts[
    'fix:refcache:refresh'
  ];
  const pkgMatch = script?.match(/\$\{PRUNE_N:-(\d+)\}/);
  assert.ok(pkgMatch, 'fix:refcache:refresh has a ${PRUNE_N:-N} fallback');

  const workflow = read('../../.github/workflows/refcache-refresh.yml');
  const wfMatch = workflow.match(/^\s*default: &default_refresh_count (\d+)$/m);
  assert.ok(wfMatch, 'refcache-refresh.yml has a default_refresh_count anchor');

  assert.equal(
    pkgMatch[1],
    wfMatch[1],
    'refresh counts agree across package.json and refcache-refresh.yml',
  );
});
