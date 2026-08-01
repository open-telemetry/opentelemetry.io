#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { runLiveCheckLauncher } from '../../../tests/lib/live-check-launcher.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const testFile = path.join(dir, 'live-check.test.mjs');
runLiveCheckLauncher({
  rawArgs: process.argv.slice(2),
  command:
    'node netlify/edge-functions/registry-component-redirect/live-check.mjs',
  label: 'Registry component redirect',
  testFile,
  examples: [
    'node netlify/edge-functions/registry-component-redirect/live-check.mjs',
    'node netlify/edge-functions/registry-component-redirect/live-check.mjs 9603',
    'node netlify/edge-functions/registry-component-redirect/live-check.mjs http://localhost:8888',
  ],
});
