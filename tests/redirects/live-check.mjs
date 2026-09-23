#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { runLiveCheckLauncher } from '../lib/live-check-launcher.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const testFile = path.join(dir, 'live-check.test.mjs');

runLiveCheckLauncher({
  rawArgs: process.argv.slice(2),
  command: 'node tests/redirects/live-check.mjs',
  label: 'Redirects',
  testFile,
  examples: [
    'node tests/redirects/live-check.mjs',
    'node tests/redirects/live-check.mjs 9632',
    'node tests/redirects/live-check.mjs http://localhost:8888',
  ],
});
