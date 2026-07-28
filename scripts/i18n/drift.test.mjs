import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';

import {
  STATUS_BASELINE_PATH,
  classifyCliArgs,
  driftPendingPages,
  driftPendingForRepo,
  driftReport,
  enCounterpartOf,
  groupByPin,
  isDriftedStatus,
  isUnpinned,
  parsePin,
  parseStatus,
  readBaseline,
  setPinInText,
  setStatusInText,
  writeBaseline,
  writeStatuses,
} from './drift.mjs';

describe('parsePin()', () => {
  it('extracts the default_lang_commit hash', () => {
    const text = '---\ntitle: X\ndefault_lang_commit: abc1234\n---\n';
    assert.deepEqual(parsePin(text), { sha: 'abc1234', patched: false });
  });

  it('recognizes the "# patched" suffix', () => {
    const text = 'default_lang_commit: abc1234 # patched\n';
    assert.deepEqual(parsePin(text), { sha: 'abc1234', patched: true });
  });

  it('treats other trailing comments as unpatched', () => {
    const text = 'default_lang_commit: abc1234 # WIP\n';
    assert.deepEqual(parsePin(text), { sha: 'abc1234', patched: false });
  });

  it('matches the key case-insensitively', () => {
    const text = 'Default_Lang_Commit: ABC1234\n';
    assert.deepEqual(parsePin(text), { sha: 'ABC1234', patched: false });
  });

  it('returns the first match when several lines match', () => {
    const text = 'default_lang_commit: 1111111\ndefault_lang_commit: 2222222\n';
    assert.equal(parsePin(text).sha, '1111111');
  });

  it('returns null when the key is absent', () => {
    assert.equal(parsePin('---\ntitle: X\n---\n'), null);
  });
});

describe('enCounterpartOf()', () => {
  it('maps a two-letter locale path to content/en', () => {
    assert.equal(
      enCounterpartOf('content/ja/docs/demo.md'),
      'content/en/docs/demo.md',
    );
  });

  it('maps a five-char locale segment (regional variants)', () => {
    assert.equal(
      enCounterpartOf('content/zh_CN/docs/demo.md'),
      'content/en/docs/demo.md',
    );
  });
});

describe('groupByPin()', () => {
  it('groups page paths by pin sha', () => {
    const pagePins = new Map([
      ['content/ja/a.md', { sha: '1111111', patched: false }],
      ['content/es/a.md', { sha: '1111111', patched: true }],
      ['content/ja/b.md', { sha: '2222222', patched: false }],
      ['content/ja/c.md', null],
    ]);
    const groups = groupByPin(pagePins);
    assert.deepEqual(
      groups.get('1111111'),
      ['content/ja/a.md', 'content/es/a.md'],
      'pages sharing a pin are grouped together',
    );
    assert.deepEqual(groups.get('2222222'), ['content/ja/b.md']);
    assert.equal(groups.size, 2, 'unpinned pages are left out of pin groups');
  });
});

