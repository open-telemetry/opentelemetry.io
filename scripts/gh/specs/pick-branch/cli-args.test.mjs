import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { parseCliArgs, cliUsage } from './index.mjs';

describe('pick-branch: CLI args', () => {
  test('defaults: spec=otel, dry-run on when not in Actions', () => {
    const result = parseCliArgs([], {});
    assert.equal(result.spec, 'otel');
    assert.equal(result.dryRun, true);
    assert.equal(result.help, false);
    assert.match(result.dryRunReason, /GITHUB_ACTIONS/);
  });

  test('default dry-run is OFF when GITHUB_ACTIONS=true', () => {
    const result = parseCliArgs([], { GITHUB_ACTIONS: 'true' });
    assert.equal(result.dryRun, false);
    assert.equal(result.dryRunReason, 'GITHUB_ACTIONS=true');
  });

  test('default dry-run is ON when GITHUB_ACTIONS is set to anything else', () => {
    assert.equal(parseCliArgs([], { GITHUB_ACTIONS: 'false' }).dryRun, true);
    assert.equal(parseCliArgs([], { GITHUB_ACTIONS: '' }).dryRun, true);
  });

  test('--dry-run forces dry-run even under Actions', () => {
    const result = parseCliArgs(['--dry-run'], { GITHUB_ACTIONS: 'true' });
    assert.equal(result.dryRun, true);
    assert.equal(result.dryRunReason, '--dry-run flag');
  });

  test('--no-dry-run forces writes even outside Actions', () => {
    const result = parseCliArgs(['--no-dry-run'], {});
    assert.equal(result.dryRun, false);
    assert.equal(result.dryRunReason, '--no-dry-run flag');
  });

  test('later --dry-run / --no-dry-run wins', () => {
    assert.equal(parseCliArgs(['--no-dry-run', '--dry-run'], {}).dryRun, true);
    assert.equal(parseCliArgs(['--dry-run', '--no-dry-run'], {}).dryRun, false);
  });

  test('--spec=<id> selects a known spec', () => {
    assert.equal(parseCliArgs(['--spec=semconv'], {}).spec, 'semconv');
  });

  test('--spec <id> (separate token) selects a known spec', () => {
    assert.equal(parseCliArgs(['--spec', 'semconv'], {}).spec, 'semconv');
  });

  test('-s <id> short form selects a known spec', () => {
    assert.equal(parseCliArgs(['-s', 'semconv'], {}).spec, 'semconv');
  });

  test('--help sets help flag without throwing', () => {
    const result = parseCliArgs(['--help'], {});
    assert.equal(result.help, true);
  });

  test('-h short form sets help flag', () => {
    assert.equal(parseCliArgs(['-h'], {}).help, true);
  });

  test('unknown --spec value throws', () => {
    assert.throws(() => parseCliArgs(['--spec=bogus'], {}), /Unknown --spec/);
  });

  test('unknown flag throws', () => {
    assert.throws(() => parseCliArgs(['--bogus'], {}), /Unknown argument/);
  });

  test('--spec without value throws', () => {
    assert.throws(() => parseCliArgs(['--spec'], {}), /Missing value/);
  });

  test('cliUsage mentions both specs and the dry-run flags', () => {
    const text = cliUsage();
    assert.match(text, /otel\|semconv/);
    assert.match(text, /--dry-run/);
    assert.match(text, /--no-dry-run/);
  });
});
