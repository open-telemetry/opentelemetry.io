#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rawArgs = process.argv.slice(2);

function usage() {
  const cmd = 'node netlify/edge-functions/bin/live-check.mjs';
  console.error(`Edge Functions - combined live checks against a deployed host.

Usage:
  ${cmd} [-h | --help]
  ${cmd} [URL | PR_NUMBER]

URL defaults to https://opentelemetry.io when no argument is provided.
PR numbers are interpreted as Netlify preview numbers by each per-suite
launcher and converted to:

  https://deploy-preview-<N>--opentelemetry.netlify.app

Other URLs are passed through unchanged.

Examples:
  npm run test:edge-functions:live
  npm run test:edge-functions:live -- 9632
  npm run test:edge-functions:live -- http://localhost:8888
`);
}

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

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');

const suites = [
  {
    label: 'markdown-negotiation',
    script: path.join(root, 'markdown-negotiation', 'live-check.mjs'),
  },
  {
    label: 'asset-tracking',
    script: path.join(root, 'asset-tracking', 'live-check.mjs'),
  },
  {
    label: 'schema-analytics',
    script: path.join(root, 'schema-analytics', 'live-check.mjs'),
  },
];

const failures = [];

for (const suite of suites) {
  console.error(`\n[live-check:${suite.label}]`);
  const result = spawnSync(process.execPath, [suite.script, ...positional], {
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  const status = result.status ?? 1;
  if (status !== 0) {
    failures.push({ label: suite.label, status });
  }
}

if (failures.length === 0) {
  console.error('\n[live-check] all edge-function suites passed');
  process.exit(0);
}

console.error('\n[live-check] failing suites:');
for (const failure of failures) {
  console.error(`- ${failure.label} (exit ${failure.status})`);
}
process.exit(1);
