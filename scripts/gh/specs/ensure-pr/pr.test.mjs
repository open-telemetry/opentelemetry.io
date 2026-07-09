// State-table tests for ensurePullRequest: the mode-aware PR create/finalize
// helper driven by injected `gh` and `git` runners.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { ensurePullRequest } from './index.mjs';

const noLog = () => {};

/**
 * Build a fake runner that records calls and serves canned responses keyed by
 * the first two argv tokens (e.g. `pr list`, `pr create`). Default response is
 * `{ stdout: '', status: 0 }`.
 */
function makeFakeRunner(responses = {}) {
  const calls = [];
  const run = (args) => {
    calls.push(args);
    const key = args.slice(0, 2).join(' ');
    return responses[key] ?? { stdout: '', status: 0 };
  };
  return { run, calls };
}

/** Argv of the first recorded call whose leading tokens match `prefix`. */
function findCall(calls, ...prefix) {
  return calls.find((args) => prefix.every((token, i) => args[i] === token));
}

/** Value following `flag` in `args`. */
function flagValue(args, flag) {
  return args[args.indexOf(flag) + 1];
}

const INPUT = {
  repo: 'opentelemetry-specification',
  version: 'v1.59.0',
  branch: 'otelbot/spec-integration-v1.59.0-dev',
};

const NO_PR = { 'pr list': { stdout: '[]', status: 0 } };
const OPEN_DRAFT_PR = {
  'pr list': { stdout: '[{"number":10526,"isDraft":true}]', status: 0 },
};
const OPEN_READY_PR = {
  'pr list': { stdout: '[{"number":10526,"isDraft":false}]', status: 0 },
};

describe('ensure-pr: dev mode', () => {
  test('PR already open: no-op', () => {
    const gh = makeFakeRunner(OPEN_DRAFT_PR);
    const git = makeFakeRunner();
    const result = ensurePullRequest({
      ...INPUT,
      mode: 'dev',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result.action, 'none');
    assert.equal(gh.calls.length, 1, 'only the pr-list call runs');
    assert.equal(git.calls.length, 0, 'no git calls');
  });

  test('no PR, branch has commits: creates draft PR', () => {
    const gh = makeFakeRunner(NO_PR);
    const git = makeFakeRunner({
      'rev-list origin/main..HEAD': { stdout: 'abc123\n', status: 0 },
    });
    const result = ensurePullRequest({
      ...INPUT,
      mode: 'dev',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result.action, 'created-draft');
    const create = findCall(gh.calls, 'pr', 'create');
    assert.ok(create, 'gh pr create is called');
    assert.ok(create.includes('--draft'), 'PR is created as draft');
    assert.equal(
      flagValue(create, '--title'),
      'DRAFT Update opentelemetry-specification to unreleased v1.59.0-dev',
    );
    assert.match(
      flagValue(create, '--body'),
      /draft PR used for identifying issues integrating the latest \(unreleased\) \[opentelemetry-specification\]\(https:\/\/github\.com\/open-telemetry\/opentelemetry-specification\)/,
    );
    assert.ok(
      !findCall(git.calls, 'commit'),
      'no bootstrap commit when branch has commits',
    );
  });

  test('no PR, branch even with main: bootstraps with an empty commit', () => {
    const gh = makeFakeRunner(NO_PR);
    const git = makeFakeRunner({
      'rev-list origin/main..HEAD': { stdout: '', status: 0 },
    });
    const result = ensurePullRequest({
      ...INPUT,
      mode: 'dev',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result.action, 'bootstrapped-and-created-draft');
    const commit = findCall(git.calls, 'commit');
    assert.ok(commit, 'git commit is called');
    assert.ok(commit.includes('--allow-empty'), 'commit is empty');
    assert.equal(
      flagValue(commit, '-m'),
      `Trigger PR creation for ${INPUT.branch}`,
    );
    assert.ok(findCall(git.calls, 'push'), 'bootstrap commit is pushed');
    assert.ok(findCall(gh.calls, 'pr', 'create'), 'draft PR is created');
    // Bootstrap must happen before PR creation.
    assert.ok(
      git.calls.length > 1,
      'git bootstrap calls precede the gh pr create call',
    );
  });
});

describe('ensure-pr: release mode', () => {
  const RELEASE_TITLE = 'Update opentelemetry-specification version to v1.59.0';

  test('no PR: creates non-draft release PR', () => {
    const gh = makeFakeRunner(NO_PR);
    const git = makeFakeRunner({
      'rev-list origin/main..HEAD': { stdout: 'abc123\n', status: 0 },
    });
    const result = ensurePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result.action, 'created-release');
    const create = findCall(gh.calls, 'pr', 'create');
    assert.ok(create, 'gh pr create is called');
    assert.ok(!create.includes('--draft'), 'release PR is not a draft');
    assert.equal(flagValue(create, '--title'), RELEASE_TITLE);
    const body = flagValue(create, '--body');
    assert.match(body, /`v1\.59\.0`/);
    assert.match(
      body,
      /https:\/\/github\.com\/open-telemetry\/opentelemetry-specification\/releases\/tag\/v1\.59\.0/,
    );
  });

  test('open draft PR: one-time finalization (ready + title + body)', () => {
    const gh = makeFakeRunner(OPEN_DRAFT_PR);
    const git = makeFakeRunner();
    const result = ensurePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result.action, 'finalized');
    const ready = findCall(gh.calls, 'pr', 'ready');
    assert.ok(ready, 'gh pr ready is called');
    assert.ok(ready.includes(INPUT.branch), 'pr ready targets the branch');
    const edit = findCall(gh.calls, 'pr', 'edit');
    assert.ok(edit, 'gh pr edit is called');
    assert.equal(flagValue(edit, '--title'), RELEASE_TITLE);
    assert.ok(edit.includes('--body'), 'finalization writes the body once');
    assert.equal(git.calls.length, 0, 'no git calls');
  });

  test('open ready PR: re-syncs the title only', () => {
    const gh = makeFakeRunner(OPEN_READY_PR);
    const git = makeFakeRunner();
    const result = ensurePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result.action, 'title-synced');
    assert.ok(!findCall(gh.calls, 'pr', 'ready'), 'pr ready is not re-run');
    const edit = findCall(gh.calls, 'pr', 'edit');
    assert.ok(edit, 'gh pr edit is called');
    assert.equal(flagValue(edit, '--title'), RELEASE_TITLE);
    assert.ok(
      !edit.includes('--body'),
      'body is left alone to preserve maintainer notes',
    );
  });

  test('open ready PR with matching title: full no-op', () => {
    const gh = makeFakeRunner({
      'pr list': {
        stdout: `[{"number":10526,"isDraft":false,"title":${JSON.stringify(RELEASE_TITLE)}}]`,
        status: 0,
      },
    });
    const git = makeFakeRunner();
    const result = ensurePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result.action, 'none');
    assert.equal(gh.calls.length, 1, 'only the pr-list call runs');
  });
});