describe('driftReport()', () => {
  const pin = { sha: '1111111', patched: false };

  function fakeDeps({ missingEn = [], changed = {}, throwFor = [] } = {}) {
    const calls = [];
    return {
      calls,
      enExists: (p) => !missingEn.includes(p),
      changedEnSince: async (sha) => {
        calls.push(sha);
        if (throwFor.includes(sha)) throw new Error(`bad revision '${sha}'`);
        return new Set(changed[sha] ?? []);
      },
    };
  }

  it('reports "file not found" when the EN counterpart is gone', async () => {
    const deps = fakeDeps({ missingEn: ['content/en/gone.md'] });
    const report = await driftReport(
      new Map([['content/ja/gone.md', pin]]),
      deps,
    );
    assert.equal(report.get('content/ja/gone.md').status, 'file not found');
    assert.deepEqual(deps.calls, [], 'no git call is spent on a deleted page');
  });

  it('reports "new" for a page without a pin', async () => {
    const report = await driftReport(
      new Map([['content/ja/new.md', null]]),
      fakeDeps(),
    );
    assert.equal(report.get('content/ja/new.md').status, 'new');
  });

  it('reports "drifted" when the EN counterpart changed since the pin', async () => {
    const deps = fakeDeps({ changed: { 1111111: ['content/en/a.md'] } });
    const report = await driftReport(
      new Map([
        ['content/ja/a.md', pin],
        ['content/ja/b.md', pin],
      ]),
      deps,
    );
    assert.equal(report.get('content/ja/a.md').status, 'drifted');
    assert.equal(report.get('content/ja/b.md').status, 'in-sync');
  });

  it('carries pin metadata through to the report', async () => {
    const patched = { sha: '1111111', patched: true };
    const report = await driftReport(
      new Map([['content/ja/a.md', patched]]),
      fakeDeps(),
    );
    assert.deepEqual(report.get('content/ja/a.md'), {
      status: 'in-sync',
      sha: '1111111',
      patched: true,
    });
  });

  it('queries git once per unique pin, not per page', async () => {
    const deps = fakeDeps();
    await driftReport(
      new Map([
        ['content/ja/a.md', pin],
        ['content/es/a.md', pin],
        ['content/ja/b.md', { sha: '2222222', patched: false }],
      ]),
      deps,
    );
    assert.deepEqual(deps.calls.sort(), ['1111111', '2222222']);
  });

  it('reports "error" for every page of a pin git rejects', async () => {
    const bad = { sha: 'fffffff', patched: false };
    const deps = fakeDeps({ throwFor: ['fffffff'] });
    const report = await driftReport(
      new Map([
        ['content/ja/a.md', bad],
        ['content/es/a.md', bad],
        ['content/ja/b.md', pin],
      ]),
      deps,
    );
    assert.equal(report.get('content/ja/a.md').status, 'error');
    assert.equal(report.get('content/es/a.md').status, 'error');
    assert.equal(report.get('content/ja/b.md').status, 'in-sync');
  });
});

describe('setPinInText()', () => {
  const fm = (body) => `---\ntitle: X\n${body}---\n\nBody.\n`;

  it('updates an existing pin in place', () => {
    const { text, action } = setPinInText(
      fm('default_lang_commit: 1111111\n'),
      '2222222',
    );
    assert.equal(text, fm('default_lang_commit: 2222222\n'));
    assert.equal(action, 'UPDATED');
  });

  it('drops a "# patched" marker on update (re-pin supersedes the patch)', () => {
    const { text } = setPinInText(
      fm('default_lang_commit: 1111111 # patched\n'),
      '2222222',
    );
    assert.equal(text, fm('default_lang_commit: 2222222\n'));
  });

  it('adds the pin at the end of the front matter when missing', () => {
    const { text, action } = setPinInText(fm(''), '2222222');
    assert.equal(text, fm('default_lang_commit: 2222222\n'));
    assert.equal(action, 'ADDED');
  });

  it('is a no-op when the pin already matches', () => {
    const input = fm('default_lang_commit: 2222222\n');
    const { text, action } = setPinInText(input, '2222222');
    assert.equal(text, input);
    assert.equal(action, null);
  });
});

