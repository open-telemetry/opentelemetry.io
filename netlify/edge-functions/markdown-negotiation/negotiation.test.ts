/**
 * Tests `Accept` header preference handling.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { prefersMarkdownOverHtml } from './index.ts';

test('prefersMarkdownOverHtml honors explicit markdown preference', () => {
  assert.strictEqual(
    prefersMarkdownOverHtml('text/markdown'),
    true,
    'prefersMarkdownOverHtml',
  );
  assert.strictEqual(
    prefersMarkdownOverHtml('text/markdown, text/html;q=0.8'),
    true,
    'prefersMarkdownOverHtml',
  );
  assert.strictEqual(
    prefersMarkdownOverHtml('text/html, text/markdown;q=0.8'),
    false,
    'prefersMarkdownOverHtml',
  );
  assert.strictEqual(
    prefersMarkdownOverHtml('text/html;q=0.8, text/markdown;q=0.8'),
    true,
    'prefersMarkdownOverHtml',
  );
  assert.strictEqual(
    prefersMarkdownOverHtml('text/html;q=0.5, text/markdown;q=0.8'),
    true,
    'prefersMarkdownOverHtml',
  );
  assert.strictEqual(
    prefersMarkdownOverHtml('application/xhtml+xml, text/markdown;q=0.8'),
    false,
    'prefersMarkdownOverHtml',
  );
  assert.strictEqual(
    prefersMarkdownOverHtml('application/xhtml+xml;q=0.5, text/markdown;q=0.8'),
    true,
    'prefersMarkdownOverHtml',
  );
  // Wildcards are ignored by design: explicit markdown still wins here.
  assert.strictEqual(
    prefersMarkdownOverHtml('text/markdown;q=0.5, */*'),
    true,
    'prefersMarkdownOverHtml',
  );
  assert.strictEqual(
    prefersMarkdownOverHtml('text/html, */*;q=0.8'),
    false,
    'prefersMarkdownOverHtml',
  );
});
