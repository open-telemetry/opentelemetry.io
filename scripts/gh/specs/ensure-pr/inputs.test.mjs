// Tests for readEnvInputs: strict validation of the MODE/VERSION/BRANCH
// environment values that the ensure-pr CLI consumes.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { readEnvInputs } from './index.mjs';

const SPEC = { repo: 'opentelemetry-specification', abbr: 'spec' };

const VALID_ENV = {
  MODE: 'dev',
  VERSION: 'v1.59.0',
  BRANCH: 'otelbot/spec-integration-v1.59.0-dev',
};

describe('ensure-pr: readEnvInputs', () => {
  test('accepts valid dev-mode inputs', () => {
    const inputs = readEnvInputs(VALID_ENV, SPEC);
    assert.deepEqual(inputs, {
      mode: 'dev',
      version: 'v1.59.0',
      branch: 'otelbot/spec-integration-v1.59.0-dev',
    });
  });

  test('accepts valid release-mode inputs', () => {
    const inputs = readEnvInputs({ ...VALID_ENV, MODE: 'release' }, SPEC);
    assert.equal(inputs.mode, 'release');
  });

  test('accepts a branch whose version differs from VERSION (patch release)', () => {
    // Mid-cycle patch release: branch says v1.44.0-dev, VERSION is v1.43.1.
    const inputs = readEnvInputs(
      {
        MODE: 'release',
        VERSION: 'v1.43.1',
        BRANCH: 'otelbot/semconv-integration-v1.44.0-dev',
      },
      { repo: 'semantic-conventions', abbr: 'semconv' },
    );
    assert.equal(inputs.branch, 'otelbot/semconv-integration-v1.44.0-dev');
  });

  test('rejects a missing MODE', () => {
    assert.throws(
      () => readEnvInputs({ ...VALID_ENV, MODE: undefined }, SPEC),
      /MODE/,
    );
  });

  test('rejects an unknown MODE', () => {
    assert.throws(
      () => readEnvInputs({ ...VALID_ENV, MODE: 'prod' }, SPEC),
      /MODE/,
    );
  });

  test('rejects a malformed VERSION', () => {
    assert.throws(
      () => readEnvInputs({ ...VALID_ENV, VERSION: '1.59.0' }, SPEC),
      /VERSION/,
    );
    assert.throws(
      () => readEnvInputs({ ...VALID_ENV, VERSION: 'v1.59' }, SPEC),
      /VERSION/,
    );
    assert.throws(
      () => readEnvInputs({ ...VALID_ENV, VERSION: undefined }, SPEC),
      /VERSION/,
    );
  });

  test('rejects a BRANCH not matching the integration pattern', () => {
    assert.throws(
      () => readEnvInputs({ ...VALID_ENV, BRANCH: 'main' }, SPEC),
      /BRANCH/,
    );
    assert.throws(
      () => readEnvInputs({ ...VALID_ENV, BRANCH: undefined }, SPEC),
      /BRANCH/,
    );
  });

  test("rejects a BRANCH for a different spec's abbreviation", () => {
    assert.throws(
      () =>
        readEnvInputs(
          { ...VALID_ENV, BRANCH: 'otelbot/semconv-integration-v1.59.0-dev' },
          SPEC,
        ),
      /BRANCH/,
    );
  });
});