describe('ensure-pr: dry-run', () => {
  test('dev mode: reads state but skips all writes', () => {
    const gh = makeFakeRunner(NO_PR);
    const git = makeFakeRunner({
      'rev-list origin/main..HEAD': { stdout: '', status: 0 },
    });
    const logs = [];
    const result = ensurePullRequest({
      ...INPUT,
      mode: 'dev',
      dryRun: true,
      runGh: gh.run,
      runGit: git.run,
      log: (m) => logs.push(m),
    });
    assert.equal(result.action, 'would-bootstrap-and-create-draft');
    assert.equal(gh.calls.length, 1, 'only the read-only pr-list call runs');
    assert.ok(
      !findCall(git.calls, 'commit') && !findCall(git.calls, 'push'),
      'no git writes in dry-run',
    );
    assert.ok(
      logs.some((m) => /\[dry-run\]/.test(m)),
      'dry-run intent is logged',
    );
  });

  test('release mode with draft PR: skips finalize writes', () => {
    const gh = makeFakeRunner(OPEN_DRAFT_PR);
    const git = makeFakeRunner();
    const result = ensurePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: true,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result.action, 'would-finalize');
    assert.equal(gh.calls.length, 1, 'only the read-only pr-list call runs');
  });
});

describe('ensure-pr: failure propagation', () => {
  test('throws when gh pr list fails', () => {
    const gh = makeFakeRunner({ 'pr list': { stdout: 'boom', status: 4 } });
    const git = makeFakeRunner();
    assert.throws(
      () =>
        ensurePullRequest({
          ...INPUT,
          mode: 'dev',
          dryRun: false,
          runGh: gh.run,
          runGit: git.run,
          log: noLog,
        }),
      /gh pr list failed/,
    );
  });

  test('throws when gh pr create fails', () => {
    const gh = makeFakeRunner({
      ...NO_PR,
      'pr create': { stdout: 'nope', status: 1 },
    });
    const git = makeFakeRunner({
      'rev-list origin/main..HEAD': { stdout: 'abc123\n', status: 0 },
    });
    assert.throws(
      () =>
        ensurePullRequest({
          ...INPUT,
          mode: 'dev',
          dryRun: false,
          runGh: gh.run,
          runGit: git.run,
          log: noLog,
        }),
      /gh pr create failed/,
    );
  });

  test('throws when gh pr ready fails during finalization', () => {
    const gh = makeFakeRunner({
      ...OPEN_DRAFT_PR,
      'pr ready': { stdout: '', status: 1 },
    });
    const git = makeFakeRunner();
    assert.throws(
      () =>
        ensurePullRequest({
          ...INPUT,
          mode: 'release',
          dryRun: false,
          runGh: gh.run,
          runGit: git.run,
          log: noLog,
        }),
      /gh pr ready failed/,
    );
  });

  test('throws when git bootstrap commit fails', () => {
    const gh = makeFakeRunner(NO_PR);
    const git = makeFakeRunner({
      'rev-list origin/main..HEAD': { stdout: '', status: 0 },
      'commit --allow-empty': { stdout: '', status: 1 },
    });
    assert.throws(
      () =>
        ensurePullRequest({
          ...INPUT,
          mode: 'dev',
          dryRun: false,
          runGh: gh.run,
          runGit: git.run,
          log: noLog,
        }),
      /git commit failed/,
    );
  });

  test('throws on invalid mode', () => {
    const gh = makeFakeRunner();
    const git = makeFakeRunner();
    assert.throws(
      () =>
        ensurePullRequest({
          ...INPUT,
          mode: 'prod',
          dryRun: false,
          runGh: gh.run,
          runGit: git.run,
          log: noLog,
        }),
      /unexpected mode: prod/,
    );
    assert.equal(gh.calls.length, 0, 'no calls are made on invalid input');
  });
});
