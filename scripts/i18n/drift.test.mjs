import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  driftReport,
  enCounterpartOf,
  groupByPin,
  parsePin,
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
