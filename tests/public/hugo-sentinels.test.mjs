// Hugo replaces values that are unsafe for their template context with
// `#ZgotmplZ`. The build still succeeds, so without a rendered-output check a
// broken link or asset URL can reach production unnoticed.
//
// This test scans every generated HTML file, including localized pages. It
// follows the tests/public convention: skip when no site has been built, and
// otherwise report each sentinel with a file, line, column, and short excerpt.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SENTINEL = '#ZgotmplZ';
const MAX_EXCERPT_LENGTH = 160;
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const publicDir = path.join(repoRoot, 'public');
const indexPath = path.join(publicDir, 'index.html');

function* htmlFiles(root) {
  const pending = [root];

  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(file);
      else if (entry.isFile() && path.extname(entry.name) === '.html')
        yield file;
    }
  }
}

function excerpt(line, column) {
  const start = Math.max(0, column - Math.floor(MAX_EXCERPT_LENGTH / 2));
  const value = line.slice(start, start + MAX_EXCERPT_LENGTH).trim();
  return `${start > 0 ? '…' : ''}${value}${
    start + MAX_EXCERPT_LENGTH < line.length ? '…' : ''
  }`;
}

function findHugoSentinels(root) {
  const findings = [];

  for (const file of htmlFiles(root)) {
    const relativeFile = path.relative(root, file).split(path.sep).join('/');
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

    for (const [lineIndex, line] of lines.entries()) {
      let column = line.indexOf(SENTINEL);
      while (column !== -1) {
        findings.push({
          file: relativeFile,
          line: lineIndex + 1,
          column: column + 1,
          excerpt: excerpt(line, column),
        });
        column = line.indexOf(SENTINEL, column + SENTINEL.length);
      }
    }
  }

  return findings;
}

test('Hugo sentinel scanner reports every occurrence with its location', (t) => {
  const fixtureDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'otel-hugo-output-'),
  );
  t.after(() => fs.rmSync(fixtureDir, { recursive: true, force: true }));

  fs.mkdirSync(path.join(fixtureDir, 'nested'));
  fs.writeFileSync(
    path.join(fixtureDir, 'nested', 'index.html'),
    '<a href="#ZgotmplZ">first</a>\n<img src="#ZgotmplZ">',
  );
  fs.writeFileSync(path.join(fixtureDir, 'ignored.txt'), SENTINEL);

  assert.deepStrictEqual(findHugoSentinels(fixtureDir), [
    {
      file: 'nested/index.html',
      line: 1,
      column: 10,
      excerpt: '<a href="#ZgotmplZ">first</a>',
    },
    {
      file: 'nested/index.html',
      line: 2,
      column: 11,
      excerpt: '<img src="#ZgotmplZ">',
    },
  ]);
});

if (!fs.existsSync(indexPath)) {
  test(
    'rendered HTML contains no Hugo unsafe-value sentinels (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  test('rendered HTML contains no Hugo unsafe-value sentinels', () => {
    assert.deepStrictEqual(
      findHugoSentinels(publicDir),
      [],
      `${SENTINEL} marks a value Hugo rejected as unsafe`,
    );
  });
}
