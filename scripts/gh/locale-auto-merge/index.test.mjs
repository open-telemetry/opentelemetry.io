import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

// cspell:ignore mallory

import {
  discoverLocales,
  parseCommand,
  localeForPath,
  evaluateEligibility,
  authorizeForLocales,
  resolveVerdict,
  runAutoMergeCommand,
} from './index.mjs';

const LOCALES = discoverLocales();

describe('locale-auto-merge: discoverLocales', () => {
  test('includes translation locales but excludes the default en', () => {
    assert.ok(LOCALES.has('ja'), 'expected ja to be a locale');
    assert.ok(LOCALES.has('pt'), 'expected pt to be a locale');
    assert.ok(!LOCALES.has('en'), 'en is maintainer-owned, not a locale');
  });
});

describe('locale-auto-merge: parseCommand', () => {
  test('bare /auto-merge means enable', () => {
    assert.equal(parseCommand('/auto-merge'), 'enable');
    assert.equal(parseCommand('  /auto-merge  '), 'enable');
  });

  test('explicit enable/disable', () => {
    assert.equal(parseCommand('/auto-merge:enable'), 'enable');
    assert.equal(parseCommand('/auto-merge:disable'), 'disable');
  });

  test('rejects surrounding text and unknown verbs', () => {
    assert.equal(parseCommand('please /auto-merge'), null);
    assert.equal(parseCommand('/auto-merge now'), null);
    assert.equal(parseCommand('/auto-merge:later'), null);
    assert.equal(parseCommand('/automerge'), null);
  });

  test('rejects non-strings', () => {
    assert.equal(parseCommand(undefined), null);
    assert.equal(parseCommand(42), null);
  });
});

describe('locale-auto-merge: localeForPath', () => {
  test('maps content/<loc>/** to the locale', () => {
    assert.equal(localeForPath('content/ja/docs/foo.md', LOCALES), 'ja');
    assert.equal(localeForPath('content/pt/_index.md', LOCALES), 'pt');
  });

  test('maps .cspell/<loc>-*.txt and prh/<loc>.yml', () => {
    assert.equal(localeForPath('.cspell/ja-words.txt', LOCALES), 'ja');
    assert.equal(localeForPath('prh/ja.yml', LOCALES), 'ja');
  });

  test('returns null for non-locale cspell files', () => {
    assert.equal(localeForPath('.cspell/all-words.txt', LOCALES), null);
  });

  test('returns null for unknown locale tokens', () => {
    assert.equal(localeForPath('content/xx/foo.md', LOCALES), null);
  });

  test('returns null for paths outside the locale-owned set', () => {
    assert.equal(localeForPath('layouts/partials/head.html', LOCALES), null);
    assert.equal(localeForPath('static/refcache.json', LOCALES), null);
    assert.equal(localeForPath('content/ja', LOCALES), null);
  });
});

describe('locale-auto-merge: evaluateEligibility', () => {
  const known = new Set(['ja', 'pt']);

  test('single-locale PR is eligible', () => {
    const r = evaluateEligibility(
      ['content/ja/a.md', 'content/ja/b.md'],
      known,
    );
    assert.deepEqual(r, { eligible: true, locales: ['ja'], offending: [] });
  });

  test('multi-locale PR is eligible and reports all locales sorted', () => {
    const r = evaluateEligibility(
      ['content/pt/a.md', 'content/ja/b.md'],
      known,
    );
    assert.deepEqual(r, {
      eligible: true,
      locales: ['ja', 'pt'],
      offending: [],
    });
  });

  test('no-owner refcache.json does not block, but is not a locale', () => {
    const r = evaluateEligibility(
      ['content/ja/a.md', 'static/refcache.json'],
      known,
    );
    assert.deepEqual(r, { eligible: true, locales: ['ja'], offending: [] });
  });

  test('refcache.json alone is ineligible (no locale touched)', () => {
    const r = evaluateEligibility(['static/refcache.json'], known);
    assert.equal(r.eligible, false);
    assert.deepEqual(r.locales, []);
    assert.deepEqual(r.offending, []);
  });

  test('a non-locale file makes the PR ineligible and is reported', () => {
    const r = evaluateEligibility(['content/ja/a.md', 'layouts/x.html'], known);
    assert.equal(r.eligible, false);
    assert.deepEqual(r.offending, ['layouts/x.html']);
  });

  test('content/en is ineligible (default locale, not a translation)', () => {
    const r = evaluateEligibility(
      ['content/ja/a.md', 'content/en/a.md'],
      known,
    );
    assert.equal(r.eligible, false);
    assert.deepEqual(r.offending, ['content/en/a.md']);
  });

  test('empty PR is ineligible', () => {
    assert.equal(evaluateEligibility([], known).eligible, false);
  });

  test('onFile callback classifies each path', () => {
    const seen = [];
    evaluateEligibility(
      ['content/ja/a.md', 'static/refcache.json', 'layouts/x.html'],
      known,
      (f) => seen.push(f),
    );
    assert.deepEqual(seen, [
      { path: 'content/ja/a.md', kind: 'locale', locale: 'ja' },
      { path: 'static/refcache.json', kind: 'shared', locale: null },
      { path: 'layouts/x.html', kind: 'offending', locale: null },
    ]);
  });
});

