// Pure logic for the double-check driver: turn probe results for
// Lychee-reported link failures into committed link-cache entries. Process
// wiring lives in ./cli.mjs; probe and cache-entry semantics in ./README.md.

// Deep import of the package's cache codec (no side effects). link-cache has
// no CLI or public API yet for recording a named resolver's result; this is
// the interim path, kept to its own serializer so the file stays canonical.
import { parseOwned, serializeOwned } from 'link-cache/lib/cache.mjs';
import { STATUS_OK_BY_ANALYSIS, isHttp2XX } from './get-url-status.mjs';

// Probe status marker for URLs whose probe errored out (null status).
export const UNVERIFIED = 'UNVERIFIED';

// Provenance recorded on the entries this driver writes (the `via` field).
export const VIA = 'double-check';

// Owned-cache entries (result 206, via double-check) for the probe results
// that resolved.
export function cacheEntriesFor(results, nowEpoch) {
  return results
    .filter(({ status }) => isHttp2XX(status))
    .map(({ url }) => ({
      url,
      result: STATUS_OK_BY_ANALYSIS,
      ts: nowEpoch,
      via: VIA,
      comments: [],
    }));
}

// Owned-cache text with the new entries merged in: an existing entry for the
// same URL (typically the failure word the check just recorded) is replaced.
// Serialized by link-cache's own codec, so the result is what a check run
// would write.
export function mergedCacheText(cacheText, newEntries, nowEpoch) {
  if (newEntries.length === 0) return cacheText;
  const owned = parseOwned(cacheText, { now: nowEpoch });
  const newUrls = new Set(newEntries.map(({ url }) => url));
  const entries = owned.entries.filter(({ url }) => !newUrls.has(url));
  return serializeOwned({
    entries: [...entries, ...newEntries],
    trailing: owned.trailing,
  });
}

// False-green guard: the Lychee summary line declares an error count; if it
// is positive but the failure parse found nothing, the report format has
// drifted and silently probing nothing would masquerade as success.
//
// With `expectFailures`, "nothing parsed" means parser drift or a failure
// unrelated to links, so throw even without a summary line.
export function checkReportConsistency(
  output,
  failures,
  { expectFailures = false } = {},
) {
  const summary = output.match(/🚫 (\d+) Errors?/);
  const declared = summary ? Number(summary[1]) : 0;
  if (declared > 0 && failures.length === 0) {
    throw new Error(
      `Lychee reports ${declared} error(s) but no failure lines were parsed; ` +
        'the report format may have changed.',
    );
  }
  if (expectFailures && failures.length === 0) {
    throw new Error(
      'The link check failed, but no failure lines were parsed from its ' +
        'log; the failure may be unrelated to links, or the report format ' +
        'may have changed.',
    );
  }
}

// Probe-infrastructure guard: a null status means the probe itself errored
// out; if every probe did, the probe infrastructure is broken (e.g., Chrome
// failed to launch) and exiting normally would masquerade as a completed run.
export function checkProbeResults(results) {
  if (results.length > 0 && results.every(({ status }) => status === null)) {
    throw new Error(
      `Every probe (${results.length}) errored out; the probe ` +
        'infrastructure is likely broken (Chrome launch failure?). ' +
        'See the probe log lines above for details.',
    );
  }
}

// Human-readable outcome: how many URLs resolved, and which did not.
export function summaryReport(results) {
  const unresolved = results.filter(({ status }) => !isHttp2XX(status));
  const resolvedCount = results.length - unresolved.length;
  const lines = [
    `Double-check: ${resolvedCount} of ${results.length} failing URL(s) resolved by the browser probe.`,
  ];
  if (unresolved.length > 0) {
    lines.push(
      'Unresolved (probe status shown):',
      ...unresolved.map(
        ({ status, url }) => `  [${status ?? UNVERIFIED}] ${url}`,
      ),
    );
  }
  return lines.join('\n');
}
