// cSpell:ignore GOOGLEANALYTICS

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAssetFetchGaInfoHeaderValue,
  enqueueAssetFetchEvent,
  enqueueGa4PageViewEvent,
  normalizeContentType,
  resolveClientId,
} from './ga4-mp.ts';

test('normalizeContentType extracts media type', () => {
  assert.strictEqual(
    normalizeContentType('application/yaml'),
    'application/yaml',
    'normalizeContentType',
  );
  assert.strictEqual(
    normalizeContentType('text/html; charset=utf-8'),
    'text/html',
    'normalizeContentType',
  );
  assert.strictEqual(
    normalizeContentType('  Application/JSON ; q=0.9'),
    'application/json',
    'normalizeContentType',
  );
  assert.strictEqual(
    normalizeContentType(null),
    'none',
    'normalizeContentType',
  );
  assert.strictEqual(normalizeContentType(''), 'none', 'normalizeContentType');
});

test('buildAssetFetchGaInfoHeaderValue formats GA event candidate path with tags', () => {
  assert.strictEqual(
    buildAssetFetchGaInfoHeaderValue({
      assetPath: '/schemas/1.40.0',
      configPresent: true,
      gaEventCandidate: true,
    }),
    '/schemas/1.40.0;ga-event-candidate,config-present',
    'buildAssetFetchGaInfoHeaderValue',
  );
});

test('buildAssetFetchGaInfoHeaderValue formats none reason', () => {
  assert.strictEqual(
    buildAssetFetchGaInfoHeaderValue({
      noneReason: 'internal subrequest',
      gaEventCandidate: false,
    }),
    'none: internal subrequest',
    'buildAssetFetchGaInfoHeaderValue',
  );
});

test('resolveClientId returns fallback when no GA cookie is present', () => {
  const request = new Request('https://example.com/', {
    headers: {},
  });
  assert.strictEqual(
    resolveClientId(request),
    'asset_fetch.anonymous',
    'resolveClientId',
  );
});

test('resolveClientId extracts client id from GA cookie', () => {
  const request = new Request('https://example.com/', {
    headers: { cookie: '_ga=GA1.1.123456789.1234567890' },
  });
  assert.strictEqual(
    resolveClientId(request),
    '123456789.1234567890',
    'resolveClientId',
  );
});

test('resolveClientId returns raw value for non-standard GA cookie', () => {
  const request = new Request('https://example.com/', {
    headers: { cookie: '_ga=custom-value' },
  });
  assert.strictEqual(
    resolveClientId(request),
    'custom-value',
    'resolveClientId',
  );
});

test('resolveClientId finds GA cookie among multiple cookies', () => {
  const request = new Request('https://example.com/', {
    headers: { cookie: 'session=abc; _ga=GA1.2.111.222; other=xyz' },
  });
  assert.strictEqual(resolveClientId(request), '111.222', 'resolveClientId');
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
  assert.strictEqual(
    url.searchParams.get('api_secret'),
    'secret-test',
    'api_secret',
  );
  assert.strictEqual(
    url.searchParams.get('measurement_id'),
    'G-TEST123',
    'measurement_id',
  );

  assert.ok(capturedBody, 'Body exists');
  assert.strictEqual(
    capturedBody!.client_id,
    'asset_fetch.anonymous',
    'client_id',
  );

  const events = capturedBody!.events as Array<{
    name: string;
    params: Record<string, string>;
  }>;
  assert.strictEqual(events.length, 1, 'events length');
  assert.strictEqual(events[0].name, 'asset_fetch', 'event name');
  assert.strictEqual(
    events[0].params.asset_path,
    '/schemas/1.40.0',
    'asset_path',
  );
  assert.strictEqual(
    events[0].params.content_type,
    'application/yaml',
    'content_type',
  );
  assert.strictEqual(events[0].params.status_code, '200', 'status_code');
  assert.strictEqual(events[0].params.event_emitter, 'schema', 'event_emitter');
  assert.strictEqual(
    events[0].params.original_path,
    undefined,
    'original_path',
  );
});

test('enqueueGa4PageViewEvent calls waitUntil with page_view payload', async (t) => {
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
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
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
  };

  const pageUrl = 'https://example.com/ecosystem/registry/miss';
  enqueueGa4PageViewEvent(new Request(pageUrl), context, {
    page_location: pageUrl,
    page_title: 't',
  });

  assert.ok(waitUntilPromise, 'waitUntil');
  await waitUntilPromise;

  assert.ok(capturedBody, 'Body exists');
  const events = capturedBody!.events as Array<{
    name: string;
    params: Record<string, string | number>;
  }>;
  assert.strictEqual(events.length, 1, 'events length');
  assert.strictEqual(events[0].name, 'page_view', 'event name');
  assert.strictEqual(events[0].params.page_location, pageUrl, 'page_location');
  assert.strictEqual(events[0].params.page_title, 't', 'page_title');
  assert.strictEqual(
    events[0].params.engagement_time_msec,
    1,
    'engagement_time_msec',
  );
});
