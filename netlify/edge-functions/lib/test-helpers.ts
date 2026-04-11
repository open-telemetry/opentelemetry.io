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