describe('setStatusInText()', () => {
  const fm = (body) => `---\ntitle: X\n${body}---\n\nBody.\n`;
  const pinned = (rest = '') => fm(`default_lang_commit: 1111111\n${rest}`);

  it('inserts the status right after the pin line when absent', () => {
    const { text, action } = setStatusInText(pinned(), 'true');
    assert.equal(text, pinned('drifted_from_default: true\n'));
    assert.equal(action, 'ADDED');
  });

  it('preserves a "# patched" pin marker on insertion', () => {
    const input = fm('default_lang_commit: 1111111 # patched\n');
    const { text } = setStatusInText(input, 'file not found');
    assert.equal(
      text,
      fm(
        'default_lang_commit: 1111111 # patched\ndrifted_from_default: file not found\n',
      ),
    );
  });

  it('updates an existing status value in place', () => {
    const { text, action } = setStatusInText(
      pinned('drifted_from_default: file not found\n'),
      'true',
    );
    assert.equal(text, pinned('drifted_from_default: true\n'));
    assert.equal(action, 'UPDATED');
  });

  it('removes the status line when the page is in sync', () => {
    const { text, action } = setStatusInText(
      pinned('drifted_from_default: true\n'),
      false,
    );
    assert.equal(text, pinned());
    assert.equal(action, 'REMOVED');
  });

  it('is a no-op when in sync and no status is present', () => {
    const input = pinned();
    const { text, action } = setStatusInText(input, false);
    assert.equal(text, input);
    assert.equal(action, null);
  });

  it('is a no-op when the status already matches', () => {
    const input = pinned('drifted_from_default: true\n');
    const { text, action } = setStatusInText(input, 'true');
    assert.equal(text, input);
    assert.equal(action, null);
  });

  it('throws when adding a status to a page without a pin', () => {
    assert.throws(() => setStatusInText(fm(''), 'true'), /default_lang_commit/);
  });
});

describe('pages without a front-matter block', () => {
  it('setPinInText() fails loudly instead of reporting a false ADDED', () => {
    assert.throws(
      () => setPinInText('Body only.\n', '1111111'),
      /front.matter/i,
    );
  });

  it('setStatusInText() fails loudly too', () => {
    assert.throws(
      () => setStatusInText('Body only.\n', 'true'),
      /front.matter/i,
    );
  });
});

describe('isUnpinned()', () => {
  it('selects new pages and pin-less deleted-EN pages, as bash -n did', () => {
    assert.equal(isUnpinned({ status: 'new' }), true);
    assert.equal(isUnpinned({ status: 'file not found' }), true);
    assert.equal(
      isUnpinned({ status: 'file not found', sha: '1111111' }),
      false,
    );
    assert.equal(isUnpinned({ status: 'drifted', sha: '1111111' }), false);
  });
});

describe('writeStatuses()', () => {
  const fixture = (files) => {
    const root = mkdtempSync(path.join(tmpdir(), 'drift-test-'));
    for (const [p, text] of Object.entries(files)) {
      writeFileSync(path.join(root, p), text);
    }
    return root;
  };
  const pinnedPage = (rest = '') =>
    `---\ntitle: X\ndefault_lang_commit: 1111111\n${rest}---\n\nBody.\n`;

  it('skips a pin-less "file not found" page with a warning, no throw', () => {
    const root = fixture({ 'gone.md': '---\ntitle: X\n---\n\nBody.\n' });
    const report = new Map([
      ['gone.md', { status: 'file not found' }],
      ['drifted.md', { status: 'drifted', sha: '1111111' }],
    ]);
    writeFileSync(path.join(root, 'drifted.md'), pinnedPage());
    const actions = writeStatuses(root, report);
    assert.deepEqual(actions, [['drifted.md', 'ADDED']], 'pinned page written');
    assert.equal(
      readFileSync(path.join(root, 'gone.md'), 'utf8'),
      '---\ntitle: X\n---\n\nBody.\n',
      'pin-less page is left untouched',
    );
  });

  it('writes "file not found" for a pinned page whose EN is gone', () => {
    const root = fixture({ 'gone.md': pinnedPage() });
    const actions = writeStatuses(
      root,
      new Map([['gone.md', { status: 'file not found', sha: '1111111' }]]),
    );
    assert.deepEqual(actions, [['gone.md', 'ADDED']]);
    assert.match(
      readFileSync(path.join(root, 'gone.md'), 'utf8'),
      /^drifted_from_default: file not found$/m,
    );
  });
});

