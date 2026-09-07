// Tests for the scoped drift-state guard: page selection (pure) and the
// guard's verdict over a fixture git repo (base branch + PR-style edits).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';

import { guardDriftState, selectLocalizedPages } from './drift-pr-guard.mjs';

describe('selectLocalizedPages()', () => {
  it('keeps only non-EN content .md pages', () => {
    assert.deepEqual(
      selectLocalizedPages([
        'content/ja/docs/a.md',
        'content/en/docs/a.md', // EN
        'content/zh/docs/img.png', // not a page
        'scripts/i18n/drift.mjs', // not content
        'content/es/blog/b.md',
      ]),
      ['content/ja/docs/a.md', 'content/es/blog/b.md'],
    );
  });
});

describe('guardDriftState() over a fixture repo', () => {
  // A repo whose main branch has an EN page and a pinned, in-sync ja copy;
  // returns helpers to make PR-style edits on a branch.
  const gitRepo = () => {
    const root = mkdtempSync(path.join(tmpdir(), 'drift-guard-test-'));
    const git = (...args) =>
      execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    const write = (rel, text) => {
      mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      writeFileSync(path.join(root, rel), text);
    };
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');
    write('content/en/docs/a.md', '---\ntitle: A\n---\n\nBody.\n');
    git('add', '.');
    git('commit', '-q', '-m', 'en page');
    const pin = git('rev-parse', 'HEAD');
    write(
      'content/ja/docs/a.md',
      `---\ntitle: A-ja\ndefault_lang_commit: ${pin}\n---\n\nBody.\n`,
    );
    git('add', '.');
    git('commit', '-q', '-m', 'ja copy');
    git('branch', 'base');
    return {
      root,
      git,
      write,
      cleanup: () => rmSync(root, { recursive: true, force: true }),
    };
  };

  it('passes when no localized page changed', async () => {
    const { root, git, write, cleanup } = gitRepo();
    try {
      write('content/en/docs/a.md', '---\ntitle: A\n---\n\nEdited.\n');
      git('commit', '-qam', 'EN-only edit');
      const { pages, actions } = await guardDriftState(root, 'base');
      assert.equal(pages.length, 0, 'no localized page is selected');
      assert.equal(actions.length, 0, 'nothing to correct');
    } finally {
      cleanup();
    }
  });

  it('passes when an edited copy keeps an accurate state', async () => {
    const { root, git, write, cleanup } = gitRepo();
    try {
      // Edit the ja copy only: EN unchanged since the pin, so in-sync
      // without a status is accurate.
      write(
        'content/ja/docs/a.md',
        `---\ntitle: A-ja\ndefault_lang_commit: ${git('rev-parse', 'HEAD~1')}\n---\n\nEdited body.\n`,
      );
      git('commit', '-qam', 'ja edit');
      const { pages, actions } = await guardDriftState(root, 'base');
      assert.equal(pages.length, 1, 'the edited copy is guarded');
      assert.equal(actions.length, 0, 'its drift state is accurate');
    } finally {
      cleanup();
    }
  });

  it('fails when an edited copy hides its drift', async () => {
    const { root, git, write, cleanup } = gitRepo();
    try {
      // EN changes, then the copy is edited without recording the drift.
      write('content/en/docs/a.md', '---\ntitle: A\n---\n\nEN edited.\n');
      git('commit', '-qam', 'EN edit');
      write(
        'content/ja/docs/a.md',
        readFileSync(path.join(root, 'content/ja/docs/a.md'), 'utf8') +
          '\nMore.\n',
      );
      git('commit', '-qam', 'ja edit without status');
      const { actions } = await guardDriftState(root, 'base');
      assert.equal(actions.length, 1, 'the hidden drift is corrected');
      assert.equal(actions[0][0], 'content/ja/docs/a.md', 'on the edited copy');
      assert.equal(actions[0][1], 'ADDED', 'a drifted status is added');
    } finally {
      cleanup();
    }
  });

  it('corrects a stale status on a synced copy', async () => {
    const { root, git, write, cleanup } = gitRepo();
    try {
      // The copy catches up (pin -> HEAD) but leaves a stale drifted status.
      write('content/en/docs/a.md', '---\ntitle: A\n---\n\nEN edited.\n');
      git('commit', '-qam', 'EN edit');
      write(
        'content/ja/docs/a.md',
        `---\ntitle: A-ja\ndefault_lang_commit: ${git('rev-parse', 'HEAD')}\ndrifted_from_default: true\n---\n\nSynced body.\n`,
      );
      git('commit', '-qam', 'ja catch-up with stale status');
      const { actions } = await guardDriftState(root, 'base');
      assert.equal(actions.length, 1, 'the stale status is corrected');
      assert.equal(actions[0][1], 'REMOVED', 'the status is removed');
    } finally {
      cleanup();
    }
  });

  it('ignores deleted copies', async () => {
    const { root, git, cleanup } = gitRepo();
    try {
      git('rm', '-q', 'content/ja/docs/a.md');
      git('commit', '-qm', 'delete ja copy');
      const { pages } = await guardDriftState(root, 'base');
      assert.equal(pages.length, 0, 'a deleted copy carries no state to guard');
    } finally {
      cleanup();
    }
  });
});
