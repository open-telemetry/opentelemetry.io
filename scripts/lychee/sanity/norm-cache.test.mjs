// Regression guard for the lychee-norm-cache helper (link-cache package): the
// `/public/`-anchored `exclude_path` patterns that ../config/index.mjs
// generates only match when the helper hands lychee the lexical `<cwd>/public`
// path. When `public` is a symlink -- the diffable-public layout -- resolving
// it to its target would strip the `/public/` path component and silently
// disable every exclusion (fixed in chalin/link-cache v0.2.1).
//
// Skips cleanly when the `lychee` binary or the link-cache package is absent.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

import { lycheeAvailable } from './run-lychee.mjs';

const require = createRequire(import.meta.url);

function normCacheBin() {
  try {
    return require.resolve('link-cache/check/index.mjs');
  } catch {
    return null;
  }
}

const bin = normCacheBin();
const skip = !lycheeAvailable()
  ? 'lychee binary is not on PATH'
  : !bin
    ? 'link-cache package is not installed'
    : process.platform === 'win32'
      ? 'directory symlinks need elevation on Windows'
      : false;

describe(
  'lychee-norm-cache exclusions through a symlinked public/',
  { skip },
  () => {
    test('a dead link under an excluded path stays excluded', () => {
      const root = mkdtempSync(join(tmpdir(), 'lychee-norm-cache-'));
      try {
        // Mirror the diffable-public layout: `public` is a symlink to a
        // sibling directory holding the built site.
        const built = join(root, 'site.g');
        mkdirSync(join(built, 'blog', '2022'), { recursive: true });
        writeFileSync(
          join(built, 'index.html'),
          '<!doctype html><html><body><a href="present.html">ok</a></body></html>',
        );
        writeFileSync(join(built, 'present.html'), 'x');
        writeFileSync(
          join(built, 'blog', '2022', 'index.html'),
          '<!doctype html><html><body><a href="missing.html">dead</a></body></html>',
        );
        const site = join(root, 'site');
        mkdirSync(site);
        symlinkSync(join('..', 'site.g'), join(site, 'public'));
        writeFileSync(
          join(site, 'lychee.toml'),
          'extensions = ["html"]\nexclude_path = ["/public/blog/2022/"]\n',
        );

        const result = spawnSync('node', [bin, '--offline'], {
          cwd: site,
          encoding: 'utf8',
        });
        assert.equal(
          result.status,
          0,
          `the excluded dead link is skipped, so the check passes:\n${result.stdout}${result.stderr}`,
        );
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });
  },
);
