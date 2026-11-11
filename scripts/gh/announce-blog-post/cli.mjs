#!/usr/bin/env node
// CLI entry point for the "Announce blog post" workflow.
//
// Usage:
//   cli.mjs OUT_DIR --before SHA  Announce the post published since SHA.
//   cli.mjs OUT_DIR --post PATH   Announce PATH (manual runs).
//
// OUT_DIR is the root of the open-telemetry/opentelemetry-announcements
// checkout. When an announcement file is written, `branch`, `title` and `body`
// are appended to $GITHUB_OUTPUT (stdout if unset).

import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

import {
  buildAnnouncement,
  findPublishedPosts,
  parseFrontMatter,
  parsePostPath,
} from './index.mjs';

const git = (...args) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : null);

function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { before: { type: 'string' }, post: { type: 'string' } },
  });
  const [outDir] = positionals;
  if (!outDir || !values.before === !values.post) {
    throw new Error('Usage: cli.mjs OUT_DIR (--before SHA | --post PATH)');
  }

  let path = values.post;
  if (!path) {
    const { before } = values;
    const changed = git(
      'diff',
      '--name-only',
      '--no-renames',
      '--diff-filter=AM',
      before,
      'HEAD',
      '--',
      'content/en/blog',
    )
      .split('\n')
      .filter(Boolean);
    const readBefore = (p) => {
      try {
        return git('show', `${before}:${p}`);
      } catch {
        return null;
      }
    };
    const published = findPublishedPosts(changed, readBefore, read);
    if (published.length === 0) {
      console.log('No newly published blog post.');
      return;
    }
    if (published.length > 1) {
      throw new Error(
        `This push published several blog posts (${published.join(', ')}). ` +
          'Announce each one with a manual run of this workflow.',
      );
    }
    [path] = published;
  }

  const content = read(path);
  if (!parsePostPath(path) || content === null) {
    throw new Error(`${path}: not an English blog post`);
  }
  const frontMatter = parseFrontMatter(content);
  if (frontMatter.draft === true) throw new Error(`${path}: is a draft`);

  const today = new Date().toISOString().slice(0, 10);
  const announcement = buildAnnouncement(path, frontMatter, today);
  if (!announcement) {
    console.log(`Skipping ${path}: announcement: false`);
    return;
  }

  const target = join(outDir, announcement.file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, announcement.content);
  console.log(`Wrote ${target}`);

  const { branch, title, body } = announcement;
  const output = `branch=${branch}\ntitle=${title}\nbody<<EOF_BODY\n${body}\nEOF_BODY\n`;
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, output);
  } else {
    process.stdout.write(output);
  }
}

try {
  main();
} catch (err) {
  console.log(`::error::${err.message}`);
  process.exit(1);
}
