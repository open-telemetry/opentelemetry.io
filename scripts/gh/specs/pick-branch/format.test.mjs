// Tests for pure output-shaping helpers:
//   SPECS, formatGithubEnv, buildIssueBody

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { buildIssueBody, formatGithubEnv, SPECS } from './index.mjs';

describe('pick-branch: format helpers', () => {
  test('SPECS: contains otel and semconv with expected repos', () => {
    assert.deepEqual(SPECS.otel, {
      repo: 'opentelemetry-specification',
      abbr: 'spec',
    });
    assert.deepEqual(SPECS.semconv, {
      repo: 'semantic-conventions',
      abbr: 'semconv',
    });
  });

  test('formatGithubEnv: emits VERSION and BRANCH lines with trailing newline', () => {
    const out = formatGithubEnv({
      version: 'v1.42.0',
      branch: 'otelbot/spec-integration-v1.42.0-dev',
    });
    assert.equal(
      out,
      'VERSION=v1.42.0\nBRANCH=otelbot/spec-integration-v1.42.0-dev\n',
    );
    // Ensure parsing back through `key=value` round-trips cleanly.
    const parsed = Object.fromEntries(
      out
        .trim()
        .split('\n')
        .map((line) => line.split('=')),
    );
    assert.deepEqual(parsed, {
      VERSION: 'v1.42.0',
      BRANCH: 'otelbot/spec-integration-v1.42.0-dev',
    });
  });

  test('buildIssueBody: includes warnings, repo link, and run url when provided', () => {
    const body = buildIssueBody({
      warnings: ['stale branches found', 'something else'],
      repo: 'opentelemetry-specification',
      abbr: 'spec',
      runUrl: 'https://github.com/o/r/actions/runs/123',
    });
    assert.match(body, /update-spec-integration-branch/);
    assert.match(
      body,
      /\[`opentelemetry-specification`\]\(https:\/\/github\.com\/open-telemetry\/opentelemetry-specification\)/,
    );
    assert.match(body, /- stale branches found/);
    assert.match(body, /- something else/);
    assert.match(
      body,
      /Workflow run: https:\/\/github\.com\/o\/r\/actions\/runs\/123/,
    );
  });

  test('buildIssueBody: omits run url when not provided', () => {
    const body = buildIssueBody({
      warnings: ['x'],
      repo: 'semantic-conventions',
      abbr: 'semconv',
    });
    assert.doesNotMatch(body, /Workflow run:/);
  });
});
