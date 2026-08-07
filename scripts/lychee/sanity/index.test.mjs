// Behavioral "sanity" tests that run the real lychee binary against tiny
// fixtures to lock down the assumptions our config depends on: fragment (#id)
// checking on local and external URLs, `index_files` pretty-URL resolution,
// the `extensions` input filter, and `exclude` reporting.
//
// They skip cleanly when the `lychee` binary is absent from PATH.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  lycheeAvailable,
  runLychee,
  findError,
  wasExcluded,
} from './run-lychee.mjs';

const skip = lycheeAvailable() ? false : 'lychee binary is not on PATH';

function makeFixtureDir() {
  return mkdtempSync(join(tmpdir(), 'lychee-sanity-'));
}

describe('lychee fragment checking on local (path) URLs', { skip }, () => {
  let dir;
  let result;

  before(() => {
    dir = makeFixtureDir();
    writeFileSync(
      join(dir, 'target.html'),
      '<!doctype html><html><body><h2 id="known-anchor">A</h2></body></html>',
    );
    mkdirSync(join(dir, 'sub'));
    writeFileSync(
      join(dir, 'sub', 'index.html'),
      '<!doctype html><html><body><h2 id="deep">D</h2></body></html>',
    );
    writeFileSync(
      join(dir, 'page.html'),
      [
        '<!doctype html><html><body>',
        '<a href="target.html#known-anchor">local-valid</a>',
        '<a href="target.html#bogus-anchor">local-bogus</a>',
        '<a href="sub/#deep">pretty-valid</a>',
        '<a href="sub/#nope">pretty-bogus</a>',
        '<a href="missing.html">missing</a>',
        '</body></html>',
      ].join('\n'),
    );
    result = runLychee([
      '--offline',
      '--include-fragments',
      '--root-dir',
      dir,
      '--index-files',
      'index.html',
      join(dir, 'page.html'),
    ]);
  });

  after(() => rmSync(dir, { recursive: true, force: true }));

  test('a bad fragment on a local file is caught', () => {
    assert.equal(
      findError(result, 'target.html#bogus-anchor'),
      'Cannot find fragment',
      'bad local fragment is reported as a missing fragment',
    );
  });

  test('a valid fragment on a local file is OK', () => {
    assert.equal(
      findError(result, 'target.html#known-anchor'),
      null,
      'valid local fragment is accepted',
    );
  });

  test('a pretty (dir) URL resolves via index_files and its fragment is checked', () => {
    assert.equal(
      findError(result, '#deep'),
      null,
      'valid fragment behind a pretty URL is accepted',
    );
    assert.equal(
      findError(result, '#nope'),
      'Cannot find fragment',
      'bad fragment behind a pretty URL is caught',
    );
  });

  test('a missing local target file is an error', () => {
    assert.match(
      findError(result, 'missing.html') ?? '',
      /File not found/,
      'missing local file is reported as not found',
    );
  });
});

describe('lychee fragment checking on external (http) URLs', { skip }, () => {
  let serverProc;
  let base;
  let dir;
  let result;

  before(async () => {
    const serverPath = fileURLToPath(
      new URL('./fixture-server.mjs', import.meta.url),
    );
    serverProc = spawn('node', [serverPath], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const port = await new Promise((resolve, reject) => {
      let buf = '';
      serverProc.stdout.on('data', (chunk) => {
        buf += chunk;
        const match = buf.match(/(\d+)/);
        if (match) resolve(Number(match[1]));
      });
      serverProc.once('error', reject);
    });
    base = `http://127.0.0.1:${port}`;

    dir = makeFixtureDir();
    writeFileSync(
      join(dir, 'page.html'),
      [
        '<!doctype html><html><body>',
        `<a href="${base}/p.html#remote-anchor">ext-valid</a>`,
        `<a href="${base}/p.html#bogus-remote">ext-bogus</a>`,
        '</body></html>',
      ].join('\n'),
    );
    result = runLychee(['--include-fragments', join(dir, 'page.html')]);
  });

  after(() => {
    serverProc.kill();
    rmSync(dir, { recursive: true, force: true });
  });

  test('a bad fragment on an external URL is caught', () => {
    assert.equal(
      findError(result, '#bogus-remote'),
      'Cannot find fragment',
      'bad external fragment is reported as a missing fragment',
    );
  });

  test('a valid fragment on an external URL is OK', () => {
    assert.equal(
      findError(result, '#remote-anchor'),
      null,
      'valid external fragment is accepted',
    );
  });
});

describe('lychee input filtering and exclusion', { skip }, () => {
  test('extensions = ["html"] skips .md inputs', () => {
    const dir = makeFixtureDir();
    try {
      writeFileSync(join(dir, 'ok.txt'), 'ok');
      writeFileSync(
        join(dir, 'keep.html'),
        '<!doctype html><html><body><a href="ok.txt">present</a></body></html>',
      );
      writeFileSync(join(dir, 'skip.md'), '[bad](./does-not-exist.md)\n');
      writeFileSync(join(dir, 'cfg.toml'), 'extensions = ["html"]\n');
      const result = runLychee([
        '--config',
        join(dir, 'cfg.toml'),
        '--offline',
        '--root-dir',
        dir,
        dir,
      ]);
      assert.equal(
        result.errors,
        0,
        'the .md input is not scanned, so its dead link is not an error',
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('an excluded URL is reported as excluded, not errored', () => {
    const dir = makeFixtureDir();
    try {
      writeFileSync(
        join(dir, 'cfg.toml'),
        "exclude = ['^https://excluded\\.example\\.test/']\n",
      );
      writeFileSync(
        join(dir, 'page.html'),
        '<!doctype html><html><body><a href="https://excluded.example.test/x">x</a></body></html>',
      );
      const result = runLychee([
        '--config',
        join(dir, 'cfg.toml'),
        join(dir, 'page.html'),
      ]);
      assert.equal(result.errors, 0, 'an excluded URL contributes no errors');
      assert.ok(
        wasExcluded(result, 'excluded.example.test'),
        'the URL is reported in the excluded set',
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
