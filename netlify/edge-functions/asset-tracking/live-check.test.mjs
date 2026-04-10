/**
 * Live integration tests (node:test). Not discovered by
 * `npm run test:edge-functions` (that command only runs `*.test.ts` files).
 *
 * Run via `live-check.mjs` only; it supplies the base URL for this process. See
 * `live-check.mjs -h`.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ASSET_FETCH_GA_INFO_HEADER,
  INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
} from '../lib/ga4-asset-fetch.ts';

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

const markdownPath = '/docs/concepts/resources/index.md';
const textPath = '/llms.txt';

test('GET explicit .md path → markdown response', async () => {
  const ref = baseRef();
  const url = absUrl(markdownPath, ref);
  const res = await fetch(url);
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();

  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.ok(
    ct.toLowerCase().includes('text/markdown'),
    `expected text/markdown content-type, got ${JSON.stringify(ct)}`,
  );
  assert.ok(
    text.includes('# Resources'),
    'body should contain "# Resources" (English docs index heading)',
  );
});

test('HEAD explicit .md path → success with empty body', async () => {
  const ref = baseRef();
  const url = absUrl(markdownPath, ref);
  const res = await fetch(url, { method: 'HEAD' });
  const ct = res.headers.get('content-type') ?? '';
  const buf = await res.arrayBuffer();

  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.ok(
    ct.toLowerCase().includes('text/markdown'),
    `expected text/markdown content-type, got ${JSON.stringify(ct)}`,
  );
  assert.equal(buf.byteLength, 0, 'expected empty body');
});

test('GET explicit .md path with internal marker → same markdown response', async () => {
  const ref = baseRef();
  const url = absUrl(markdownPath, ref);
  const res = await fetch(url, {
    headers: {
      [ASSET_FETCH_GA_INFO_HEADER]: INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
    },
  });
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();

  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.ok(
    ct.toLowerCase().includes('text/markdown'),
    `expected text/markdown content-type, got ${JSON.stringify(ct)}`,
  );
  assert.ok(
    text.includes('# Resources'),
    'body should contain "# Resources" (English docs index heading)',
  );
});

test('GET explicit .txt path → text response', async () => {
  const ref = baseRef();
  const url = absUrl(textPath, ref);
  const res = await fetch(url);
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();

  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.ok(
    ct.toLowerCase().includes('text/plain'),
    `expected text/plain content-type, got ${JSON.stringify(ct)}`,
  );
  assert.ok(
    text.includes('# OpenTelemetry'),
    'body should contain "# OpenTelemetry" (llms.txt heading)',
  );
});

test('GET explicit .txt path with internal marker → same text response', async () => {
  const ref = baseRef();
  const url = absUrl(textPath, ref);
  const res = await fetch(url, {
    headers: {
      [ASSET_FETCH_GA_INFO_HEADER]: INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
    },
  });
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();

  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.ok(
    ct.toLowerCase().includes('text/plain'),
    `expected text/plain content-type, got ${JSON.stringify(ct)}`,
  );
  assert.ok(
    text.includes('# OpenTelemetry'),
    'body should contain "# OpenTelemetry" (llms.txt heading)',
  );
});
