// Tests for the patch-pipeline outcome comment composer.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { buildAckComment, buildOutcomeComment } from './index.mjs';

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

  const LOGS = 'See [run 123](https://example.test/run/123).';

  const build = (overrides) => buildOutcomeComment({ ...BASE, ...overrides });

  test('success: command applied cleanly', () => {
    const body = build({});
    assert.match(body, /^✅ `fix:refcache` applied successfully/);
  });

  test('strips Markdown metacharacters from a forgeable label', () => {
    // cspell:ignore xhttps exampley
    const body = build({
      label: 'x`](https://evil.example)[`y',
      directiveUrl: 'https://example.test/c/7',
    });
    assert.match(
      body,
      /^✅ \[`xhttps:\/\/evil\.exampley`\]\(https:\/\/example\.test\/c\/7\)/,
    );
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

  test('closed PR: nothing ran', () => {
    const body = build({ prState: 'closed' });
    assert.match(body, /^❌ This PR is closed, so `fix:refcache` was not run/);
    assert.match(body, /only apply to open PRs/);
  });

  test('merged PR: nothing ran', () => {
    const body = build({ prState: 'closed', prMerged: 'true', label: '' });
    assert.match(
      body,
      /^❌ This PR has already been merged, so the requested action was not run/,
    );
  });

  test('open PR state does not short-circuit the outcome', () => {
    assert.equal(build({ prState: 'open' }), build({}));
  });

  test('not-run reason: pipeline declined to run the action', () => {
    const body = build({ notRunReason: 'the branch is stale.' });
    assert.equal(
      body,
      `⚠️ \`fix:refcache\` was not run: the branch is stale. ${LOGS}`,
    );
  });

  test('not-run reason takes precedence over generation and apply outcomes', () => {
    const body = build({
      notRunReason: 'the branch is stale.',
      generateResult: 'failure',
      applyResult: 'skipped',
    });
    assert.match(body, /was not run: the branch is stale\./);
  });

  test('closed PR takes precedence over a not-run reason', () => {
    const body = build({
      prState: 'closed',
      notRunReason: 'the branch is stale.',
    });
    assert.match(body, /^❌ This PR is closed/);
  });

  test('label links to the directive comment when its URL is given', () => {
    const body = build({ directiveUrl: 'https://example.test/c/1' });
    assert.match(
      body,
      /^✅ \[`fix:refcache`\]\(https:\/\/example\.test\/c\/1\) applied successfully/,
    );
  });

  test('unidentified request links to the directive comment', () => {
    const body = build({
      generateResult: 'failure',
      label: '',
      directiveUrl: 'https://example.test/c/1',
    });
    assert.match(
      body,
      /^❌ \[The request\]\(https:\/\/example\.test\/c\/1\) could not be processed\./,
    );
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
                for (const prState of ['open', 'closed', '']) {
                  for (const directiveUrl of ['d', '']) {
                    for (const notRunReason of ['a reason.', '']) {
                      const body = buildOutcomeComment({
                        label,
                        prState,
                        notRunReason,
                        generateResult,
                        patchSkipped,
                        commandExitStatus,
                        applyResult,
                        runId: '1',
                        runUrl: 'u',
                        directiveUrl,
                        hint,
                      });
                      assert.ok(
                        typeof body === 'string' && body.length > 0,
                        'comment should be a non-empty string',
                      );
                      assert.ok(
                        body.endsWith('See [run 1](u).'),
                        `comment should end with the run link: ${body}`,
                      );
                      if (directiveUrl) {
                        assert.ok(
                          body.includes('](d)'),
                          `comment should link the directive: ${body}`,
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});

describe('buildAckComment', () => {
  test('links the directive comment and the run', () => {
    assert.equal(
      buildAckComment({
        directiveUrl: 'https://example.test/c/1',
        runId: '123',
        runUrl: 'https://example.test/run/123',
      }),
      '🔄 Processing [your request](https://example.test/c/1)… See [run 123](https://example.test/run/123).',
    );
  });

  test('omits the directive link when the URL is unknown', () => {
    assert.equal(
      buildAckComment({ directiveUrl: '', runId: '1', runUrl: 'u' }),
      '🔄 Processing your request… See [run 1](u).',
    );
  });
});
