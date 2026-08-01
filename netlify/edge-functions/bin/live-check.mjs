#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { runLiveCheckLauncher } from '../../../tests/lib/live-check-launcher.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const testFile = path.join(dir, '..', 'tests', 'live-check.test.mjs');

runLiveCheckLauncher({
  rawArgs: process.argv.slice(2),
  command: 'node netlify/edge-functions/bin/live-check.mjs',
  label: 'Edge Functions',
  testFile,
  examples: [
    'npm run test:edge-functions:live',
    'npm run test:edge-functions:live -- 9632',
    'npm run test:edge-functions:live -- http://localhost:8888',
  ],
});
