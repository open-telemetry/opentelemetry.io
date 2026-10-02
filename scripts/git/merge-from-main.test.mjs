// Exercises merge-from-main.sh over a fixture repo: a branch that edited the
// link cache merges a `main` that edited it too, in each conflict shape the
// bot branches meet.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'merge-from-main.sh',
);

const OWNED = 'link-cache.jsonc';
const CSV = '.lycheecache';

// An owned-cache file holding the given URLs, in link-cache's shape.
const owned = (...urls) =>
  '{\n' +
  urls
    .map(
      (u) =>
        `  "${u}": {\n    "result": 200,\n    "when": "2026-10-01T00:00:00Z",\n    "via": "lychee",\n  },\n`,
    )
    .join('') +
  '}\n';

describe('merge-from-main.sh', () => {
  // Fixture: `main` and `branch` diverge from a shared base commit; the test
  // body writes each side's edits. Returns helpers bound to the repo.
  const gitRepo = (baseFiles) => {
    const root = mkdtempSync(path.join(tmpdir(), 'merge-from-main-test-'));
    const git = (...args) =>
      execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    const write = (rel, text) => writeFileSync(path.join(root, rel), text);
    const read = (rel) => readFileSync(path.join(root, rel), 'utf8');
    const commitAll = (msg) => {
      git('add', '-A');
      git('commit', '-q', '-m', msg);
    };
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');
    for (const [rel, text] of Object.entries(baseFiles)) write(rel, text);
    commitAll('base');
    git('branch', 'branch');
    const githubEnv = `${root}.env`;
    writeFileSync(githubEnv, '');
    const merge = () =>
      spawnSync(script, ['main'], {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, GITHUB_ENV: githubEnv },
      });
    return {
      git,
      write,
      read,
      commitAll,
      merge,
      githubEnv: () => readFileSync(githubEnv, 'utf8'),
      has: (rel) => existsSync(path.join(root, rel)),
      cleanup: () => {
        rmSync(root, { recursive: true, force: true });
        rmSync(githubEnv, { force: true });
      },
    };
  };

  it('merges cleanly when the branch and main touch different files', () => {
    const r = gitRepo({ [OWNED]: owned('https://a.example/'), 'x.md': 'x\n' });
    try {
      r.write('x.md', 'main edit\n');
      r.commitAll('main: x');
      r.git('checkout', '-q', 'branch');
      r.write(OWNED, owned('https://a.example/', 'https://b.example/'));
      r.commitAll('branch: cache');
      const res = r.merge();
      assert.equal(res.status, 0, `exit 0\n${res.stdout}${res.stderr}`);
      assert.equal(r.read('x.md'), 'main edit\n', 'main edit merged in');
      assert.match(r.read(OWNED), /b\.example/, 'branch cache entry kept');
      assert.equal(r.githubEnv(), '', 'no self-heal flag on a clean merge');
    } finally {
      r.cleanup();
    }
  });

  it("heals a same-gap insertion conflict by taking main's cache", () => {
    const r = gitRepo({ [OWNED]: owned('https://a.example/') });
    try {
      r.write(OWNED, owned('https://a.example/', 'https://m.example/'));
      r.commitAll('main: cache');
      r.git('checkout', '-q', 'branch');
      r.write(OWNED, owned('https://a.example/', 'https://b.example/'));
      r.commitAll('branch: cache');
      const res = r.merge();
      assert.equal(res.status, 0, `exit 0\n${res.stdout}${res.stderr}`);
      assert.equal(
        r.read(OWNED),
        owned('https://a.example/', 'https://m.example/'),
        "owned cache is main's whole file",
      );
      assert.equal(r.git('status', '--porcelain'), '', 'merge committed');
      assert.match(r.githubEnv(), /^CACHE_SELF_HEALED=true$/m, 'flag set');
    } finally {
      r.cleanup();
    }
  });

  it('heals the cutover: branch still edits the CSV that main replaced', () => {
    const r = gitRepo({ [CSV]: 'https://a.example/,200,1759276800\n' });
    try {
      r.git('rm', '-q', CSV);
      r.write(OWNED, owned('https://a.example/'));
      r.commitAll('main: migrate the cache');
      r.git('checkout', '-q', 'branch');
      r.write(
        CSV,
        'https://a.example/,200,1759276800\nhttps://b.example/,200,1759276800\n',
      );
      r.commitAll('branch: cache');
      const res = r.merge();
      assert.equal(res.status, 0, `exit 0\n${res.stdout}${res.stderr}`);
      assert.equal(r.has(CSV), false, 'derived CSV dropped with main');
      assert.equal(
        r.read(OWNED),
        owned('https://a.example/'),
        "owned cache is main's",
      );
      assert.equal(r.git('status', '--porcelain'), '', 'merge committed');
      assert.match(r.githubEnv(), /^CACHE_SELF_HEALED=true$/m, 'flag set');
    } finally {
      r.cleanup();
    }
  });

  it('heals both cache paths at once: JSONC added on both sides, CSV cut over', () => {
    const r = gitRepo({ [CSV]: 'https://a.example/,200,1759276800\n' });
    try {
      r.git('rm', '-q', CSV);
      r.write(OWNED, owned('https://a.example/', 'https://m.example/'));
      r.commitAll('main: migrate the cache');
      r.git('checkout', '-q', 'branch');
      r.write(
        CSV,
        'https://a.example/,200,1759276800\nhttps://b.example/,200,1\n',
      );
      r.write(OWNED, owned('https://a.example/', 'https://b.example/'));
      r.commitAll('branch: cache, both files');
      const res = r.merge();
      assert.equal(res.status, 0, `exit 0\n${res.stdout}${res.stderr}`);
      assert.equal(r.has(CSV), false, 'derived CSV dropped with main');
      assert.equal(
        r.read(OWNED),
        owned('https://a.example/', 'https://m.example/'),
        "owned cache is main's",
      );
      assert.equal(r.git('status', '--porcelain'), '', 'merge committed');
    } finally {
      r.cleanup();
    }
  });

  it('fails closed when the merge itself fails without conflicts', () => {
    const r = gitRepo({ [OWNED]: owned('https://a.example/') });
    try {
      r.write(OWNED, owned('https://a.example/', 'https://m.example/'));
      r.commitAll('main: cache');
      r.git('checkout', '-q', 'branch');
      // An uncommitted edit to a file the merge must update makes git refuse.
      r.write(OWNED, owned('https://a.example/', 'https://dirty.example/'));
      const before = r.git('rev-parse', 'HEAD');
      const res = r.merge();
      assert.equal(res.status, 1, 'exit 1');
      assert.match(
        res.stdout + res.stderr,
        /::error::.*without conflicts/,
        'names the cause',
      );
      assert.equal(r.git('rev-parse', 'HEAD'), before, 'HEAD unchanged');
      assert.equal(r.githubEnv(), '', 'no self-heal flag');
    } finally {
      r.cleanup();
    }
  });

  it('leaves a wider conflict for a human', () => {
    const r = gitRepo({ [OWNED]: owned('https://a.example/'), 'x.md': 'x\n' });
    try {
      r.write(OWNED, owned('https://a.example/', 'https://m.example/'));
      r.write('x.md', 'main\n');
      r.commitAll('main: cache + x');
      r.git('checkout', '-q', 'branch');
      r.write(OWNED, owned('https://a.example/', 'https://b.example/'));
      r.write('x.md', 'branch\n');
      r.commitAll('branch: cache + x');
      const res = r.merge();
      assert.equal(res.status, 1, 'exit 1');
      assert.match(
        res.stdout + res.stderr,
        /::error::.*x\.md/,
        'names the file',
      );
      assert.match(
        r.git('status', '--porcelain'),
        /^UU x\.md$/m,
        'conflict left in place',
      );
      assert.equal(r.githubEnv(), '', 'no self-heal flag');
    } finally {
      r.cleanup();
    }
  });
});
