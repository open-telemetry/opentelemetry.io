/**
 * Tests end-to-end handler behavior:
 *
 * - markdown success
 * - html fallback
 * - root
 * - explicit `.html`
 * - non-index `.html` bypass
 * - `HEAD`
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertVaryIncludesAccept,
  withMockFetch,
} from '../lib/test-helpers.ts';
import markdownNegotiation from './index.ts';

test('handler serves markdown when preferred and available', async (t) => {
  withMockFetch(t, (async (input) => {
    const request = input as Request;
    assert.strictEqual(
      request.url,
      'https://example.com/docs/index.md',
      'Subrequest URL',
    );
    assert.strictEqual(request.method, 'GET', 'Subrequest method');
    assert.strictEqual(
      request.headers.get('accept'),
      'text/markdown',
      'Accept header',
    );

    return new Response('# Docs', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      status: 200,
    });
  }) as typeof fetch);

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/', {
      headers: { accept: 'text/markdown, text/html;q=0.8' },
    }),
    {
      next: async () =>
        new Response('<html>fallback</html>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 200,
        }),
    },
  );

  assert.strictEqual(await response.text(), '# Docs', 'Response body');
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
    'Content-Type',
  );
  assertVaryIncludesAccept(response);
});

test('handler serves markdown for the site root', async (t) => {
  withMockFetch(t, (async (input) => {
    const request = input as Request;
    assert.strictEqual(
      request.url,
      'https://example.com/index.md',
      'Subrequest URL',
    );
    assert.strictEqual(request.method, 'GET', 'Subrequest method');

    return new Response('# Home', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      status: 200,
    });
  }) as typeof fetch);

  const response = await markdownNegotiation(
    new Request('https://example.com/', {
      headers: { accept: 'text/markdown' },
    }),
    {
      next: async () => new Response('<html>home</html>', { status: 200 }),
    },
  );

  assert.strictEqual(await response.text(), '# Home', 'Response body');
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
    'Content-Type',
  );
});

test('handler serves markdown for explicit html page requests', async (t) => {
  withMockFetch(t, (async (input) => {
    const request = input as Request;
    assert.strictEqual(
      request.url,
      'https://example.com/docs/index.md',
      'Subrequest URL',
    );
    assert.strictEqual(request.method, 'GET', 'Subrequest method');

    return new Response('# Html page mapped to markdown', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      status: 200,
    });
  }) as typeof fetch);

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/index.html', {
      headers: { accept: 'text/markdown' },
    }),
    {
      next: async () => new Response('<html>docs</html>', { status: 200 }),
    },
  );

  assert.strictEqual(
    await response.text(),
    '# Html page mapped to markdown',
    'Response body',
  );
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
    'Content-Type',
  );
});

test('handler bypasses negotiation for non-index html paths', async (t) => {
  let fetched = false;
  withMockFetch(t, (async () => {
    fetched = true;
    return new Response('unexpected', { status: 200 });
  }) as typeof fetch);

  const docsHtmlResponse = await markdownNegotiation(
    new Request('https://example.com/docs.html', {
      headers: { accept: 'text/markdown' },
    }),
    {
      next: async () =>
        new Response(null, {
          headers: { location: '/docs/' },
          status: 301,
        }),
    },
  );

  assert.strictEqual(fetched, false, 'Markdown subrequest');
  assert.strictEqual(docsHtmlResponse.status, 301, 'HTTP status');
  assert.strictEqual(
    docsHtmlResponse.headers.get('location'),
    '/docs/',
    'Location',
  );

  const uppercaseIndexHtmlResponse = await markdownNegotiation(
    new Request('https://example.com/docs/index.HTML', {
      headers: { accept: 'text/markdown' },
    }),
    {
      next: async () =>
        new Response('<html>uppercase</html>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 200,
        }),
    },
  );

  assert.strictEqual(fetched, false, 'Markdown subrequest');
  assert.strictEqual(
    await uppercaseIndexHtmlResponse.text(),
    '<html>uppercase</html>',
    'Response body',
  );

  const fourOhFourResponse = await markdownNegotiation(
    new Request('https://example.com/404.html', {
      headers: { accept: 'text/markdown' },
    }),
    {
      next: async () =>
        new Response('<html>not found</html>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 404,
        }),
    },
  );

  assert.strictEqual(fetched, false, 'Markdown subrequest');
  assert.strictEqual(fourOhFourResponse.status, 404, 'HTTP status');
  assert.strictEqual(
    await fourOhFourResponse.text(),
    '<html>not found</html>',
    'Response body',
  );
});

test('handler bypasses markdown fetch when html is preferred', async (t) => {
  let fetched = false;
  withMockFetch(t, (async () => {
    fetched = true;
    return new Response('unexpected', { status: 200 });
  }) as typeof fetch);

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/', {
      headers: { accept: 'text/html, text/markdown;q=0.8' },
    }),
    {
      next: async () =>
        new Response('<html>docs</html>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 200,
        }),
    },
  );

  assert.strictEqual(fetched, false, 'Markdown subrequest');
  assert.strictEqual(
    await response.text(),
    '<html>docs</html>',
    'Response body',
  );
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/html; charset=utf-8',
    'Content-Type',
  );
});

test('handler bypasses markdown fetch when Accept is missing', async (t) => {
  let fetched = false;
  withMockFetch(t, (async () => {
    fetched = true;
    return new Response('unexpected', { status: 200 });
  }) as typeof fetch);

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/'),
    {
      next: async () =>
        new Response('<html>docs</html>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 200,
        }),
    },
  );

  assert.strictEqual(fetched, false, 'Markdown subrequest');
  assert.strictEqual(
    await response.text(),
    '<html>docs</html>',
    'Response body',
  );
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/html; charset=utf-8',
    'Content-Type',
  );
});

test('handler bypasses markdown fetch for unsupported methods', async (t) => {
  let fetched = false;
  withMockFetch(t, (async () => {
    fetched = true;
    return new Response('unexpected', { status: 200 });
  }) as typeof fetch);

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/', {
      headers: { accept: 'text/markdown' },
      method: 'POST',
    }),
    {
      next: async () =>
        new Response('<html>post passthrough</html>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 200,
        }),
    },
  );

  assert.strictEqual(fetched, false, 'Markdown subrequest');
  assert.strictEqual(
    await response.text(),
    '<html>post passthrough</html>',
    'Response body',
  );
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/html; charset=utf-8',
    'Content-Type',
  );
});

test('handler serves HEAD markdown responses without a body', async (t) => {
  withMockFetch(t, (async (input) => {
    const request = input as Request;
    assert.strictEqual(
      request.url,
      'https://example.com/docs/index.md',
      'Subrequest URL',
    );
    assert.strictEqual(request.method, 'HEAD', 'Subrequest method');

    return new Response('ignored', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      status: 200,
      statusText: 'OK',
    });
  }) as typeof fetch);

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/', {
      headers: { accept: 'text/markdown' },
      method: 'HEAD',
    }),
    {
      next: async () => new Response(null, { status: 200 }),
    },
  );

  assert.strictEqual(response.status, 200, 'HTTP status');
  assert.strictEqual(response.statusText, 'OK', 'HTTP statusText');
  assert.strictEqual(await response.text(), '', 'Response body');
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
    'Content-Type',
  );
  assertVaryIncludesAccept(response);
});

test('handler falls back from HEAD to GET when HEAD is not supported', async (t) => {
  const methods: string[] = [];
  withMockFetch(t, (async (input) => {
    const request = input as Request;
    methods.push(request.method);
    assert.strictEqual(
      request.url,
      'https://example.com/docs/index.md',
      'Subrequest URL',
    );

    if (request.method === 'HEAD') {
      return new Response(null, {
        status: 405,
        statusText: 'Method Not Allowed',
      });
    }

    return new Response('# Docs', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      status: 200,
      statusText: 'OK',
    });
  }) as typeof fetch);

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/', {
      headers: { accept: 'text/markdown' },
      method: 'HEAD',
    }),
    {
      next: async () => new Response(null, { status: 200 }),
    },
  );

  assert.deepStrictEqual(methods, ['HEAD', 'GET'], 'Subrequest methods');
  assert.strictEqual(response.status, 200, 'HTTP status');
  assert.strictEqual(response.statusText, 'OK', 'HTTP statusText');
  assert.strictEqual(await response.text(), '', 'Response body');
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
    'Content-Type',
  );
  assertVaryIncludesAccept(response);
});

test('handler falls back to html and varies on Accept when markdown is missing', async (t) => {
  withMockFetch(
    t,
    (async () => new Response('missing', { status: 404 })) as typeof fetch,
  );

  const response = await markdownNegotiation(
    new Request('https://example.com/search/', {
      headers: { accept: 'text/markdown' },
    }),
    {
      next: async () =>
        new Response('<html>search</html>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 200,
        }),
    },
  );

  assert.strictEqual(
    await response.text(),
    '<html>search</html>',
    'Response body',
  );
  assert.strictEqual(
    response.headers.get('content-type'),
    'text/html; charset=utf-8',
    'Content-Type',
  );
  assertVaryIncludesAccept(response);
});
