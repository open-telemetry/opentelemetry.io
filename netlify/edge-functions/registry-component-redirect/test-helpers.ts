/** Test-only helpers for `registry-component-redirect` (see index.test.ts). */

import assert from 'node:assert/strict';

import {
  REGISTRY_COMP_PROBE_HEADER,
  REGISTRY_COMP_PROBE_VALUE,
} from './index.ts';

export type RegistryEdgeContext = {
  next: () => Promise<Response>;
  waitUntil?: (promise: Promise<unknown>) => void;
};

export function createRegistryEdgeContext(
  options: {
    nextResponse?: Response;
    waitUntil?: (promise: Promise<unknown>) => void;
  } = {},
): RegistryEdgeContext {
  const nextResponse =
    options.nextResponse ?? new Response('from-next', { status: 200 });
  return {
    next: async () => nextResponse,
    waitUntil: options.waitUntil,
  };
}

/** `fetch` stub that requires the component probe header, then returns `response`. */
export function fetchStubForProbe(response: Response): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const req = input instanceof Request ? input : new Request(input);
    assert.strictEqual(
      req.headers.get(REGISTRY_COMP_PROBE_HEADER),
      REGISTRY_COMP_PROBE_VALUE,
      'probe header',
    );
    return response;
  }) as typeof fetch;
}