describe('classifyCliArgs()', () => {
  it('defaults to a bare status read', () => {
    const cli = classifyCliArgs([]);
    assert.equal(cli.noun, 'status');
    assert.equal(cli.write, false);
    assert.deepEqual(cli.paths, []);
  });

  it('treats positional args of a bare invocation as paths', () => {
    const cli = classifyCliArgs(['content/ja']);
    assert.equal(cli.noun, 'status');
    assert.deepEqual(cli.paths, ['content/ja']);
  });

  it('parses status flags', () => {
    const cli = classifyCliArgs(['status', '--new', '--check', '-q']);
    assert.deepEqual(
      { noun: cli.noun, list: cli.list, check: cli.check, quiet: cli.quiet },
      { noun: 'status', list: 'new', check: true, quiet: true },
    );
  });

  it('parses status --write with paths or --all', () => {
    assert.equal(
      classifyCliArgs(['status', '--write', 'content/ja']).write,
      true,
    );
    const cli = classifyCliArgs(['status', '--write', '--all']);
    assert.deepEqual(
      { write: cli.write, list: cli.list },
      { write: true, list: 'all' },
    );
  });

  it('refuses a tree-wide status write (no paths, no --all)', () => {
    assert.throws(() => classifyCliArgs(['status', '--write']), /tree-wide/i);
  });

  it('rejects --check with --write', () => {
    assert.throws(() =>
      classifyCliArgs(['status', '--write', '--check', 'content/ja']),
    );
  });

  it('requires paths for diff', () => {
    assert.throws(() => classifyCliArgs(['diff']), /path/i);
    const cli = classifyCliArgs(['diff', 'content/ja/a.md']);
    assert.equal(cli.noun, 'diff');
    assert.deepEqual(cli.paths, ['content/ja/a.md']);
  });

  it('classifies a bare commit as a read', () => {
    const cli = classifyCliArgs(['commit', 'content/ja']);
    assert.equal(cli.noun, 'commit');
    assert.equal(cli.write, false);
    assert.deepEqual(cli.paths, ['content/ja']);
  });

  it('classifies a hash first-positional as a write', () => {
    const cli = classifyCliArgs(['commit', 'abc1234', 'content/ja/a.md']);
    assert.deepEqual(
      { write: cli.write, hash: cli.hash, paths: cli.paths },
      { write: true, hash: 'abc1234', paths: ['content/ja/a.md'] },
    );
  });

  it('accepts the literal HEAD as the pin payload', () => {
    const cli = classifyCliArgs(['commit', 'HEAD', '--new']);
    assert.deepEqual(
      { write: cli.write, hash: cli.hash, list: cli.list },
      {
        write: true,
        hash: 'HEAD',
        list: 'new',
      },
    );
  });

  it('normalizes hash-argument case, as bash did', () => {
    assert.equal(classifyCliArgs(['commit', 'head', '--new']).hash, 'HEAD');
    assert.equal(
      classifyCliArgs(['commit', 'ABC1234', 'content/ja/a.md']).hash,
      'abc1234',
    );
  });

  it('rejects a tree-wide pin write (no paths, no --new/--all)', () => {
    assert.throws(() => classifyCliArgs(['commit', 'HEAD']), /tree-wide/i);
  });

  it('treats post-"--" args as paths, even hash-shaped ones', () => {
    const cli = classifyCliArgs(['commit', '--', 'HEAD']);
    assert.equal(cli.write, false);
    assert.deepEqual(cli.paths, ['HEAD']);
  });

  it('rejects unknown flags', () => {
    assert.throws(() => classifyCliArgs(['status', '--bogus']), /--bogus/);
  });

  it('rejects --write on nouns other than status', () => {
    assert.throws(() => classifyCliArgs(['commit', '--write']));
  });

  it('rejects flags that would silently no-op', () => {
    assert.throws(
      () => classifyCliArgs(['status', '--write', '--new']),
      /no effect/,
    );
    assert.throws(
      () => classifyCliArgs(['commit', '--check']),
      /status noun only/,
    );
  });
});

