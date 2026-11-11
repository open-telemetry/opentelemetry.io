import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAnnouncement,
  collectAnnouncements,
  describePullRequest,
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

describe('buildAnnouncement', () => {
  const today = '2026-05-01';

  test('defaults text to the title, followed by the URL', () => {
    const r = buildAnnouncement({
      path: PATH,
      frontMatter: parseFrontMatter(post('title: "Hello: it\'s & 100%"')),
      today,
    });
    assert.equal(r.file, 'announcements/2026/05-01-blog-my-post.yaml');
    assert.match(r.content, /^# yaml-language-server: \$schema=/);
    assert.match(r.content, /subject: 'New on the OpenTelemetry blog: Hello/);
    assert.match(
      r.content,
      /https:\/\/opentelemetry.io\/blog\/2026\/my-post\//,
    );
  });

  test('uses the announcement string', () => {
    const r = buildAnnouncement({
      path: PATH,
      frontMatter: { title: 'T', announcement: 'Custom' },
      today,
    });
    assert.match(r.content, /Custom/);
  });

  test('skips announcement: false', () => {
    const r = buildAnnouncement({
      path: PATH,
      frontMatter: { title: 'T', announcement: false },
      today,
    });
    assert.ok('skip' in r);
  });

  test('rejects non-string announcement', () => {
    assert.throws(
      () =>
        buildAnnouncement({
          path: PATH,
          frontMatter: { title: 'T', announcement: 5 },
          today,
        }),
      /must be a string or false/,
    );
  });

  test('mentions the go-live date for future posts', () => {
    const r = buildAnnouncement({
      path: PATH,
      frontMatter: parseFrontMatter(post('title: T\ndate: 2026-05-10')),
      today,
    });
    assert.match(r.line, /goes live on 2026-05-10/);
  });

  test('names the file after the post date, independent of the run date', () => {
    const frontMatter = parseFrontMatter(post('title: T\ndate: 2026-04-20'));
    for (const day of ['2026-05-01', '2026-06-15']) {
      const r = buildAnnouncement({ path: PATH, frontMatter, today: day });
      assert.equal(r.file, 'announcements/2026/04-20-blog-my-post.yaml');
    }
  });
});

describe('collectAnnouncements', () => {
  const run = (current, before, explicit = false) =>
    collectAnnouncements({
      posts: [PATH],
      explicit,
      today: '2026-05-01',
      readCurrent: () => current,
      readBefore: (p) => (p === PATH ? before : null),
    });

  test('announces new posts', () => {
    assert.equal(run(post('title: T'), null).length, 1);
  });
  test('announces draft -> published', () => {
    assert.equal(
      run(post('title: T'), post('title: T\ndraft: true')).length,
      1,
    );
  });
  test('ignores new drafts', () => {
    assert.equal(run(post('title: T\ndraft: true'), null).length, 0);
  });
  test('ignores edits of published posts', () => {
    assert.equal(run(post('title: T'), post('title: T')).length, 0);
  });
  test('treats a bundle and a single file as the same post', () => {
    const r = collectAnnouncements({
      posts: [PATH],
      explicit: false,
      today: '2026-05-01',
      readCurrent: () => post('title: T'),
      readBefore: (p) =>
        p === 'content/en/blog/2026/my-post/index.md' ? post('title: T') : null,
    });
    assert.equal(r.length, 0);
  });
  test('explicit posts ignore history', () => {
    assert.equal(run(post('title: T'), post('title: T'), true).length, 1);
  });
});

describe('describePullRequest', () => {
  const a = (slug) => ({ slug, title: `T ${slug}`, line: `- ${slug}` });
  test('single post', () => {
    assert.deepEqual(describePullRequest([a('x')]), {
      branch: 'otelbot/announce-blog-x',
      title: 'Announce blog post: T x',
      body: '- x',
    });
  });
  test('several posts', () => {
    const r = describePullRequest([a('x'), a('y')]);
    assert.equal(r.title, 'Announce 2 blog posts');
    assert.equal(r.body, '- x\n- y');
  });
});
