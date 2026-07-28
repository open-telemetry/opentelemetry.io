// Tests for the patch-pipeline outcome comment composer.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { buildAckComment, buildOutcomeComment } from './index.mjs';

describe('buildOutcomeComment', () => {
  const BASE = {
    label: 'fix:link-cache',
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
    assert.match(body, /^✅ `fix:link-cache` applied successfully/);
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
      `ℹ️ \`fix:link-cache\` made no changes; nothing to commit. ${LOGS}`,
    );
  });

  test('no-op with unknown (empty) exit status is not reported as a failure', () => {
    assert.equal(
      build({ patchSkipped: 'true', commandExitStatus: '' }),
      `ℹ️ \`fix:link-cache\` made no changes; nothing to commit. ${LOGS}`,
    );
  });

  test('command failed and produced no changes', () => {
    const body = build({ patchSkipped: 'true', commandExitStatus: '2' });
    assert.match(body, /^❌ `fix:link-cache` failed \(exit status 2\)/);
    assert.match(body, /made no changes/);
  });

  test('command failed non-zero but changes were applied', () => {
    const body = build({ commandExitStatus: '1' });
    assert.match(
      body,
      /^⚠️ `fix:link-cache` exited with a non-zero status \(1\)/,
    );
    assert.match(body, /the resulting changes were applied/);
  });

  test('unidentified request: generation failed with no label', () => {
    const body = build({ generateResult: 'failure', label: '' });
    assert.match(body, /^❌ The request could not be processed\./);
  });

  test('unidentified request: note carries the caller-supplied guidance', () => {
    // The note is an opaque caller-supplied string (this reporter is generic,
    // not /fix-specific), so any text works here.
    const note = 'See the docs for how to phrase a request.';
    const body = build({ generateResult: 'failure', label: '', note });
    assert.match(body, /^❌ The request could not be processed\./);
    assert.ok(body.endsWith(`\n\n${note}`), 'note is the final paragraph');
  });

  test('generation failed for a known command (e.g. oversized patch)', () => {
    const body = build({ generateResult: 'failure' });
    assert.match(body, /^❌ `fix:link-cache` could not be run/);
  });

  test('generation cancelled', () => {
    const body = build({ generateResult: 'cancelled' });
    assert.match(body, /^⚠️ `fix:link-cache` was cancelled/);
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
    assert.match(
      body,
      /^❌ This PR is closed, so `fix:link-cache` was not run/,
    );
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

  test('label links to the directive comment when its URL is given', () => {
    const body = build({ directiveUrl: 'https://example.test/c/1' });
    assert.match(
      body,
      /^✅ \[`fix:link-cache`\]\(https:\/\/example\.test\/c\/1\) applied successfully/,
    );
  });

  test('appends a caller-supplied note as its own final paragraph', () => {
    const note = 'ℹ️ INFO: `/fix:refcache` is deprecated.';
    const body = build({ label: 'fix:refcache', note });
    assert.match(body, /^✅ `fix:refcache` applied successfully/);
    assert.ok(body.endsWith(`\n\n${note}`), 'note is the final paragraph');
  });

  test('note is appended to non-success outcomes too', () => {
    const note = 'ℹ️ INFO: compat notice.';
    const body = build({ generateResult: 'failure', note });
    assert.match(body, /^❌/);
    assert.ok(body.endsWith(`\n\n${note}`), 'note is the final paragraph');
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
              for (const prState of ['open', 'closed', '']) {
                for (const directiveUrl of ['d', '']) {
                  for (const note of ['ℹ️ A notice.', '']) {
                    const body = buildOutcomeComment({
                      label,
                      prState,
                      generateResult,
                      patchSkipped,
                      commandExitStatus,
                      applyResult,
                      runId: '1',
                      runUrl: 'u',
                      directiveUrl,
                      note,
                    });
                    assert.ok(
                      typeof body === 'string' && body.length > 0,
                      'comment should be a non-empty string',
                    );
                    const tail = note
                      ? `See [run 1](u).\n\n${note}`
                      : 'See [run 1](u).';
                    assert.ok(
                      body.endsWith(tail),
                      `comment should end with the run link (followed only by the note, when given): ${body}`,
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
