#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { runLiveCheckLauncher } from '../../../tests/lib/live-check-launcher.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const testFile = path.join(dir, 'live-check.test.mjs');
runLiveCheckLauncher({
  rawArgs: process.argv.slice(2),
  command: 'node netlify/edge-functions/asset-tracking/live-check.mjs',
  label: 'Asset tracking',
  testFile,
});
