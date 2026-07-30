// End-to-end drift-overlay scenario tests: prove the full chain
//
//   git fixture repo (committed baseline + EN edits on top)
//     -> the real `generate:config:links` script
//     -> the real lychee binary over a fixture `public/` tree
//
// Each seam is unit-tested elsewhere (scripts/i18n/drift.test.mjs,
// scripts/lychee/config/index.test.mjs, index.test.mjs here), but only this
// test spans them: a page each unit believes is excluded must actually not
// turn the lychee run red, and — the control — a page nothing excludes must.
//
// The fixture is declarative (file map -> tmpdir, in the spirit of Hugo's
// IntegrationTestBuilder). The real script files are copied into the fixture
// repo unmodified — `generate:config:links` derives the repo root from its
// own location — so the chain under test is the working tree's actual code.
//
// Skips cleanly when the `lychee` binary is absent from PATH.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { lycheeAvailable, runLychee, findError } from './run-lychee.mjs';

const skip = lycheeAvailable() ? false : 'lychee binary is not on PATH';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

// --- declarative fixture helpers ---------------------------------------------

// Write a { relativePath: content } file map under dir, creating directories.
function writeFiles(dir, files) {
  for (const [relPath, content] of Object.entries(files)) {
    const filePath = join(dir, relPath);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
  }
}

function git(dir, ...args) {
  return execFileSync('git', args, {
    cwd: dir,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_SYSTEM: '/dev/null',
      GIT_AUTHOR_NAME: 'fixture',
      GIT_AUTHOR_EMAIL: 'fixture@example.test',
      GIT_COMMITTER_NAME: 'fixture',
      GIT_COMMITTER_EMAIL: 'fixture@example.test',
    },
  }).trim();
}

// --- fixture content ----------------------------------------------------------

const pin = 'default_lang_commit: 0123456789abcdef0123456789abcdef01234567';

function contentPage(title, extraFrontMatter = '') {
  return `---\ntitle: ${title}\n${extraFrontMatter}---\n\nBody.\n`;
}

// A built page whose sole link is broken (the target file does not exist), so
// the page is red iff lychee scans it. Distinct targets keep cases attributable.
function brokenHtml(brokenTarget) {
  return [
    '<!doctype html><html><body>',
    `<a href="/xx/docs/${brokenTarget}.html">broken</a>`,
    '</body></html>',
  ].join('\n');
}

const validHtml = [
  '<!doctype html><html><body>',
  '<a href="/en/docs/target/#known-anchor">valid</a>',
  '</body></html>',
].join('\n');

// Committed as the baseline: every EN page and locale copy in sync.
const baselineFiles = {
  'content/en/docs/en-edited.md': contentPage('EN, edited after baseline'),
  'content/xx/docs/en-edited.md': contentPage('Copy of en-edited', `${pin}\n`),
  'content/en/docs/en-deleted.md': contentPage('EN, deleted after baseline'),
  'content/xx/docs/en-deleted.md': contentPage(
    'Copy of en-deleted',
    `${pin}\n`,
  ),
  'content/en/docs/both-edited.md': contentPage('EN, edited after baseline'),
  'content/xx/docs/both-edited.md': contentPage(
    'Copy of both-edited, also edited after baseline',
    `${pin}\n`,
  ),
  // Stored-status case: EN counterpart long gone, status already persisted by
  // a tree-wide sync (same skip predicate as `true` in config gen).
  'content/xx/docs/stored-fnf.md': contentPage(
    'Copy whose EN is long gone',
    `${pin}\ndrifted_from_default: file not found\n`,
  ),
  'content/en/docs/control.md': contentPage('EN, untouched'),
  'content/xx/docs/control.md': contentPage('Copy of control', `${pin}\n`),
};

// The fixture "built site": each scenario's locale page carries a broken
// link, so scanned-vs-excluded is directly observable in lychee's output.
const publicFiles = {
  'public/en/docs/target/index.html':
    '<!doctype html><html><body><h2 id="known-anchor">T</h2></body></html>',
  'public/xx/docs/en-edited/index.html': brokenHtml('missing-en-edited'),
  'public/xx/docs/en-deleted/index.html': brokenHtml('missing-en-deleted'),
  'public/xx/docs/both-edited/index.html': brokenHtml('missing-both-edited'),
  'public/xx/docs/stored-fnf/index.html': brokenHtml('missing-stored-fnf'),
  'public/xx/docs/control/index.html': brokenHtml('missing-control'),
  'public/en/docs/control/index.html': validHtml,
};

