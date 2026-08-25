// cSpell:ignore ZgotmplZ

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MARKER = '#ZgotmplZ';
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const publicDir = path.join(repoRoot, 'public');
const indexPath = path.join(publicDir, 'index.html');

const findUnsafeTemplateMarkers = (root) => {
  const matches = [];

  const visit = (directory) => {
    const entries = fs
      .readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(file);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
        for (const [index, line] of lines.entries()) {
          if (line.includes(MARKER)) {
            matches.push(`${path.relative(root, file)}:${index + 1}`);
          }
        }
      }
    }
  };

  visit(root);
  return matches;
};

test('unsafe template marker scan covers nested HTML only', (t) => {
  const fixture = fs.mkdtempSync(
    path.join(os.tmpdir(), 'otel-template-marker-'),
  );
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));

  fs.mkdirSync(path.join(fixture, 'nested'));
  fs.writeFileSync(path.join(fixture, 'index.html'), '<p>safe</p>\n');
  fs.writeFileSync(
    path.join(fixture, 'nested', 'unsafe.html'),
    `<p>safe</p>\n<a href="${MARKER}">unsafe</a>\n`,
  );
  fs.writeFileSync(path.join(fixture, 'ignored.txt'), MARKER);

  assert.deepEqual(findUnsafeTemplateMarkers(fixture), [
    path.join('nested', 'unsafe.html:2'),
  ]);
});

if (!fs.existsSync(indexPath)) {
  test(
    'generated HTML has no unsafe template markers (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  test('generated HTML has no unsafe template markers', () => {
    const matches = findUnsafeTemplateMarkers(publicDir);
    const sample = matches.slice(0, 20).join('\n');
    const remainder =
      matches.length > 20 ? `\n...and ${matches.length - 20} more` : '';

    assert.equal(
      matches.length,
      0,
      `found ${MARKER} in generated HTML:\n${sample}${remainder}`,
    );
  });
}
