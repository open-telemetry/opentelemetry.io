// Argument-handling tests for the double-check driver (./cli.mjs), run by
// spawning the CLI; the pure logic is covered by ./index.test.mjs.

import { test, suite } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cliPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'cli.mjs',
);

function runCli(args) {
  try {
    const stdout = execFileSync(process.execPath, [cliPath, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stdout, stderr: '' };
  } catch (e) {
    return { status: e.status, stdout: e.stdout, stderr: e.stderr };
  }
}

suite('cli argument handling', () => {
  test('--help prints usage and exits 0', () => {
    const { status, stdout } = runCli(['--help']);
    assert.equal(status, 0, 'exit status is 0');
    assert.match(stdout, /^Usage: cli\.mjs/, 'usage text is printed');
    assert.match(stdout, /--expect-failures/, 'options are listed');
  });

  test('-h is a --help alias', () => {
    const { status, stdout } = runCli(['-h']);
    assert.equal(status, 0, 'exit status is 0');
    assert.match(stdout, /^Usage: cli\.mjs/, 'usage text is printed');
  });

  test('an unknown option fails with the usage text', () => {
    const { status, stderr } = runCli(['--no-such-option']);
    assert.equal(status, 1, 'exit status is 1');
    assert.match(stderr, /--no-such-option/, 'the offending option is named');
    assert.match(stderr, /Usage: cli\.mjs/, 'usage text is printed');
  });

  test('extra positional arguments fail with the usage text', () => {
    const { status, stderr } = runCli(['a.log', 'b.log']);
    assert.equal(status, 1, 'exit status is 1');
    assert.match(stderr, /b\.log/, 'the extra argument is named');
    assert.match(stderr, /Usage: cli\.mjs/, 'usage text is printed');
  });
});
