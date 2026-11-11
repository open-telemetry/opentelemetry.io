#!/usr/bin/env node
// CLI entry point for the "Announce blog post" workflow.
//
// Usage: cli.mjs BEFORE OUT_DIR [POST...]
//   BEFORE   Commit to compare HEAD with (ignored when POSTs are given).
//   OUT_DIR  Root of the open-telemetry/opentelemetry-announcements checkout.
//   POST     Blog post files to announce regardless of BEFORE.
//
// Writes announcement files below OUT_DIR and, when it wrote any, appends
// `branch`, `title` and `body` to $GITHUB_OUTPUT (stdout if unset).
// A post is newly published if it isn't a draft now, and it didn't exist or
// was a draft at BEFORE. Posts with `announcement: false` are skipped.

import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

import { collectAnnouncements, describePullRequest } from './index.mjs';

const [before, outDir, ...explicitPosts] = process.argv.slice(2);
if (!before || !outDir) {
  console.error('Usage: cli.mjs BEFORE OUT_DIR [POST...]');
  process.exit(2);
}

const git = (...args) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

const explicit = explicitPosts.length > 0;
const posts = explicit
  ? explicitPosts
  : git(
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

try {
  const announcements = collectAnnouncements({
    posts,
    explicit,
    today: new Date().toISOString().slice(0, 10),
    readCurrent: (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null),
    readBefore: (p) => {
      try {
        return git('show', `${before}:${p}`);
      } catch {
        return null;
      }
    },
    log: console.log,
  });

  if (announcements.length === 0) {
    console.log('No newly published blog posts.');
    process.exit(0);
  }

  for (const { file, content } of announcements) {
    const target = join(outDir, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
    console.log(`Wrote ${target}`);
  }

  const { branch, title, body } = describePullRequest(announcements);
  const output = `branch=${branch}\ntitle=${title}\nbody<<EOF_BODY\n${body}\nEOF_BODY\n`;
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, output);
  else process.stdout.write(output);
} catch (err) {
  console.log(`::error::${err.message}`);
  process.exit(1);
}
