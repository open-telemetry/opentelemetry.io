import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BEGIN_MARKER,
  DOCS_APPROVERS,
  END_MARKER,
  genLocaleSection,
  isStaffed,
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
});
