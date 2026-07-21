// Guards the "old blog posts are no longer checked" policy: for each tool, a
// file seeded with violations is created in an old blog folder (must be
// ignored) and in a recent one (must be flagged). For the policy, tool list,
// and config details, see:
//
// - https://opentelemetry.io/site/skills/update-old-blog-ignores/
// - content/en/site/skills/update-old-blog-ignores.md
//
// Link checking is not covered (requires a site build); validate it manually
// via `npm run check:links`.
//
// Seed files are deleted on completion; should the test runner die mid-run,
// stray files are easy to spot: content/en/blog/*/zz-old-blog-ignore-test/

import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

// cSpell:ignore zorblefritz opentelemtry textlintignore
const seededWord = 'zorblefritz';

// Use the current year's blog folder if it exists, otherwise fall back to
// earlier years, but no earlier than the current year - 2. The "recent" post
// must land in a year that the lint configs still check; if this fails, the
// old-blog ignore ranges probably haven't been advanced in a while. See:
// https://opentelemetry.io/site/skills/update-old-blog-ignores/
function recentBlogDir() {
  const currentYear = new Date().getFullYear();
  const lowerBound = currentYear - 2;
  for (let year = currentYear; year >= lowerBound; year--) {
    const dir = `content/en/blog/${year}`;
    if (fs.existsSync(path.join(repoRoot, dir))) return dir;
  }
  assert.fail(
    `no content/en/blog/<year> folder found for year >= ${lowerBound}`,
  );
}

const recentDir = recentBlogDir();
const recentYear = path.basename(recentDir);
const recentPost = `${recentDir}/zz-old-blog-ignore-test/index.md`;

// The newest existing blog-year folder that the tools must ignore. Like the
// sidebar script in content/en/blog/_index.md, treat the current and previous
// years as recent: old years are those <= currentYear - 2.
function oldBlogDir() {
  for (let year = new Date().getFullYear() - 2; year >= 2019; year--) {
    const dir = `content/en/blog/${year}`;
    if (fs.existsSync(path.join(repoRoot, dir))) return dir;
  }
  assert.fail(`no old content/en/blog/<year> folder found`);
}

const oldDir = oldBlogDir();
const oldYear = path.basename(oldDir);
const oldPost = `${oldDir}/zz-old-blog-ignore-test/index.md`;

// The folders overlap at currentYear - 2; if posts are missing for ~2 years
// they could resolve to the same dir, which would invalidate the test.
assert.notEqual(oldDir, recentDir, 'old and recent blog dirs must differ');

const seedContent = `---
title: Old-blog lint-ignore tooling test
date: ${oldYear}-01-01
---

## Seeded heading with trailing spaces${'  '}

A cspell unknown word ${seededWord}, an opentelemtry textlint terminology
error, and a deliberately very long line so that prettier flags this file as needing a rewrap.

[unstable GH link for the gh-url-hash markdownlint rule](https://github.com/open-telemetry/opentelemetry-collector/blob/main/README.md)
`;

function run(cmd, args) {
  const res = spawnSync(cmd, args, { cwd: repoRoot, encoding: 'utf8' });
  assert.notEqual(res.error, Object(res.error), `failed to launch ${cmd}`);
  return { status: res.status, out: (res.stdout ?? '') + (res.stderr ?? '') };
}

const npx = (...args) => run('npx', ['--no-install', ...args]);

describe('old blog posts are ignored by lint/format tooling', () => {
  before(() => {
    for (const f of [oldPost, recentPost]) {
      const abs = path.join(repoRoot, f);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, seedContent);
    }
  });

  after(() => {
    for (const f of [oldPost, recentPost]) {
      fs.rmSync(path.dirname(path.join(repoRoot, f)), {
        recursive: true,
        force: true,
      });
    }
  });

  test('cspell (.cspell.yml ignorePaths)', () => {
    const { status, out } = npx(
      'cspell',
      '--no-progress',
      '-c',
      '.cspell.yml',
      oldPost,
      recentPost,
    );
    assert.notEqual(status, 0, 'exit status');
    assert.match(out, /Files checked: 1\b/, 'old post should be skipped');
    assert.ok(
      out.includes(`${recentPost}:`),
      `flags ${seededWord} in recent post`,
    );
  });

  test('markdownlint (.markdownlint-cli2.yaml ignores)', () => {
    const { status, out } = npx('markdownlint-cli2', oldPost, recentPost);
    assert.notEqual(status, 0, 'exit status');
    const errorLines = out.split('\n').filter((l) => / error /.test(l));
    assert.ok(errorLines.length > 0, 'reports errors for recent post');
    assert.ok(
      errorLines.every((l) => l.startsWith(recentPost)),
      `errors only in recent post, got:\n${errorLines.join('\n')}`,
    );
  });

  test('prettier (.prettierignore)', () => {
    const { status, out } = npx('prettier', '--check', oldPost, recentPost);
    assert.notEqual(status, 0, 'exit status');
    assert.ok(out.includes(recentPost), 'flags recent post');
    assert.ok(!out.includes(oldPost), 'skips old post');
  });

  test('textlint (.textlintignore)', () => {
    const { status, out } = npx('textlint', oldPost, recentPost);
    assert.notEqual(status, 0, 'exit status');
    assert.ok(out.includes(recentPost), 'flags recent post');
    assert.ok(!out.includes(oldPost), 'skips old post');
  });

  test('__find:md:not-old-blog (used by _fix:dict and _fix:trailing-spaces)', () => {
    const { status, out } = run('npm', [
      'run',
      '-s',
      '__find:md:not-old-blog',
      '--',
      oldDir,
      recentDir,
    ]);
    assert.equal(status, 0, 'exit status');
    const files = out.split('\0').filter(Boolean);
    assert.ok(files.includes(recentPost), 'finds recent post');
    assert.ok(!files.includes(oldPost), 'excludes old post');
  });
});
