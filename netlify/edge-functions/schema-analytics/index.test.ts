/**
 * Tests for schema-analytics Edge Function:
 *
 * - content-type fixup (ensureSchemaContentType)
 * - tracking gate (shouldTrackSchemaFetch)
 * - handler integration (schemaAnalytics default export)
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import schemaAnalytics, {
  ensureSchemaContentType,
  shouldTrackSchemaFetch,
} from './index.ts';

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

// --- ensureSchemaContentType ---

test('ensureSchemaContentType sets application/yaml for 2xx /schemas/ responses', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const response = new Response('opentelemetry: 1.40.0', {
    headers: { 'content-type': 'text/plain' },
    status: 200,
  });

  const result = ensureSchemaContentType(request, response);
  assert.equal(result.headers.get('content-type'), 'application/yaml');
  assert.equal(result.status, 200);
});

test('ensureSchemaContentType does not alter non-/schemas/ responses', () => {
  const request = new Request('https://example.com/docs/');
  const response = new Response('<html></html>', {
    headers: { 'content-type': 'text/html' },
    status: 200,
  });

  const result = ensureSchemaContentType(request, response);
  assert.equal(result.headers.get('content-type'), 'text/html');
});

test('ensureSchemaContentType passes through non-2xx /schemas/ responses', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const response = new Response('Not Found', { status: 404 });

  const result = ensureSchemaContentType(request, response);
  assert.equal(result.status, 404);
  assert.notEqual(result.headers.get('content-type'), 'application/yaml');
});

test('ensureSchemaContentType passes through 3xx /schemas/ responses', () => {
  const request = new Request('https://example.com/schemas/latest');
  const response = new Response(null, {
    status: 302,
    headers: { location: '/schemas/1.40.0' },
  });

  const result = ensureSchemaContentType(request, response);
  assert.equal(result.status, 302);
  assert.notEqual(result.headers.get('content-type'), 'application/yaml');
});

// --- shouldTrackSchemaFetch ---

test('shouldTrackSchemaFetch accepts GET /schemas/ with yaml content type', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const response = new Response('', {
    headers: { 'content-type': 'application/yaml' },
    status: 200,
  });
  assert.equal(shouldTrackSchemaFetch(request, response), true);
});

test('shouldTrackSchemaFetch accepts GET /schemas/ with no content type', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const response = new Response(null, { status: 200 });
  response.headers.delete('content-type');
  assert.equal(shouldTrackSchemaFetch(request, response), true);
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
    assert.equal(shouldTrackSchemaFetch(request, response), true, `${ct}`);
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
    assert.equal(
      shouldTrackSchemaFetch(request, response),
      false,
      `method ${method}`,
    );
  }
});

test('shouldTrackSchemaFetch returns false for non-/schemas/ paths', () => {
  const request = new Request('https://example.com/docs/');
  const response = new Response('', {
    headers: { 'content-type': 'application/yaml' },
    status: 200,
  });
  assert.equal(shouldTrackSchemaFetch(request, response), false);
});

test('shouldTrackSchemaFetch returns false for 4xx and 5xx responses', () => {
  for (const status of [400, 404, 500]) {
    const request = new Request('https://example.com/schemas/1.40.0');
    const response = new Response('', {
      headers: { 'content-type': 'application/yaml' },
      status,
    });
    assert.equal(
      shouldTrackSchemaFetch(request, response),
      false,
      `status ${status}`,
    );
  }
});

test('shouldTrackSchemaFetch accepts 3xx redirects', () => {
  const request = new Request('https://example.com/schemas/latest');
  const response = new Response(null, {
    status: 302,
    headers: { location: '/schemas/1.40.0' },
  });
  assert.equal(shouldTrackSchemaFetch(request, response), true);
});

test('shouldTrackSchemaFetch returns false for 2xx with non-yaml content type', () => {
  const request = new Request('https://example.com/schemas/1.40.0');
  const response = new Response('<html></html>', {
    headers: { 'content-type': 'text/html' },
    status: 200,
  });
  assert.equal(shouldTrackSchemaFetch(request, response), false);
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
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/yaml');
  assert.equal(await response.text(), 'opentelemetry: 1.40.0');
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
  assert.equal(
    response.headers.get('x-asset-fetch-ga-info'),
    '/schemas/1.40.0;ga-event-candidate,config-present',
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
  assert.equal(response.headers.get('content-type'), 'text/html');
});

test('handler passes through 404 /schemas/ responses', async () => {
  const request = new Request('https://example.com/schemas/nonexistent');
  const context = {
    next: async () => new Response('Not Found', { status: 404 }),
  };

  const response = await schemaAnalytics(request, context);
  assert.equal(response.status, 404);
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
  assert.equal(response.status, 200);
});
