#!/usr/bin/env node
/**
 * Launcher for live integration tests (`live-check.test.mjs` via `node:test`).
 * Passes the resolved base URL into the child process environment (argv after
 * `node --test` is not visible to test files).
 *
 * Not run by `npm run test:edge-functions` (that command only runs `*.test.ts`
 * files).
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Env key used only between this launcher and `live-check.test.mjs`. */
const LIVE_CHECK_BASE_URL_ENV = 'LIVE_CHECK_BASE_URL';

function usage() {
  const cmd = 'node netlify/edge-functions/schema-analytics/live-check.mjs';
  console.error(`Schema analytics - live checks against a deployed host.

Usage:
  ${cmd} [-h | --help]
  ${cmd} [URL | PR_NUMBER]

URL defaults to https://opentelemetry.io when no argument is provided.
PR numbers are interpreted as Netlify preview numbers and converted to:

  https://deploy-preview-<N>--opentelemetry.netlify.app

Other URLs are passed through unchanged.

Examples:
  node netlify/edge-functions/schema-analytics/live-check.mjs
  node netlify/edge-functions/schema-analytics/live-check.mjs 9603
  node netlify/edge-functions/schema-analytics/live-check.mjs http://localhost:8888
`);
}

const rawArgs = process.argv.slice(2);
if (rawArgs.some((a) => a === '-h' || a === '--help')) {
  usage();
  process.exit(0);
}

const positional = rawArgs.filter((a) => a !== '-h' && a !== '--help');
if (positional.length > 1) {
  console.error('error: at most one BASE argument is allowed.\n');
  usage();
  process.exit(1);
}

const chosen = positional[0]?.trim() || 'https://opentelemetry.io';

const raw = /^\d+$/.test(chosen)
  ? `https://deploy-preview-${chosen}--opentelemetry.netlify.app`
  : chosen;

console.error(`[live-check] ${raw}`);

const dir = path.dirname(fileURLToPath(import.meta.url));
const testFile = path.join(dir, 'live-check.test.mjs');
const result = spawnSync(process.execPath, ['--test', testFile], {
  env: { ...process.env, [LIVE_CHECK_BASE_URL_ENV]: raw },
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}
process.exit(result.status === 0 ? 0 : (result.status ?? 1));
