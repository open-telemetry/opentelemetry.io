// State-table tests for createOrFinalizePullRequest: the mode-aware PR create/finalize
// helper driven by injected `gh` and `git` runners.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { createOrFinalizePullRequest } from './index.mjs';

const noLog = () => {};

/**
 * Build a fake runner that records calls and serves canned responses keyed by
 * the first two argv tokens (e.g. `pr list`, `pr create`). Default response is
 * `{ stdout: '', status: 0 }`. When given a shared `seq` array and a `tool`
 * tag, each call is also appended to `seq` as `[tool, ...argv]` so that
 * cross-runner call order can be asserted.
 */
function makeFakeRunner(responses = {}, seq = undefined, tool = '') {
  const calls = [];
  const run = (args) => {
    calls.push(args);
    seq?.push([tool, ...args]);
    const key = args.slice(0, 2).join(' ');
    return responses[key] ?? { stdout: '', status: 0 };
  };
  return { run, calls };
}

/** Argv of the first recorded call whose leading tokens match `prefix`. */
function findCall(calls, ...prefix) {
  return calls.find((args) => prefix.every((token, i) => args[i] === token));
}

/** Index in `calls` of the first call matching `prefix`; fails if absent. */
function callIndex(calls, ...prefix) {
  const i = calls.findIndex((args) => prefix.every((t, j) => args[j] === t));
  assert.ok(i >= 0, `${prefix.join(' ')} is called`);
  return i;
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
const PR_URL = 'https://github.com/open-telemetry/opentelemetry.io/pull/12345';

// The titles and bodies the automation writes, as the live PRs carry them.
const DRAFT_TITLE =
  'DRAFT Update opentelemetry-specification to unreleased v1.59.0-dev';
const DEV_BODY =
  'This is a draft PR used for identifying issues integrating the latest (unreleased) [opentelemetry-specification](https://github.com/open-telemetry/opentelemetry-specification).';
const RELEASE_TITLE = 'Update opentelemetry-specification version to v1.59.0';
const RELEASE_BODY =
  'Update opentelemetry-specification version to `v1.59.0`.\n\nSee https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.59.0.';

/** Canned `gh pr list` response with a single open PR. */
function openPr(fields) {
  return {
    'pr list': {
      stdout: JSON.stringify([{ number: 10526, ...fields }]),
      status: 0,
    },
  };
}

const OPEN_DRAFT_PR = openPr({
  isDraft: true,
  title: DRAFT_TITLE,
  body: DEV_BODY,
});

describe('create-or-finalize-pr: dev mode', () => {
  test('PR already open: no-op', () => {
    const gh = makeFakeRunner(OPEN_DRAFT_PR);
    const git = makeFakeRunner();
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'dev',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result, 'unchanged');
    assert.equal(gh.calls.length, 1, 'only the pr-list call runs');
    assert.equal(git.calls.length, 0, 'git is unused');
  });

  test('no PR, branch has commits: creates draft PR', () => {
    const gh = makeFakeRunner({
      ...NO_PR,
      'pr create': { stdout: `${PR_URL}\n`, status: 0 },
    });
    const git = makeFakeRunner({
      'rev-list origin/main..HEAD': { stdout: 'abc123\n', status: 0 },
    });
    const logs = [];
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'dev',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: (m) => logs.push(m),
    });
    assert.equal(result, 'created');
    const create = findCall(gh.calls, 'pr', 'create');
    assert.ok(create, 'gh pr create is called');
    assert.ok(create.includes('--draft'), 'PR is created as draft');
    assert.equal(flagValue(create, '--title'), DRAFT_TITLE);
    assert.equal(flagValue(create, '--body'), DEV_BODY);
    assert.ok(
      !findCall(git.calls, 'commit'),
      'a branch with commits skips the bootstrap commit',
    );
    assert.ok(logs.includes(PR_URL), 'the created PR URL is logged');
  });

  test('no PR, branch even with main: bootstraps with an empty commit', () => {
    const seq = [];
    const gh = makeFakeRunner(NO_PR, seq, 'gh');
    const git = makeFakeRunner(
      { 'rev-list origin/main..HEAD': { stdout: '', status: 0 } },
      seq,
      'git',
    );
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'dev',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result, 'created');
    const commit = findCall(git.calls, 'commit');
    assert.ok(commit, 'git commit is called');
    assert.ok(commit.includes('--allow-empty'), 'commit is empty');
    assert.equal(
      flagValue(commit, '-m'),
      `Trigger PR creation for ${INPUT.branch}`,
    );
    assert.ok(findCall(git.calls, 'push'), 'bootstrap commit is pushed');
    assert.ok(
      callIndex(seq, 'git', 'push') < callIndex(seq, 'gh', 'pr', 'create'),
      'bootstrap commit is pushed before gh pr create runs',
    );
  });
});

