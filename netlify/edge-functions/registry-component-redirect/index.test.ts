/**
 * Tests for registry-component-redirect Edge Function.
 *
 * cSpell:ignore subresponse
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createWaitUntilSpy,
  firstMpEventNamed,
  setupGa4CapturingFetchMock,
  setupNetlifyEnv,
  withMockFetch,
} from '../lib/test-helpers.ts';
import registryCompRedirect, {
  REGISTRY_COMP_PROBE_HEADER,
  REGISTRY_COMP_PROBE_VALUE,
  shouldHandleRegistryCompPath,
} from './index.ts';
import {
  createRegistryEdgeContext,
  fetchStubForProbe,
} from './test-helpers.ts';

test('shouldHandleRegistryCompPath: bare prefix and index root are false', () => {
  assert.strictEqual(
    shouldHandleRegistryCompPath('/ecosystem/registry'),
    false,
  );
  assert.strictEqual(
    shouldHandleRegistryCompPath('/ecosystem/registry/'),
    false,
  );
});

test('shouldHandleRegistryCompPath: any non-empty suffix is true', () => {
  assert.strictEqual(
    shouldHandleRegistryCompPath('/ecosystem/registry/foo'),
    true,
    'arbitrary slug',
  );
  assert.strictEqual(
    shouldHandleRegistryCompPath('/ecosystem/registry/index.json'),
    true,
    'index.json',
  );
});

test('probe header on incoming request → next() only (no fetch)', async (t) => {
  const nextBody = 'next-only';
  withMockFetch(t, async () => {
    assert.fail('fetch must not be called when probe header is set');
  });
  const res = await registryCompRedirect(
    new Request('https://example.com/ecosystem/registry/x', {
      headers: {
        [REGISTRY_COMP_PROBE_HEADER]: REGISTRY_COMP_PROBE_VALUE,
      },
    }),
    createRegistryEdgeContext({
      nextResponse: new Response(nextBody, { status: 200 }),
    }),
  );
  assert.strictEqual(res.status, 200, 'HTTP status');
  assert.strictEqual(await res.text(), nextBody, 'Request body');
});

test('GET /ecosystem/registry (no suffix) → next() only', async (t) => {
  withMockFetch(t, async () => {
    assert.fail('fetch must not be called for bare registry path');
  });
  const res = await registryCompRedirect(
    new Request('https://example.com/ecosystem/registry'),
    createRegistryEdgeContext(),
  );
  assert.strictEqual(res.status, 200, 'HTTP status');
});

test('GET /ecosystem/registry/ → next() only', async (t) => {
  withMockFetch(t, async () => {
    assert.fail('fetch must not be called for registry index path');
  });
  const res = await registryCompRedirect(
    new Request('https://example.com/ecosystem/registry/'),
    createRegistryEdgeContext(),
  );
  assert.strictEqual(res.status, 200, 'HTTP status');
});

test('POST /ecosystem/registry/foo → next() only', async (t) => {
  withMockFetch(t, async () => {
    assert.fail('fetch must not be called for non-GET/HEAD');
  });
  const res = await registryCompRedirect(
    new Request('https://example.com/ecosystem/registry/foo', {
      method: 'POST',
    }),
    createRegistryEdgeContext(),
  );
  assert.strictEqual(res.status, 200, 'HTTP status');
});

test('GET suffix: subresponse 200 is passed through', async (t) => {
  const sub = new Response('<html>ok</html>', {
    headers: { 'content-type': 'text/html; charset=utf-8' },
    status: 200,
  });
  withMockFetch(t, fetchStubForProbe(sub));
  const res = await registryCompRedirect(
    new Request('https://example.com/ecosystem/registry/adding/'),
    createRegistryEdgeContext(),
  );
  assert.strictEqual(res.status, 200, 'HTTP status');
  assert.strictEqual(
    res.headers.get('content-type'),
    'text/html; charset=utf-8',
    'Content-Type',
  );
});

test('GET suffix: subresponse 302 is passed through', async (t) => {
  const sub = new Response(null, {
    headers: { location: '/elsewhere' },
    status: 302,
  });
  withMockFetch(t, fetchStubForProbe(sub));
  const res = await registryCompRedirect(
    new Request('https://example.com/ecosystem/registry/redirect-me'),
    createRegistryEdgeContext(),
  );
  assert.strictEqual(res.status, 302, 'HTTP status');
  assert.strictEqual(res.headers.get('location'), '/elsewhere', 'Location');
});

test('GET suffix: subresponse 502 is passed through', async (t) => {
  const sub = new Response('bad gateway', { status: 502 });
  withMockFetch(t, fetchStubForProbe(sub));
  const res = await registryCompRedirect(
    new Request('https://example.com/ecosystem/registry/boom'),
    createRegistryEdgeContext(),
  );
  assert.strictEqual(res.status, 502, 'HTTP status');
});

test('GET suffix: subresponse 404 → 301 redirect + GA page_view', async (t) => {
  setupNetlifyEnv(t);
  const spy = createWaitUntilSpy();
  const gaBodies = setupGa4CapturingFetchMock(
    t,
    fetchStubForProbe(
      new Response('missing', {
        headers: { 'content-type': 'text/html; charset=utf-8' },
        status: 404,
      }),
    ),
  );

  const reqUrl = 'https://example.com/ecosystem/registry/missing-slug?lang=en';
  const res = await registryCompRedirect(
    new Request(reqUrl),
    createRegistryEdgeContext({ waitUntil: spy.waitUntil }),
  );

  await spy.flush();

  assert.strictEqual(res.status, 301, 'HTTP status');
  const loc = res.headers.get('location');
  assert.ok(loc, 'Location');
  const locUrl = new URL(loc);
  assert.strictEqual(locUrl.pathname, '/ecosystem/registry/', 'Location path');
  assert.strictEqual(locUrl.search, '?lang=en', 'Location query');

  const event = firstMpEventNamed(gaBodies, 'page_view');
  assert.strictEqual(event.name, 'page_view', 'event name');
  assert.strictEqual(event.params.page_location, reqUrl, 'page_location');
  assert.strictEqual(
    Number(event.params.engagement_time_msec),
    1,
    'engagement_time_msec',
  );
});

test('HEAD suffix: subresponse 404 → 301 redirect', async (t) => {
  setupNetlifyEnv(t);
  const spy = createWaitUntilSpy();
  setupGa4CapturingFetchMock(
    t,
    fetchStubForProbe(new Response(null, { status: 404 })),
  );

  const res = await registryCompRedirect(
    new Request('https://example.com/ecosystem/registry/missing', {
      method: 'HEAD',
    }),
    createRegistryEdgeContext({ waitUntil: spy.waitUntil }),
  );

  await spy.flush();

  assert.strictEqual(res.status, 301, 'HTTP status');
  const loc = res.headers.get('location');
  assert.ok(loc, 'Location');
  assert.strictEqual(
    new URL(loc).pathname,
    '/ecosystem/registry/',
    'Location path',
  );
});
