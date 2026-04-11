/**
 * Live integration tests (node:test). Not discovered by `npm run test:edge-functions`
 * (that command only runs `*.test.ts` files).
 *
 * Run via `live-check.mjs` only; it supplies the base URL for this process. See
 * `live-check.mjs -h`.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

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

const docsPath = '/docs/concepts/resources/';
const docsIndexHtmlPath = '/docs/concepts/resources/index.html';
const docsUppercaseIndexHtmlPath = '/docs/concepts/resources/index.HTML';

test('GET /docs/concepts/resources/ with Accept: text/markdown → markdown + Vary: Accept', async () => {
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
    text.includes('# Resources'),
    'body should contain "# Resources" (English docs index heading)',
  );
  assert.ok(
    varyIncludesAccept(res.headers.get('vary')),
    `Vary should include Accept, got ${JSON.stringify(res.headers.get('vary'))}`,
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

test('GET /docs/concepts/resources/index.html with Accept: text/markdown → markdown + Vary: Accept', async () => {
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
    text.includes('# Resources'),
    'body should contain "# Resources" (English docs index heading)',
  );
  assert.ok(
    varyIncludesAccept(res.headers.get('vary')),
    `Vary should include Accept, got ${JSON.stringify(res.headers.get('vary'))}`,
  );
});

test(
  'GET /docs/concepts/resources/index.HTML with Accept: text/markdown → redirect',
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
    const expected = '/docs/concepts/resources/';
    assert.ok(
      target.endsWith(expected),
      `Location should end with ${expected} (or without trailing slash), got ${JSON.stringify(loc)} → ${target}`,
    );
  },
);

test('GET /search/ with Accept: text/markdown → HTML fallback + Vary: Accept', async () => {
  const ref = baseRef();
  const url = absUrl('/search/', ref);
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

test('HEAD /docs/concepts/resources/ with Accept: text/markdown → empty body', async () => {
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
