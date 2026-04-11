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

function expectedConfigTag(baseRef) {
  return (
    'config-' +
    (baseRef.hostname === 'opentelemetry.io' ? 'present' : 'missing')
  );
}

const schemaVersionPath = '/schemas/1.40.0';
const latestSchemaPath = '/schemas/latest';
const missingSchemaPath = '/schemas/does-not-exist';

/** Set on successful `/schemas/*` responses in `schema-analytics/index.ts`. */
const expectedSchemaYamlContentType = 'application/yaml';

test('GET /schemas/1.40.0 → YAML response', async () => {
  const ref = baseRef();
  const url = absUrl(schemaVersionPath, ref);
  const res = await fetch(url);
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();

  assert.strictEqual(res.status, 200, 'HTTP status');
  assert.strictEqual(ct, expectedSchemaYamlContentType, 'Content-Type');
  assert.match(text, /schema_url:/, 'Request body');
});

test('GET /schemas/1.40.0 → X-Asset-Fetch-Ga-Info header', async () => {
  const ref = baseRef();
  const url = absUrl(schemaVersionPath, ref);
  const res = await fetch(url);

  assert.strictEqual(
    res.headers.get(ASSET_FETCH_GA_INFO_HEADER),
    `${schemaVersionPath};ga-event-candidate,${expectedConfigTag(ref)}`,
    'X-Asset-Fetch-Ga-Info',
  );
});

test('HEAD /schemas/1.40.0 → success with empty body', async () => {
  const ref = baseRef();
  const url = absUrl(schemaVersionPath, ref);
  const res = await fetch(url, { method: 'HEAD' });
  const ct = res.headers.get('content-type') ?? '';
  const buf = await res.arrayBuffer();

  assert.strictEqual(res.status, 200, 'HTTP status');
  assert.strictEqual(ct, expectedSchemaYamlContentType, 'Content-Type');
  assert.strictEqual(buf.byteLength, 0, 'Response body');
});

test('GET /schemas/latest → redirect', async () => {
  const ref = baseRef();
  const url = absUrl(latestSchemaPath, ref);
  const res = await fetch(url, { redirect: 'manual' });

  assert.match(String(res.status), /^3\d\d$/, 'HTTP status');

  const loc = res.headers.get('location');
  assert.ok(loc, 'Location');
  const latestLocUrl = new URL(loc, url);
  assert.match(latestLocUrl.pathname, /^\/schemas\/.+$/, 'Location');
});

test('GET /schemas/does-not-exist → not found', async () => {
  const ref = baseRef();
  const url = absUrl(missingSchemaPath, ref);
  const res = await fetch(url, { redirect: 'manual' });

  assert.strictEqual(res.status, 404, 'HTTP status');
  const ct = res.headers.get('content-type') ?? '';
  assert.notStrictEqual(ct, 'application/yaml', 'Content-Type');
});
