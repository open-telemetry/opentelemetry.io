/**
 * Tests for asset-tracking Edge Function:
 *
 * - tracking gate (shouldTrackAssetFetch)
 * - handler integration (assetTracking default export)
 *
 * cSpell:ignore GOOGLEANALYTICS
 */

import assert from 'node:assert/strict';
import test from 'node:test';

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
import assetTracking, { shouldTrackAssetFetch } from './index.ts';

test('shouldTrackAssetFetch accepts GET .md requests', () => {
  const request = new Request(
    'https://example.com/docs/concepts/resources/index.md',
  );
  const response = new Response('# Resources', {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
    status: 200,
  });

  assert.strictEqual(
    shouldTrackAssetFetch(request, response),
    true,
    'shouldTrackAssetFetch',
  );
});

test('shouldTrackAssetFetch accepts GET .txt requests', () => {
  const request = new Request('https://example.com/llms.txt');
  const response = new Response('OpenTelemetry', {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    status: 200,
  });

  assert.strictEqual(
    shouldTrackAssetFetch(request, response),
    true,
    'shouldTrackAssetFetch',
  );
});

test('shouldTrackAssetFetch returns false for internal marked requests', () => {
  const request = new Request(
    'https://example.com/docs/concepts/resources/index.md',
    {
      headers: {
        [ASSET_FETCH_GA_INFO_HEADER]: INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
      },
    },
  );
  const response = new Response('# Resources', {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
    status: 200,
  });

  assert.strictEqual(
    shouldTrackAssetFetch(request, response),
    false,
    'shouldTrackAssetFetch',
  );
});

test('shouldTrackAssetFetch returns false for non-GET methods', () => {
  for (const method of ['HEAD', 'POST']) {
    const request = new Request(
      'https://example.com/docs/concepts/resources/index.md',
      { method },
    );
    const response = new Response('# Resources', {
      headers: { 'content-type': 'text/markdown; charset=utf-8' },
      status: 200,
    });

    assert.strictEqual(
      shouldTrackAssetFetch(request, response),
      false,
      'shouldTrackAssetFetch',
    );
  }
});

test('shouldTrackAssetFetch accepts non-2xx responses for tracked assets', () => {
  for (const status of [301, 404, 500]) {
    const request = new Request(
      'https://example.com/docs/concepts/resources/index.md',
    );
    const response = new Response('', {
      headers: { 'content-type': 'text/markdown; charset=utf-8' },
      status,
    });

    assert.strictEqual(
      shouldTrackAssetFetch(request, response),
      true,
      'shouldTrackAssetFetch',
    );
  }
});

test('shouldTrackAssetFetch accepts non-markdown content type for tracked assets', () => {
  const request = new Request(
    'https://example.com/docs/concepts/resources/index.md',
  );
  const response = new Response('<html></html>', {
    headers: { 'content-type': 'text/html' },
    status: 200,
  });

  assert.strictEqual(
    shouldTrackAssetFetch(request, response),
    true,
    'shouldTrackAssetFetch',
  );
});

test('shouldTrackAssetFetch returns false for non-tracked extensions', () => {
  const request = new Request(
    'https://example.com/docs/concepts/resources/index.html',
  );
  const response = new Response('<html></html>', {
    headers: { 'content-type': 'text/html' },
    status: 200,
  });

  assert.strictEqual(
    shouldTrackAssetFetch(request, response),
    false,
    'shouldTrackAssetFetch',
  );
});

test('handler emits asset_fetch for explicit .md requests', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupGa4CapturingFetchMock(t);
  const spy = createWaitUntilSpy();

  const response = await assetTracking(
    new Request('https://example.com/docs/concepts/resources/index.md'),
    {
      next: async () =>
        new Response('# Resources', {
          headers: { 'content-type': 'text/markdown; charset=utf-8' },
          status: 200,
        }),
      ...spy,
    },
  );

  await spy.flush();

  assert.strictEqual(response.status, 200, 'HTTP status');
  assert.strictEqual(
    response.headers.get('x-asset-fetch-ga-info'),
    '/docs/concepts/resources/index.md;ga-event-candidate,config-present',
    'X-Asset-Fetch-Ga-Info',
  );

  assertAssetFetchGa4Event(
    firstAssetFetchEvent(ga4Bodies),
    {
      asset_path: '/docs/concepts/resources/index.md',
      content_type: 'text/markdown',
      status_code: '200',
      event_emitter: 'tracking',
    },
    { expectOriginalPathAbsent: true },
  );
});

test('handler emits asset_fetch for explicit .txt requests', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupGa4CapturingFetchMock(t);
  const spy = createWaitUntilSpy();

  const response = await assetTracking(
    new Request('https://example.com/llms.txt'),
    {
      next: async () =>
        new Response('OpenTelemetry', {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
          status: 200,
        }),
      ...spy,
    },
  );

  await spy.flush();

  assert.strictEqual(response.status, 200, 'HTTP status');

  assertAssetFetchGa4Event(
    firstAssetFetchEvent(ga4Bodies),
    {
      asset_path: '/llms.txt',
      content_type: 'text/plain',
      status_code: '200',
      event_emitter: 'tracking',
    },
    { expectOriginalPathAbsent: true },
  );
});

test('handler skips asset_fetch for internal marked explicit .md requests', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupGa4CapturingFetchMock(t);
  const spy = createWaitUntilSpy();

  const response = await assetTracking(
    new Request('https://example.com/docs/concepts/resources/index.md', {
      headers: {
        [ASSET_FETCH_GA_INFO_HEADER]: INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
      },
    }),
    {
      next: async () =>
        new Response('# Resources', {
          headers: { 'content-type': 'text/markdown; charset=utf-8' },
          status: 200,
        }),
      ...spy,
    },
  );

  await spy.flush();

  assert.strictEqual(response.status, 200, 'HTTP status');
  assert.strictEqual(ga4Bodies.length, 0, 'GA4 body count');
  assert.strictEqual(
    response.headers.get('x-asset-fetch-ga-info'),
    'none: internal subrequest',
    'X-Asset-Fetch-Ga-Info',
  );
});

test('handler emits asset_fetch for explicit .md requests regardless of response status', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupGa4CapturingFetchMock(t);
  const spy = createWaitUntilSpy();

  const response = await assetTracking(
    new Request('https://example.com/docs/concepts/resources/index.md'),
    {
      next: async () =>
        new Response('missing', {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
          status: 404,
        }),
      ...spy,
    },
  );

  await spy.flush();

  assert.strictEqual(response.status, 404, 'HTTP status');

  assertAssetFetchGa4Event(firstAssetFetchEvent(ga4Bodies), {
    asset_path: '/docs/concepts/resources/index.md',
    content_type: 'text/plain',
    status_code: '404',
    event_emitter: 'tracking',
  });
});
