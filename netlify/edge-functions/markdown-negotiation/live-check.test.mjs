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
import {
  absUrl,
  baseRef,
  expectedConfigTag,
} from '../../../tests/lib/live-check-base.mjs';
import { assertVaryIncludesAccept } from '../lib/test-helpers.ts';

const docsPath = '/site/testing/tests/regular/';
const docsIndexHtmlPath = '/site/testing/tests/regular/index.html';
const docsUppercaseIndexHtmlPath = '/site/testing/tests/regular/index.HTML';
const noMarkdownPath = '/site/testing/tests/no-md/';
const redirectRegularPath = '/site/testing/tests/redirect-regular/';
const redirectNoMarkdownPath = '/site/testing/tests/redirect-no-md/';

/** Negotiated Markdown responses set this in `markdown-negotiation/index.ts`. */
const expectedNegotiatedMarkdownContentType = 'text/markdown; charset=utf-8';
/** Static HTML from `context.next()` (typical Netlify / Hugo). */
const expectedHtmlContentType = 'text/html; charset=UTF-8';
/** Static 404 for missing markdown output currently comes back as HTML. */
const expectedMissingMarkdownContentType = /^text\/html;\s*charset=utf-8$/i;

const regularPageMarkdownHeading = /^# Regular test page/;
const htmlDocumentPattern = /<!DOCTYPE html|<html[\s>]/i;

