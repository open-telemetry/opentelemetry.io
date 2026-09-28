import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BEGIN_MARKER,
  DOCS_APPROVERS,
  END_MARKER,
  fetchDirectMembers,
  fetchLiveRegistry,
  genLocaleSection,
  genLocalesBlock,
  isStaffed,
  normalizeTeams,
  replaceLocalesBlock,
  updateCodeowners,
  validateRegistry,
} from './index.mjs';

const registry = {
  locales: {
    ja: { maintainers: ['katzchang'], approvers: ['kohbis'] },
    uk: { maintainers: [], approvers: [] },
    bn: { maintainers: [], approvers: ['badhon495'] },
  },
};

describe('locale-codeowners: isStaffed', () => {
  test('staffed iff at least one maintainer', () => {
    assert.equal(isStaffed({ maintainers: ['a'] }), true);
    assert.equal(isStaffed({ maintainers: [] }), false);
    assert.equal(isStaffed({}), false);
  });
});

describe('locale-codeowners: genLocaleSection', () => {
  const fileExists = (p) => p === 'prh/ja.yml';
  const section = genLocaleSection(registry, { fileExists });
  const lines = section.split('\n');

  test('locales are sorted and labeled with staffing status', () => {
    const headers = lines.filter((l) => l.startsWith('# '));
    assert.deepEqual(headers, ['# bn (unstaffed)', '# ja', '# uk (unstaffed)']);
  });

  test('staffed locale lists only its own approvers team', () => {
    const ja = lines.filter((l) => l.includes('/docs-ja-approvers'));
    assert.equal(ja.length, 3); // cspell, content, prh
    assert.ok(ja.every((l) => !l.includes(DOCS_APPROVERS)));
  });

  test('unstaffed locales also list docs-approvers', () => {
    for (const loc of ['bn', 'uk']) {
      const ls = lines.filter((l) => l.includes(`/docs-${loc}-approvers`));
      assert.equal(ls.length, 2); // no prh file
      assert.ok(ls.every((l) => l.endsWith(` ${DOCS_APPROVERS}`)));
    }
  });

  test('content rules stay plain directory rules (labeler constraint)', () => {
    const content = lines.filter((l) => l.startsWith('/content/'));
    assert.equal(content.length, 3);
    for (const l of content) {
      assert.match(l, /^\/content\/[a-z]+\/\s+@/, `no glob form: ${l}`);
    }
  });

  test('prh line only for locales with a prh file', () => {
    assert.ok(section.includes('/prh/ja.yml'));
    assert.ok(!section.includes('/prh/bn.yml'));
  });

  test('owners column is aligned', () => {
    const offsets = new Set(
      lines.filter((l) => l.includes('@')).map((l) => l.indexOf('@')),
    );
    assert.equal(offsets.size, 1);
  });
});

describe('locale-codeowners: updateCodeowners', () => {
  const doc = `# head\n\n${BEGIN_MARKER}\n\nOLD\n\n${END_MARKER}\n\n# tail\n`;

  test('replaces only the marked section', () => {
    const updated = updateCodeowners(doc, 'NEW');
    assert.equal(
      updated,
      `# head\n\n${BEGIN_MARKER}\n\nNEW\n\n${END_MARKER}\n\n# tail\n`,
    );
  });

  test('is idempotent', () => {
    const once = updateCodeowners(doc, 'NEW');
    assert.equal(updateCodeowners(once, 'NEW'), once);
  });

  test('throws when markers are missing', () => {
    assert.throws(() => updateCodeowners('# no markers', 'NEW'), /markers/);
  });
});

