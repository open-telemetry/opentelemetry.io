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
import markdownNegotiation from '../markdown-negotiation/index.ts';

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

function createWaitUntilSpy() {
  const promises: Promise<unknown>[] = [];
  return {
    waitUntil: (p: Promise<unknown>) => {
      promises.push(p);
    },
    flush: () => Promise.all(promises),
  };
}

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
    assert.equal(url.pathname, '/docs/index.md');
    assert.equal(request.method, 'GET');
    assert.equal(request.headers.get('accept'), 'text/markdown');
    assert.equal(
      request.headers.get(ASSET_FETCH_GA_INFO_HEADER),
      INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
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

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
  );
  assert.equal(await response.text(), '# Docs');
  assert.equal(ga4Bodies.length, 1);

  const event = (
    ga4Bodies[0].events as { name: string; params: Record<string, string> }[]
  )[0];
  assert.equal(event.name, 'asset_fetch');
  assert.equal(event.params.asset_group, 'markdown');
  assert.equal(event.params.asset_path, '/docs/index.md');
  assert.equal(event.params.asset_ext, 'md');
  assert.equal(event.params.content_type, 'text/markdown');
  assert.equal(event.params.status_code, '200');
  assert.equal(event.params.original_path, '/docs/');
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

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
  );
  assert.equal(await response.text(), '# Docs');
  assert.equal(ga4Bodies.length, 1);

  const event = (
    ga4Bodies[0].events as { name: string; params: Record<string, string> }[]
  )[0];
  assert.equal(event.name, 'asset_fetch');
  assert.equal(event.params.asset_group, 'markdown');
  assert.equal(event.params.asset_path, '/docs/index.md');
  assert.equal(event.params.asset_ext, 'md');
  assert.equal(event.params.content_type, 'text/markdown');
  assert.equal(event.params.status_code, '200');
  assert.ok(!('original_path' in event.params));
});