describe('front-matter scoping of write transforms', () => {
  // A page can cite the keys in its body (e.g. the localization guide's
  // examples); writers must only ever touch the front-matter block. The
  // legacy bash writer gets this wrong (per-line perl -pe clobbers body
  // occurrences too) — module behavior is the fix.
  const page = `---
title: X
default_lang_commit: 1111111
drifted_from_default: true
---

Example:

\`\`\`yaml
default_lang_commit: 2222222
drifted_from_default: true
\`\`\`
`;

  it('setPinInText() leaves body occurrences of the key alone', () => {
    const { text } = setPinInText(page, '3333333');
    assert.match(text, /^default_lang_commit: 3333333$/m);
    assert.match(text, /^default_lang_commit: 2222222$/m);
  });

  it('setStatusInText() updates only the front-matter status', () => {
    const { text } = setStatusInText(page, 'file not found');
    assert.match(text, /^drifted_from_default: file not found$/m);
    assert.match(text, /^drifted_from_default: true$/m);
  });

  it('setStatusInText() removes only the front-matter status', () => {
    const { text } = setStatusInText(page, false);
    assert.doesNotMatch(text, /^drifted_from_default: true\ndrifted/m);
    assert.match(text, /^drifted_from_default: true$/m);
  });
});

describe('body-only key occurrences', () => {
  const page = `---
title: X
default_lang_commit: 1111111
---

\`\`\`yaml
drifted_from_default: true
\`\`\`
`;

  it('setStatusInText() adds to the front matter, not before the body match', () => {
    const { text, action } = setStatusInText(page, 'true');
    assert.equal(action, 'ADDED');
    assert.match(
      text,
      /^default_lang_commit: 1111111\ndrifted_from_default: true$/m,
      'status is inserted right after the front-matter pin',
    );
  });

  it('setStatusInText() treats a body-only status as absent on removal', () => {
    const { action } = setStatusInText(page, false);
    assert.equal(action, null);
  });
});

describe('parseStatus() / isDriftedStatus()', () => {
  const page = (status) => `---
title: X
default_lang_commit: 1111111
${status ? `drifted_from_default: ${status}\n` : ''}---

Body.
`;

  it('returns the stored status value', () => {
    assert.equal(parseStatus(page('true')), 'true');
    assert.equal(parseStatus(page('file not found')), 'file not found');
  });

  it('returns null when the status is absent', () => {
    assert.equal(parseStatus(page()), null);
  });

  it('ignores body-only occurrences of the key', () => {
    const text = `---
title: X
---

\`\`\`yaml
drifted_from_default: true
\`\`\`
`;
    assert.equal(parseStatus(text), null);
  });

  it('one predicate covers drifted and deleted-EN pages alike', () => {
    assert.equal(isDriftedStatus('true'), true);
    assert.equal(isDriftedStatus('file not found'), true);
    assert.equal(isDriftedStatus(null), false);
  });
});

describe('driftPendingPages()', () => {
  const locales = ['bn', 'ja', 'zh'];
  const existing = new Set([
    'content/ja/docs/demo/index.md',
    'content/zh/docs/demo/index.md',
    'content/ja/docs/collector.md',
  ]);
  const pageExists = (p) => existing.has(p);

  it('maps changed EN pages to their existing locale copies', () => {
    assert.deepEqual(
      driftPendingPages(['content/en/docs/demo/index.md'], locales, pageExists),
      ['content/ja/docs/demo/index.md', 'content/zh/docs/demo/index.md'],
    );
  });

  it('a deleted EN page still covers its existing locale copies', () => {
    // The EN page no longer exists; only the locale copies do.
    assert.deepEqual(
      driftPendingPages(['content/en/docs/collector.md'], locales, pageExists),
      ['content/ja/docs/collector.md'],
    );
  });

  it('a locale copy itself changed since the baseline stays checked', () => {
    // Activity exemption: someone is working on the copy (same-PR edit or a
    // catch-up merged since the baseline) — the checker must not skip it.
    assert.deepEqual(
      driftPendingPages(
        ['content/en/docs/demo/index.md'],
        locales,
        pageExists,
        new Set(['content/ja/docs/demo/index.md']),
      ),
      ['content/zh/docs/demo/index.md'],
    );
  });

  it('ignores non-EN and non-page paths', () => {
    assert.deepEqual(
      driftPendingPages(
        [
          'content/ja/docs/demo/index.md', // not under content/en/
          'content/en/docs/img/diagram.png', // not a page
        ],
        locales,
        pageExists,
      ),
      [],
    );
  });
});

