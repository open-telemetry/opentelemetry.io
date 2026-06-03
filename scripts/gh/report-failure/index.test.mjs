// Tests for the report-failure orchestration and helpers, driven by an injected
// `gh` runner so no real GitHub calls are made.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildIssueTitle,
  buildIssueBody,
  buildCommentBody,
  selectIssueNumberByExactTitle,
  resolveIssueTypeId,
  reportFailure,
} from './index.mjs';

const noLog = () => {};

/**
 * Build a fake `gh` runner that records calls and serves canned responses keyed
 * by the first two argv tokens (e.g. `issue list`, `issue create`,
 * `api graphql`). Default response is `{ stdout: '', status: 0 }`.
 */
function makeFakeGh(responses = {}) {
  const calls = [];
  const runGh = (args) => {
    calls.push(args);
    const key = args.slice(0, 2).join(' ');
    const r = responses[key];
    const resolved = typeof r === 'function' ? r(args) : r;
    return resolved ?? { stdout: '', status: 0 };
  };
  return { runGh, calls };
}

const TYPES_JSON = JSON.stringify({
  data: {
    repository: {
      issueTypes: {
        nodes: [
          { id: 'IT_task', name: 'Task' },
          { id: 'IT_bug', name: 'Bug' },
        ],
      },
    },
  },
});

const BASE = {
  repo: 'open-telemetry/opentelemetry.io',
  workflow: 'Auto-update versions',
  branch: 'main',
  sha: 'abc123',
  runUrl: 'https://github.com/o/r/actions/runs/1',
  label: 'CI/infra',
  issueType: 'Bug',
  issuePrefix: 'Workflow failed',
};

describe('report-failure: pure helpers', () => {
  test('buildIssueTitle composes prefix, workflow, branch', () => {
    assert.equal(
      buildIssueTitle({
        prefix: 'Workflow failed',
        workflow: 'CI',
        branch: 'main',
      }),
      'Workflow failed: CI on main',
    );
  });

  test('buildIssueBody includes all fields', () => {
    const body = buildIssueBody({
      workflow: 'CI',
      branch: 'main',
      sha: 'deadbeef',
      runUrl: 'https://example/run',
    });
    assert.match(body, /\*\*Workflow:\*\* CI/);
    assert.match(body, /\*\*Branch:\*\* main/);
    assert.match(body, /\*\*Commit:\*\* deadbeef/);
    assert.match(body, /\*\*Run:\*\* https:\/\/example\/run/);
  });

  test('buildCommentBody includes run and commit', () => {
    const body = buildCommentBody({
      sha: 'feed',
      runUrl: 'https://example/run2',
    });
    assert.match(body, /Another failure occurred/);
    assert.match(body, /https:\/\/example\/run2/);
    assert.match(body, /feed/);
  });
});

describe('report-failure: selectIssueNumberByExactTitle', () => {
  const title = 'Workflow failed: CI on main';

  test('returns the exact-title match, ignoring fuzzy extras', () => {
    const json = JSON.stringify([
      { number: 7, title: 'Workflow failed: CI on main (was something else)' },
      { number: 9, title },
    ]);
    assert.equal(selectIssueNumberByExactTitle(json, title), 9);
  });

  test('returns null when no exact match', () => {
    const json = JSON.stringify([{ number: 7, title: 'unrelated' }]);
    assert.equal(selectIssueNumberByExactTitle(json, title), null);
  });

  test('returns null on empty / invalid input', () => {
    assert.equal(selectIssueNumberByExactTitle('', title), null);
    assert.equal(selectIssueNumberByExactTitle('not json', title), null);
  });
});

describe('report-failure: resolveIssueTypeId', () => {
  test('resolves a known type by name', () => {
    const { runGh } = makeFakeGh({
      'api graphql': { stdout: TYPES_JSON, status: 0 },
    });
    const id = resolveIssueTypeId(runGh, {
      owner: 'open-telemetry',
      name: 'opentelemetry.io',
      issueType: 'Bug',
    });
    assert.equal(id, 'IT_bug');
  });

  test('returns null for an unknown type', () => {
    const { runGh } = makeFakeGh({
      'api graphql': { stdout: TYPES_JSON, status: 0 },
    });
    const id = resolveIssueTypeId(runGh, {
      owner: 'o',
      name: 'r',
      issueType: 'Nope',
    });
    assert.equal(id, null);
  });
});

