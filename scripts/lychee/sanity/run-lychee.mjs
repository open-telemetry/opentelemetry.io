// Test helper: invoke the real lychee binary and normalize its JSON output.
// Kept separate from the tests so they stay declarative.

import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

export function lycheeAvailable() {
  try {
    execFileSync('lychee', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Runs `lychee --format json --no-progress <args>` and returns a normalized
// result. lychee exits non-zero when links fail, but still writes the JSON
// summary to stdout, so a non-zero exit is expected and not treated as a crash.
//
// `cwd` defaults to the OS temp dir so that lychee never auto-discovers the
// repo's generated `lychee.toml` (whose excludes cover loopback and would
// otherwise neutralize the external-URL tests). Pass an explicit `--config` for
// config-driven behavior.
export function runLychee(args, { cwd = tmpdir() } = {}) {
  let stdout;
  try {
    stdout = execFileSync(
      'lychee',
      ['--format', 'json', '--no-progress', ...args],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
  } catch (err) {
    if (err.stdout == null) throw err;
    stdout = err.stdout;
  }
  return normalize(JSON.parse(stdout));
}

function normalize(json) {
  const errorsByUrl = new Map();
  for (const items of Object.values(json.error_map ?? {})) {
    for (const item of items) {
      errorsByUrl.set(item.url, item.status?.text ?? '');
    }
  }
  const excludedUrls = new Set();
  for (const items of Object.values(json.excluded_map ?? {})) {
    for (const item of items) {
      excludedUrls.add(item.url);
    }
  }
  return {
    total: json.total,
    ok: json.successful,
    errors: json.errors,
    excludes: json.excludes,
    errorsByUrl,
    excludedUrls,
  };
}

// Error status text for the first errored URL containing `urlSubstring`, or
// null. Matches by substring because lychee reports absolute (e.g. file://)
// URLs whose prefix depends on the temp fixture directory.
export function findError(result, urlSubstring) {
  for (const [url, reason] of result.errorsByUrl) {
    if (url.includes(urlSubstring)) return reason;
  }
  return null;
}

export function wasExcluded(result, urlSubstring) {
  for (const url of result.excludedUrls) {
    if (url.includes(urlSubstring)) return true;
  }
  return false;
}
