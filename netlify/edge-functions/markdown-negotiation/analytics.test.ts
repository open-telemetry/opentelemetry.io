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

import {
  createWaitUntilSpy,
  setupGa4CapturingFetchMock,
  setupNetlifyEnv,
} from '../lib/test-helpers.ts';
import markdownNegotiation from './index.ts';

test('GET markdown emits asset_fetch with original_path when path differs', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupGa4CapturingFetchMock(
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

  assert.strictEqual(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
    'Content-Type',
  );
  assert.strictEqual(ga4Bodies.length, 1, 'GA4 body count');
  assert.strictEqual(
    response.headers.get('x-asset-fetch-ga-info'),
    '/docs/index.md;ga-event-candidate,config-present',
    'X-Asset-Fetch-Ga-Info',
  );

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

test('GET markdown includes original_path when request path differs from resolved md', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupGa4CapturingFetchMock(
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

  assert.strictEqual(ga4Bodies.length, 1, 'GA4 body count');
  const params = (
    ga4Bodies[0].events as { params: Record<string, string> }[]
  )[0].params;
  assert.strictEqual(params.asset_path, '/docs/index.md', 'asset_path');
  assert.strictEqual(params.original_path, '/docs/index.html', 'original_path');
  assert.strictEqual(params.event_emitter, 'negotiation', 'event_emitter');
});

test('GET direct .md URL currently passes through without asset_fetch', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupGa4CapturingFetchMock(
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

  assert.strictEqual(response.status, 200, 'HTTP status');
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
    'Content-Type',
  );
  assert.strictEqual(ga4Bodies.length, 0, 'GA4 body count');
});

test('HEAD markdown does not emit asset_fetch', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupGa4CapturingFetchMock(
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

  assert.strictEqual(ga4Bodies.length, 0, 'GA4 body count');
});

test('markdown unavailable does not emit asset_fetch', async (t) => {
  setupNetlifyEnv(t);
  const ga4Bodies = setupGa4CapturingFetchMock(
    t,
    async () => new Response('not found', { status: 404 }),
  );

  const spy = createWaitUntilSpy();

  const response = await markdownNegotiation(
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

  assert.strictEqual(ga4Bodies.length, 0, 'GA4 body count');
  assert.strictEqual(
    response.headers.get('x-asset-fetch-ga-info'),
    'none: response does not meet route-specific gating',
    'X-Asset-Fetch-Ga-Info',
  );
});
