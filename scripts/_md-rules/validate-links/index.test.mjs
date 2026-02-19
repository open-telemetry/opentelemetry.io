// @ts-check
//
// Tests for the createLinkPatternRule factory

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lint } from 'markdownlint/promise';
import { createLinkPatternRule } from './index.mjs';

const exampleRule = createLinkPatternRule('no-example-com', 'No example.com');
const localhostRule = createLinkPatternRule('no-localhost', 'No localhost');

/**
 * Run lint with the given rules and config on markdown content.
 * @param {string} content
 * @param {import("markdownlint").Rule[]} rules
 * @param {object} config
 * @returns {Promise<Array>}
 */
async function lintContent(content, rules, config) {
  const results = await lint({
    strings: { test: content },
    customRules: rules,
    config,
  });
  return results.test || [];
}

describe('createLinkPatternRule', () => {
  const config = {
    default: false,
    'no-example-com': {
      regex: 'example\\.com',
      message: 'Do not link to example.com',
    },
    'no-localhost': {
      regex: 'localhost',
      message: 'Do not link to localhost',
    },
  };

  it('should pass for links not matching any pattern', async () => {
    const errors = await lintContent(
      '[link](https://opentelemetry.io)',
      [exampleRule, localhostRule],
      config,
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should flag links matching a pattern', async () => {
    const errors = await lintContent(
      '[link](https://example.com/page)',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].ruleNames[0], 'no-example-com');
  });

  it('should flag localhost links', async () => {
    const errors = await lintContent(
      '[api](http://localhost:8080/api)',
      [localhostRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].ruleNames[0], 'no-localhost');
    assert.ok(errors[0].errorDetail.includes('localhost'));
  });

  it('should skip URLs with Hugo template directives', async () => {
    const errors = await lintContent(
      '[link]({{ site.baseurl }}/example.com)',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should check multiple links in content', async () => {
    const content = `
[good](https://opentelemetry.io)
[bad1](https://example.com)
[bad2](http://localhost:3000)
`;
    const errors = await lintContent(
      content,
      [exampleRule, localhostRule],
      config,
    );
    assert.strictEqual(errors.length, 2);
  });

  it('should flag link reference definitions', async () => {
    const content = `
See [example][] for details.

[example]: https://example.com/page
`;
    const errors = await lintContent(content, [exampleRule], config);
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].errorDetail.includes('example.com'));
  });

  it('should flag image URLs', async () => {
    const errors = await lintContent(
      '![logo](https://example.com/logo.png)',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should flag autolinks', async () => {
    const errors = await lintContent(
      'Visit <https://example.com> for info.',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should flag bare URLs', async () => {
    const errors = await lintContent(
      'Visit https://example.com for info.',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should only flag the matching rule, not others', async () => {
    const errors = await lintContent(
      '[link](https://example.com)',
      [exampleRule, localhostRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].ruleNames[0], 'no-example-com');
  });

  it('should be independently disableable per rule', async () => {
    const configWithDisable = {
      ...config,
      'no-example-com': false,
    };
    const errors = await lintContent(
      '[a](https://example.com) [b](http://localhost)',
      [exampleRule, localhostRule],
      configWithDisable,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].ruleNames[0], 'no-localhost');
  });
});
