/**
 * Tests GA4 asset_fetch event integration in the markdown negotiation handler.
 *
 * - GET success: event with correct params and original_path when path differs
 * - GET index.html: original_path is the request path, asset_path is *.md
 * - GET direct *.md URL: current behavior is pass-through without asset_fetch
 * - HEAD success: no event
 * - markdown unavailable (HTML fallback): no event
 *
 * cSpell:ignore GOOGLEANALYTICS
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import markdownNegotiation from './index.ts';

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

function setupFetchMock(
  t: { after: (fn: () => void) => void },
  handler: (input: Request) => Promise<Response>,
) {
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

    return handler(input as Request);
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

test('GET markdown emits asset_fetch with original_path when path differs', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupFetchMock(
    t,
    async () =>
      new Response('# Docs', {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
        status: 200,
      }),
  );

  const spy = createWaitUntilSpy();

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/', {
      headers: { accept: 'text/markdown, text/html;q=0.8' },
    }),
    {
      next: async () =>
        new Response('<html></html>', {
          headers: { 'content-type': 'text/html' },
          status: 200,
        }),
      ...spy,
    },
  );

  await spy.flush();

  assert.equal(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
  );
  assert.equal(ga4Bodies.length, 1);

  const event = (
    ga4Bodies[0].events as { name: string; params: Record<string, string> }[]
  )[0];
  assert.equal(event.name, 'asset_fetch');
  assert.equal(event.params.asset_path, '/docs/index.md');
  assert.equal(event.params.content_type, 'text/markdown');
  assert.equal(event.params.status_code, '200');
  assert.equal(event.params.original_path, '/docs/');
  assert.equal(event.params.event_emitter, 'negotiation');
});

test('GET markdown includes original_path when request path differs from resolved md', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupFetchMock(
    t,
    async () =>
      new Response('# Page', {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
        status: 200,
      }),
  );

  const spy = createWaitUntilSpy();

  await markdownNegotiation(
    new Request('https://example.com/docs/index.html', {
      headers: { accept: 'text/markdown' },
    }),
    {
      next: async () =>
        new Response('<html></html>', {
          headers: { 'content-type': 'text/html' },
          status: 200,
        }),
      ...spy,
    },
  );

  await spy.flush();

  assert.equal(ga4Bodies.length, 1);
  const params = (
    ga4Bodies[0].events as { params: Record<string, string> }[]
  )[0].params;
  assert.equal(params.asset_path, '/docs/index.md');
  assert.equal(params.original_path, '/docs/index.html');
  assert.equal(params.event_emitter, 'negotiation');
});

test('GET direct .md URL currently passes through without asset_fetch', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupFetchMock(
    t,
    async () =>
      new Response('unexpected: fetch should not run for pass-through .md', {
        status: 500,
      }),
  );

  const spy = createWaitUntilSpy();

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/concepts/index.md'),
    {
      next: async () =>
        new Response('# Page', {
          headers: { 'content-type': 'text/markdown; charset=utf-8' },
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
  assert.equal(ga4Bodies.length, 0);
});

test('HEAD markdown does not emit asset_fetch', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupFetchMock(
    t,
    async () =>
      new Response('ignored', {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
        status: 200,
      }),
  );

  const spy = createWaitUntilSpy();

  await markdownNegotiation(
    new Request('https://example.com/docs/', {
      headers: { accept: 'text/markdown' },
      method: 'HEAD',
    }),
    {
      next: async () => new Response(null, { status: 200 }),
      ...spy,
    },
  );

  await spy.flush();

  assert.equal(ga4Bodies.length, 0, 'HEAD should not emit GA4 events');
});

test('markdown unavailable does not emit asset_fetch', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupFetchMock(
    t,
    async () => new Response('not found', { status: 404 }),
  );

  const spy = createWaitUntilSpy();

  await markdownNegotiation(
    new Request('https://example.com/search/', {
      headers: { accept: 'text/markdown' },
    }),
    {
      next: async () =>
        new Response('<html>search</html>', {
          headers: { 'content-type': 'text/html' },
          status: 200,
        }),
      ...spy,
    },
  );

  await spy.flush();

  assert.equal(
    ga4Bodies.length,
    0,
    'failed markdown fetch should not emit GA4 events',
  );
});
