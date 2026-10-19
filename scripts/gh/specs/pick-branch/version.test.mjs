// Tests for the version-picking pipeline:
//   bumpMinor → extractVersionFromBranches → computeIntegrationVersion

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  bumpMinor,
  computeIntegrationVersion,
  extractVersionFromBranches,
  parsePinnedVersion,
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
      pinnedVersion: 'v1.42.0',
      isReleased: () => {
        throw new Error('isReleased should not be called');
      },
      getLatestReleaseTag: () => 'v1.42.0',
      log: noLog,
    });
    assert.deepEqual(result, {
      mode: 'dev',
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
      pinnedVersion: 'v1.41.0',
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
      mode: 'dev',
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
      pinnedVersion: 'v1.42.0',
      isReleased: (v) => v === 'v1.42.0',
      getLatestReleaseTag: () => {
        getLatestCalled = true;
        return 'v1.42.0';
      },
      log: noLog,
    });
    assert.equal(getLatestCalled, true);
    assert.deepEqual(result, {
      mode: 'dev',
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
      pinnedVersion: 'v1.40.0',
      isReleased: () => false,
      getLatestReleaseTag: () => 'v1.40.0',
      log: noLog,
    });
    assert.equal(result.mode, 'dev');
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
      pinnedVersion: 'v1.40.0',
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
          pinnedVersion: 'v1.42.0',
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
      pinnedVersion: 'v1.42.0',
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
      pinnedVersion: 'v1.42.0',
      isReleased: () => true,
      getLatestReleaseTag: () => 'v1.42.0',
      log,
    });
    assert.deepEqual(logs, [
      'Version v1.42.0 has already been released; bumping to v1.43.0.',
    ]);
  });
});

describe('pick-branch: pinned-version parsing', () => {
  test('parsePinnedVersion: plain tag pin', () => {
    assert.equal(parsePinnedVersion('v1.58.0'), 'v1.58.0');
  });

  test('parsePinnedVersion: git-describe pin -> leading tag', () => {
    assert.equal(parsePinnedVersion('v0.15.0-22-g3bcd6e7d'), 'v0.15.0');
  });

  test('parsePinnedVersion: throws on malformed pin', () => {
    assert.throws(() => parsePinnedVersion('e9411ee'), /unexpected pin/);
    assert.throws(() => parsePinnedVersion(''), /unexpected pin/);
    assert.throws(() => parsePinnedVersion(undefined), /unexpected pin/);
  });
});

describe('pick-branch: mode selection', () => {
  const isReleasedUnexpected = () => {
    throw new Error('isReleased should not be called in release mode');
  };

  test('release mode: pinned behind latest -> finalize existing branch', () => {
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `  origin/${PREFIX}-v1.59.0-dev\n`,
      pinnedVersion: 'v1.58.0',
      isReleased: isReleasedUnexpected,
      getLatestReleaseTag: () => 'v1.59.0',
      log: noLog,
    });
    assert.deepEqual(result, {
      mode: 'release',
      version: 'v1.59.0',
      branch: `${PREFIX}-v1.59.0-dev`,
      warnings: [],
      latestRelease: 'v1.59.0',
    });
  });

  test('release mode: patch release keeps existing branch name', () => {
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `  origin/${PREFIX}-v1.44.0-dev\n`,
      pinnedVersion: 'v1.43.0',
      isReleased: isReleasedUnexpected,
      getLatestReleaseTag: () => 'v1.43.1',
      log: noLog,
    });
    assert.equal(result.mode, 'release');
    assert.equal(result.version, 'v1.43.1');
    // Branch name mismatch (v1.44.0-dev vs v1.43.1) is cosmetic; keep it.
    assert.equal(result.branch, `${PREFIX}-v1.44.0-dev`);
  });

  test('release mode: major bump', () => {
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `  origin/${PREFIX}-v1.59.0-dev\n`,
      pinnedVersion: 'v1.58.0',
      isReleased: isReleasedUnexpected,
      getLatestReleaseTag: () => 'v2.0.0',
      log: noLog,
    });
    assert.equal(result.mode, 'release');
    assert.equal(result.version, 'v2.0.0');
    assert.equal(result.branch, `${PREFIX}-v1.59.0-dev`);
  });

  test('release mode: rejects malformed latest release tag', () => {
    // The tag flows into $GITHUB_ENV and thence into workflow shell steps
    // (e.g. `git reset --hard $VERSION`), so a tag crafted as an option
    // (`--upload-pack=...`) must never leave this function.
    assert.throws(
      () =>
        computeIntegrationVersion({
          branchPrefix: PREFIX,
          branchesOutput: `  origin/${PREFIX}-v1.59.0-dev\n`,
          pinnedVersion: 'v1.58.0',
          isReleased: isReleasedUnexpected,
          getLatestReleaseTag: () => 'v99.0.0--upload-pack=/tmp/x',
          log: noLog,
        }),
      /unexpected version/,
    );
  });

  test('release mode: no branch -> create branch for latest release', () => {
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: '  origin/main\n',
      pinnedVersion: 'v1.58.0',
      isReleased: isReleasedUnexpected,
      getLatestReleaseTag: () => 'v1.59.0',
      log: noLog,
    });
    assert.deepEqual(result, {
      mode: 'release',
      version: 'v1.59.0',
      branch: `${PREFIX}-v1.59.0-dev`,
      warnings: [],
      latestRelease: 'v1.59.0',
    });
  });

  test('release mode: multiple branches still warn, latest wins', () => {
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `
  origin/${PREFIX}-v1.58.0-dev
  origin/${PREFIX}-v1.59.0-dev
`,
      pinnedVersion: 'v1.58.0',
      isReleased: isReleasedUnexpected,
      getLatestReleaseTag: () => 'v1.59.0',
      log: noLog,
    });
    assert.equal(result.mode, 'release');
    assert.equal(result.version, 'v1.59.0');
    assert.equal(result.branch, `${PREFIX}-v1.59.0-dev`);
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /Multiple integration branches found/);
  });

  test('release mode: log explains the mode decision', () => {
    const logs = [];
    computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: `  origin/${PREFIX}-v1.59.0-dev\n`,
      pinnedVersion: 'v1.58.0',
      isReleased: isReleasedUnexpected,
      getLatestReleaseTag: () => 'v1.59.0',
      log: (m) => logs.push(m),
    });
    assert.equal(logs.length, 1);
    assert.match(logs[0], /release mode/i);
    assert.match(logs[0], /v1\.59\.0/);
    assert.match(logs[0], /v1\.58\.0/);
  });

  test('dev mode: git-describe pin not behind latest', () => {
    const result = computeIntegrationVersion({
      branchPrefix: PREFIX,
      branchesOutput: '  origin/main\n',
      pinnedVersion: 'v0.15.0-22-g3bcd6e7d',
      isReleased: () => false,
      getLatestReleaseTag: () => 'v0.15.0',
      log: noLog,
    });
    assert.equal(result.mode, 'dev');
    assert.equal(result.version, 'v0.16.0');
  });

  test('compute: bubbles up malformed pin', () => {
    assert.throws(
      () =>
        computeIntegrationVersion({
          branchPrefix: PREFIX,
          branchesOutput: '  origin/main\n',
          pinnedVersion: 'e9411ee',
          isReleased: () => false,
          getLatestReleaseTag: () => 'v1.59.0',
          log: noLog,
        }),
      /unexpected pin/,
    );
  });
});
