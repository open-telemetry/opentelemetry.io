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
  assert.equal(shouldConsiderRequest('GET', '/docs/'), true);
  assert.equal(shouldConsiderRequest('HEAD', '/docs'), true);
  assert.equal(shouldConsiderRequest('GET', '/docs/index.html'), true);
  assert.equal(shouldConsiderRequest('GET', '/docs/index.HTML'), false);
  assert.equal(shouldConsiderRequest('GET', '/docs.html'), false);
  assert.equal(shouldConsiderRequest('GET', '/404.html'), false);
  assert.equal(shouldConsiderRequest('POST', '/docs/'), false);
  assert.equal(shouldConsiderRequest('GET', '/docs/index.md'), false);
  assert.equal(shouldConsiderRequest('GET', '/data/search.json'), false);
  assert.equal(shouldConsiderRequest('GET', '/styles/site.css'), false);
  assert.equal(shouldConsiderRequest('GET', '/img/logo.svg'), false);
  assert.equal(shouldConsiderRequest('GET', '/.well-known/test'), false);
  // Last segment matches `\\.([^.]+)$` as `.0` — not extensionless, not index.html.
  assert.equal(shouldConsiderRequest('GET', '/schemas/1.40.0'), false);
});

test('resolveMarkdownPath maps page requests to markdown artifacts', () => {
  assert.equal(resolveMarkdownPath('/'), '/index.md');
  assert.equal(resolveMarkdownPath('/docs/'), '/docs/index.md');
  assert.equal(resolveMarkdownPath('/docs'), '/docs/index.md');
  assert.equal(resolveMarkdownPath('/index.html'), '/index.md');
  assert.equal(resolveMarkdownPath('/docs/index.html'), '/docs/index.md');
});