test('GET /site/testing/tests/regular/ with Accept: text/markdown → markdown + Vary: Accept', async () => {
  const ref = baseRef();
  const url = absUrl(docsPath, ref);
  const res = await fetch(url, {
    headers: { accept: 'text/markdown' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();
  assert.strictEqual(res.status, 200, 'HTTP status');
  assert.strictEqual(ct, expectedNegotiatedMarkdownContentType, 'Content-Type');
  assert.match(text, regularPageMarkdownHeading, 'Request body');
  assertVaryIncludesAccept(res);
});

test('GET /site/testing/tests/regular/ with Accept: text/markdown → X-Asset-Fetch-Ga-Info header', async () => {
  const ref = baseRef();
  const url = absUrl(docsPath, ref);
  const res = await fetch(url, {
    headers: { accept: 'text/markdown' },
  });

  assert.strictEqual(
    res.headers.get(ASSET_FETCH_GA_INFO_HEADER),
    `/site/testing/tests/regular/index.md;ga-event-candidate,${expectedConfigTag(ref)}`,
    'X-Asset-Fetch-Ga-Info',
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
  assert.strictEqual(res.status, 200, 'HTTP status');
  assert.strictEqual(ct, expectedHtmlContentType, 'Content-Type');
  assert.match(text, htmlDocumentPattern, 'Request body');
});

test('GET /site/testing/tests/regular/index.html with Accept: text/markdown → markdown + Vary: Accept', async () => {
  const ref = baseRef();
  const url = absUrl(docsIndexHtmlPath, ref);
  const res = await fetch(url, {
    headers: { accept: 'text/markdown' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();
  assert.strictEqual(res.status, 200, 'HTTP status');
  assert.strictEqual(ct, expectedNegotiatedMarkdownContentType, 'Content-Type');
  assert.match(text, regularPageMarkdownHeading, 'Request body');
  assertVaryIncludesAccept(res);
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
    assert.match(String(res.status), /^3\d\d$/, 'HTTP status');
    const loc = res.headers.get('location');
    assert.ok(loc, 'Location');
    const expectedPathname = '/site/testing/tests/regular/';
    const locUrl = new URL(loc, url);
    assert.strictEqual(locUrl.pathname, expectedPathname, 'Location');
  },
);

test('GET /site/testing/tests/no-md/ with Accept: text/markdown → direct 404 subresponse + Vary: Accept', async () => {
  const ref = baseRef();
  const url = absUrl(noMarkdownPath, ref);
  const res = await fetch(url, {
    headers: { accept: 'text/markdown' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();
  assert.strictEqual(res.status, 404, 'HTTP status');
  assert.match(ct, expectedMissingMarkdownContentType, 'Content-Type');
  assertVaryIncludesAccept(res);
  assert.match(text, htmlDocumentPattern, 'Request body');
});

test(
  'GET /site/testing/tests/redirect-regular/ with Accept: text/markdown → direct redirect subresponse + Vary: Accept',
  {
    // Pending a fix to alias redirect handling for negotiated Markdown.
    skip: 'Pending a fix to alias redirect code',
  },
  async () => {
    const ref = baseRef();
    const url = absUrl(redirectRegularPath, ref);
    const res = await fetch(url, {
      headers: { accept: 'text/markdown' },
      redirect: 'manual',
    });

    assert.match(String(res.status), /^3\d\d$/, 'HTTP status');
    assert.strictEqual(
      new URL(res.headers.get('location') ?? '', url).pathname,
      '/site/testing/tests/regular/index.md',
      'Location',
    );
    assertVaryIncludesAccept(res);
  },
);

test(
  'GET /site/testing/tests/redirect-no-md/ with Accept: text/markdown → direct redirect subresponse + Vary: Accept',
  {
    // Pending a fix to alias redirect handling for negotiated Markdown.
    skip: 'Pending a fix to alias redirect code',
  },
  async () => {
    const ref = baseRef();
    const url = absUrl(redirectNoMarkdownPath, ref);
    const res = await fetch(url, {
      headers: { accept: 'text/markdown' },
      redirect: 'manual',
    });

    assert.match(String(res.status), /^3\d\d$/, 'HTTP status');
    assert.strictEqual(
      new URL(res.headers.get('location') ?? '', url).pathname,
      '/site/testing/tests/no-md/index.md',
      'Location',
    );
    assertVaryIncludesAccept(res);
  },
);

test('HEAD /site/testing/tests/regular/ with Accept: text/markdown → empty body', async () => {
  const ref = baseRef();
  const url = absUrl(docsPath, ref);
  const res = await fetch(url, {
    method: 'HEAD',
    headers: { accept: 'text/markdown' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const buf = await res.arrayBuffer();
  assert.strictEqual(res.status, 200, 'HTTP status');
  assert.strictEqual(ct, expectedNegotiatedMarkdownContentType, 'Content-Type');
  assert.strictEqual(buf.byteLength, 0, 'Response body');
});

test('HEAD /site/testing/tests/no-md/ with Accept: text/markdown → direct 404 subresponse without a body', async () => {
  const ref = baseRef();
  const url = absUrl(noMarkdownPath, ref);
  const res = await fetch(url, {
    method: 'HEAD',
    headers: { accept: 'text/markdown' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const buf = await res.arrayBuffer();
  assert.strictEqual(res.status, 404, 'HTTP status');
  assert.match(ct, expectedMissingMarkdownContentType, 'Content-Type');
  assert.strictEqual(buf.byteLength, 0, 'Response body');
  assertVaryIncludesAccept(res);
});

test('HEAD same URL with HTML preferred → pass-through response', async () => {
  const ref = baseRef();
  const url = absUrl(docsPath, ref);
  const res = await fetch(url, {
    method: 'HEAD',
    headers: { accept: 'text/html, text/markdown;q=0.8' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const buf = await res.arrayBuffer();
  assert.strictEqual(res.status, 200, 'HTTP status');
  assert.strictEqual(ct, expectedHtmlContentType, 'Content-Type');
  assert.strictEqual(buf.byteLength, 0, 'Response body');
});

test('GET /docs.html → redirect toward /docs/', async () => {
  const ref = baseRef();
  const url = absUrl('/docs.html', ref);
  const res = await fetch(url, {
    headers: { accept: 'text/markdown' },
    redirect: 'manual',
  });
  assert.match(String(res.status), /^3\d\d$/, 'HTTP status');
  const loc = res.headers.get('location');
  assert.ok(loc, 'Location');
  const docsLocUrl = new URL(loc, url);
  assert.match(docsLocUrl.pathname, /^\/docs\/?$/, 'Location');
});