describe('create-or-finalize-pr: release mode', () => {
  test('no PR: creates non-draft release PR', () => {
    const gh = makeFakeRunner({
      ...NO_PR,
      'pr create': { stdout: `${PR_URL}\n`, status: 0 },
    });
    const git = makeFakeRunner({
      'rev-list origin/main..HEAD': { stdout: 'abc123\n', status: 0 },
    });
    const logs = [];
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: (m) => logs.push(m),
    });
    assert.equal(result, 'created');
    const create = findCall(gh.calls, 'pr', 'create');
    assert.ok(create, 'gh pr create is called');
    assert.ok(!create.includes('--draft'), 'release PR is not a draft');
    assert.equal(flagValue(create, '--title'), RELEASE_TITLE);
    assert.equal(flagValue(create, '--body'), RELEASE_BODY);
    assert.ok(logs.includes(PR_URL), 'the created PR URL is logged');
  });

  test('draft PR in dev form: finalized — title + body, then ready', () => {
    const gh = makeFakeRunner(OPEN_DRAFT_PR);
    const git = makeFakeRunner();
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result, 'updated');
    const list = findCall(gh.calls, 'pr', 'list');
    assert.equal(
      flagValue(list, '--json'),
      'number,isDraft,title,body',
      'the PR query includes the fields the fixups inspect',
    );
    const edit = findCall(gh.calls, 'pr', 'edit');
    assert.ok(edit, 'gh pr edit is called');
    assert.equal(flagValue(edit, '--title'), RELEASE_TITLE);
    assert.equal(flagValue(edit, '--body'), RELEASE_BODY);
    const ready = findCall(gh.calls, 'pr', 'ready');
    assert.ok(ready, 'gh pr ready is called');
    assert.ok(ready.includes(INPUT.branch), 'pr ready targets the branch');
    assert.ok(
      callIndex(gh.calls, 'pr', 'edit') < callIndex(gh.calls, 'pr', 'ready'),
      'title and body are written while the PR is still a draft',
    );
    assert.equal(git.calls.length, 0, 'git is unused');
  });

  test('draft PR with a maintainer-edited body: body is preserved', () => {
    const gh = makeFakeRunner(
      openPr({
        isDraft: true,
        title: DRAFT_TITLE,
        body: 'Hold this until the FAQ is updated. — maintainer',
      }),
    );
    const git = makeFakeRunner();
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result, 'updated');
    const edit = findCall(gh.calls, 'pr', 'edit');
    assert.ok(edit, 'gh pr edit is called');
    assert.equal(flagValue(edit, '--title'), RELEASE_TITLE);
    assert.ok(
      !edit.includes('--body'),
      'the maintainer-owned body is preserved',
    );
    assert.ok(findCall(gh.calls, 'pr', 'ready'), 'gh pr ready is called');
  });

  test('ready PR still in dev form: title and body are healed', () => {
    // E.g. a maintainer marked the draft integration PR ready mid-cycle.
    const gh = makeFakeRunner(
      openPr({ isDraft: false, title: DRAFT_TITLE, body: DEV_BODY }),
    );
    const git = makeFakeRunner();
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result, 'updated');
    const edit = findCall(gh.calls, 'pr', 'edit');
    assert.ok(edit, 'gh pr edit is called');
    assert.equal(flagValue(edit, '--title'), RELEASE_TITLE);
    assert.equal(flagValue(edit, '--body'), RELEASE_BODY);
    assert.ok(
      !findCall(gh.calls, 'pr', 'ready'),
      'an already-ready PR skips pr ready',
    );
  });

  test('ready PR in the form of an older release: title and body re-synced', () => {
    // A newer release landed while the release PR awaited merge.
    const gh = makeFakeRunner(
      openPr({
        isDraft: false,
        title: RELEASE_TITLE.replaceAll('v1.59.0', 'v1.58.0'),
        body: RELEASE_BODY.replaceAll('v1.59.0', 'v1.58.0'),
      }),
    );
    const git = makeFakeRunner();
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result, 'updated');
    const edit = findCall(gh.calls, 'pr', 'edit');
    assert.ok(edit, 'gh pr edit is called');
    assert.equal(flagValue(edit, '--title'), RELEASE_TITLE);
    assert.equal(flagValue(edit, '--body'), RELEASE_BODY);
  });

  test('ready PR with maintainer-edited title and body: full no-op', () => {
    const gh = makeFakeRunner(
      openPr({
        isDraft: false,
        title: 'Update the spec to v1.59.0 (hold for FAQ)',
        body: 'Blocked on #12346.',
      }),
    );
    const git = makeFakeRunner();
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result, 'unchanged');
    assert.equal(gh.calls.length, 1, 'only the pr-list call runs');
  });

  test('ready PR already in release form: full no-op', () => {
    const gh = makeFakeRunner(
      openPr({ isDraft: false, title: RELEASE_TITLE, body: RELEASE_BODY }),
    );
    const git = makeFakeRunner();
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: false,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result, 'unchanged');
    assert.equal(gh.calls.length, 1, 'only the pr-list call runs');
  });
});

