// Unit tests for the filename checks, plus repo-wide sanity and drift guards.

import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  OBSOLETE_PATHS,
  SCAN_DIRS,
  escapeAnnotation,
  escapeAnnotationProperty,
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
    assert.equal(
      isBadName('getting-started.md'),
      false,
      'kebab-case name is accepted',
    );
    assert.equal(isBadName('img.png'), false, 'kebab-case name is accepted');
  });

  test('allows _- and .-prefixed names', () => {
    assert.equal(isBadName('_index.md'), false, '_-prefixed name is exempt');
    assert.equal(isBadName('__init__.py'), false, '_-prefixed name is exempt');
    assert.equal(
      isBadName('.git_ignore-ish'),
      false,
      '.-prefixed name is exempt',
    );
  });
});

describe('temp-fixture checks', () => {
  let cwd;

  // A fresh fixture per test keeps the tests below order-independent.
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'filenames-test-'));
    fs.mkdirSync(path.join(cwd, 'content/a_b'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'content/a_b/c_d.md'), '');
    fs.writeFileSync(path.join(cwd, 'content/a_b/_index.md'), '');
    fs.mkdirSync(path.join(cwd, 'static'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'static/refcache.json'), '{}');
    fs.mkdirSync(path.join(cwd, 'tools'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'tools/x.txt'), '');
  });

  afterEach(() => {
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

    assert.equal(
      fs.existsSync(path.join(cwd, 'tools')),
      false,
      'obsolete tools/ is removed',
    );
    assert.equal(
      fs.existsSync(path.join(cwd, 'static/refcache.json')),
      false,
      'obsolete refcache.json is removed',
    );
    assert.ok(fs.existsSync(path.join(cwd, 'content/a-b/c-d.md')));
    assert.ok(fs.existsSync(path.join(cwd, 'content/a-b/_index.md')));
    assert.equal(
      fs.existsSync(path.join(cwd, 'content/a_b')),
      false,
      'a_b directory is renamed away',
    );
    assert.equal(logs.length, 4, 'one log line per fixed violation');

    assert.deepEqual(findBadFilenames(['content'], { cwd }), []);
    assert.deepEqual(findObsoletePaths(OBSOLETE_PATHS, { cwd }), []);
  });

  test('fixViolations refuses a rename over an existing path, mutating nothing', () => {
    fs.writeFileSync(path.join(cwd, 'content/a_b/c-d.md'), 'occupied');

    assert.throws(
      () =>
        fixViolations({
          badNames: findBadFilenames(['content'], { cwd }),
          obsolete: findObsoletePaths(OBSOLETE_PATHS, { cwd }),
          cwd,
          log: () => {},
        }),
      /refusing to rename content\/a_b\/c_d\.md: content\/a_b\/c-d\.md already exists/,
    );
    assert.equal(
      fs.existsSync(path.join(cwd, 'tools')),
      true,
      'obsolete tools/ is untouched',
    );
    assert.equal(
      fs.existsSync(path.join(cwd, 'static/refcache.json')),
      true,
      'obsolete refcache.json is untouched',
    );
    assert.equal(
      fs.existsSync(path.join(cwd, 'content/a-b')),
      false,
      'a_b directory keeps its name',
    );
    assert.ok(fs.existsSync(path.join(cwd, 'content/a_b/c_d.md')));
    assert.equal(
      fs.readFileSync(path.join(cwd, 'content/a_b/c-d.md'), 'utf8'),
      'occupied',
    );
  });

  test('fixViolations refuses two renames onto the same destination', () => {
    fs.writeFileSync(path.join(cwd, 'content/a_b-c.md'), 'first');
    fs.writeFileSync(path.join(cwd, 'content/a-b_c.md'), 'second');

    assert.throws(
      () =>
        fixViolations({
          badNames: ['content/a_b-c.md', 'content/a-b_c.md'],
          cwd,
          log: () => {},
        }),
      /refusing to rename content\/a-b_c\.md: content\/a-b-c\.md is also the rename destination of another path/,
    );
    assert.equal(
      fs.readFileSync(path.join(cwd, 'content/a_b-c.md'), 'utf8'),
      'first',
      'first source is untouched',
    );
    assert.equal(
      fs.readFileSync(path.join(cwd, 'content/a-b_c.md'), 'utf8'),
      'second',
      'second source is untouched',
    );
    assert.equal(
      fs.existsSync(path.join(cwd, 'content/a-b-c.md')),
      false,
      'no rename is applied',
    );
  });

  test('findObsoletePaths reports a dangling symlink', () => {
    fs.rmSync(path.join(cwd, 'static/refcache.json'));
    fs.symlinkSync('no-such-target', path.join(cwd, 'static/refcache.json'));
    assert.deepEqual(
      findObsoletePaths(OBSOLETE_PATHS, { cwd }).map((entry) => entry.path),
      ['tools', 'static/refcache.json'],
    );
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

  test('property form also escapes : and ,', () => {
    assert.equal(escapeAnnotationProperty('a:b,c%d'), 'a%3Ab%2Cc%25d');
  });
});

describe('repo-wide sanity', () => {
  // Guards against a false-green check that silently scans nothing.
  test('every scanned directory exists at the repo root', () => {
    for (const dir of SCAN_DIRS) {
      assert.ok(
        fs.existsSync(path.join(repoRoot, dir)),
        `scan root ${dir}/ exists`,
      );
    }
  });

  test('every obsolete-path entry carries guidance', () => {
    assert.ok(OBSOLETE_PATHS.length > 0, 'obsolete-path list has entries');
    for (const { path: p, message } of OBSOLETE_PATHS) {
      assert.equal(path.posix.normalize(p), p, `path is normalized: ${p}`);
      assert.ok(
        p && !path.posix.isAbsolute(p) && p !== '..' && !p.startsWith('../'),
        `path stays within the repository: ${p}`,
      );
      assert.match(
        message,
        /#\d+|https:\/\//,
        `message for ${p} references an issue, PR, or URL`,
      );
    }
  });

  // OBSOLETE_PATHS is canonical; the docs page mirrors it for contributors.
  test('the docs page mirrors every obsolete-path entry', () => {
    const docsPage = fs.readFileSync(
      path.join(repoRoot, 'content/en/docs/contributing/pr-checks.md'),
      'utf8',
    );
    for (const { path: p, message } of OBSOLETE_PATHS) {
      assert.ok(docsPage.includes(`\`${p}`), `docs list the path ${p}`);
      for (const ref of message.match(/#\d+/g) ?? []) {
        assert.ok(
          docsPage.includes(ref),
          `docs cite ${ref}, referenced by the message for ${p}`,
        );
      }
    }
  });
});