describe('locale-codeowners: validateRegistry', () => {
  test('accepts a valid registry', () => {
    assert.deepEqual(validateRegistry(registry), []);
  });

  test('rejects missing locales map and non-list rosters', () => {
    assert.equal(validateRegistry({}).length, 1);
    const bad = { locales: { ja: { maintainers: 'katzchang' } } };
    assert.ok(validateRegistry(bad).some((p) => p.includes('must be a list')));
  });

  test('rejects unsorted or duplicate rosters', () => {
    const unsorted = {
      locales: { ja: { maintainers: ['b', 'a'], approvers: [] } },
    };
    assert.ok(validateRegistry(unsorted).some((p) => p.includes('not sorted')));
    const dupes = {
      locales: { ja: { maintainers: ['a', 'A'], approvers: [] } },
    };
    assert.ok(validateRegistry(dupes).some((p) => p.includes('duplicates')));
  });

  test('rejects maintainer/approver overlap', () => {
    const overlap = {
      locales: { ja: { maintainers: ['a'], approvers: ['a', 'b'] } },
    };
    assert.ok(validateRegistry(overlap).some((p) => p.includes('both')));
  });

  test('checks registry keys against content locale dirs when given', () => {
    const dirs = ['bn', 'ja', 'uk'];
    assert.deepEqual(validateRegistry(registry, { localeDirs: dirs }), []);
    assert.ok(
      validateRegistry(registry, { localeDirs: ['bn', 'ja', 'uk', 'xx'] }).some(
        (p) => p.includes('not in registry'),
      ),
    );
    assert.ok(
      validateRegistry(registry, { localeDirs: ['bn', 'ja'] }).some((p) =>
        p.includes('no content/ directory'),
      ),
    );
  });
});

// Fake `gh api graphql` runner: `teams` maps slug -> logins, or a function
// returning a raw { stdout, stderr, status } response.
function fakeGh(teams, calls = []) {
  return (args) => {
    const query = args.find((a) => a.startsWith('query='));
    const slug = args.find((a) => a.startsWith('slug=')).slice(5);
    calls.push({ query, slug });
    const t = teams[slug];
    if (typeof t === 'function') return t();
    const team =
      t === undefined
        ? null
        : {
            members: {
              totalCount: t.length,
              pageInfo: { hasNextPage: false },
              nodes: t.map((login) => ({ login })),
            },
          };
    return {
      stdout: JSON.stringify({ data: { organization: { team } } }),
      status: 0,
    };
  };
}

describe('locale-codeowners: fetchDirectMembers', () => {
  test('asks GraphQL for direct (IMMEDIATE) members only', () => {
    const calls = [];
    const runGh = fakeGh({ 'docs-ja-approvers': ['a', 'b'] }, calls);
    assert.deepEqual(fetchDirectMembers({ runGh, team: 'docs-ja-approvers' }), [
      'a',
      'b',
    ]);
    assert.match(calls[0].query, /membership: IMMEDIATE/);
  });

  test('fails on a gh error', () => {
    const runGh = fakeGh({
      t: () => ({ stdout: '', stderr: 'HTTP 403', status: 1 }),
    });
    assert.throws(() => fetchDirectMembers({ runGh, team: 't' }), /403/);
  });

  test('fails on a missing or unreadable team (null, exit 0)', () => {
    const runGh = fakeGh({});
    assert.throws(
      () => fetchDirectMembers({ runGh, team: 'docs-xx-approvers' }),
      /not found or not readable/,
    );
  });

  test('fails on GraphQL errors and unparsable output', () => {
    const errors = fakeGh({
      t: () => ({ stdout: '{"errors":[{"message":"boom"}]}', status: 0 }),
    });
    assert.throws(
      () => fetchDirectMembers({ runGh: errors, team: 't' }),
      /boom/,
    );
    const junk = fakeGh({ t: () => ({ stdout: 'oops', status: 0 }) });
    assert.throws(
      () => fetchDirectMembers({ runGh: junk, team: 't' }),
      /unparsable/,
    );
  });

  test('fails on incomplete pagination', () => {
    const page = (extra) => () => ({
      stdout: JSON.stringify({
        data: {
          organization: {
            team: {
              members: {
                totalCount: 2,
                pageInfo: { hasNextPage: false, ...extra },
                nodes: [{ login: 'a' }],
              },
            },
          },
        },
      }),
      status: 0,
    });
    // totalCount 2 but one node returned
    assert.throws(
      () => fetchDirectMembers({ runGh: fakeGh({ t: page() }), team: 't' }),
      /incomplete/,
    );
    assert.throws(
      () =>
        fetchDirectMembers({
          runGh: fakeGh({ t: page({ hasNextPage: true }) }),
          team: 't',
        }),
      /incomplete/,
    );
  });
});

