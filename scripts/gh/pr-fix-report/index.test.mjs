// Tests for the `/fix` run outcome comment composer.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { buildOutcomeComment } from './index.mjs';

describe('buildOutcomeComment', () => {
  const BASE = {
    actionName: 'fix:refcache',
    generateResult: 'success',
    patchSkipped: 'false',
    actionExitStatus: '0',
    applyResult: 'success',
    runId: '123',
    runUrl: 'https://example.test/run/123',
  };

  const build = (overrides) => buildOutcomeComment({ ...BASE, ...overrides });

  test('success: command applied cleanly', () => {
    const body = build({});
    assert.match(body, /^✅ `fix:refcache` applied successfully/);
    assert.match(body, /\[run 123\]\(https:\/\/example\.test\/run\/123\)/);
  });

  test('no-op: generation produced no changes', () => {
    assert.equal(
      build({ patchSkipped: 'true' }),
      'ℹ️ `fix:refcache` made no changes. Nothing to commit.',
    );
  });

  test('command failed non-zero but changes were applied', () => {
    const body = build({ actionExitStatus: '1' });
    assert.match(
      body,
      /^⚠️ `fix:refcache` exited with a non-zero status \(1\)/,
    );
    assert.match(body, /the resulting changes were applied/);
  });

  test('invalid directive: generation failed with no action name', () => {
    const body = build({ generateResult: 'failure', actionName: '' });
    assert.match(body, /^❌ Invalid `\/fix` directive/);
    assert.match(body, /\/fix:<name>/);
  });

  test('generation failed for a known command (e.g. oversized patch)', () => {
    const body = build({ generateResult: 'failure' });
    assert.match(body, /^❌ `fix:refcache` could not be run/);
    assert.match(body, /See logs: https:\/\/example\.test\/run\/123/);
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

  test('every outcome produces a non-empty comment', () => {
    for (const generateResult of ['success', 'failure', 'cancelled']) {
      for (const patchSkipped of ['true', 'false']) {
        for (const applyResult of [
          'success',
          'failure',
          'cancelled',
          'skipped',
        ]) {
          for (const actionExitStatus of ['0', '1', '']) {
            for (const actionName of ['fix', '']) {
              const body = buildOutcomeComment({
                actionName,
                generateResult,
                patchSkipped,
                actionExitStatus,
                applyResult,
                runId: '1',
                runUrl: 'u',
              });
              assert.ok(
                typeof body === 'string' && body.length > 0,
                'comment should be a non-empty string',
              );
            }
          }
        }
      }
    }
  });
});
