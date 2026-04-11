/**
 * Live redirect checks for site-level routing behavior. These are not tied to a
 * particular Edge Function and should stay focused on externally visible
 * redirect semantics.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { absUrl, baseRef } from '../lib/live-check-base.mjs';

const htmlRedirectPath = '/docs.html';
const regularAliasPath = '/site/testing/tests/regular-alias/';
const noMarkdownAliasPath = '/site/testing/tests/no-md-alias/';

async function fetchRedirect(path, method = 'GET') {
  const ref = baseRef();
  const url = absUrl(path, ref);
  const res = await fetch(url, {
    method,
    headers: { accept: 'text/html' },
    redirect: 'manual',
  });

  return { ref, res, url };
}

test('GET /docs.html → redirect toward /docs/', async () => {
  const { res, url } = await fetchRedirect(htmlRedirectPath);

  assert.match(String(res.status), /^3\d\d$/, 'HTTP status');

  const loc = res.headers.get('location');
  assert.ok(loc, 'Location');
  const target = new URL(loc, url);
  assert.match(target.pathname, /^\/docs\/?$/, 'Location');
});

test('HEAD /docs.html → redirect toward /docs/', async () => {
  const { res, url } = await fetchRedirect(htmlRedirectPath, 'HEAD');
  const buf = await res.arrayBuffer();

  assert.match(String(res.status), /^3\d\d$/, 'HTTP status');

  const loc = res.headers.get('location');
  assert.ok(loc, 'Location');
  const target = new URL(loc, url);
  assert.match(target.pathname, /^\/docs\/?$/, 'Location');
  assert.strictEqual(buf.byteLength, 0, 'Response body');
});

test('GET /site/testing/tests/regular-alias/ → redirect toward canonical page', async () => {
  const { res, url } = await fetchRedirect(regularAliasPath);

  assert.match(String(res.status), /^3\d\d$/, 'HTTP status');

  const loc = res.headers.get('location');
  assert.ok(loc, 'Location');
  const target = new URL(loc, url);
  assert.strictEqual(
    target.pathname,
    '/site/testing/tests/regular/',
    'Location',
  );
});

test('GET /site/testing/tests/no-md-alias/ → redirect toward canonical page', async () => {
  const { res, url } = await fetchRedirect(noMarkdownAliasPath);

  assert.match(String(res.status), /^3\d\d$/, 'HTTP status');

  const loc = res.headers.get('location');
  assert.ok(loc, 'Location');
  const target = new URL(loc, url);
  assert.strictEqual(target.pathname, '/site/testing/tests/no-md/', 'Location');
});
