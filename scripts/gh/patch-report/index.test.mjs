// Tests for the patch-pipeline outcome comment composer.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { buildOutcomeComment } from './index.mjs';

describe('buildOutcomeComment', () => {
  const BASE = {
    label: 'fix:refcache',
    generateResult: 'success',
    patchSkipped: 'false',
    commandExitStatus: '0',
    applyResult: 'success',
    runId: '123',
    runUrl: 'https://example.test/run/123',
  };

  const LOGS = 'See the logs of [run 123](https://example.test/run/123).';

  const build = (overrides) => buildOutcomeComment({ ...BASE, ...overrides });

  test('success: command applied cleanly', () => {
    const body = build({});
    assert.match(body, /^✅ `fix:refcache` applied successfully/);
  });

  test('no-op: generation produced no changes', () => {
    assert.equal(
      build({ patchSkipped: 'true' }),
      `ℹ️ \`fix:refcache\` made no changes; nothing to commit. ${LOGS}`,
    );
  });

  test('no-op with unknown (empty) exit status is not reported as a failure', () => {
    assert.equal(
      build({ patchSkipped: 'true', commandExitStatus: '' }),
      `ℹ️ \`fix:refcache\` made no changes; nothing to commit. ${LOGS}`,
    );
  });

  test('command failed and produced no changes', () => {
    const body = build({ patchSkipped: 'true', commandExitStatus: '2' });
    assert.match(body, /^❌ `fix:refcache` failed \(exit status 2\)/);
    assert.match(body, /made no changes/);
  });

  test('command failed non-zero but changes were applied', () => {
    const body = build({ commandExitStatus: '1' });
    assert.match(
      body,
      /^⚠️ `fix:refcache` exited with a non-zero status \(1\)/,
    );
    assert.match(body, /the resulting changes were applied/);
  });

  test('unidentified request: generation failed with no label', () => {
    const body = build({ generateResult: 'failure', label: '' });
    assert.match(body, /^❌ The request could not be processed\./);
  });

  test('unidentified request includes a caller-supplied hint', () => {
    // The hint is an opaque caller-supplied string (this reporter is generic,
    // not /fix-specific), so any text works here.
    const hint = 'See the docs for how to phrase a request.';
    const body = build({ generateResult: 'failure', label: '', hint });
    assert.match(body, /^❌ The request could not be processed\./);
    assert.ok(body.includes(hint));
  });

  test('generation failed for a known command (e.g. oversized patch)', () => {
    const body = build({ generateResult: 'failure' });
    assert.match(body, /^❌ `fix:refcache` could not be run/);
  });

  test('generation cancelled', () => {
    const body = build({ generateResult: 'cancelled' });
    assert.match(body, /^⚠️ `fix:refcache` was cancelled/);
  });

  test('apply failed after changes were produced', () => {
    const body = build({ applyResult: 'failure' });
    assert.match(body, /could not be applied or pushed/);
  });

  test('apply cancelled after changes were produced', () => {
    const body = build({ applyResult: 'cancelled' });
    assert.match(body, /applying them was cancelled/);
  });

  test('falls back to a generic label when none is given', () => {
    const body = build({ label: '' });
    assert.match(body, /^✅ the requested action applied successfully/);
  });

  test('every outcome produces a non-empty comment ending with the run link', () => {
    for (const generateResult of ['success', 'failure', 'cancelled']) {
      for (const patchSkipped of ['true', 'false']) {
        for (const applyResult of [
          'success',
          'failure',
          'cancelled',
          'skipped',
        ]) {
          for (const commandExitStatus of ['0', '1', '']) {
            for (const label of ['fix', '']) {
              for (const hint of ['Any hint text.', '']) {
                const body = buildOutcomeComment({
                  label,
                  generateResult,
                  patchSkipped,
                  commandExitStatus,
                  applyResult,
                  runId: '1',
                  runUrl: 'u',
                  hint,
                });
                assert.ok(
                  typeof body === 'string' && body.length > 0,
                  'comment should be a non-empty string',
                );
                assert.ok(
                  body.endsWith('See the logs of [run 1](u).'),
                  `comment should end with the run link: ${body}`,
                );
              }
            }
          }
        }
      }
    }
  });
});
