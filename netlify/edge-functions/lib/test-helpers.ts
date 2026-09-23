/** Shared helpers for edge-function tests (unit and live-check). */

import assert from 'node:assert/strict';

/** `node:test` context (or any object with `after`). */
export type TestLifecycle = { after: (fn: () => void) => void };

/**
 * Minimal Netlify globals so GA4 enqueue paths see measurement id + API secret.
 * Values match across handler / integration tests (`G-TEST`, `secret`).
 */
export function setupNetlifyEnv(t: TestLifecycle): void {
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

/** Collects `context.waitUntil` promises for `await flush()` in tests. */
export function createWaitUntilSpy(): {
  waitUntil: (p: Promise<unknown>) => void;
  flush: () => Promise<unknown[]>;
} {
  const promises: Promise<unknown>[] = [];
  return {
    waitUntil: (p: Promise<unknown>) => {
      promises.push(p);
    },
    flush: () => Promise.all(promises),
  };
}

const defaultNonGa4Fetch: (input: Request) => Promise<Response> = async () =>
  new Response('unexpected fetch', { status: 500 });

/**
 * Stubs `globalThis.fetch`: records GA4 Measurement Protocol POST bodies and
 * delegates other requests to `nonGa4Handler` (default: 500 "unexpected fetch").
 */
export function setupGa4CapturingFetchMock(
  t: TestLifecycle,
  nonGa4Handler: (input: Request) => Promise<Response> = defaultNonGa4Fetch,
): Record<string, unknown>[] {
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

    return nonGa4Handler(input as Request);
  }) as typeof fetch;

  return ga4Bodies;
}

/**
 * Replaces `globalThis.fetch` for the duration of the test; restores the
 * previous implementation in `t.after`.
 */
export function withMockFetch(
  t: TestLifecycle,
  implementation: typeof fetch,
): void {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = implementation;
}

/** One GA4 Measurement Protocol `events[]` entry used in `asset_fetch` tests. */
export type AssetFetchGa4Event = {
  name: string;
  params: Record<string, string>;
};

const ASSET_FETCH_PARAM_KEYS = [
  'asset_path',
  'content_type',
  'status_code',
  'original_path',
  'event_emitter',
] as const;

export type AssetFetchParamsExpected = Partial<
  Record<(typeof ASSET_FETCH_PARAM_KEYS)[number], string>
>;

function parseGa4EventsArray(
  body: Record<string, unknown>,
): AssetFetchGa4Event[] {
  const events = body.events;
  assert.ok(Array.isArray(events), 'GA4 body.events');
  return events as AssetFetchGa4Event[];
}

/**
 * Asserts `ga4Bodies.length` and returns the first event from the first captured
 * GA4 POST JSON body.
 */
export function firstAssetFetchEvent(
  ga4Bodies: Record<string, unknown>[],
  expectedBodyCount = 1,
): AssetFetchGa4Event {
  assert.strictEqual(ga4Bodies.length, expectedBodyCount, 'GA4 body count');
  const events = parseGa4EventsArray(ga4Bodies[0] as Record<string, unknown>);
  assert.ok(events.length > 0, 'GA4 events length');
  return events[0]!;
}

/** First captured MP event with the given `name` (e.g. `page_view`). */
export function firstMpEventNamed(
  ga4Bodies: Record<string, unknown>[],
  eventName: string,
  expectedBodyCount = 1,
): { name: string; params: Record<string, unknown> } {
  assert.strictEqual(ga4Bodies.length, expectedBodyCount, 'GA4 body count');
  const events = parseGa4EventsArray(ga4Bodies[0] as Record<string, unknown>);
  const ev = events.find((e) => e.name === eventName);
  assert.ok(ev, `GA4 event ${eventName}`);
  const hit = ev as AssetFetchGa4Event;
  return {
    name: hit.name,
    params: { ...hit.params } as Record<string, unknown>,
  };
}

/** Like {@link firstAssetFetchEvent} but returns only `params` (no `name` check). */
export function firstAssetFetchParams(
  ga4Bodies: Record<string, unknown>[],
  expectedBodyCount = 1,
): Record<string, string> {
  return firstAssetFetchEvent(ga4Bodies, expectedBodyCount).params;
}

export function assertAssetFetchGa4Event(
  event: AssetFetchGa4Event,
  expectedParams: AssetFetchParamsExpected,
  options?: { expectOriginalPathAbsent?: boolean },
): void {
  assert.strictEqual(event.name, 'asset_fetch', 'event name');
  assertAssetFetchParams(event.params, expectedParams, options);
}

/**
 * Asserts selected `asset_fetch` params. Only keys present on `expected` are
 * checked. When `expectOriginalPathAbsent` is true, asserts `original_path` is
 * not present on `params` (same as `assert.ok(!('original_path' in params))`).
 */
export function assertAssetFetchParams(
  params: Record<string, string>,
  expected: AssetFetchParamsExpected,
  options?: { expectOriginalPathAbsent?: boolean },
): void {
  if (options?.expectOriginalPathAbsent) {
    assert.ok(!('original_path' in params));
  }
  for (const k of ASSET_FETCH_PARAM_KEYS) {
    if (Object.prototype.hasOwnProperty.call(expected, k)) {
      assert.strictEqual(params[k], expected[k], k);
    }
  }
}

export function varyIncludesAccept(
  varyHeader: string | null | undefined,
): boolean {
  if (!varyHeader) {
    return false;
  }
  return varyHeader
    .split(',')
    .some((part) => part.trim().toLowerCase() === 'accept');
}

export function assertVaryIncludesAccept(
  res: Response,
  label = 'Vary header',
): void {
  const vary = res.headers.get('vary');
  assert.ok(
    varyIncludesAccept(vary),
    `${label}: expected Accept token, got ${JSON.stringify(vary)}`,
  );
}
