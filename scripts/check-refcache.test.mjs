import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const repoRoot = resolve(import.meta.dirname, '..');
const script = join(repoRoot, '.github/scripts/check-refcache.sh');

function requireJq() {
  try {
    execFileSync('jq', ['--version'], { stdio: 'ignore' });
  } catch {
    return false;
  }
  return true;
}

function setupRefcachePair({ reference, shard }) {
  const dir = mkdtempSync(join(tmpdir(), 'check-refcache-'));
  mkdirSync(join(dir, 'static'), { recursive: true });
  mkdirSync(join(dir, 'tmp/check-refcache/shard/static'), { recursive: true });
  writeFileSync(
    join(dir, 'static/refcache.json'),
    JSON.stringify(reference, null, 2) + '\n',
  );
  writeFileSync(
    join(dir, 'tmp/check-refcache/shard/static/refcache.json'),
    JSON.stringify(shard, null, 2) + '\n',
  );
  return dir;
}

test(
  'check-refcache ignores JSON object key order',
  { skip: !requireJq() },
  () => {
    const cwd = setupRefcachePair({
      reference: {
        'https://example.test/b': {
          StatusCode: 200,
          LastSeen: '2026-01-02T00:00:00Z',
        },
        'https://example.test/a': {
          StatusCode: 206,
          LastSeen: '2026-01-01T00:00:00Z',
        },
      },
      shard: {
        'https://example.test/a': {
          StatusCode: 206,
          LastSeen: '2026-01-01T00:00:00Z',
        },
        'https://example.test/b': {
          StatusCode: 200,
          LastSeen: '2026-01-02T00:00:00Z',
        },
      },
    });

    const result = spawnSync(script, [], { cwd, encoding: 'utf8' });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /is identical/);
  },
);

test(
  'check-refcache still reports value differences',
  { skip: !requireJq() },
  () => {
    const cwd = setupRefcachePair({
      reference: {
        'https://example.test/a': {
          StatusCode: 200,
          LastSeen: '2026-01-01T00:00:00Z',
        },
      },
      shard: {
        'https://example.test/a': {
          StatusCode: 206,
          LastSeen: '2026-01-01T00:00:00Z',
        },
      },
    });

    const result = spawnSync(script, [], { cwd, encoding: 'utf8' });

    assert.equal(result.status, 1);
    assert.match(result.stdout, /differs/);
    assert.match(result.stdout, /StatusCode/);
  },
);
