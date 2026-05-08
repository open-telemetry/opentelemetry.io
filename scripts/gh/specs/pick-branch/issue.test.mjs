// Tests for ensureWarningIssueOpen: the dedup + (dry-run-aware) issue creator
// driven by an injected `gh` runner.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { ensureWarningIssueOpen } from './index.mjs';

const noLog = () => {};

/**
 * Build a fake `gh` runner that records calls and serves canned responses
 * keyed by the first two argv tokens (e.g. `issue list`, `issue create`,
 * `label create`). Default response is `{ stdout: '', status: 0 }`.
 */
function makeFakeGh(responses = {}) {
  const calls = [];
  const runGh = (args) => {
    calls.push(args);
    const key = args.slice(0, 2).join(' ');
    return responses[key] ?? { stdout: '', status: 0 };
  };
  return { runGh, calls };
}

const ISSUE_INPUT = {
  title: 'spec integration workflow: warnings detected',
  label: 'spec-integration-warning',
  body: 'body content',
};

describe('pick-branch: ensureWarningIssueOpen', () => {
  test('skips creation when an issue already exists', () => {
    const { runGh, calls } = makeFakeGh({
      'issue list': { stdout: '[{"number":42}]', status: 0 },
    });
    const logs = [];
    const result = ensureWarningIssueOpen({
      ...ISSUE_INPUT,
      dryRun: false,
      runGh,
      log: (m) => logs.push(m),
    });
    assert.equal(result.action, 'skipped-existing');
    assert.equal(calls.length, 1, 'only the issue-list call should be made');
    assert.deepEqual(calls[0].slice(0, 2), ['issue', 'list']);
    assert.match(logs[0], /already open; skipping/);
  });

  test('creates issue (with label) when none exists', () => {
    const { runGh, calls } = makeFakeGh({
      'issue list': { stdout: '[]', status: 0 },
    });
    const result = ensureWarningIssueOpen({
      ...ISSUE_INPUT,
      dryRun: false,
      runGh,
      log: noLog,
    });
    assert.equal(result.action, 'created');
    assert.equal(calls.length, 3);
    assert.deepEqual(calls[0].slice(0, 2), ['issue', 'list']);
    assert.deepEqual(calls[1].slice(0, 3), [
      'label',
      'create',
      ISSUE_INPUT.label,
    ]);
    assert.deepEqual(calls[2].slice(0, 2), ['issue', 'create']);
    // Issue create should pass title, label, body verbatim.
    const createArgs = calls[2];
    assert.equal(
      createArgs[createArgs.indexOf('--title') + 1],
      ISSUE_INPUT.title,
    );
    assert.equal(
      createArgs[createArgs.indexOf('--label') + 1],
      ISSUE_INPUT.label,
    );
    assert.equal(
      createArgs[createArgs.indexOf('--body') + 1],
      ISSUE_INPUT.body,
    );
  });

  test('dry-run still checks but never creates', () => {
    const { runGh, calls } = makeFakeGh({
      'issue list': { stdout: '[]', status: 0 },
    });
    const logs = [];
    const result = ensureWarningIssueOpen({
      ...ISSUE_INPUT,
      dryRun: true,
      runGh,
      log: (m) => logs.push(m),
    });
    assert.equal(result.action, 'would-create');
    assert.equal(calls.length, 1, 'only the read-only issue-list call runs');
    assert.deepEqual(calls[0].slice(0, 2), ['issue', 'list']);
    assert.ok(
      logs.some((m) => /\[dry-run\] Would open an issue/.test(m)),
      'should log a "would open" message',
    );
  });

  test('dry-run with existing issue skips quietly', () => {
    const { runGh, calls } = makeFakeGh({
      'issue list': { stdout: '[{"number":7}]', status: 0 },
    });
    const logs = [];
    const result = ensureWarningIssueOpen({
      ...ISSUE_INPUT,
      dryRun: true,
      runGh,
      log: (m) => logs.push(m),
    });
    assert.equal(result.action, 'skipped-existing');
    assert.equal(calls.length, 1);
    assert.ok(
      !logs.some((m) => /Would open an issue/.test(m)),
      'should not log "would open" when an issue exists',
    );
  });

  test('throws when gh issue list fails', () => {
    const { runGh } = makeFakeGh({
      'issue list': { stdout: 'boom', status: 2 },
    });
    assert.throws(
      () =>
        ensureWarningIssueOpen({
          ...ISSUE_INPUT,
          dryRun: false,
          runGh,
          log: noLog,
        }),
      /gh issue list failed/,
    );
  });

  test('throws when gh issue create fails', () => {
    const { runGh } = makeFakeGh({
      'issue list': { stdout: '[]', status: 0 },
      'issue create': { stdout: 'nope', status: 1 },
    });
    assert.throws(
      () =>
        ensureWarningIssueOpen({
          ...ISSUE_INPUT,
          dryRun: false,
          runGh,
          log: noLog,
        }),
      /gh issue create failed/,
    );
  });
});