describe(
  'drift overlay e2e: fixture repo -> config gen -> lychee',
  { skip },
  () => {
    let dir;
    let lycheeToml;
    let result;

    before(() => {
      dir = mkdtempSync(join(tmpdir(), 'drift-overlay-e2e-'));

      // The real chain under test, copied verbatim into the fixture repo (the
      // config script resolves the repo root from its own path). The symlinked
      // node_modules serves the script's own imports (js-yaml).
      for (const f of [
        'scripts/lychee/config/index.mjs',
        'scripts/i18n/drift.mjs',
        'lychee.base.toml',
      ]) {
        mkdirSync(dirname(join(dir, f)), { recursive: true });
        cpSync(join(repoRoot, f), join(dir, f));
      }
      symlinkSync(join(repoRoot, 'node_modules'), join(dir, 'node_modules'));

      // Baseline commit: everything in sync.
      writeFiles(dir, baselineFiles);
      git(dir, 'init', '--quiet');
      git(dir, 'add', '-A');
      git(dir, 'commit', '--quiet', '-m', 'baseline');
      const baselineSha = git(dir, 'rev-parse', 'HEAD');
      writeFiles(dir, {
        'data/l10n-drift.yaml': `commit: ${baselineSha}\n`,
      });

      // Post-baseline commit: the EN churn (and same-window locale activity)
      // that the overlay must react to.
      writeFiles(dir, {
        'content/en/docs/en-edited.md': contentPage('EN, edited'),
        'content/en/docs/both-edited.md': contentPage('EN, edited'),
        'content/xx/docs/both-edited.md': contentPage(
          'Copy, edited in the same window',
          `${pin}\n`,
        ),
        ...publicFiles,
      });
      rmSync(join(dir, 'content/en/docs/en-deleted.md'));
      git(dir, 'add', '-A');
      git(dir, 'commit', '--quiet', '-m', 'EN edits since the baseline');

      // Real config generation, then the real lychee run, both invoked as in
      // production (absolute public path: exclude_path anchors on /public/).
      execFileSync(
        process.execPath,
        [join(dir, 'scripts/lychee/config/index.mjs')],
        {
          cwd: dir,
          stdio: ['ignore', 'ignore', 'pipe'],
        },
      );
      lycheeToml = readFileSync(join(dir, 'lychee.toml'), 'utf8');
      const publicDir = join(dir, 'public');
      result = runLychee(
        [
          '--config',
          join(dir, 'lychee.toml'),
          '--root-dir',
          publicDir,
          publicDir,
        ],
        { cwd: dir },
      );
    });

    after(() => rmSync(dir, { recursive: true, force: true }));

    test('sanity: exactly the non-excluded pages are scanned', () => {
      // 3 = the two checked broken-link pages (both-edited, control) + the
      // EN control's valid link. Pinning the exact count distinguishes
      // "excluded by the overlay" from "accidentally not scanned": a page
      // dropped from the input set for any other reason would change it.
      // (exclude_path removes files from lychee's input set, so path-excluded
      // pages never surface in excluded_map — the count is the observable.)
      assert.equal(result.total, 3, 'link count matches the checked pages');
      assert.equal(
        findError(result, '/en/docs/target/#known-anchor'),
        null,
        'the valid link on a checked page passes',
      );
    });

    test('generated config excludes exactly the drifted/pending copies', () => {
      for (const page of ['en-edited', 'en-deleted', 'stored-fnf']) {
        assert.ok(
          lycheeToml.includes(`/public/xx/docs/${page}/index\\.html$`),
          `exclude_path covers xx/docs/${page}`,
        );
      }
      for (const page of ['both-edited', 'control']) {
        assert.ok(
          !lycheeToml.includes(`/${page}/index\\.html$`),
          `exclude_path leaves xx/docs/${page} checked`,
        );
      }
    });

    test('EN edited since the baseline: broken locale copy is excluded', () => {
      assert.equal(
        findError(result, 'missing-en-edited'),
        null,
        'the drift-pending copy of an edited EN page is skipped',
      );
    });

    test('EN deleted since the baseline: broken locale copy is excluded', () => {
      assert.equal(
        findError(result, 'missing-en-deleted'),
        null,
        'the drift-pending copy of a deleted EN page is skipped',
      );
    });

    test('activity exemption: a locale copy edited in the window stays checked', () => {
      assert.match(
        findError(result, 'missing-both-edited') ?? '',
        /File not found/,
        'the exempted copy is scanned and its broken link is red',
      );
    });

    test('stored `file not found` status: broken locale copy is excluded', () => {
      assert.equal(
        findError(result, 'missing-stored-fnf'),
        null,
        'the stored-status copy of a long-deleted EN page is skipped',
      );
    });

    test('control: a broken copy of an in-sync EN page is red', () => {
      assert.match(
        findError(result, 'missing-control') ?? '',
        /File not found/,
        'nothing excludes the in-sync copy, so its broken link is red',
      );
    });

    test('no other reds: the two expected errors are the only ones', () => {
      assert.equal(
        result.errors,
        2,
        'exactly the exempted + control pages are red',
      );
    });
  },
);
