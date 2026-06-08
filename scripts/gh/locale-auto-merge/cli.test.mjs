#!/usr/bin/env node
// Functional tests for cli.mjs: spawn the real CLI entry point as a subprocess
// with a fake `gh` on PATH. These cover the wiring the unit/integration tests
// can't reach — flag parsing, the real `spawnSync` runner, and `process.exit`
// codes — without touching the network.
//
// Skipped on Windows, where the shebang-based `gh` shim is not executable.
//
// cspell:ignore mallory

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(here, 'cli.mjs');
const fakeGhSrc = path.join(here, 'testdata', 'fake-gh.mjs');
const skip = process.platform === 'win32';

/**
 * Run cli.mjs with a fake `gh` on PATH and canned responses.
 *
 * @param {Object} opts
 * @param {string[]} [opts.args] CLI argv (default: --pr 1 --enable --dry-run).
 * @param {string} [opts.files] Comma-separated changed-file paths.
 * @param {boolean} [opts.autoMerge]
 * @param {string} [opts.state] PR state (OPEN/CLOSED/MERGED).
 * @param {Object<string,string[]>} [opts.teams] team-slug -> [logins].
 * @param {string} [opts.author] COMMENT_AUTHOR env value.
 * @param {string} [opts.fail] First two `gh` args that should fail.
 * @returns {{ status: number, stdout: string, stderr: string, ghCalls: string[] }}
 */
function runCli({
  args = ['--pr', '1', '--enable', '--dry-run'],
  files = 'content/ja/docs/a.md',
  autoMerge = false,
  state = 'OPEN',
  teams = { 'docs-ja-approvers': ['alice'] },
  author = 'alice',
  fail,
} = {}) {
  const binDir = mkdtempSync(path.join(tmpdir(), 'fake-gh-'));
  const ghLog = path.join(binDir, 'gh.log');
  const ghPath = path.join(binDir, 'gh');
  copyFileSync(fakeGhSrc, ghPath);
  chmodSync(ghPath, 0o755);

  const env = {
    ...process.env,
    PATH: `${binDir}${path.delimiter}${process.env.PATH}`,
    REPO: 'open-telemetry/opentelemetry.io',
    COMMENT_AUTHOR: author,
    FAKE_GH_FILES: files,
    FAKE_GH_AUTOMERGE: autoMerge ? '1' : '0',
    FAKE_GH_STATE: state,
    FAKE_GH_TEAMS: JSON.stringify(teams),
    FAKE_GH_LOG: ghLog,
    ...(fail ? { FAKE_GH_FAIL: fail } : {}),
    // Ensure dry-run defaulting is deterministic (not under Actions).
    GITHUB_ACTIONS: 'false',
  };

  const res = spawnSync('node', [cliPath, ...args], { encoding: 'utf8', env });
  let ghCalls = [];
  try {
    ghCalls = readFileSync(ghLog, 'utf8').split('\n').filter(Boolean);
  } catch {
    /* no calls logged */
  }
  rmSync(binDir, { recursive: true, force: true });
  return {
    status: res.status,
    stdout: res.stdout,
    stderr: res.stderr,
    ghCalls,
  };
}

describe('locale-auto-merge cli', { skip }, () => {
  test('--help exits 0 and prints usage', () => {
    const res = spawnSync('node', [cliPath, '--help'], { encoding: 'utf8' });
    assert.equal(res.status, 0);
    assert.match(res.stdout, /Usage: cli\.mjs/);
  });

  test('missing --pr fails with exit 1', () => {
    const res = runCli({ args: ['--enable', '--dry-run'] });
    assert.equal(res.status, 1);
  });

  test('dry-run eligible+authorized enable: exit 0, no mutating gh calls', () => {
    const res = runCli({ args: ['--pr', '42', '--enable', '--dry-run'] });
    assert.equal(res.status, 0);
    assert.ok(!res.ghCalls.some((c) => c.startsWith('pr merge')));
    assert.ok(!res.ghCalls.some((c) => c.startsWith('pr comment')));
    assert.match(res.stdout, /\[dry-run\]/);
  });

  test('--user impersonation: a non-member is unauthorized (exit 1)', () => {
    const res = runCli({
      args: ['--pr', '42', '--enable', '--user', 'mallory', '--dry-run'],
      author: 'mallory',
    });
    assert.equal(res.status, 1);
    assert.match(res.stdout, /docs-ja-approvers/);
  });

  test('ineligible PR (non-locale file): exit 1', () => {
    const res = runCli({
      args: ['--pr', '42', '--enable', '--dry-run'],
      files: 'content/ja/a.md,layouts/x.html',
    });
    assert.equal(res.status, 1);
  });

  test('--no-dry-run actually issues gh pr merge --auto', () => {
    const res = runCli({
      args: ['--pr', '42', '--enable', '--no-dry-run'],
    });
    assert.equal(res.status, 0);
    assert.ok(res.ghCalls.some((c) => c.startsWith('pr merge 42')));
    assert.ok(res.ghCalls.some((c) => c.includes('--auto')));
  });

  test('rejects more than one command flag', () => {
    const res = runCli({ args: ['--pr', '1', '--enable', '--disable'] });
    assert.equal(res.status, 1);
    assert.match(res.stderr, /only one of/);
  });
});
