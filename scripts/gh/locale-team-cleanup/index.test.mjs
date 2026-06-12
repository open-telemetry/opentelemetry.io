import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DOCS_CORE,
  KEEP,
  ORG,
  planRemovals,
  runCleanup,
  teamsInRemovalOrder,
} from './index.mjs';

describe('locale-team-cleanup: teamsInRemovalOrder', () => {
  test('lists child (maintainers) before parent (approvers) per locale', () => {
    const teams = teamsInRemovalOrder(['ja']);
    assert.deepEqual(teams, ['docs-ja-maintainers', 'docs-ja-approvers']);
  });
});

describe('locale-team-cleanup: planRemovals', () => {
  test('removes docs-core members, keeps locale members', () => {
    const rosters = new Map([
      ['docs-ja-maintainers', new Set(['chalin', 'svrnm', 'katzchang'])],
    ]);
    const removals = planRemovals(rosters);
    assert.deepEqual(removals, [
      { team: 'docs-ja-maintainers', user: 'chalin' },
      { team: 'docs-ja-maintainers', user: 'svrnm' },
    ]);
  });

  test('honors per-locale KEEP exceptions', () => {
    const rosters = new Map([
      ['docs-fr-maintainers', new Set(['chalin', 'svrnm', 'marcalff'])],
      ['docs-pt-approvers', new Set(['maryliag', 'vitorvasc', 'cartermp'])],
    ]);
    const users = planRemovals(rosters).map((r) => `${r.team}:${r.user}`);
    assert.deepEqual(users, [
      'docs-fr-maintainers:svrnm',
      'docs-pt-approvers:cartermp',
    ]);
  });

  test('keeps KEEP scoped to its locale', () => {
    // chalin is kept in fr but still removed elsewhere.
    const rosters = new Map([
      ['docs-fr-approvers', new Set(['chalin'])],
      ['docs-ro-approvers', new Set(['chalin'])],
    ]);
    assert.deepEqual(planRemovals(rosters), [
      { team: 'docs-ro-approvers', user: 'chalin' },
    ]);
  });

  test('skips teams with no roster and returns empty for clean rosters', () => {
    assert.deepEqual(planRemovals(new Map()), []);
    const clean = new Map([['docs-ja-maintainers', new Set(['katzchang'])]]);
    assert.deepEqual(planRemovals(clean), []);
  });
});

// Fake gh: returns canned rosters; records DELETE calls.
function makeRunGh({ rosters, deleteStatus = () => 0, calls }) {
  return (args) => {
    calls.push(args);
    if (args[0] === 'api' && args[1] === '-X' && args[2] === 'DELETE') {
      const status = deleteStatus(args[3]);
      return {
        stdout: '',
        stderr: status === 0 ? '' : 'HTTP 404: Not Found',
        status,
      };
    }
    const m = args[1]?.match(/teams\/([^/]+)\/members/);
    const roster = (m && rosters[m[1]]) ?? [];
    return { stdout: roster.join('\n'), stderr: '', status: 0 };
  };
}

describe('locale-team-cleanup: runCleanup', () => {
  const rosters = {
    'docs-ja-maintainers': ['chalin', 'katzchang'],
    'docs-ja-approvers': ['chalin', 'katzchang', 'kohbis'],
  };

  test('dry run plans removals but issues no DELETE', () => {
    const calls = [];
    const r = runCleanup({ runGh: makeRunGh({ rosters, calls }) });
    assert.equal(r.exitCode, 0);
    assert.deepEqual(
      r.removals.map((x) => `${x.team}:${x.user}:${x.status}`),
      [
        'docs-ja-maintainers:chalin:would remove',
        'docs-ja-approvers:chalin:would remove',
      ],
    );
    assert.ok(!calls.some((a) => a.includes('DELETE')));
  });

  test('apply issues DELETE per planned removal, child team first', () => {
    const calls = [];
    const r = runCleanup({
      runGh: makeRunGh({ rosters, calls }),
      dryRun: false,
    });
    assert.equal(r.exitCode, 0);
    const deletes = calls.filter((a) => a.includes('DELETE')).map((a) => a[3]);
    assert.deepEqual(deletes, [
      `/orgs/${ORG}/teams/docs-ja-maintainers/memberships/chalin`,
      `/orgs/${ORG}/teams/docs-ja-approvers/memberships/chalin`,
    ]);
  });

  test('404 on DELETE is a skip, not a failure', () => {
    const calls = [];
    const r = runCleanup({
      runGh: makeRunGh({ rosters, deleteStatus: () => 1, calls }),
      dryRun: false,
    });
    assert.equal(r.exitCode, 0);
    assert.ok(
      r.removals.every((x) => x.status === 'skipped (not a direct member)'),
    );
  });

  test('roster fetch failure aborts with exit 1', () => {
    const calls = [];
    const r = runCleanup({
      runGh: (args) => {
        calls.push(args);
        return { stdout: '', stderr: 'boom', status: 1 };
      },
    });
    assert.equal(r.exitCode, 1);
    assert.deepEqual(r.removals, []);
  });
});

describe('locale-team-cleanup: config sanity', () => {
  test('KEEP names are docs-core members', () => {
    for (const users of Object.values(KEEP)) {
      for (const u of users) {
        assert.ok(DOCS_CORE.includes(u), `${u} should be in DOCS_CORE`);
      }
    }
  });
});