// Build a fake runGh that answers team-membership queries from a map of
// team-slug -> [logins].
function teamRunner(teams) {
  return (args) => {
    if (args[0] === 'api') {
      const ref = args.find((a) => a.includes('/teams/'));
      const m = ref && ref.match(/teams\/([^/]+)\/members/);
      if (m) {
        const members = teams[m[1]] ?? [];
        return { stdout: members.join('\n'), status: 0 };
      }
    }
    return { stdout: '', status: 1 };
  };
}

describe('locale-auto-merge: authorizeForLocales', () => {
  const teams = {
    'docs-ja-maintainers': ['Alice', 'bob'],
    'docs-pt-maintainers': ['carol', 'alice'],
  };

  test('member of the single touched locale team is authorized', () => {
    const r = authorizeForLocales(teamRunner(teams), 'open-telemetry', 'bob', [
      'ja',
    ]);
    assert.deepEqual(r, { authorized: true, missing: [] });
  });

  test('membership check is case-insensitive', () => {
    const r = authorizeForLocales(
      teamRunner(teams),
      'open-telemetry',
      'ALICE',
      ['ja'],
    );
    assert.equal(r.authorized, true);
  });

  test('must be a member of every touched locale team', () => {
    const r = authorizeForLocales(
      teamRunner(teams),
      'open-telemetry',
      'alice',
      ['ja', 'pt'],
    );
    assert.deepEqual(r, { authorized: true, missing: [] });

    const r2 = authorizeForLocales(teamRunner(teams), 'open-telemetry', 'bob', [
      'ja',
      'pt',
    ]);
    assert.deepEqual(r2, { authorized: false, missing: ['pt'] });
  });

  test('non-member is unauthorized', () => {
    const r = authorizeForLocales(
      teamRunner(teams),
      'open-telemetry',
      'mallory',
      ['ja'],
    );
    assert.deepEqual(r, { authorized: false, missing: ['ja'] });
  });

  test('an API failure is treated as non-membership', () => {
    const failing = () => ({ stdout: '', status: 1 });
    const r = authorizeForLocales(failing, 'open-telemetry', 'alice', ['ja']);
    assert.deepEqual(r, { authorized: false, missing: ['ja'] });
  });

  test('onCheck callback reports each membership result', () => {
    const seen = [];
    authorizeForLocales(
      teamRunner(teams),
      'open-telemetry',
      'bob',
      ['ja', 'pt'],
      (c) => seen.push(c),
    );
    assert.deepEqual(seen, [
      { locale: 'ja', team: 'docs-ja-maintainers', member: true },
      { locale: 'pt', team: 'docs-pt-maintainers', member: false },
    ]);
  });
});

