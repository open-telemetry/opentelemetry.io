/**
 * Cross-function integration tests for Netlify Edge Functions.
 *
 * cSpell:ignore GOOGLEANALYTICS
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import assetTracking from '../asset-tracking/index.ts';
import {
  ASSET_FETCH_GA_INFO_HEADER,
  INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
} from '../lib/ga4-asset-fetch.ts';
import {
  assertAssetFetchGa4Event,
  createWaitUntilSpy,
  firstAssetFetchEvent,
  setupGa4CapturingFetchMock,
  setupNetlifyEnv,
} from '../lib/test-helpers.ts';
import markdownNegotiation from '../markdown-negotiation/index.ts';

test('markdown negotiation internal .md fetch does not double-count asset_fetch', async (t) => {
  setupNetlifyEnv(t);

  const spy = createWaitUntilSpy();
  const ga4Bodies = setupGa4CapturingFetchMock(t, async (request) => {
    const url = new URL(request.url);
    assert.strictEqual(url.pathname, '/docs/index.md', 'Subrequest pathname');
    assert.strictEqual(request.method, 'GET', 'Subrequest method');
    assert.strictEqual(
      request.headers.get('accept'),
      'text/markdown',
      'Accept header',
    );
    assert.strictEqual(
      request.headers.get(ASSET_FETCH_GA_INFO_HEADER),
      INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
      'X-Asset-Fetch-Ga-Info',
    );

    return assetTracking(request, {
      next: async () =>
        new Response('# Docs', {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
          status: 200,
        }),
      ...spy,
    });
  });

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/', {
      headers: { accept: 'text/markdown, text/html;q=0.8' },
    }),
    {
      next: async () =>
        new Response('<html>fallback</html>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 200,
        }),
      ...spy,
    },
  );

  await spy.flush();

  assert.strictEqual(response.status, 200, 'HTTP status');
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
    'Content-Type',
  );
  assert.strictEqual(
    response.headers.get('x-asset-fetch-ga-info'),
    '/docs/index.md;ga-event-candidate,config-present',
    'X-Asset-Fetch-Ga-Info',
  );
  assert.strictEqual(await response.text(), '# Docs', 'Response body');

  assertAssetFetchGa4Event(firstAssetFetchEvent(ga4Bodies), {
    asset_path: '/docs/index.md',
    content_type: 'text/markdown',
    status_code: '200',
    original_path: '/docs/',
    event_emitter: 'negotiation',
  });
});

test('direct .md request passes through markdown negotiation and emits one asset_fetch', async (t) => {
  setupNetlifyEnv(t);

  const spy = createWaitUntilSpy();
  const ga4Bodies = setupGa4CapturingFetchMock(t);

  const request = new Request('https://example.com/docs/index.md');

  const response = await markdownNegotiation(request, {
    next: async () =>
      assetTracking(request, {
        next: async () =>
          new Response('# Docs', {
            headers: { 'content-type': 'text/markdown; charset=utf-8' },
            status: 200,
          }),
        ...spy,
      }),
    ...spy,
  });

  await spy.flush();

  assert.strictEqual(response.status, 200, 'HTTP status');
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
    'Content-Type',
  );
  assert.strictEqual(
    response.headers.get('x-asset-fetch-ga-info'),
    '/docs/index.md;ga-event-candidate,config-present',
    'X-Asset-Fetch-Ga-Info',
  );
  assert.strictEqual(await response.text(), '# Docs', 'Response body');

  assertAssetFetchGa4Event(
    firstAssetFetchEvent(ga4Bodies),
    {
      asset_path: '/docs/index.md',
      content_type: 'text/markdown',
      status_code: '200',
      event_emitter: 'tracking',
    },
    { expectOriginalPathAbsent: true },
  );
});
