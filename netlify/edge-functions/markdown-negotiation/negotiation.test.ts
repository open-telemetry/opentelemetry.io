/**
 * Tests `Accept` header preference handling.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { prefersMarkdownOverHtml } from './index.ts';

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
  assert.equal(
    prefersMarkdownOverHtml('application/xhtml+xml, text/markdown;q=0.8'),
    false,
  );
  assert.equal(
    prefersMarkdownOverHtml('application/xhtml+xml;q=0.5, text/markdown;q=0.8'),
    true,
  );
  // Wildcards are ignored by design: explicit markdown still wins here.
  assert.equal(prefersMarkdownOverHtml('text/markdown;q=0.5, */*'), true);
  assert.equal(prefersMarkdownOverHtml('text/html, */*;q=0.8'), false);
});