describe('locale-auto-merge: resolveVerdict', () => {
  const eligible = { eligible: true, locales: ['ja'], offending: [] };
  const authorized = { authorized: true, missing: [] };

  test('ineligible (offending files) -> exit 1, no mutation', () => {
    const v = resolveVerdict({
      action: 'enable',
      eligibility: { eligible: false, locales: [], offending: ['x.html'] },
      authorization: { authorized: false, missing: [] },
      autoMergeEnabled: false,
    });
    assert.equal(v.outcome, 'ineligible');
    assert.equal(v.exitCode, 1);
    assert.equal(v.apply, null);
    assert.match(v.message, /x\.html/);
  });

  test('unauthorized -> exit 1, lists missing teams', () => {
    const v = resolveVerdict({
      action: 'enable',
      eligibility: {
        eligible: true,
        locales: ['ja', 'pt'],
        offending: [],
      },
      authorization: { authorized: false, missing: ['pt'] },
      autoMergeEnabled: false,
    });
    assert.equal(v.outcome, 'unauthorized');
    assert.equal(v.exitCode, 1);
    assert.equal(v.apply, null);
    assert.match(v.message, /docs-pt-maintainers/);
  });

  test('enable when already enabled -> noop', () => {
    const v = resolveVerdict({
      action: 'enable',
      eligibility: eligible,
      authorization: authorized,
      autoMergeEnabled: true,
    });
    assert.equal(v.outcome, 'noop');
    assert.equal(v.apply, null);
  });

  test('disable when not enabled -> noop', () => {
    const v = resolveVerdict({
      action: 'disable',
      eligibility: eligible,
      authorization: authorized,
      autoMergeEnabled: false,
    });
    assert.equal(v.outcome, 'noop');
    assert.equal(v.apply, null);
  });

  test('enable when eligible+authorized -> apply enable', () => {
    const v = resolveVerdict({
      action: 'enable',
      eligibility: eligible,
      authorization: authorized,
      autoMergeEnabled: false,
      author: 'alice',
    });
    assert.equal(v.outcome, 'apply');
    assert.equal(v.apply, 'enable');
    assert.equal(v.exitCode, 0);
  });

  test('enable proof line names the requester and every locale team', () => {
    const v = resolveVerdict({
      action: 'enable',
      eligibility: {
        eligible: true,
        locales: ['ja', 'pt'],
        offending: [],
      },
      authorization: authorized,
      autoMergeEnabled: false,
      author: 'alice',
    });
    assert.match(v.message, /@alice is a member of the maintainer team/);
    assert.match(v.message, /@open-telemetry\/docs-ja-maintainers/);
    assert.match(v.message, /@open-telemetry\/docs-pt-maintainers/);
  });

  test('enable message states files are locale-owned or shared', () => {
    const v = resolveVerdict({
      action: 'enable',
      eligibility: eligible,
      authorization: authorized,
      autoMergeEnabled: false,
      author: 'alice',
    });
    assert.match(
      v.message,
      /All PR files are locale-owned or shared and can be changed by the locale\(s\)\./,
    );
  });

  test('disable message carries no proof line', () => {
    const v = resolveVerdict({
      action: 'disable',
      eligibility: eligible,
      authorization: authorized,
      autoMergeEnabled: true,
      author: 'alice',
    });
    assert.doesNotMatch(v.message, /is a member of the maintainer team/);
  });

  test('disable when enabled -> apply disable', () => {
    const v = resolveVerdict({
      action: 'disable',
      eligibility: eligible,
      authorization: authorized,
      autoMergeEnabled: true,
    });
    assert.equal(v.apply, 'disable');
  });
});

// ---------------------------------------------------------------------------
// runAutoMergeCommand integration tests with a fully scripted `gh` runner.
// ---------------------------------------------------------------------------

function makeRunGh({ pr, teams = {}, calls }) {
  return (args) => {
    calls.push(args);
    const key = args.slice(0, 2).join(' ');
    if (key === 'pr view') {
      return { stdout: JSON.stringify(pr), status: 0 };
    }
    if (args[0] === 'api') {
      const ref = args.find((a) => a.includes('/teams/'));
      const m = ref && ref.match(/teams\/([^/]+)\/members/);
      if (m) return { stdout: (teams[m[1]] ?? []).join('\n'), status: 0 };
    }
    // pr merge / pr comment
    return { stdout: '', status: 0 };
  };
}

