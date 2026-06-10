// Tests for the CLI wiring: gh-api invocation (create vs update) and
// comment_id step-output emission. A stub `gh` on PATH records its argv and
// returns a canned comment id, so no live GitHub API is involved.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CLI = new URL('./cli.mjs', import.meta.url).pathname;

// Runs the CLI with a stubbed `gh` and returns the args that the stub
// received plus the contents written to $GITHUB_OUTPUT.
function runCli(cliArgs) {
  const dir = mkdtempSync(join(tmpdir(), 'patch-report-cli-'));
  const argsFile = join(dir, 'gh-args.txt');
  const outputFile = join(dir, 'github-output.txt');
  writeFileSync(outputFile, '');
  const stub = join(dir, 'gh');
  writeFileSync(
    stub,
    `#!/bin/sh\nprintf '%s\\n' "$@" > '${argsFile}'\necho 314159\n`,
  );
  chmodSync(stub, 0o755);

  const stdout = execFileSync(process.execPath, [CLI, ...cliArgs], {
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

  return {
    stdout,
    ghArgs: readFileSync(argsFile, 'utf8').trim().split('\n'),
    githubOutput: readFileSync(outputFile, 'utf8'),
  };
}

describe('patch-report CLI', () => {
  test('--ack creates a comment and emits its id as a step output', () => {
    const { ghArgs, githubOutput } = runCli([
      '--ack',
      '--pr',
      '42',
      '--directive-url',
      'https://example.test/c/7',
    ]);
    assert.equal(ghArgs[0], 'api');
    assert.ok(ghArgs.includes('repos/org/repo/issues/42/comments'));
    assert.ok(!ghArgs.includes('PATCH'), 'create must not PATCH');
    const body = ghArgs.find((a) => a.startsWith('body='));
    assert.match(body, /^body=🔄 Processing \[your request\]/);
    assert.equal(githubOutput, 'comment_id=314159\n');
  });

  test('--comment-id updates the given comment in place', () => {
    const { ghArgs } = runCli([
      '--pr',
      '42',
      '--comment-id',
      '314159',
      '--label',
      'fix:format',
      '--generate-result',
      'success',
      '--patch-skipped',
      'false',
      '--apply-result',
      'success',
    ]);
    assert.deepEqual(ghArgs.slice(0, 3), ['api', '-X', 'PATCH']);
    assert.ok(ghArgs.includes('repos/org/repo/issues/comments/314159'));
    const body = ghArgs.find((a) => a.startsWith('body='));
    assert.match(body, /^body=✅ `fix:format` applied successfully/);
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
