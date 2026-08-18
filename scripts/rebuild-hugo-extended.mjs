// Retrying wrapper around `npm rebuild hugo-extended`: the rebuild fetches
// the pinned Hugo binary from GitHub releases on every clean install, and
// transient fetch failures ("Hugo installation failed" / "TypeError: fetch
// failed") otherwise fail whole Netlify deploys. Refuses hugo-extended
// installer env overrides so the rebuild stays pinned.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

export const RETRY_DELAYS_SECONDS = [0, 2, 5, 10];
export const UNSAFE_HUGO_ENV = [
  'HUGO_BIN_PATH',
  'HUGO_FORCE_STANDARD',
  'HUGO_MIRROR_BASE_URL',
  'HUGO_NO_EXTENDED',
  'HUGO_OVERRIDE_VERSION',
  'HUGO_SKIP_CHECKSUM',
  'HUGO_SKIP_DOWNLOAD',
  'HUGO_SKIP_VERIFY',
];

// Deterministic misconfigurations must not consume the retry budget: an
// unset, whitespace-only, or nonexistent npm CLI path fails on the first
// attempt.
const npmCliPath = (env) => {
  const cliPath = env.npm_execpath?.trim();
  return cliPath && fs.existsSync(cliPath) ? cliPath : undefined;
};

export function runNpmRebuild({
  env = process.env,
  error = console.error,
  spawn = spawnSync,
} = {}) {
  // Trimmed: a whitespace-only value is as deterministic a failure as a
  // missing one, and must not consume the retry budget.
  const npmExecPath = npmCliPath(env);
  if (!npmExecPath) {
    error('npm_execpath is unavailable; run this helper through npm');
    return 1;
  }

  // Use npm's JavaScript CLI directly so no command shell is involved.
  const result = spawn(
    process.execPath,
    [npmExecPath, 'rebuild', 'hugo-extended', '--ignore-scripts=false'],
    { env, stdio: 'inherit' },
  );
  if (result.error) {
    error(`Unable to start the Hugo rebuild: ${result.error.message}`);
  }
  // Report terminations so a killed attempt is never silent; it stays
  // retryable: an attempt-scoped kill (e.g. the OOM killer picking the npm
  // child) is as recoverable as a failed fetch, and a build cancellation
  // signals this wrapper too.
  if (result.signal) {
    error(`The Hugo rebuild attempt was terminated by ${result.signal}`);
  }
  return result.status ?? 1;
}

export async function rebuildHugoExtended({
  env = process.env,
  error = console.error,
  log = console.log,
  run,
  wait = (delay) => sleep(delay * 1000),
} = {}) {
  // Canonical-name lookups suffice on Windows: process.env access is
  // case-insensitive there (Node semantics), the same folding the
  // installer sees. Empty string matches the installer's falsy handling.
  for (const name of UNSAFE_HUGO_ENV) {
    if ((env[name] ?? '') !== '') {
      error(`${name} must be unset for the pinned Hugo rebuild`);
      return 1;
    }
  }

  const rebuild = run ?? (() => runNpmRebuild({ env, error }));
  if (!run && !npmCliPath(env)) {
    // Fail before the retry loop: a missing npm CLI path is deterministic.
    return rebuild();
  }
  const attemptCount = RETRY_DELAYS_SECONDS.length;
  // Retries are cause-blind by design: classifying npm/installer output is
  // brittle, and the bounded budget adds at most ~17s to a failing build.
  for (const [index, delay] of RETRY_DELAYS_SECONDS.entries()) {
    if (delay > 0) {
      log(`Retrying Hugo install in ${delay}s...`);
      await wait(delay);
    }

    log(`Hugo install attempt ${index + 1}/${attemptCount}`);
    if (rebuild() === 0) return 0;
  }

  error(`Hugo install failed after ${attemptCount} attempts`);
  return 1;
}

// Realpaths on both sides so a symlinked invocation can't silently no-op;
// importing this module never runs the rebuild. No try/catch: an
// entry-time realpath throw must crash loud, not exit 0.
const isMain =
  Boolean(process.argv[1]) &&
  fs.realpathSync(process.argv[1]) ===
    fs.realpathSync(fileURLToPath(import.meta.url));
if (isMain) process.exitCode = await rebuildHugoExtended();
