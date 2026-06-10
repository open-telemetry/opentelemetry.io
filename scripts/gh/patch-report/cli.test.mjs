// Tests for the CLI wiring: gh-api invocation (create vs update) and
// comment_id step-output emission. A stub `gh` on PATH records its argv and
// returns a canned comment id, so no live GitHub API is involved.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CLI = new URL('./cli.mjs', import.meta.url).pathname;

// Runs the CLI with a stubbed `gh` and returns the args that the stub
// received plus the contents written to $GITHUB_OUTPUT. The stub exits with
// $GH_STUB_EXIT (default 0) so failure propagation can be tested.
function runCli(cliArgs, { ghExit = 0 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'patch-report-cli-'));
  const argsFile = join(dir, 'gh-args.txt');
  writeFileSync(argsFile, ''); // remains empty if the CLI exits before gh runs
  const outputFile = join(dir, 'github-output.txt');
  writeFileSync(outputFile, '');
  const stub = join(dir, 'gh');
  // NUL-separated argv so multi-line comment bodies can't break parsing.
  writeFileSync(
    stub,
    `#!/bin/sh\nprintf '%s\\0' "$@" > '${argsFile}'\necho 314159\nexit ${ghExit}\n`,
  );
  chmodSync(stub, 0o755);

  const res = spawnSync(process.execPath, [CLI, ...cliArgs], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${dir}:${process.env.PATH}`,
      GITHUB_SERVER_URL: 'https://example.test',
      GITHUB_REPOSITORY: 'org/repo',
      GITHUB_RUN_ID: '123',
      GITHUB_OUTPUT: outputFile,
    },
  });

  const rawArgs = readFileSync(argsFile, 'utf8');
  return {
    status: res.status,
    stdout: res.stdout,
    stderr: res.stderr,
    ghArgs: rawArgs ? rawArgs.split('\0').slice(0, -1) : [],
    githubOutput: readFileSync(outputFile, 'utf8'),
  };
}

describe('patch-report CLI', () => {
  test('--ack creates a comment and emits its id as a step output', () => {
    const { ghArgs, githubOutput, status } = runCli([
      '--ack',
      '--pr',
      '42',
      '--directive-url',
      'https://example.test/c/7',
    ]);
    assert.equal(status, 0);
    assert.equal(ghArgs[0], 'api');
    assert.ok(ghArgs.includes('repos/org/repo/issues/42/comments'));
    assert.ok(!ghArgs.includes('PATCH'), 'create must not PATCH');
    const body = ghArgs.find((a) => a.startsWith('body='));
    assert.match(body, /^body=🔄 Processing \[your request\]/);
    assert.equal(githubOutput, 'comment_id=314159\n');
  });

  test('--comment-id updates the given comment in place', () => {
    const { ghArgs, githubOutput, status } = runCli([
      '--pr',
      '42',
      '--comment-id',
      '314159',
      '--directive-url',
      'https://example.test/c/7',
      '--label',
      'fix:format',
      '--generate-result',
      'success',
      '--patch-skipped',
      'false',
      '--apply-result',
      'success',
    ]);
    assert.equal(status, 0);
    assert.deepEqual(ghArgs.slice(0, 3), ['api', '-X', 'PATCH']);
    assert.ok(ghArgs.includes('repos/org/repo/issues/comments/314159'));
    const body = ghArgs.find((a) => a.startsWith('body='));
    assert.match(
      body,
      /^body=✅ \[`fix:format`\]\(https:\/\/example\.test\/c\/7\) applied successfully/,
    );
    assert.equal(githubOutput, '', 'update path must not emit comment_id');
  });

  test('--ack and --comment-id are mutually exclusive', () => {
    const { status, stderr } = runCli([
      '--ack',
      '--pr',
      '42',
      '--comment-id',
      '314159',
    ]);
    assert.equal(status, 1);
    assert.match(stderr, /mutually exclusive/);
  });

  test('gh failure propagates its exit code and surfaces output', () => {
    const { status, stdout } = runCli(['--ack', '--pr', '42'], { ghExit: 3 });
    assert.equal(status, 3);
    assert.match(stdout, /314159/, 'gh stdout (API error body) is surfaced');
  });

  test('empty --comment-id creates a new comment (ack fallback path)', () => {
    const { ghArgs } = runCli([
      '--pr',
      '42',
      '--comment-id',
      '',
      '--label',
      'fix:format',
      '--generate-result',
      'success',
      '--patch-skipped',
      'true',
    ]);
    assert.ok(!ghArgs.includes('PATCH'), 'fallback must create, not PATCH');
    assert.ok(ghArgs.includes('repos/org/repo/issues/42/comments'));
  });

  test('--dry-run prints the comment without invoking gh', () => {
    const dir = mkdtempSync(join(tmpdir(), 'patch-report-dry-'));
    const outputFile = join(dir, 'github-output.txt');
    writeFileSync(outputFile, '');
    const stdout = execFileSync(
      process.execPath,
      [CLI, '--ack', '--pr', '42', '--dry-run'],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: dir, // no gh available: must not be needed
          GITHUB_SERVER_URL: 'https://example.test',
          GITHUB_REPOSITORY: 'org/repo',
          GITHUB_RUN_ID: '123',
          GITHUB_OUTPUT: outputFile,
        },
      },
    );
    assert.match(stdout, /🔄 Processing your request/);
    assert.equal(readFileSync(outputFile, 'utf8'), '');
  });
});