describe('report-failure: reportFailure', () => {
  test('comments on an existing open issue and does not create', () => {
    const title = buildIssueTitle({
      prefix: BASE.issuePrefix,
      workflow: BASE.workflow,
      branch: BASE.branch,
    });
    const { runGh, calls } = makeFakeGh({
      'issue list': {
        stdout: JSON.stringify([{ number: 42, title }]),
        status: 0,
      },
    });
    const result = reportFailure({ ...BASE, runGh, log: noLog });

    assert.deepEqual(result, {
      action: 'commented',
      issueNumber: 42,
      typeSet: false,
    });
    const kinds = calls.map((a) => a.slice(0, 2).join(' '));
    assert.deepEqual(kinds, ['issue list', 'issue comment']);
  });

  test('creates a new issue and sets its type when none exists', () => {
    const { runGh, calls } = makeFakeGh({
      'issue list': { stdout: '[]', status: 0 },
      'issue create': {
        stdout:
          'https://github.com/open-telemetry/opentelemetry.io/issues/123\n',
        status: 0,
      },
      'issue view': { stdout: 'I_node123', status: 0 },
      'api graphql': (args) => {
        // First graphql call resolves types; the mutation returns ok.
        const q = args.find((a) => a.startsWith('query=')) ?? '';
        if (q.includes('issueTypes')) return { stdout: TYPES_JSON, status: 0 };
        return { stdout: '{"data":{}}', status: 0 };
      },
    });

    const result = reportFailure({ ...BASE, runGh, log: noLog });

    assert.equal(result.action, 'created');
    assert.equal(result.issueNumber, 123);
    assert.equal(result.typeSet, true);

    const kinds = calls.map((a) => a.slice(0, 2).join(' '));
    assert.deepEqual(kinds, [
      'issue list',
      'issue create',
      'api graphql', // resolve type id
      'issue view', // resolve issue node id
      'api graphql', // set type mutation
    ]);
  });

  test('still succeeds (typeSet=false) when the issue type is undefined', () => {
    const { runGh } = makeFakeGh({
      'issue list': { stdout: '[]', status: 0 },
      'issue create': {
        stdout: 'https://github.com/o/r/issues/5\n',
        status: 0,
      },
      'api graphql': { stdout: TYPES_JSON, status: 0 },
    });

    const result = reportFailure({
      ...BASE,
      issueType: 'Nonexistent',
      runGh,
      log: noLog,
    });
    assert.equal(result.action, 'created');
    assert.equal(result.typeSet, false);
  });

  test('still succeeds (typeSet=false) when the issue-type mutation fails', () => {
    const { runGh } = makeFakeGh({
      'issue list': { stdout: '[]', status: 0 },
      'issue create': {
        stdout: 'https://github.com/o/r/issues/5\n',
        status: 0,
      },
      'issue view': { stdout: 'I_node123', status: 0 },
      'api graphql': (args) => {
        const q = args.find((a) => a.startsWith('query=')) ?? '';
        if (q.includes('issueTypes')) return { stdout: TYPES_JSON, status: 0 };
        return { stdout: '', status: 1 };
      },
    });

    const result = reportFailure({ ...BASE, runGh, log: noLog });
    assert.equal(result.action, 'created');
    assert.equal(result.issueNumber, 5);
    assert.equal(result.typeSet, false);
  });

  test('throws when gh issue create output is not a parseable issue URL', () => {
    const { runGh } = makeFakeGh({
      'issue list': { stdout: '[]', status: 0 },
      'issue create': { stdout: 'unexpected output\n', status: 0 },
    });
    assert.throws(
      () => reportFailure({ ...BASE, runGh, log: noLog }),
      /Could not parse issue number from gh issue create output/,
    );
  });

  test('throws when a gh call fails', () => {
    const { runGh } = makeFakeGh({
      'issue list': { stdout: '', status: 1 },
    });
    assert.throws(
      () => reportFailure({ ...BASE, runGh, log: noLog }),
      /gh issue list .* failed with exit code 1/,
    );
  });
});
