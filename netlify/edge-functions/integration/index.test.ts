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
import { createWaitUntilSpy, setupNetlifyEnv } from '../lib/test-helpers.ts';
import markdownNegotiation from '../markdown-negotiation/index.ts';

test('markdown negotiation internal .md fetch does not double-count asset_fetch', async (t) => {
  setupNetlifyEnv(t);

  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const spy = createWaitUntilSpy();
  const ga4Bodies: Record<string, unknown>[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request =
      input instanceof Request
        ? input
        : new Request(
            input instanceof URL ? input.toString() : String(input),
            init,
          );

    if (request.url.includes('google-analytics.com')) {
      if (init?.body) {
        ga4Bodies.push(JSON.parse(init.body as string));
      }
      return new Response('', { status: 200 });
    }

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
  }) as typeof fetch;

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
  assert.strictEqual(ga4Bodies.length, 1, 'GA4 body count');

  const event = (
    ga4Bodies[0].events as { name: string; params: Record<string, string> }[]
  )[0];
  assert.strictEqual(event.name, 'asset_fetch', 'event name');
  assert.strictEqual(event.params.asset_path, '/docs/index.md', 'asset_path');
  assert.strictEqual(
    event.params.content_type,
    'text/markdown',
    'content_type',
  );
  assert.strictEqual(event.params.status_code, '200', 'status_code');
  assert.strictEqual(event.params.original_path, '/docs/', 'original_path');
  assert.strictEqual(
    event.params.event_emitter,
    'negotiation',
    'event_emitter',
  );
});

test('direct .md request passes through markdown negotiation and emits one asset_fetch', async (t) => {
  setupNetlifyEnv(t);

  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const spy = createWaitUntilSpy();
  const ga4Bodies: Record<string, unknown>[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      input instanceof URL
        ? input.toString()
        : typeof input === 'string'
          ? input
          : input.url;

    if (url.includes('google-analytics.com')) {
      if (init?.body) {
        ga4Bodies.push(JSON.parse(init.body as string));
      }
      return new Response('', { status: 200 });
    }

    return new Response('unexpected fetch', { status: 500 });
  }) as typeof fetch;

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
  assert.strictEqual(ga4Bodies.length, 1, 'GA4 body count');

  const event = (
    ga4Bodies[0].events as { name: string; params: Record<string, string> }[]
  )[0];
  assert.strictEqual(event.name, 'asset_fetch', 'event name');
  assert.strictEqual(event.params.asset_path, '/docs/index.md', 'asset_path');
  assert.strictEqual(
    event.params.content_type,
    'text/markdown',
    'content_type',
  );
  assert.strictEqual(event.params.status_code, '200', 'status_code');
  assert.ok(!('original_path' in event.params));
  assert.strictEqual(event.params.event_emitter, 'tracking', 'event_emitter');
});
