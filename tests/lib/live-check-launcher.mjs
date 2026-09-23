#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { LIVE_CHECK_BASE_URL_ENV } from './live-check-base.mjs';

function resolveChosenBase(rawArgs) {
  const positional = rawArgs.filter((a) => a !== '-h' && a !== '--help');
  if (positional.length > 1) {
    throw new Error('error: at most one BASE argument is allowed.');
  }

  const chosen = positional[0]?.trim() || 'https://opentelemetry.io';
  return /^\d+$/.test(chosen)
    ? `https://deploy-preview-${chosen}--opentelemetry.netlify.app`
    : chosen;
}

export function runLiveCheckLauncher({
  rawArgs,
  command,
  label,
  testFile,
  examples = [],
}) {
  if (rawArgs.some((a) => a === '-h' || a === '--help')) {
    const exampleText =
      examples.length > 0
        ? `\nExamples:\n${examples.map((ex) => `  ${ex}`).join('\n')}\n`
        : '\n';
    console.error(`${label} - live checks against a deployed host.

Usage:
  ${command} [-h | --help]
  ${command} [URL | PR_NUMBER]

URL defaults to https://opentelemetry.io when no argument is provided.
PR numbers are interpreted as Netlify preview numbers and converted to:

  https://deploy-preview-<N>--opentelemetry.netlify.app

Other URLs are passed through unchanged.${exampleText}`);
    process.exit(0);
  }

  let raw;
  try {
    raw = resolveChosenBase(rawArgs);
  } catch (error) {
    console.error(`${error.message}\n`);
    process.exit(1);
  }

  console.error(`[live-check] ${raw}`);

  const result = spawnSync(process.execPath, ['--test', testFile], {
    env: { ...process.env, [LIVE_CHECK_BASE_URL_ENV]: raw },
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }
  process.exit(result.status === 0 ? 0 : (result.status ?? 1));
}
