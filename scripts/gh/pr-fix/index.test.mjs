// Tests for the `/fix` PR-comment directive parser.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  DIRECTIVE_HINT,
  FIX_ALL_COMPAT_MESSAGE,
  FIX_REFCACHE_COMPAT_MESSAGE,
  INVALID_DIRECTIVE_MESSAGE,
  parseFixDirective,
} from './index.mjs';

describe('parseFixDirective', () => {
  test('the invalid-directive message includes the directive hint', () => {
    assert.ok(INVALID_DIRECTIVE_MESSAGE.includes(DIRECTIVE_HINT));
  });

  test('bare /fix runs the fix script', () => {
    assert.deepEqual(parseFixDirective('/fix'), {
      valid: true,
      actionName: 'fix',
      command: 'fix',
    });
  });

  test('/fix:<name> runs the matching script', () => {
    assert.deepEqual(parseFixDirective('/fix:link-cache'), {
      valid: true,
      actionName: 'fix:link-cache',
      command: 'fix:link-cache',
    });
  });

  test('multi-segment directive is preserved', () => {
    assert.deepEqual(parseFixDirective('/fix:i18n:status'), {
      valid: true,
      actionName: 'fix:i18n:status',
      command: 'fix:i18n:status',
    });
  });

  test('/fix:all maps to fix with a compat message', () => {
    assert.deepEqual(parseFixDirective('/fix:all'), {
      valid: true,
      actionName: 'fix:all',
      command: 'fix',
      info: FIX_ALL_COMPAT_MESSAGE,
    });
  });

  test('/fix:ALL still runs the literal fix:all script', () => {
    assert.deepEqual(parseFixDirective('/fix:ALL'), {
      valid: true,
      actionName: 'fix:ALL',
      command: 'fix:all',
    });
  });

  test('/fix:refcache still runs the fix:refcache script, with a deprecation notice', () => {
    // The command stays `fix:refcache` (not `fix:link-cache`) because the
    // resolved script runs on the PR head, and pre-rename heads only have
    // `fix:refcache`; post-rename package.json keeps a forwarding alias.
    assert.deepEqual(parseFixDirective('/fix:refcache'), {
      valid: true,
      actionName: 'fix:refcache',
      command: 'fix:refcache',
      info: FIX_REFCACHE_COMPAT_MESSAGE,
    });
  });

  test('the fix:refcache forwarding alias survives in package.json', () => {
    // Guards the pair: as long as the directive above resolves to the
    // deprecated script name, package.json must keep forwarding it.
    const pkg = JSON.parse(
      fs.readFileSync(new URL('../../../package.json', import.meta.url)),
    );
    assert.equal(pkg.scripts['fix:refcache'], 'npm run fix:link-cache');
  });

  test('directive on the first line may be followed by free-form text', () => {
    const body = ['/fix:format', '', 'CI flagged prettier, retrying.'].join(
      '\n',
    );
    assert.deepEqual(parseFixDirective(body), {
      valid: true,
      actionName: 'fix:format',
      command: 'fix:format',
    });
  });

  test('trailing whitespace/newline after the directive is accepted', () => {
    assert.equal(parseFixDirective('/fix \n').valid, true);
  });

  for (const bad of [
    '',
    'fix',
    '/fixup',
    '/fix please',
    'please /fix',
    '/fix:',
    '/fix:bad name',
    '/build',
    // Directives not on the first line are rejected.
    'Thanks for the patch!\n/fix:format',
    '/fix please\n/fix',
  ]) {
    test(`rejects invalid directive: ${JSON.stringify(bad)}`, () => {
      assert.deepEqual(parseFixDirective(bad), {
        valid: false,
        error: INVALID_DIRECTIVE_MESSAGE,
      });
    });
  }

  test('handles undefined input', () => {
    assert.equal(parseFixDirective(undefined).valid, false);
  });
});