describe('create-or-finalize-pr: dry-run', () => {
  test('dev mode: reads state but skips all writes', () => {
    const gh = makeFakeRunner(NO_PR);
    const git = makeFakeRunner({
      'rev-list origin/main..HEAD': { stdout: '', status: 0 },
    });
    const logs = [];
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'dev',
      dryRun: true,
      runGh: gh.run,
      runGit: git.run,
      log: (m) => logs.push(m),
    });
    assert.equal(result, 'created', 'outcome a write run would produce');
    assert.equal(gh.calls.length, 1, 'only the read-only pr-list call runs');
    assert.ok(
      !findCall(git.calls, 'commit') && !findCall(git.calls, 'push'),
      'dry-run keeps git read-only',
    );
    assert.ok(
      logs.some((m) => /\[dry-run\]/.test(m)),
      'dry-run intent is logged',
    );
  });

  test('release mode with draft PR: skips finalize writes', () => {
    const gh = makeFakeRunner(OPEN_DRAFT_PR);
    const git = makeFakeRunner();
    const result = createOrFinalizePullRequest({
      ...INPUT,
      mode: 'release',
      dryRun: true,
      runGh: gh.run,
      runGit: git.run,
      log: noLog,
    });
    assert.equal(result, 'updated', 'outcome a write run would produce');
    assert.equal(gh.calls.length, 1, 'only the read-only pr-list call runs');
  });
});

describe('create-or-finalize-pr: failure propagation', () => {
  test('throws when gh pr list fails', () => {
    const gh = makeFakeRunner({ 'pr list': { stdout: 'boom', status: 4 } });
    const git = makeFakeRunner();
    assert.throws(
      () =>
        createOrFinalizePullRequest({
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
        createOrFinalizePullRequest({
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
        createOrFinalizePullRequest({
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

  test('throws when gh pr edit fails during finalization, before pr ready', () => {
    const gh = makeFakeRunner({
      ...OPEN_DRAFT_PR,
      'pr edit': { stdout: 'boom', status: 1 },
    });
    const git = makeFakeRunner();
    assert.throws(
      () =>
        createOrFinalizePullRequest({
          ...INPUT,
          mode: 'release',
          dryRun: false,
          runGh: gh.run,
          runGit: git.run,
          log: noLog,
        }),
      /gh pr edit failed/,
    );
    // The PR must remain a draft so that the next run redoes the finalization.
    assert.ok(
      !findCall(gh.calls, 'pr', 'ready'),
      'pr ready runs only after a successful edit',
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
        createOrFinalizePullRequest({
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
        createOrFinalizePullRequest({
          ...INPUT,
          mode: 'prod',
          dryRun: false,
          runGh: gh.run,
          runGit: git.run,
          log: noLog,
        }),
      /unexpected mode: prod/,
    );
    assert.equal(gh.calls.length, 0, 'invalid mode fails before any call');
  });
});