describe('locale-codeowners: normalizeTeams', () => {
  test('approvers exclude maintainers; both sorted case-insensitively', () => {
    assert.deepEqual(
      normalizeTeams({
        maintainers: ['ymotongpoo', 'Msksgm', 'katzchang'],
        approvers: ['ymotongpoo', 'kota-sakuma', 'Msksgm', 'kohbis'],
      }),
      {
        maintainers: ['katzchang', 'Msksgm', 'ymotongpoo'],
        approvers: ['kohbis', 'kota-sakuma'],
      },
    );
  });

  test('the overlap match ignores login case', () => {
    assert.deepEqual(
      normalizeTeams({ maintainers: ['Alice'], approvers: ['alice', 'bob'] })
        .approvers,
      ['bob'],
    );
  });
});

describe('locale-codeowners: fetchLiveRegistry + replaceLocalesBlock', () => {
  const header = '# header\n# comments stay\n\n';
  const file =
    header +
    'locales:\n' +
    '  ja:\n    maintainers: [katzchang]\n    approvers: [kohbis, kota-sakuma]\n' +
    '  uk:\n    maintainers: []\n    approvers: []\n';
  const sync = (teams) =>
    replaceLocalesBlock(
      file,
      genLocalesBlock(
        fetchLiveRegistry({ runGh: fakeGh(teams), locales: ['uk', 'ja'] }),
      ),
    );
  const base = {
    'docs-ja-maintainers': ['katzchang'],
    'docs-ja-approvers': ['katzchang', 'kohbis', 'kota-sakuma'],
    'docs-uk-maintainers': [],
    'docs-uk-approvers': [],
  };

  test('no drift leaves the file byte-identical (maintainers repeated in approvers)', () => {
    assert.equal(sync(base), file);
  });

  test('addition', () => {
    const out = sync({
      ...base,
      'docs-uk-approvers': ['newbie'],
    });
    assert.ok(
      out.includes('  uk:\n    maintainers: []\n    approvers: [newbie]\n'),
    );
    assert.ok(out.startsWith(header));
  });

  test('removal', () => {
    const out = sync({
      ...base,
      'docs-ja-approvers': ['katzchang', 'kohbis'],
    });
    assert.ok(out.includes('approvers: [kohbis]\n'));
  });

  test('role move: approver promoted to maintainer', () => {
    const out = sync({
      ...base,
      'docs-ja-maintainers': ['katzchang', 'kohbis'],
      'docs-ja-approvers': ['katzchang', 'kohbis', 'kota-sakuma'],
    });
    assert.ok(out.includes('maintainers: [katzchang, kohbis]\n'));
    assert.ok(out.includes('approvers: [kota-sakuma]\n'));
  });

  test('a fetch failure produces nothing', () => {
    const { 'docs-uk-approvers': _, ...missing } = base;
    assert.throws(() => sync(missing), /docs-uk-approvers/);
  });

  test('output passes registry validation', () => {
    const live = fetchLiveRegistry({
      runGh: fakeGh({ ...base, 'docs-ja-maintainers': ['Zed', 'amy'] }),
      locales: ['ja', 'uk'],
    });
    assert.deepEqual(validateRegistry(live), []);
  });

  test('quotes logins that YAML would coerce', () => {
    const block = genLocalesBlock({
      locales: { ja: { maintainers: ['null', '12345'], approvers: ['ok-1'] } },
    });
    assert.ok(block.includes('maintainers: ["null", "12345"]'));
    assert.ok(block.includes('approvers: [ok-1]'));
  });

  test('replaceLocalesBlock rejects unexpected layouts', () => {
    assert.throws(() => replaceLocalesBlock('# nothing', 'x'), /locales/);
    assert.throws(
      () => replaceLocalesBlock('locales:\n  a: 1\nother: 2\n', 'x'),
      /after/,
    );
  });
});
