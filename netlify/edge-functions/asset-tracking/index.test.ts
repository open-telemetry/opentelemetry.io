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
import assetTracking, { shouldTrackAssetFetch } from './index.ts';

function setupNetlifyEnv(t: { after: (fn: () => void) => void }) {
  const g = globalThis as Record<string, unknown>;
  const originalNetlify = g.Netlify;
  t.after(() => {
    g.Netlify = originalNetlify;
  });

  g.Netlify = {
    env: {
      get: (name: string) => {
        if (name === 'HUGO_SERVICES_GOOGLEANALYTICS_ID') return 'G-TEST';
        if (name === 'GA4_API_SECRET') return 'secret';
        return undefined;
      },
    },
  };
}

function setupFetchMock(t: { after: (fn: () => void) => void }) {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

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

  return ga4Bodies;
}

function createWaitUntilSpy() {
  const promises: Promise<unknown>[] = [];
  return {
    waitUntil: (p: Promise<unknown>) => {
      promises.push(p);
    },
    flush: () => Promise.all(promises),
  };
}

test('shouldTrackAssetFetch accepts GET .md requests', () => {
  const request = new Request(
    'https://example.com/docs/concepts/resources/index.md',
  );
  const response = new Response('# Resources', {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
    status: 200,
  });

  assert.equal(shouldTrackAssetFetch(request, response), true);
});

test('shouldTrackAssetFetch accepts GET .txt requests', () => {
  const request = new Request('https://example.com/llms.txt');
  const response = new Response('OpenTelemetry', {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    status: 200,
  });

  assert.equal(shouldTrackAssetFetch(request, response), true);
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

  assert.equal(shouldTrackAssetFetch(request, response), false);
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

    assert.equal(shouldTrackAssetFetch(request, response), false);
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

    assert.equal(shouldTrackAssetFetch(request, response), true);
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

  assert.equal(shouldTrackAssetFetch(request, response), true);
});

test('shouldTrackAssetFetch returns false for non-tracked extensions', () => {
  const request = new Request(
    'https://example.com/docs/concepts/resources/index.html',
  );
  const response = new Response('<html></html>', {
    headers: { 'content-type': 'text/html' },
    status: 200,
  });

  assert.equal(shouldTrackAssetFetch(request, response), false);
});

test('handler emits asset_fetch for explicit .md requests', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupFetchMock(t);
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

  assert.equal(response.status, 200);
  assert.equal(ga4Bodies.length, 1);

  const event = (
    ga4Bodies[0].events as { name: string; params: Record<string, string> }[]
  )[0];
  assert.equal(event.name, 'asset_fetch');
  assert.equal(event.params.asset_path, '/docs/concepts/resources/index.md');
  assert.equal(event.params.content_type, 'text/markdown');
  assert.equal(event.params.status_code, '200');
  assert.ok(!('original_path' in event.params));
  assert.equal(event.params.event_emitter, 'tracking');
});

test('handler emits asset_fetch for explicit .txt requests', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupFetchMock(t);
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

  assert.equal(response.status, 200);
  assert.equal(ga4Bodies.length, 1);

  const event = (
    ga4Bodies[0].events as { name: string; params: Record<string, string> }[]
  )[0];
  assert.equal(event.name, 'asset_fetch');
  assert.equal(event.params.asset_path, '/llms.txt');
  assert.equal(event.params.content_type, 'text/plain');
  assert.equal(event.params.status_code, '200');
  assert.ok(!('original_path' in event.params));
  assert.equal(event.params.event_emitter, 'tracking');
});

test('handler skips asset_fetch for internal marked explicit .md requests', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupFetchMock(t);
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

  assert.equal(response.status, 200);
  assert.equal(ga4Bodies.length, 0);
});

test('handler emits asset_fetch for explicit .md requests regardless of response status', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupFetchMock(t);
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

  assert.equal(response.status, 404);
  assert.equal(ga4Bodies.length, 1);

  const event = (
    ga4Bodies[0].events as { name: string; params: Record<string, string> }[]
  )[0];
  assert.equal(event.name, 'asset_fetch');
  assert.equal(event.params.asset_path, '/docs/concepts/resources/index.md');
  assert.equal(event.params.content_type, 'text/plain');
  assert.equal(event.params.status_code, '404');
  assert.equal(event.params.event_emitter, 'tracking');
});
