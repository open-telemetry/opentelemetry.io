/**
 * Tests cover the following scenarios:
 *
 * - page/resource path classification
 * - markdown path mapping
 * - `Accept` negotiation
 * - markdown success
 * - html fallback
 * - root
 * - explicit `.html`
 * - `HEAD`
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import markdownNegotiation, {
  prefersMarkdownOverHtml,
  resolveMarkdownPath,
  shouldConsiderRequest,
} from './index.ts';

test('shouldConsiderRequest only accepts page-like GET/HEAD requests', () => {
  assert.equal(shouldConsiderRequest('GET', '/docs/'), true);
  assert.equal(shouldConsiderRequest('HEAD', '/docs'), true);
  assert.equal(shouldConsiderRequest('GET', '/docs/index.html'), true);
  assert.equal(shouldConsiderRequest('GET', '/docs.html'), false);
  assert.equal(shouldConsiderRequest('GET', '/404.html'), false);
  assert.equal(shouldConsiderRequest('POST', '/docs/'), false);
  assert.equal(shouldConsiderRequest('GET', '/docs/index.md'), false);
  assert.equal(shouldConsiderRequest('GET', '/data/search.json'), false);
  assert.equal(shouldConsiderRequest('GET', '/styles/site.css'), false);
  assert.equal(shouldConsiderRequest('GET', '/img/logo.svg'), false);
  assert.equal(shouldConsiderRequest('GET', '/.well-known/test'), false);
});

test('resolveMarkdownPath maps page requests to markdown artifacts', () => {
  assert.equal(resolveMarkdownPath('/'), '/index.md');
  assert.equal(resolveMarkdownPath('/docs/'), '/docs/index.md');
  assert.equal(resolveMarkdownPath('/docs'), '/docs/index.md');
  assert.equal(resolveMarkdownPath('/index.html'), '/index.md');
  assert.equal(resolveMarkdownPath('/docs/index.html'), '/docs/index.md');
  assert.equal(resolveMarkdownPath('/docs/index.HTML'), '/docs/index.md');
  assert.equal(resolveMarkdownPath('/docs/INDEX.HTML'), '/docs/index.md');
});

test('prefersMarkdownOverHtml honors explicit markdown preference', () => {
  assert.equal(prefersMarkdownOverHtml('text/markdown'), true);
  assert.equal(prefersMarkdownOverHtml('text/markdown, text/html;q=0.8'), true);
  assert.equal(
    prefersMarkdownOverHtml('text/html, text/markdown;q=0.8'),
    false,
  );
  assert.equal(
    prefersMarkdownOverHtml('text/html;q=0.8, text/markdown;q=0.8'),
    true,
  );
  assert.equal(
    prefersMarkdownOverHtml('text/html;q=0.5, text/markdown;q=0.8'),
    true,
  );
  assert.equal(prefersMarkdownOverHtml('text/html, */*;q=0.8'), false);
});

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
