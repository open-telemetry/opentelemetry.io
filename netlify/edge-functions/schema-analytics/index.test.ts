/**
 * Tests for schema-analytics Edge Function:
 *
 * - content-type fixup (ensureSchemaContentType)
 * - tracking gate (shouldTrackSchemaFetch)
 * - handler integration (schemaAnalytics default export)
 *
 * cSpell:ignore GOOGLEANALYTICS
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { setupNetlifyEnv } from '../lib/test-helpers.ts';
import schemaAnalytics, {
  ensureSchemaContentType,
  shouldTrackSchemaFetch,
} from './index.ts';

// --- ensureSchemaContentType ---

test('ensureSchemaContentType sets application/yaml for 2xx /schemas/ responses', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const response = new Response('opentelemetry: 1.40.0', {
    headers: { 'content-type': 'text/plain' },
    status: 200,
  });

  const result = ensureSchemaContentType(request, response);
  assert.strictEqual(
    result.headers.get('content-type'),
    'application/yaml',
    'Content-Type',
  );
  assert.strictEqual(result.status, 200, 'HTTP status');
});

test('ensureSchemaContentType does not alter non-/schemas/ responses', () => {
  const request = new Request('https://example.com/docs/');
  const response = new Response('<html></html>', {
    headers: { 'content-type': 'text/html' },
    status: 200,
  });

  const result = ensureSchemaContentType(request, response);
  assert.strictEqual(
    result.headers.get('content-type'),
    'text/html',
    'Content-Type',
  );
});

test('ensureSchemaContentType passes through non-2xx /schemas/ responses', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const response = new Response('Not Found', { status: 404 });

  const result = ensureSchemaContentType(request, response);
  assert.strictEqual(result.status, 404, 'HTTP status');
  assert.notStrictEqual(
    result.headers.get('content-type'),
    'application/yaml',
    'Content-Type',
  );
});

test('ensureSchemaContentType passes through 3xx /schemas/ responses', () => {
  const request = new Request('https://example.com/schemas/latest');
  const response = new Response(null, {
    status: 302,
    headers: { location: '/schemas/1.40.0' },
  });

  const result = ensureSchemaContentType(request, response);
  assert.strictEqual(result.status, 302, 'HTTP status');
  assert.notStrictEqual(
    result.headers.get('content-type'),
    'application/yaml',
    'Content-Type',
  );
});

// --- shouldTrackSchemaFetch ---

test('shouldTrackSchemaFetch accepts GET /schemas/ with yaml content type', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const response = new Response('', {
    headers: { 'content-type': 'application/yaml' },
    status: 200,
  });
  assert.strictEqual(
    shouldTrackSchemaFetch(request, response),
    true,
    'shouldTrackSchemaFetch',
  );
});

test('shouldTrackSchemaFetch accepts GET /schemas/ with no content type', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const response = new Response(null, { status: 200 });
  response.headers.delete('content-type');
  assert.strictEqual(
    shouldTrackSchemaFetch(request, response),
    true,
    'shouldTrackSchemaFetch',
  );
});

test('shouldTrackSchemaFetch accepts various yaml content types', () => {
  for (const ct of [
    'application/yaml',
    'application/x-yaml',
    'text/yaml',
    'text/x-yaml',
  ]) {
    const request = new Request('https://example.com/schemas/1.40.0');
    const response = new Response('', {
      headers: { 'content-type': ct },
      status: 200,
    });
    assert.strictEqual(
      shouldTrackSchemaFetch(request, response),
      true,
      'shouldTrackSchemaFetch',
    );
  }
});

test('shouldTrackSchemaFetch returns false for non-GET methods', () => {
  for (const method of ['HEAD', 'POST', 'PUT', 'DELETE']) {
    const request = new Request('https://example.com/schemas/1.40.0', {
      method,
    });
    const response = new Response('', {
      headers: { 'content-type': 'application/yaml' },
      status: 200,
    });
    assert.strictEqual(
      shouldTrackSchemaFetch(request, response),
      false,
      'shouldTrackSchemaFetch',
    );
  }
});

test('shouldTrackSchemaFetch returns false for non-/schemas/ paths', () => {
  const request = new Request('https://example.com/docs/');
  const response = new Response('', {
    headers: { 'content-type': 'application/yaml' },
    status: 200,
  });
  assert.strictEqual(
    shouldTrackSchemaFetch(request, response),
    false,
    'shouldTrackSchemaFetch',
  );
});

test('shouldTrackSchemaFetch returns false for 4xx and 5xx responses', () => {
  for (const status of [400, 404, 500]) {
    const request = new Request('https://example.com/schemas/1.40.0');
    const response = new Response('', {
      headers: { 'content-type': 'application/yaml' },
      status,
    });
    assert.strictEqual(
      shouldTrackSchemaFetch(request, response),
      false,
      'shouldTrackSchemaFetch',
    );
  }
});

test('shouldTrackSchemaFetch accepts 3xx redirects', () => {
  const request = new Request('https://example.com/schemas/latest');
  const response = new Response(null, {
    status: 302,
    headers: { location: '/schemas/1.40.0' },
  });
  assert.strictEqual(
    shouldTrackSchemaFetch(request, response),
    true,
    'shouldTrackSchemaFetch',
  );
});

test('shouldTrackSchemaFetch returns false for 2xx with non-yaml content type', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const response = new Response('<html></html>', {
    headers: { 'content-type': 'text/html' },
    status: 200,
  });
  assert.strictEqual(
    shouldTrackSchemaFetch(request, response),
    false,
    'shouldTrackSchemaFetch',
  );
});

// --- handler integration ---

test('handler returns response with yaml content type for /schemas/ GET', async () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const context = {
    next: async () =>
      new Response('opentelemetry: 1.40.0', {
        headers: { 'content-type': 'text/plain' },
        status: 200,
      }),
  };

  const response = await schemaAnalytics(request, context);
  assert.strictEqual(response.status, 200, 'HTTP status');
  assert.strictEqual(
    response.headers.get('content-type'),
    'application/yaml',
    'Content-Type',
  );
  assert.strictEqual(
    await response.text(),
    'opentelemetry: 1.40.0',
    'Response body',
  );
});

test('handler adds X-Asset-Fetch-Ga-Info for GA event candidate schema responses when config is present', async (t) => {
  setupNetlifyEnv(t);

  const request = new Request('https://example.com/schemas/1.40.0');
  const context = {
    next: async () =>
      new Response('opentelemetry: 1.40.0', {
        headers: { 'content-type': 'text/plain' },
        status: 200,
      }),
  };

  const response = await schemaAnalytics(request, context);
  assert.strictEqual(
    response.headers.get('x-asset-fetch-ga-info'),
    '/schemas/1.40.0;ga-event-candidate,config-present',
    'X-Asset-Fetch-Ga-Info',
  );
});

test('handler passes through non-/schemas/ requests unchanged', async () => {
  const request = new Request('https://example.com/docs/');
  const context = {
    next: async () =>
      new Response('<html></html>', {
        headers: { 'content-type': 'text/html' },
        status: 200,
      }),
  };

  const response = await schemaAnalytics(request, context);
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/html',
    'Content-Type',
  );
});

test('handler passes through 404 /schemas/ responses', async () => {
  const request = new Request('https://example.com/schemas/nonexistent');
  const context = {
    next: async () => new Response('Not Found', { status: 404 }),
  };

  const response = await schemaAnalytics(request, context);
  assert.strictEqual(response.status, 404, 'HTTP status');
});

test('handler skips tracking for HEAD requests', async () => {
  const request = new Request('https://example.com/schemas/1.40.0', {
    method: 'HEAD',
  });
  const context = {
    next: async () =>
      new Response(null, {
        headers: { 'content-type': 'application/yaml' },
        status: 200,
      }),
  };

  const response = await schemaAnalytics(request, context);
  assert.strictEqual(response.status, 200, 'HTTP status');
});
