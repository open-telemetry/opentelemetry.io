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

import markdownNegotiation from './index.ts';

test('handler serves markdown when preferred and available', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async (input) => {
    const request = input as Request;
    assert.equal(request.url, 'https://example.com/docs/index.md');
    assert.equal(request.method, 'GET');
    assert.equal(request.headers.get('accept'), 'text/markdown');

    return new Response('# Docs', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      status: 200,
    });
  }) as typeof fetch;

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

  assert.equal(await response.text(), '# Docs');
  assert.equal(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
  );
  assert.match(response.headers.get('vary') ?? '', /(^|,\s*)Accept(,|$)/);
});

test('handler serves markdown for the site root', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async (input) => {
    const request = input as Request;
    assert.equal(request.url, 'https://example.com/index.md');
    assert.equal(request.method, 'GET');

    return new Response('# Home', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      status: 200,
    });
  }) as typeof fetch;

  const response = await markdownNegotiation(
    new Request('https://example.com/', {
      headers: { accept: 'text/markdown' },
    }),
    {
      next: async () => new Response('<html>home</html>', { status: 200 }),
    },
  );

  assert.equal(await response.text(), '# Home');
  assert.equal(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
  );
});

test('handler serves markdown for explicit html page requests', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async (input) => {
    const request = input as Request;
    assert.equal(request.url, 'https://example.com/docs/index.md');
    assert.equal(request.method, 'GET');

    return new Response('# Html page mapped to markdown', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      status: 200,
    });
  }) as typeof fetch;

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/index.html', {
      headers: { accept: 'text/markdown' },
    }),
    {
      next: async () => new Response('<html>docs</html>', { status: 200 }),
    },
  );

  assert.equal(await response.text(), '# Html page mapped to markdown');
  assert.equal(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
  );
});

test('handler bypasses negotiation for non-index html paths', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let fetched = false;
  globalThis.fetch = (async () => {
    fetched = true;
    return new Response('unexpected', { status: 200 });
  }) as typeof fetch;

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

  assert.equal(fetched, false);
  assert.equal(docsHtmlResponse.status, 301);
  assert.equal(docsHtmlResponse.headers.get('location'), '/docs/');

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

  assert.equal(fetched, false);
  assert.equal(
    await uppercaseIndexHtmlResponse.text(),
    '<html>uppercase</html>',
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

  assert.equal(fetched, false);
  assert.equal(fourOhFourResponse.status, 404);
  assert.equal(await fourOhFourResponse.text(), '<html>not found</html>');
});

test('handler bypasses markdown fetch when html is preferred', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let fetched = false;
  globalThis.fetch = (async () => {
    fetched = true;
    return new Response('unexpected', { status: 200 });
  }) as typeof fetch;

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

  assert.equal(fetched, false);
  assert.equal(await response.text(), '<html>docs</html>');
  assert.equal(
    response.headers.get('content-type'),
    'text/html; charset=utf-8',
  );
});

test('handler bypasses markdown fetch when Accept is missing', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let fetched = false;
  globalThis.fetch = (async () => {
    fetched = true;
    return new Response('unexpected', { status: 200 });
  }) as typeof fetch;

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

  assert.equal(fetched, false);
  assert.equal(await response.text(), '<html>docs</html>');
  assert.equal(
    response.headers.get('content-type'),
    'text/html; charset=utf-8',
  );
});

test('handler bypasses markdown fetch for unsupported methods', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let fetched = false;
  globalThis.fetch = (async () => {
    fetched = true;
    return new Response('unexpected', { status: 200 });
  }) as typeof fetch;

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

  assert.equal(fetched, false);
  assert.equal(await response.text(), '<html>post passthrough</html>');
  assert.equal(
    response.headers.get('content-type'),
    'text/html; charset=utf-8',
  );
});

test('handler serves HEAD markdown responses without a body', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async (input) => {
    const request = input as Request;
    assert.equal(request.url, 'https://example.com/docs/index.md');
    assert.equal(request.method, 'HEAD');

    return new Response('ignored', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      status: 200,
      statusText: 'OK',
    });
  }) as typeof fetch;

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/', {
      headers: { accept: 'text/markdown' },
      method: 'HEAD',
    }),
    {
      next: async () => new Response(null, { status: 200 }),
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  assert.equal(await response.text(), '');
  assert.equal(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
  );
  assert.match(response.headers.get('vary') ?? '', /(^|,\s*)Accept(,|$)/);
});

test('handler falls back from HEAD to GET when HEAD is not supported', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const methods: string[] = [];
  globalThis.fetch = (async (input) => {
    const request = input as Request;
    methods.push(request.method);
    assert.equal(request.url, 'https://example.com/docs/index.md');

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
  }) as typeof fetch;

  const response = await markdownNegotiation(
    new Request('https://example.com/docs/', {
      headers: { accept: 'text/markdown' },
      method: 'HEAD',
    }),
    {
      next: async () => new Response(null, { status: 200 }),
    },
  );

  assert.deepEqual(methods, ['HEAD', 'GET']);
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  assert.equal(await response.text(), '');
  assert.equal(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
  );
  assert.match(response.headers.get('vary') ?? '', /(^|,\s*)Accept(,|$)/);
});

test('handler falls back to html and varies on Accept when markdown is missing', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async () =>
    new Response('missing', { status: 404 })) as typeof fetch;

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

  assert.equal(await response.text(), '<html>search</html>');
  assert.equal(
    response.headers.get('content-type'),
    'text/html; charset=utf-8',
  );
  assert.match(response.headers.get('vary') ?? '', /(^|,\s*)Accept(,|$)/);
});
