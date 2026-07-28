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

const ISSUE_URL =
  'https://github.com/open-telemetry/opentelemetry.io/issues/123';

describe('pick-branch: ensureWarningIssueOpen', () => {
  test('is a no-op when an issue is already open', () => {
    const { runGh, calls } = makeFakeGh({
      'issue list': { stdout: '[{"number":42}]', status: 0 },
    });
    const logs = [];
    const outcome = ensureWarningIssueOpen({
      ...ISSUE_INPUT,
      dryRun: false,
      runGh,
      log: (m) => logs.push(m),
    });
    assert.equal(outcome, 'unchanged');
    assert.equal(calls.length, 1, 'issue-list is the sole gh call');
    assert.deepEqual(calls[0].slice(0, 2), ['issue', 'list']);
    assert.match(logs[0], /already open; nothing to do/);
  });

  test('creates issue (with label) when none exists', () => {
    const { runGh, calls } = makeFakeGh({
      'issue list': { stdout: '[]', status: 0 },
      'issue create': { stdout: `${ISSUE_URL}\n`, status: 0 },
    });
    const logs = [];
    const outcome = ensureWarningIssueOpen({
      ...ISSUE_INPUT,
      dryRun: false,
      runGh,
      log: (m) => logs.push(m),
    });
    assert.equal(outcome, 'created');
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
    assert.ok(
      logs.some((m) => m.includes(ISSUE_URL)),
      'created issue URL is logged',
    );
  });

  test('dry-run still checks but never creates', () => {
    const { runGh, calls } = makeFakeGh({
      'issue list': { stdout: '[]', status: 0 },
    });
    const logs = [];
    const outcome = ensureWarningIssueOpen({
      ...ISSUE_INPUT,
      dryRun: true,
      runGh,
      log: (m) => logs.push(m),
    });
    assert.equal(outcome, 'created');
    assert.equal(calls.length, 1, 'read-only issue-list is the sole gh call');
    assert.deepEqual(calls[0].slice(0, 2), ['issue', 'list']);
    assert.ok(
      logs.some((m) => /\[dry-run\] Opening an issue/.test(m)),
      'dry-run log announces the issue that a write run would open',
    );
  });

  test('dry-run with existing issue skips quietly', () => {
    const { runGh, calls } = makeFakeGh({
      'issue list': { stdout: '[{"number":7}]', status: 0 },
    });
    const logs = [];
    const outcome = ensureWarningIssueOpen({
      ...ISSUE_INPUT,
      dryRun: true,
      runGh,
      log: (m) => logs.push(m),
    });
    assert.equal(outcome, 'unchanged');
    assert.equal(calls.length, 1);
    assert.equal(logs.length, 1, 'no-op message is the sole log line');
    assert.match(logs[0], /already open; nothing to do/);
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
