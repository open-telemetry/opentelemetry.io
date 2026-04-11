/**
 * Live integration tests (node:test). Not discovered by
 * `npm run test:edge-functions` (that command only runs `*.test.ts` files).
 *
 * Run via `live-check.mjs` only; it supplies the base URL for this process. See
 * `live-check.mjs -h`.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { ASSET_FETCH_GA_INFO_HEADER } from '../lib/ga4-asset-fetch.ts';

/** Must match the key set in `live-check.mjs` before spawning `node --test`. */
const LIVE_CHECK_BASE_URL_ENV = 'LIVE_CHECK_BASE_URL';

function resolveBaseRef(raw) {
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return new URL(withScheme.endsWith('/') ? withScheme : `${withScheme}/`);
}

function absUrl(path, baseRef) {
  return new URL(path, baseRef).href;
}

function baseRef() {
  const raw = process.env[LIVE_CHECK_BASE_URL_ENV]?.trim();
  assert.ok(raw, 'Run live checks via: node .../live-check.mjs [-h] [BASE]');
  return resolveBaseRef(raw);
}

const schemaVersionPath = '/schemas/1.40.0';
const latestSchemaPath = '/schemas/latest';
const missingSchemaPath = '/schemas/does-not-exist';

test('GET /schemas/1.40.0 → YAML response', async () => {
  const ref = baseRef();
  const url = absUrl(schemaVersionPath, ref);
  const res = await fetch(url);
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();

  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.equal(
    ct.toLowerCase(),
    'application/yaml',
    `expected application/yaml content-type, got ${JSON.stringify(ct)}`,
  );
  assert.ok(
    text.includes('schema_url:'),
    'body should look like a schema YAML document',
  );
});

test('GET /schemas/1.40.0 → X-Asset-Fetch-Ga-Info header', async () => {
  const ref = baseRef();
  const url = absUrl(schemaVersionPath, ref);
  const res = await fetch(url);

  assert.equal(
    res.headers.get(ASSET_FETCH_GA_INFO_HEADER),
    `${schemaVersionPath};ga-event-candidate,config-present`,
  );
});

test('HEAD /schemas/1.40.0 → success with empty body', async () => {
  const ref = baseRef();
  const url = absUrl(schemaVersionPath, ref);
  const res = await fetch(url, { method: 'HEAD' });
  const ct = res.headers.get('content-type') ?? '';
  const buf = await res.arrayBuffer();

  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.equal(
    ct.toLowerCase(),
    'application/yaml',
    `expected application/yaml content-type, got ${JSON.stringify(ct)}`,
  );
  assert.equal(buf.byteLength, 0, 'expected empty body');
});

test('GET /schemas/latest → redirect', async () => {
  const ref = baseRef();
  const url = absUrl(latestSchemaPath, ref);
  const res = await fetch(url, { redirect: 'manual' });

  assert.ok(300 <= res.status && res.status <= 399, `status for ${url}`);

  const loc = res.headers.get('location');
  assert.ok(loc, 'missing Location header');
  const target = new URL(loc, url).href;
  assert.ok(
    target.includes('/schemas/'),
    `Location should stay under /schemas/, got ${JSON.stringify(loc)} → ${target}`,
  );
});

test('GET /schemas/does-not-exist → not found', async () => {
  const ref = baseRef();
  const url = absUrl(missingSchemaPath, ref);
  const res = await fetch(url, { redirect: 'manual' });

  assert.equal(res.status, 404, `status for ${url}`);
  const ct = res.headers.get('content-type') ?? '';
  assert.notEqual(
    ct,
    'application/yaml',
    `non-YAML content-type for missing schema, got ${JSON.stringify(ct)}`,
  );
});