describe('status baseline (loud-failure paths)', () => {
  const gitRepo = () => {
    const root = mkdtempSync(path.join(tmpdir(), 'drift-baseline-test-'));
    const git = (...args) =>
      execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');
    mkdirSync(path.join(root, 'content/en/docs'), { recursive: true });
    writeFileSync(path.join(root, 'content/en/docs/a.md'), '# a\n');
    git('add', '.');
    git('commit', '-q', '-m', 'init');
    return { root, git };
  };
  const writeBaselineFile = (root, sha) => {
    mkdirSync(path.dirname(path.join(root, STATUS_BASELINE_PATH)), {
      recursive: true,
    });
    writeFileSync(path.join(root, STATUS_BASELINE_PATH), `commit: ${sha}\n`);
  };

  it('readBaseline() throws when the baseline file is missing', () => {
    const { root } = gitRepo();
    assert.throws(() => readBaseline(root), new RegExp(STATUS_BASELINE_PATH));
  });

  it('readBaseline() throws on a malformed baseline value', () => {
    const { root } = gitRepo();
    writeBaselineFile(root, 'not-a-sha');
    assert.throws(() => readBaseline(root), /baseline/i);
  });

  it('the baseline file is named for the l10n-drift concern and is YAML', () => {
    // Hugo parses every file under data/ as site data: the path must be
    // a format Hugo can unmarshal (a bare-SHA .txt fails the site build).
    assert.match(STATUS_BASELINE_PATH, /^data\/l10n-drift\.yaml$/);
  });

  it('readBaseline() returns the recorded SHA', () => {
    const { root, git } = gitRepo();
    const sha = git('rev-parse', 'HEAD');
    writeBaselineFile(root, sha);
    assert.equal(readBaseline(root), sha);
  });

  it('driftPendingForRepo() throws on an unresolvable baseline SHA', async () => {
    // A too-shallow clone must fail the config generation loudly: a silent
    // empty overlay would false-green drift-pending pages.
    const { root } = gitRepo();
    writeBaselineFile(root, 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef');
    await assert.rejects(driftPendingForRepo(root));
  });

  it('driftPendingForRepo() reports locale copies of EN pages changed since the baseline', async () => {
    const { root, git } = gitRepo();
    mkdirSync(path.join(root, 'content/ja/docs'), { recursive: true });
    writeFileSync(path.join(root, 'content/ja/docs/a.md'), '# a-ja\n');
    git('add', '.');
    git('commit', '-q', '-m', 'add ja copy');
    writeBaselineFile(root, git('rev-parse', 'HEAD'));
    writeFileSync(path.join(root, 'content/en/docs/a.md'), '# a v2\n');
    assert.deepEqual(await driftPendingForRepo(root), ['content/ja/docs/a.md']);
  });

  it("writeBaseline() records main's HEAD in the baseline file", async () => {
    const { root, git } = gitRepo();
    mkdirSync(path.dirname(path.join(root, STATUS_BASELINE_PATH)), {
      recursive: true,
    });
    const sha = await writeBaseline(root);
    assert.equal(sha, git('rev-parse', 'main'));
    assert.equal(readBaseline(root), sha);
  });

  it('driftPendingForRepo() exempts locale copies changed since the baseline', async () => {
    const { root, git } = gitRepo();
    mkdirSync(path.join(root, 'content/ja/docs'), { recursive: true });
    writeFileSync(path.join(root, 'content/ja/docs/a.md'), '# a-ja\n');
    git('add', '.');
    git('commit', '-q', '-m', 'add ja copy');
    writeBaselineFile(root, git('rev-parse', 'HEAD'));
    writeFileSync(path.join(root, 'content/en/docs/a.md'), '# a v2\n');
    writeFileSync(path.join(root, 'content/ja/docs/a.md'), '# a-ja v2\n');
    assert.deepEqual(await driftPendingForRepo(root), []);
  });
});
