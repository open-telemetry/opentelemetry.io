// Tests for the version-picking pipeline:
//   bumpMinor → extractVersionFromBranches → computeIntegrationVersion

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  bumpMinor,
  computeIntegrationVersion,
  extractVersionFromBranches,
} from './index.mjs';

const PREFIX = 'otelbot/spec-integration';
const noLog = () => {};

describe('pick-branch: version pipeline', () => {
  test('extractVersionFromBranches: no matching branch -> empty string', () => {
    const branches = `
  origin/HEAD -> origin/main
  origin/main
  origin/some-other-branch
`;
    assert.equal(extractVersionFromBranches(branches, PREFIX), '');
  });

  test('extractVersionFromBranches: returns version from matching branch', () => {
    const branches = `
  origin/main
  origin/otelbot/spec-integration-v1.42.0-dev
`;
    assert.equal(extractVersionFromBranches(branches, PREFIX), 'v1.42.0');
  });

  test('extractVersionFromBranches: ignores branches without -dev suffix', () => {
    const branches = `  origin/otelbot/spec-integration-v1.42.0\n`;
    assert.equal(extractVersionFromBranches(branches, PREFIX), '');
  });

  test('extractVersionFromBranches: warns and picks latest on multiple matches', () => {
    const branches = `
  origin/otelbot/spec-integration-v1.42.0-dev
  origin/otelbot/spec-integration-v1.43.0-dev
`;
    const warnings = [];
    const result = extractVersionFromBranches(branches, PREFIX, (m) =>
      warnings.push(m),
    );
    assert.equal(result, 'v1.43.0');
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /multiple integration branches found/i);
    assert.match(warnings[0], /using latest: v1.43.0/);
  });

  test('bumpMinor: bumps minor and resets patch', () => {
    assert.equal(bumpMinor('v1.42.3'), 'v1.43.0');
    assert.equal(bumpMinor('v0.9.0'), 'v0.10.0');
    assert.equal(bumpMinor('v2.0.0-rc.1'), 'v2.1.0');
  });

  test('bumpMinor: throws on malformed tag', () => {
    assert.throws(() => bumpMinor('1.2.3'), /unexpected version/);
    assert.throws(() => bumpMinor('vX.Y.Z'), /unexpected version/);
  });

  test('compute: no integration branch -> uses bumped latest release', () => {
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: '  origin/main\n',
      isReleased: () => {
        throw new Error('isReleased should not be called');
      },
      getLatestReleaseTag: () => 'v1.42.0',
      log: noLog,
    });
    assert.deepEqual(result, {
      version: 'v1.43.0',
      branch: `${PREFIX}-v1.43.0-dev`,
      warnings: [],
      latestRelease: 'v1.42.0',
    });
  });

  test('compute: integration branch for unreleased version -> reuses it', () => {
    let getLatestCalled = false;
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `  origin/${PREFIX}-v1.42.0-dev\n`,
      isReleased: (v) => {
        assert.equal(v, 'v1.42.0');
        return false;
      },
      getLatestReleaseTag: () => {
        getLatestCalled = true;
        return 'v1.41.0';
      },
      log: noLog,
    });
    assert.equal(getLatestCalled, true);
    assert.deepEqual(result, {
      version: 'v1.42.0',
      branch: `${PREFIX}-v1.42.0-dev`,
      warnings: [],
      latestRelease: 'v1.41.0',
    });
  });

  test('compute: integration branch for already-released version -> bumps', () => {
    let getLatestCalled = false;
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `  origin/${PREFIX}-v1.42.0-dev\n`,
      isReleased: (v) => v === 'v1.42.0',
      getLatestReleaseTag: () => {
        getLatestCalled = true;
        return 'v1.42.0';
      },
      log: noLog,
    });
    assert.equal(getLatestCalled, true);
    assert.deepEqual(result, {
      version: 'v1.43.0',
      branch: `${PREFIX}-v1.43.0-dev`,
      warnings: [],
      latestRelease: 'v1.42.0',
    });
  });

  test('compute: multiple integration branches -> picks latest and records warning', () => {
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `
  origin/${PREFIX}-v1.41.0-dev
  origin/${PREFIX}-v1.42.0-dev
`,
      isReleased: () => false,
      getLatestReleaseTag: () => 'v1.40.0',
      log: noLog,
    });
    assert.equal(result.version, 'v1.42.0');
    assert.equal(result.branch, `${PREFIX}-v1.42.0-dev`);
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /Multiple integration branches found/);
    assert.match(result.warnings[0], /v1\.41\.0/);
    assert.match(result.warnings[0], /using latest: v1\.42\.0/);
  });

  test('compute: warn callback receives warnings without polluting log', () => {
    const logs = [];
    const warns = [];
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `
  origin/${PREFIX}-v1.41.0-dev
  origin/${PREFIX}-v1.42.0-dev
`,
      isReleased: () => false,
      getLatestReleaseTag: () => 'v1.40.0',
      log: (m) => logs.push(m),
      warn: (m) => warns.push(m),
    });
    assert.equal(warns.length, 1);
    assert.match(warns[0], /Multiple integration branches found/);
    // The informational "using ..." message still goes to log.
    assert.deepEqual(logs, [
      'Version v1.42.0 has not been released; using v1.42.0.',
    ]);
    assert.deepEqual(result.warnings, warns);
  });

  test('compute: bubbles up malformed latest release tag', () => {
    assert.throws(
      () =>
        computeIntegrationVersion({
          branchPrefix: PREFIX,
          branchesOutput: '  origin/main\n',
          isReleased: () => false,
          getLatestReleaseTag: () => 'not-a-version',
          log: noLog,
        }),
      /unexpected version/,
    );
  });

  test('compute: log messages reflect release state', () => {
    const logs = [];
    const log = (m) => logs.push(m);

    computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `  origin/${PREFIX}-v1.42.0-dev\n`,
      isReleased: () => false,
      getLatestReleaseTag: () => 'v1.42.0',
      log,
    });
    assert.deepEqual(logs, [
      'Version v1.42.0 has not been released; using v1.42.0.',
    ]);

    logs.length = 0;
    computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `  origin/${PREFIX}-v1.42.0-dev\n`,
      isReleased: () => true,
      getLatestReleaseTag: () => 'v1.42.0',
      log,
    });
    assert.deepEqual(logs, [
      'Version v1.42.0 has already been released; bumping to v1.43.0.',
    ]);
  });
});