const KNOWN = new Set(['ja', 'pt']);

describe('locale-auto-merge: runAutoMergeCommand', () => {
  test('no recognized command is a no-op', () => {
    const calls = [];
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 1,
      commentAuthor: 'alice',
      commentBody: 'lgtm',
      knownLocales: KNOWN,
      runGh: makeRunGh({ pr: {}, calls }),
    });
    assert.equal(r.outcome, 'no-command');
    assert.equal(calls.length, 0); // never even fetched the PR
  });

  test('malformed /auto-merge attempt posts an unrecognized-command reply', () => {
    const calls = [];
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 5,
      commentAuthor: 'alice',
      commentBody: '/auto-merge please',
      knownLocales: KNOWN,
      runGh: makeRunGh({ pr: {}, calls }),
    });
    assert.equal(r.outcome, 'no-command');
    assert.equal(r.exitCode, 0);
    // It never fetches the PR, but it does post a feedback comment.
    assert.ok(!calls.some((a) => a[0] === 'pr' && a[1] === 'view'));
    const comment = calls.find((a) => a[0] === 'pr' && a[1] === 'comment');
    assert.ok(comment, 'expected a feedback comment');
    const body = comment[comment.indexOf('--body') + 1];
    assert.match(body, /Unrecognized auto-merge command/);
  });

  test('eligible + authorized enable issues gh pr merge --auto', () => {
    const calls = [];
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 42,
      commentAuthor: 'alice',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files: [{ path: 'content/ja/docs/a.md' }],
          autoMergeRequest: null,
        },
        teams: { 'docs-ja-maintainers': ['alice'] },
        calls,
      }),
    });
    assert.equal(r.outcome, 'apply');
    assert.equal(r.exitCode, 0);
    const merge = calls.find((a) => a[0] === 'pr' && a[1] === 'merge');
    assert.ok(merge, 'expected a gh pr merge call');
    assert.ok(merge.includes('--auto'));
    // The posted comment carries the auditable proof line.
    const comment = calls.find((a) => a[0] === 'pr' && a[1] === 'comment');
    const body = comment[comment.indexOf('--body') + 1];
    assert.match(body, /@alice is a member of the maintainer team/);
    assert.match(body, /@open-telemetry\/docs-ja-maintainers/);
  });

  test('mixed-locale PR requires membership in all locale teams', () => {
    const calls = [];
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 7,
      commentAuthor: 'bob',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files: [{ path: 'content/ja/a.md' }, { path: 'content/pt/b.md' }],
          autoMergeRequest: null,
        },
        teams: {
          'docs-ja-maintainers': ['bob'],
          'docs-pt-maintainers': ['carol'],
        },
        calls,
      }),
    });
    assert.equal(r.outcome, 'unauthorized');
    assert.equal(r.exitCode, 1);
    assert.ok(!calls.some((a) => a[0] === 'pr' && a[1] === 'merge'));
  });

  test('mixed-locale PR enables when author is in every locale team', () => {
    const calls = [];
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 8,
      commentAuthor: 'alice',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files: [
            { path: 'content/ja/a.md' },
            { path: 'content/pt/b.md' },
            { path: 'static/refcache.json' },
          ],
          autoMergeRequest: null,
        },
        teams: {
          'docs-ja-maintainers': ['alice'],
          'docs-pt-maintainers': ['alice'],
        },
        calls,
      }),
    });
    assert.equal(r.outcome, 'apply');
    assert.equal(r.exitCode, 0);
    const merge = calls.find((a) => a[0] === 'pr' && a[1] === 'merge');
    assert.ok(merge && merge.includes('--auto'));
    // Both touched locales are checked against their teams.
    const teamCalls = calls.filter((a) => a.some((s) => s.includes('/teams/')));
    assert.equal(teamCalls.length, 2);
    // The posted comment names both locales and both maintainer teams.
    const comment = calls.find((a) => a[0] === 'pr' && a[1] === 'comment');
    const body = comment[comment.indexOf('--body') + 1];
    assert.match(body, /locale\(s\) `ja`, `pt`/);
    assert.match(body, /@open-telemetry\/docs-ja-maintainers/);
    assert.match(body, /@open-telemetry\/docs-pt-maintainers/);
  });

  test('fails closed when the PR has more files than gh can return', () => {
    const calls = [];
    // gh returns only 100 files, but the PR actually changed 150 — we can't
    // see the other 50, so eligibility must not be asserted.
    const files = Array.from({ length: 100 }, (_, i) => ({
      path: `content/ja/${i}.md`,
    }));
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 11,
      commentAuthor: 'alice',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files,
          changedFiles: 150,
          autoMergeRequest: null,
        },
        teams: { 'docs-ja-maintainers': ['alice'] },
        calls,
      }),
    });
    assert.equal(r.outcome, 'too-many-files');
    assert.equal(r.exitCode, 1);
    // Never consulted team membership and never merged.
    assert.ok(!calls.some((a) => a.some((s) => s.includes('/teams/'))));
    assert.ok(!calls.some((a) => a[0] === 'pr' && a[1] === 'merge'));
    const comment = calls.find((a) => a[0] === 'pr' && a[1] === 'comment');
    const body = comment[comment.indexOf('--body') + 1];
    assert.match(body, /more than the 100 this check can read/);
  });

  test('exactly 100 files (not truncated) is evaluated normally', () => {
    const calls = [];
    const files = Array.from({ length: 100 }, (_, i) => ({
      path: `content/ja/${i}.md`,
    }));
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 12,
      commentAuthor: 'alice',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files,
          changedFiles: 100,
          autoMergeRequest: null,
        },
        teams: { 'docs-ja-maintainers': ['alice'] },
        calls,
      }),
    });
    assert.equal(r.outcome, 'apply');
    assert.ok(calls.some((a) => a[0] === 'pr' && a[1] === 'merge'));
  });

  test('ineligible PR never checks team membership or merges', () => {
    const calls = [];
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 9,
      commentAuthor: 'alice',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files: [{ path: 'content/ja/a.md' }, { path: 'layouts/x.html' }],
          autoMergeRequest: null,
        },
        teams: { 'docs-ja-maintainers': ['alice'] },
        calls,
      }),
    });
    assert.equal(r.outcome, 'ineligible');
    assert.ok(!calls.some((a) => a.includes('/teams/')));
    assert.ok(!calls.some((a) => a[0] === 'pr' && a[1] === 'merge'));
  });

  test('closed PR is rejected before eligibility', () => {
    const calls = [];
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 5,
      commentAuthor: 'alice',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      runGh: makeRunGh({
        pr: { state: 'MERGED', files: [], autoMergeRequest: null },
        calls,
      }),
    });
    assert.equal(r.outcome, 'not-open');
    assert.equal(r.exitCode, 1);
  });

  test('dry run computes the verdict but issues no mutating calls', () => {
    const calls = [];
    const logs = [];
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 42,
      commentAuthor: 'alice',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      dryRun: true,
      log: (m) => logs.push(m),
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files: [{ path: 'content/ja/a.md' }],
          autoMergeRequest: null,
        },
        teams: { 'docs-ja-maintainers': ['alice'] },
        calls,
      }),
    });
    assert.equal(r.outcome, 'apply');
    // Read-only calls happened, but no real merge/comment.
    assert.ok(!calls.some((a) => a[0] === 'pr' && a[1] === 'merge'));
    assert.ok(!calls.some((a) => a[0] === 'pr' && a[1] === 'comment'));
    assert.ok(logs.some((m) => m.includes('[dry-run]')));
  });

  test('already-enabled enable is a noop', () => {
    const calls = [];
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 42,
      commentAuthor: 'alice',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files: [{ path: 'content/ja/a.md' }],
          autoMergeRequest: {},
        },
        teams: { 'docs-ja-maintainers': ['alice'] },
        calls,
      }),
    });
    assert.equal(r.outcome, 'noop');
    assert.ok(!calls.some((a) => a[0] === 'pr' && a[1] === 'merge'));
  });

  test('verbose mode logs each file and each team check', () => {
    const calls = [];
    const logs = [];
    runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 42,
      commentAuthor: 'bob',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      verbose: true,
      log: (m) => logs.push(m),
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files: [
            { path: 'content/ja/a.md' },
            { path: 'content/pt/b.md' },
            { path: 'static/refcache.json' },
          ],
          autoMergeRequest: null,
        },
        teams: {
          'docs-ja-maintainers': ['bob'],
          'docs-pt-maintainers': ['carol'],
        },
        calls,
      }),
    });
    assert.ok(
      logs.some((m) => m === '[file] ✓ locale-owned (ja): content/ja/a.md'),
    );
    assert.ok(
      logs.some((m) => m === '[file] ✓ locale-owned (pt): content/pt/b.md'),
    );
    assert.ok(
      logs.some(
        (m) => m === '[file] ✓ shared (no owner): static/refcache.json',
      ),
    );
    assert.ok(
      logs.some((m) =>
        /\[team\] @bob ✓ is a member of .*docs-ja-maintainers/.test(m),
      ),
    );
    assert.ok(
      logs.some((m) =>
        /\[team\] @bob ✗ is NOT a member of .*docs-pt-maintainers/.test(m),
      ),
    );
  });

  test('verbose mode caps per-file lines at verboseLimit', () => {
    const calls = [];
    const logs = [];
    runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 42,
      commentAuthor: 'alice',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      verbose: true,
      verboseLimit: 2,
      log: (m) => logs.push(m),
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files: [
            { path: 'content/ja/a.md' },
            { path: 'content/ja/b.md' },
            { path: 'content/ja/c.md' },
          ],
          autoMergeRequest: null,
        },
        teams: { 'docs-ja-maintainers': ['alice'] },
        calls,
      }),
    });
    const fileLines = logs.filter((m) => m.startsWith('[file] ✓'));
    assert.equal(fileLines.length, 2);
    assert.ok(
      logs.some((m) => m.includes('verbose limit (2) reached; 1 more file')),
    );
  });

  test('enable applies but gh pr merge failure yields mutation-failed', () => {
    const calls = [];
    const base = makeRunGh({
      pr: {
        state: 'OPEN',
        files: [{ path: 'content/ja/docs/a.md' }],
        autoMergeRequest: null,
      },
      teams: { 'docs-ja-maintainers': ['alice'] },
      calls,
    });
    // Wrap the runner so the merge mutation fails, but reads still succeed.
    const runGh = (args) =>
      args[0] === 'pr' && args[1] === 'merge'
        ? { stdout: '', status: 1 }
        : base(args);
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 42,
      commentAuthor: 'alice',
      commentBody: '/auto-merge',
      knownLocales: KNOWN,
      runGh,
    });
    assert.equal(r.outcome, 'mutation-failed');
    assert.equal(r.exitCode, 1);
    const comment = calls.find((a) => a[0] === 'pr' && a[1] === 'comment');
    const body = comment[comment.indexOf('--body') + 1];
    assert.match(body, /Failed to enable auto-merge/);
  });

  test('disable on an enabled PR issues gh pr merge --disable-auto', () => {
    const calls = [];
    const r = runAutoMergeCommand({
      repo: 'open-telemetry/opentelemetry.io',
      prNum: 42,
      commentAuthor: 'alice',
      commentBody: '/auto-merge:disable',
      knownLocales: KNOWN,
      runGh: makeRunGh({
        pr: {
          state: 'OPEN',
          files: [{ path: 'content/ja/docs/a.md' }],
          autoMergeRequest: { enabledAt: '2026-01-01T00:00:00Z' },
        },
        teams: { 'docs-ja-maintainers': ['alice'] },
        calls,
      }),
    });
    assert.equal(r.outcome, 'apply');
    assert.equal(r.exitCode, 0);
    const merge = calls.find((a) => a[0] === 'pr' && a[1] === 'merge');
    assert.ok(merge, 'expected a gh pr merge call');
    assert.ok(merge.includes('--disable-auto'));
    assert.ok(!merge.includes('--auto'));
  });
});
