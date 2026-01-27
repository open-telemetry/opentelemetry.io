// @ts-check
//
// Smoke tests for validate-links rule

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lint } from 'markdownlint/promise';
import rule from './index.mjs';

const config = {
  default: false,
  'validate-links': {
    patterns: [
      { regex: 'example\\.com', message: 'Do not link to example.com' },
      { regex: 'localhost', message: 'Do not link to localhost' },
    ],
  },
};

/**
 * Run the validate-links rule on markdown content.
 * @param {string} content - Markdown content to lint
 * @returns {Promise<Array>} - Array of lint errors
 */
async function lintContent(content) {
  const results = await lint({
    strings: { test: content },
    customRules: [rule],
    config,
  });
  return results.test || [];
}

describe('validate-links', () => {
  it('should pass for links not matching any pattern', async () => {
    const errors = await lintContent('[link](https://opentelemetry.io)');
    assert.strictEqual(errors.length, 0);
  });

  it('should flag links matching a pattern', async () => {
    const errors = await lintContent('[link](https://example.com/page)');
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].ruleDescription.includes('Validate links'));
  });

  it('should flag localhost links', async () => {
    const errors = await lintContent('[api](http://localhost:8080/api)');
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].errorDetail.includes('localhost'));
  });

  it('should skip URLs with Hugo template directives', async () => {
    const errors = await lintContent('[link]({{ site.baseurl }}/example.com)');
    assert.strictEqual(errors.length, 0);
  });

  it('should check multiple links in content', async () => {
    const content = `
[good](https://opentelemetry.io)
[bad1](https://example.com)
[bad2](http://localhost:3000)
`;
    const errors = await lintContent(content);
    assert.strictEqual(errors.length, 2);
  });

  it('should flag link reference definitions', async () => {
    const content = `
See [example][] for details.

[example]: https://example.com/page
`;
    const errors = await lintContent(content);
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].errorDetail.includes('example.com'));
  });

  it('should flag image URLs', async () => {
    const errors = await lintContent('![logo](https://example.com/logo.png)');
    assert.strictEqual(errors.length, 1);
  });

  it('should flag autolinks', async () => {
    const errors = await lintContent('Visit <https://example.com> for info.');
    assert.strictEqual(errors.length, 1);
  });

  it('should flag bare URLs', async () => {
    const errors = await lintContent('Visit https://example.com for info.');
    assert.strictEqual(errors.length, 1);
  });
});
