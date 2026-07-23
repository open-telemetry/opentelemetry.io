// Unit tests for the filename checks, plus repo-wide sanity guards: the
// scanned directories must exist (so the check can't silently pass by
// scanning nothing) and every obsolete-path entry must carry guidance.

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  OBSOLETE_PATHS,
  SCAN_DIRS,
  escapeAnnotation,
  findBadFilenames,
  findObsoletePaths,
  fixViolations,
  isBadName,
} from './index.mjs';

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));

describe('isBadName', () => {
  test('flags names containing underscores', () => {
    assert.ok(isBadName('getting_started.md'));
    assert.ok(isBadName('my_dir'));
  });

  test('allows kebab-case names', () => {
    assert.ok(!isBadName('getting-started.md'));
    assert.ok(!isBadName('img.png'));
  });

  test('allows _- and .-prefixed names', () => {
    assert.ok(!isBadName('_index.md'));
    assert.ok(!isBadName('__init__.py'));
    assert.ok(!isBadName('.git_ignore-ish'));
  });
});

describe('temp-fixture checks', () => {
  let cwd;

  before(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'filenames-test-'));
    fs.mkdirSync(path.join(cwd, 'content/a_b'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'content/a_b/c_d.md'), '');
    fs.writeFileSync(path.join(cwd, 'content/a_b/_index.md'), '');
    fs.mkdirSync(path.join(cwd, 'static'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'static/refcache.json'), '{}');
    fs.mkdirSync(path.join(cwd, 'tools'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'tools/x.txt'), '');
  });

  after(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  test('findBadFilenames reports files and directories, sorted', () => {
    assert.deepEqual(findBadFilenames(['content', 'static'], { cwd }), [
      'content/a_b',
      'content/a_b/c_d.md',
    ]);
  });

  test('findBadFilenames skips missing directories', () => {
    assert.deepEqual(findBadFilenames(['no-such-dir'], { cwd }), []);
  });

  test('findObsoletePaths reports only paths that exist', () => {
    const found = findObsoletePaths(OBSOLETE_PATHS, { cwd });
    assert.deepEqual(found.map((entry) => entry.path).sort(), [
      'static/refcache.json',
      'tools',
    ]);
    fs.rmSync(path.join(cwd, 'tools'), { recursive: true });
    assert.deepEqual(
      findObsoletePaths(OBSOLETE_PATHS, { cwd }).map((entry) => entry.path),
      ['static/refcache.json'],
    );
  });

  test('fixViolations deletes obsolete paths and renames deepest-first', () => {
    const logs = [];
    fixViolations({
      badNames: findBadFilenames(['content'], { cwd }),
      obsolete: findObsoletePaths(OBSOLETE_PATHS, { cwd }),
      cwd,
      log: (message) => logs.push(message),
    });

    assert.ok(!fs.existsSync(path.join(cwd, 'static/refcache.json')));
    assert.ok(fs.existsSync(path.join(cwd, 'content/a-b/c-d.md')));
    assert.ok(fs.existsSync(path.join(cwd, 'content/a-b/_index.md')));
    assert.ok(!fs.existsSync(path.join(cwd, 'content/a_b')));
    assert.equal(logs.length, 3, 'one log line per fixed violation');

    assert.deepEqual(findBadFilenames(['content'], { cwd }), []);
    assert.deepEqual(findObsoletePaths(OBSOLETE_PATHS, { cwd }), []);
  });
});

describe('escapeAnnotation', () => {
  test('escapes %, CR, and LF', () => {
    assert.equal(escapeAnnotation('a%b\r\nc'), 'a%25b%0D%0Ac');
  });

  test('leaves URLs intact', () => {
    const url = 'https://github.com/open-telemetry/opentelemetry.io/issues/1';
    assert.equal(escapeAnnotation(url), url);
  });
});

describe('repo-wide sanity', () => {
  test('every scanned directory exists at the repo root', () => {
    for (const dir of SCAN_DIRS) {
      assert.ok(
        fs.existsSync(path.join(repoRoot, dir)),
        `scan root ${dir}/ exists`,
      );
    }
  });

  test('every obsolete-path entry carries guidance', () => {
    assert.ok(OBSOLETE_PATHS.length > 0, 'obsolete-path list is non-empty');
    for (const { path: p, message } of OBSOLETE_PATHS) {
      assert.ok(p && !p.startsWith('/'), `path is repo-relative: ${p}`);
      assert.match(
        message,
        /#\d+|https:\/\//,
        `message for ${p} references an issue, PR, or URL`,
      );
    }
  });
});
