/**
 * Tests pathname classification and markdown-path resolution:
 *
 * - page/resource path classification
 * - markdown path mapping
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveMarkdownPath, shouldConsiderRequest } from './index.ts';

test('shouldConsiderRequest only accepts page-like GET/HEAD requests', () => {
  assert.strictEqual(
    shouldConsiderRequest('GET', '/docs/'),
    true,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('HEAD', '/docs'),
    true,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('GET', '/docs/index.html'),
    true,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('GET', '/docs/index.HTML'),
    false,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('GET', '/docs.html'),
    false,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('GET', '/404.html'),
    false,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('POST', '/docs/'),
    false,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('GET', '/docs/index.md'),
    false,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('GET', '/data/search.json'),
    false,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('GET', '/styles/site.css'),
    false,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('GET', '/img/logo.svg'),
    false,
    'shouldConsiderRequest',
  );
  assert.strictEqual(
    shouldConsiderRequest('GET', '/.well-known/test'),
    false,
    'shouldConsiderRequest',
  );
  // Last segment matches `\\.([^.]+)$` as `.0` — not extensionless, not index.html.
  assert.strictEqual(
    shouldConsiderRequest('GET', '/schemas/1.40.0'),
    false,
    'shouldConsiderRequest',
  );
});

test('resolveMarkdownPath maps page requests to markdown artifacts', () => {
  assert.strictEqual(
    resolveMarkdownPath('/'),
    '/index.md',
    'resolveMarkdownPath',
  );
  assert.strictEqual(
    resolveMarkdownPath('/docs/'),
    '/docs/index.md',
    'resolveMarkdownPath',
  );
  assert.strictEqual(
    resolveMarkdownPath('/docs'),
    '/docs/index.md',
    'resolveMarkdownPath',
  );
  assert.strictEqual(
    resolveMarkdownPath('/index.html'),
    '/index.md',
    'resolveMarkdownPath',
  );
  assert.strictEqual(
    resolveMarkdownPath('/docs/index.html'),
    '/docs/index.md',
    'resolveMarkdownPath',
  );
});
