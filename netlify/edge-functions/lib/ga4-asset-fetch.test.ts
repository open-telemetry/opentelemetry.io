// cSpell:ignore GOOGLEANALYTICS

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  enqueueAssetFetchEvent,
  normalizeContentType,
  resolveClientId,
} from './ga4-asset-fetch.ts';

test('normalizeContentType extracts media type', () => {
  assert.equal(normalizeContentType('application/yaml'), 'application/yaml');
  assert.equal(normalizeContentType('text/html; charset=utf-8'), 'text/html');
  assert.equal(
    normalizeContentType('  Application/JSON ; q=0.9'),
    'application/json',
  );
  assert.equal(normalizeContentType(null), 'none');
  assert.equal(normalizeContentType(''), 'none');
});

test('resolveClientId returns fallback when no GA cookie is present', () => {
  const request = new Request('https://example.com/', {
    headers: {},
  });
  assert.equal(resolveClientId(request), 'asset_fetch.anonymous');
});

test('resolveClientId extracts client id from GA cookie', () => {
  const request = new Request('https://example.com/', {
    headers: { cookie: '_ga=GA1.1.123456789.1234567890' },
  });
  assert.equal(resolveClientId(request), '123456789.1234567890');
});

test('resolveClientId returns raw value for non-standard GA cookie', () => {
  const request = new Request('https://example.com/', {
    headers: { cookie: '_ga=custom-value' },
  });
  assert.equal(resolveClientId(request), 'custom-value');
});

test('resolveClientId finds GA cookie among multiple cookies', () => {
  const request = new Request('https://example.com/', {
    headers: { cookie: 'session=abc; _ga=GA1.2.111.222; other=xyz' },
  });
  assert.equal(resolveClientId(request), '111.222');
});

test('enqueueAssetFetchEvent no-ops without waitUntil', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  // No waitUntil on context — should not throw.
  enqueueAssetFetchEvent(
    request,
    {},
    {
      asset_path: '/schemas/1.40.0',
      content_type: 'application/yaml',
      status_code: '200',
      event_emitter: 'schema',
    },
  );
});

test('enqueueAssetFetchEvent calls waitUntil with GA4 payload', async (t) => {
  const g = globalThis as Record<string, unknown>;
  const originalNetlify = g.Netlify;
  const originalFetch = globalThis.fetch;
  t.after(() => {
    g.Netlify = originalNetlify;
    globalThis.fetch = originalFetch;
  });

  g.Netlify = {
    env: {
      get: (name: string) => {
        if (name === 'HUGO_SERVICES_GOOGLEANALYTICS_ID') return 'G-TEST123';
        if (name === 'GA4_API_SECRET') return 'secret-test';
        return undefined;
      },
    },
  };

  let capturedBody: Record<string, unknown> | undefined;
  let capturedUrl: string | undefined;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    capturedUrl =
      input instanceof URL
        ? input.toString()
        : typeof input === 'string'
          ? input
          : input.url;
    if (init?.body) {
      capturedBody = JSON.parse(init.body as string);
    }
    return new Response('', { status: 200 });
  }) as typeof fetch;

  let waitUntilPromise: Promise<unknown> | undefined;
  const context = {
    waitUntil: (p: Promise<unknown>) => {
      waitUntilPromise = p;
    },
    requestId: 'req-42',
  };

  const request = new Request('https://example.com/schemas/1.40.0');

  enqueueAssetFetchEvent(request, context, {
    asset_path: '/schemas/1.40.0',
    content_type: 'application/yaml',
    status_code: '200',
    event_emitter: 'schema',
  });

  assert.ok(waitUntilPromise, 'waitUntil should have been called');
  await waitUntilPromise;

  assert.ok(capturedUrl, 'fetch should have been called');
  const url = new URL(capturedUrl!);
  assert.equal(url.searchParams.get('api_secret'), 'secret-test');
  assert.equal(url.searchParams.get('measurement_id'), 'G-TEST123');

  assert.ok(capturedBody);
  assert.equal(capturedBody!.client_id, 'asset_fetch.anonymous');

  const events = capturedBody!.events as Array<{
    name: string;
    params: Record<string, string>;
  }>;
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'asset_fetch');
  assert.equal(events[0].params.asset_path, '/schemas/1.40.0');
  assert.equal(events[0].params.content_type, 'application/yaml');
  assert.equal(events[0].params.status_code, '200');
  assert.equal(events[0].params.event_emitter, 'schema');
  assert.equal(
    events[0].params.original_path,
    undefined,
    'undefined params should be stripped',
  );
});
