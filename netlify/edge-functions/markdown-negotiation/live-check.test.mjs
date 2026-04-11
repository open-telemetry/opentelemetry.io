/**
 * Live integration tests (node:test). Not discovered by `npm run test:edge-functions`
 * (that command only runs `*.test.ts` files).
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

function varyIncludesAccept(varyHeader) {
  if (!varyHeader) {
    return false;
  }
  return varyHeader
    .split(',')
    .some((part) => part.trim().toLowerCase() === 'accept');
}

function baseRef() {
  const raw = process.env[LIVE_CHECK_BASE_URL_ENV]?.trim();
  assert.ok(raw, 'Run live checks via: node .../live-check.mjs [-h] [BASE]');
  return resolveBaseRef(raw);
}

const docsPath = '/site/testing/tests/regular/';
const docsIndexHtmlPath = '/site/testing/tests/regular/index.html';
const docsUppercaseIndexHtmlPath = '/site/testing/tests/regular/index.HTML';
const noMarkdownPath = '/site/testing/tests/no-md/';

test('GET /site/testing/tests/regular/ with Accept: text/markdown → markdown + Vary: Accept', async () => {
  const ref = baseRef();
  const url = absUrl(docsPath, ref);
  const res = await fetch(url, {
    headers: { accept: 'text/markdown' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();
  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.ok(
    ct.toLowerCase().includes('text/markdown'),
    `expected text/markdown content-type, got ${JSON.stringify(ct)}`,
  );
  assert.ok(
    text.includes('# Regular edge function test page'),
    'body should contain "# Regular edge function test page"',
  );
  assert.ok(
    varyIncludesAccept(res.headers.get('vary')),
    `Vary should include Accept, got ${JSON.stringify(res.headers.get('vary'))}`,
  );
});

test('GET /site/testing/tests/regular/ with Accept: text/markdown → X-Asset-Fetch-Ga-Info header', async () => {
  const ref = baseRef();
  const url = absUrl(docsPath, ref);
  const res = await fetch(url, {
    headers: { accept: 'text/markdown' },
  });

  assert.equal(
    res.headers.get(ASSET_FETCH_GA_INFO_HEADER),
    '/site/testing/tests/regular/index.md;ga-event-candidate,config-present',
  );
});

test('GET same URL with HTML preferred → HTML', async () => {
  const ref = baseRef();
  const url = absUrl(docsPath, ref);
  const res = await fetch(url, {
    headers: { accept: 'text/html, text/markdown;q=0.8' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();
  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.ok(
    ct.toLowerCase().includes('text/html'),
    `expected text/html content-type, got ${JSON.stringify(ct)}`,
  );
  assert.ok(
    text.includes('<!DOCTYPE html') || text.includes('<html'),
    'body should look like HTML',
  );
});

test('GET /site/testing/tests/regular/index.html with Accept: text/markdown → markdown + Vary: Accept', async () => {
  const ref = baseRef();
  const url = absUrl(docsIndexHtmlPath, ref);
  const res = await fetch(url, {
    headers: { accept: 'text/markdown' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();
  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.ok(
    ct.toLowerCase().includes('text/markdown'),
    `expected text/markdown content-type, got ${JSON.stringify(ct)}`,
  );
  assert.ok(
    text.includes('# Regular edge function test page'),
    'body should contain "# Regular edge function test page"',
  );
  assert.ok(
    varyIncludesAccept(res.headers.get('vary')),
    `Vary should include Accept, got ${JSON.stringify(res.headers.get('vary'))}`,
  );
});

test(
  'GET /site/testing/tests/regular/index.HTML with Accept: text/markdown → redirect',
  {
    // Deployed behavior for uppercase `index.HTML` is inconsistent across
    // paths and environments on Netlify. Skip this edge case for now.
    skip: 'Deferred while clarifying Netlify handling of uppercase index.HTML paths',
  },
  async () => {
    const ref = baseRef();
    const url = absUrl(docsUppercaseIndexHtmlPath, ref);
    const res = await fetch(url, {
      headers: { accept: 'text/markdown' },
      redirect: 'manual',
    });
    assert.ok(
      300 <= res.status && res.status <= 399,
      `expected redirect (3xx), got ${res.status} for ${url}`,
    );
    const loc = res.headers.get('location');
    assert.ok(loc, 'missing Location header');
    const target = new URL(loc, url).href;
    const expected = '/site/testing/tests/regular/';
    assert.ok(
      target.endsWith(expected),
      `Location should end with ${expected} (or without trailing slash), got ${JSON.stringify(loc)} → ${target}`,
    );
  },
);

test('GET /site/testing/tests/no-md/ with Accept: text/markdown → HTML fallback + Vary: Accept', async () => {
  const ref = baseRef();
  const url = absUrl(noMarkdownPath, ref);
  const res = await fetch(url, {
    headers: { accept: 'text/markdown' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();
  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.ok(
    ct.toLowerCase().includes('text/html'),
    `expected text/html, got ${JSON.stringify(ct)}`,
  );
  assert.ok(
    varyIncludesAccept(res.headers.get('vary')),
    `Vary should include Accept, got ${JSON.stringify(res.headers.get('vary'))}`,
  );
  assert.ok(
    text.includes('<!DOCTYPE html') || text.includes('<html'),
    'body should look like HTML',
  );
});

test('HEAD /site/testing/tests/regular/ with Accept: text/markdown → empty body', async () => {
  const ref = baseRef();
  const url = absUrl(docsPath, ref);
  const res = await fetch(url, {
    method: 'HEAD',
    headers: { accept: 'text/markdown' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const buf = await res.arrayBuffer();
  assert.equal(res.status, 200, `expected 200 for ${url}`);
  assert.ok(
    ct.toLowerCase().includes('text/markdown'),
    `expected text/markdown, got ${JSON.stringify(ct)}`,
  );
  assert.equal(buf.byteLength, 0, 'expected empty body');
});

test('GET /docs.html → redirect toward /docs/', async () => {
  const ref = baseRef();
  const url = absUrl('/docs.html', ref);
  const res = await fetch(url, {
    headers: { accept: 'text/markdown' },
    redirect: 'manual',
  });
  assert.ok(
    res.status === 301 ||
      res.status === 302 ||
      res.status === 307 ||
      res.status === 308,
    `expected redirect (3xx), got ${res.status} for ${url}`,
  );
  const loc = res.headers.get('location');
  assert.ok(loc, 'missing Location header');
  const target = new URL(loc, url).href;
  assert.ok(
    target.replace(/\/+$/, '').endsWith('/docs'),
    `Location should end with /docs/ (or /docs), got ${JSON.stringify(loc)} → ${target}`,
  );
});
