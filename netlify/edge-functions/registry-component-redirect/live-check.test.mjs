/**
 * Live integration tests (node:test). Not discovered by
 * `npm run test:edge-functions` (that command only runs `*.test.ts` files).
 *
 * Run via `live-check.mjs` only; it supplies the base URL for this process. See
 * `live-check.mjs -h`.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { absUrl, baseRef } from '../../../tests/lib/live-check-base.mjs';

const bogusSlugPath =
  '/ecosystem/registry/no-such-registry-entry-xyzzy-for-live-check';
const addingPath = '/ecosystem/registry/adding/';
const indexJsonPath = '/ecosystem/registry/index.json';
const GROUPED_LIVE_CHECK_ENV = 'EDGE_FUNCTION_LIVE_CHECK_GROUPED';

export function registerLiveChecks(registerTest = test) {
  registerTest('GET bogus registry slug → 301 to registry index', async () => {
    const ref = baseRef();
    const url = absUrl(bogusSlugPath, ref);
    const res = await fetch(url, { redirect: 'manual' });

    assert.strictEqual(res.status, 301, 'HTTP status');
    const loc = res.headers.get('location');
    assert.ok(loc, 'Location');
    const locUrl = new URL(loc, url);
    assert.strictEqual(
      locUrl.pathname,
      '/ecosystem/registry/',
      'Location path',
    );
  });

  registerTest(
    'GET bogus slug with query → Location preserves query',
    async () => {
      const ref = baseRef();
      const url = absUrl(`${bogusSlugPath}?q=test`, ref);
      const res = await fetch(url, { redirect: 'manual' });

      assert.strictEqual(res.status, 301, 'HTTP status');
      const locUrl = new URL(res.headers.get('location'), url);
      assert.strictEqual(locUrl.search, '?q=test', 'Location query');
    },
  );

  registerTest('GET /ecosystem/registry/adding/ → 200', async () => {
    const ref = baseRef();
    const url = absUrl(addingPath, ref);
    const res = await fetch(url);

    assert.strictEqual(res.status, 200, 'HTTP status');
    const ct = res.headers.get('content-type') ?? '';
    assert.match(ct, /text\/html/i, 'Content-Type');
  });

  registerTest('GET /ecosystem/registry/index.json → 200 JSON', async () => {
    const ref = baseRef();
    const url = absUrl(indexJsonPath, ref);
    const res = await fetch(url);
    const text = await res.text();

    assert.strictEqual(res.status, 200, 'HTTP status');
    const ct = res.headers.get('content-type') ?? '';
    assert.match(ct, /application\/json/i, 'Content-Type');
    assert.doesNotThrow(() => JSON.parse(text), 'JSON body');
  });
}

if (process.env[GROUPED_LIVE_CHECK_ENV] !== '1') {
  registerLiveChecks();
}
