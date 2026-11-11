import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAnnouncement,
  findPublishedPosts,
  parseFrontMatter,
  parsePostPath,
} from './index.mjs';

const post = (fm) => `---\n${fm}\n---\n\nBody\n`;
const PATH = 'content/en/blog/2026/my-post.md';

describe('parsePostPath', () => {
  test('accepts single files and bundles', () => {
    assert.deepEqual(parsePostPath(PATH), { year: '2026', slug: 'my-post' });
    assert.deepEqual(parsePostPath('content/en/blog/2026/a/index.md'), {
      year: '2026',
      slug: 'a',
    });
  });
  test('rejects other paths', () => {
    assert.equal(parsePostPath('content/ja/blog/2026/my-post.md'), null);
    assert.equal(parsePostPath('content/en/blog/2026/_index.md'), null);
    assert.equal(parsePostPath('content/en/blog/2026/a/image.md'), null);
  });
});

describe('findPublishedPosts', () => {
  const find = (before, after) =>
    findPublishedPosts(
      [PATH, 'content/en/blog/2026/_index.md'],
      () => before,
      () => after,
    );

  test('new post', () => {
    assert.deepEqual(find(null, post('title: T')), [PATH]);
  });
  test('draft removed', () => {
    assert.deepEqual(find(post('draft: true'), post('title: T')), [PATH]);
  });
  test('new draft', () => {
    assert.deepEqual(find(null, post('draft: true')), []);
  });
  test('edit of a published post', () => {
    assert.deepEqual(find(post('title: T'), post('title: U')), []);
  });
});

describe('buildAnnouncement', () => {
  const today = '2026-05-01';
  const build = (fm) =>
    buildAnnouncement(PATH, parseFrontMatter(post(fm)), today);

  test('defaults text to the title, followed by the URL', () => {
    const a = build('title: "Hello: it\'s & 100%"\ndate: 2026-05-01');
    assert.equal(a.file, 'announcements/2026/05-01-blog-my-post.yaml');
    assert.equal(a.branch, 'otelbot/announce-blog-my-post');
    assert.match(a.content, /^# yaml-language-server: \$schema=/);
    assert.match(a.content, /subject: 'New on the OpenTelemetry blog: Hello/);
    assert.match(
      a.content,
      /https:\/\/opentelemetry.io\/blog\/2026\/my-post\//,
    );
    assert.doesNotMatch(a.body, /goes live/);
  });
  test('uses the announcement string', () => {
    assert.match(
      build('title: T\ndate: 2026-05-01\nannouncement: Custom').content,
      /Custom/,
    );
  });
  test('skips announcement: false', () => {
    assert.equal(
      build('title: T\ndate: 2026-05-01\nannouncement: false'),
      null,
    );
  });
  test('rejects a non-string announcement, a missing title or date', () => {
    assert.throws(
      () => build('title: T\ndate: 2026-05-01\nannouncement: 5'),
      /announcement/,
    );
    assert.throws(() => build('date: 2026-05-01'), /title/);
    assert.throws(() => build('title: T'), /date/);
  });
  test('mentions the go-live date of future posts', () => {
    assert.match(
      build('title: T\ndate: 2026-05-10').body,
      /goes live on 2026-05-10/,
    );
  });
});
