// Tests for the pure validate() orchestrator: path filtering, frontmatter
// parsing, and per-rule reporting for blog posts.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { validate } from './index.mjs';

const BLOG_PATH = 'content/en/blog/2024-01-01/post/index.md';

const wrap = (fm, body = '\n## heading\n') => `---\n${fm}\n---\n${body}`;

const validFrontmatter = [
  'title: Hello',
  'date: 2024-01-01',
  'author: "[Jane Doe](https://github.com/jane)"',
  'linkTitle: Hello',
].join('\n');

describe('frontmatter-check: validate()', () => {
  test('passes on a well-formed blog post', () => {
    assert.deepEqual(
      validate({ filePath: BLOG_PATH, content: wrap(validFrontmatter) }),
      [],
    );
  });

  test('skips files outside content/en/blog', () => {
    assert.deepEqual(
      validate({
        filePath: 'content/en/docs/index.md',
        content: wrap('title: x', '\n# allowed here\n'),
      }),
      [],
    );
  });

  test('skips content without frontmatter', () => {
    assert.deepEqual(
      validate({ filePath: BLOG_PATH, content: '## just a body\n' }),
      [],
    );
  });

  test('reports missing required fields', () => {
    const errors = validate({
      filePath: BLOG_PATH,
      content: wrap('date: 2024-01-01'),
    });
    assert.ok(errors.some((e) => e.includes('title')));
    assert.ok(errors.some((e) => e.includes('author')));
    assert.ok(errors.some((e) => e.includes('linkTitle')));
  });

  test('reports empty linkTitle', () => {
    const errors = validate({
      filePath: BLOG_PATH,
      content: wrap(
        [
          'title: x',
          'date: 2024-01-01',
          'author: "[J](https://x/j)"',
          'linkTitle:',
        ].join('\n'),
      ),
    });
    assert.ok(errors.some((e) => e.includes('linkTitle must be non-empty')));
  });

  test('reports bad date format', () => {
    const errors = validate({
      filePath: BLOG_PATH,
      content: wrap(
        [
          'title: Hello',
          'date: 2024/01/01',
          'author: "[Jane](https://github.com/jane)"',
          'linkTitle: Hello',
        ].join('\n'),
      ),
    });
    assert.ok(errors.some((e) => e.includes('Date format must be YYYY-MM-DD')));
  });

  test('reports H1 heading in body', () => {
    const errors = validate({
      filePath: BLOG_PATH,
      content: wrap(validFrontmatter, '\n# not allowed\n'),
    });
    assert.ok(errors.some((e) => e.includes('must not use H1')));
  });

  test('rejects non-link author', () => {
    const errors = validate({
      filePath: BLOG_PATH,
      content: wrap(
        [
          'title: x',
          'date: 2024-01-01',
          'author: Jane Doe',
          'linkTitle: x',
        ].join('\n'),
      ),
    });
    assert.ok(errors.some((e) => e.includes('Markdown link')));
  });

  test('accepts YAML block-scalar author for multi-author entries', () => {
    const errors = validate({
      filePath: BLOG_PATH,
      content: wrap(
        [
          'title: x',
          'date: 2024-01-01',
          'author: >-',
          '  [Jane](https://github.com/jane),',
          '  [John](https://github.com/john)',
          'linkTitle: x',
        ].join('\n'),
      ),
    });
    assert.deepEqual(errors, []);
  });
});
