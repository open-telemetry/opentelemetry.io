// @ts-check
//
// Custom markdownlint rule to flag GitHub blob/tree URLs that reference a
// default branch name or non-full 40-char commit hash.
//
// This script was developed from the plan for the gh-url-hash rule in
// projects/2026/mdl-gh-url-hash-rule.plan.md. See that file for design decisions and
// implementation guidance.

import { filterByTypes } from 'markdownlint-rule-helpers/micromark';

const USER_AGENT = 'otel.io-docs-bot/gh-url-hash (+https://opentelemetry.io)';
const FIXED_SHA_LEN = 40;
const LOOKUP_MIN_INTERVAL_MS = 300;
const LOOKUP_429_FALLBACK_MS = 60000;
// TODO: consider making this configurable (for orgs that use different default branches).
const defaultBranches = new Set(['main', 'master']);

/**
 * @typedef {object} ParsedGitHubBlobTreeUrl
 * @property {URL} url
 * @property {string} owner
 * @property {string} repo
 * @property {'blob'|'tree'} type
 * @property {string} ref
 * @property {string} path
 */

/**
 * @typedef {object} FetchCommitShaResult
 * @property {string | null} commitSha
 * @property {string | undefined} failureReason
 */

/**
 * @typedef {object} LookupState
 * @property {Map<string, Promise<FetchCommitShaResult>>} cache
 * @property {number} lastRequestAt
 */

/**
 * @typedef {object} GlobalLookupGate
 * @property {number} rateLimitedUntil
 * @property {string | null} rateLimitReason
 */

/**
 * A commit hash is exactly 40 hex characters (case-insensitive).
 */
const commitHashRe = /^[0-9a-f]{40}$/i;

/**
 * Escape string for use in a RegExp.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @returns {LookupState}
 */
function createLookupState() {
  return {
    cache: new Map(),
    lastRequestAt: 0,
  };
}

/** @type {GlobalLookupGate} */
const globalLookupGate = {
  rateLimitedUntil: 0,
  rateLimitReason: null,
};

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {LookupState} lookupState
 * @returns {Promise<void>}
 */
async function throttleLookup(lookupState) {
  if (!lookupState.lastRequestAt) return;
  const elapsed = Date.now() - lookupState.lastRequestAt;
  if (elapsed < LOOKUP_MIN_INTERVAL_MS) {
    await sleep(LOOKUP_MIN_INTERVAL_MS - elapsed);
  }
}

/**
 * Parse Retry-After header value into milliseconds.
 *
 * @param {string | null | undefined} retryAfter
 * @returns {number | null}
 */
function parseRetryAfterMs(retryAfter) {
  if (!retryAfter) return null;
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.ceil(seconds * 1000);
  }
  const dateMs = Date.parse(retryAfter);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }
  return null;
}

/**
 * @returns {string | null}
 */
function getGlobalLookupPauseReason() {
  if (!globalLookupGate.rateLimitReason) return null;
  if (Date.now() < globalLookupGate.rateLimitedUntil) {
    return globalLookupGate.rateLimitReason;
  }
  globalLookupGate.rateLimitReason = null;
  globalLookupGate.rateLimitedUntil = 0;
  return null;
}

/**
 * @param {Response} res
 * @returns {string}
 */
function setGlobalLookupPauseReason(res) {
  const retryAfterMs = parseRetryAfterMs(
    typeof res.headers?.get === 'function'
      ? res.headers.get('retry-after')
      : null,
  );
  const pauseMs = retryAfterMs ?? LOOKUP_429_FALLBACK_MS;
  const pauseSeconds = Math.max(1, Math.ceil(pauseMs / 1000));
  globalLookupGate.rateLimitedUntil = Date.now() + pauseMs;
  globalLookupGate.rateLimitReason = `GitHub rate-limited auto-fix lookups (HTTP 429). Paused lookups process-wide; retry after about ${pauseSeconds}s.`;
  return globalLookupGate.rateLimitReason;
}

/**
 * Parse a string as a GitHub blob or tree URL.
 *
 * @param {string} urlString - URL string (e.g. from a markdown link)
 * @returns {null | ParsedGitHubBlobTreeUrl} Parsed data or null if not a GitHub blob/tree URL
 */
function parseGitHubBlobTreeUrl(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }
  if (url.hostname !== 'github.com') return null;

  const segments = url.pathname.split('/').filter(Boolean);
  // pathname: owner / repo / blob|tree / ref / [path...]
  if (segments.length < 4) return null;
  const type = segments[2];
  if (type !== 'blob' && type !== 'tree') return null;

  const owner = segments[0];
  const repo = segments[1];
  const ref = segments[3];
  const path = segments.slice(4).join('/');

  return {
    url,
    owner,
    repo,
    type: /** @type {'blob'|'tree'} */ (type),
    ref,
    path,
  };
}

/**
 * Fetch latest commit SHA for a file on a ref via the public GitHub commits
 * page HTML (not the GitHub API).
 *
 * Design decision: keep fix-mode lookup API-free so check/fix runs do not
 * depend on API auth or API-specific quotas.
 *
 * Returns full (40-char) SHA if file exists, null otherwise.
 * On HTTP/network/parse failures (including 404), this returns commitSha=null
 * with a failureReason so the lint error can explain why no fix was applied.
 *
 * @param {string} owner - repo owner
 * @param {string} repo - repo name
 * @param {string} branch - branch ref
 * @param {string} path - file path (no leading slash)
 * @param {LookupState} lookupState
 * @returns {Promise<FetchCommitShaResult>}
 */
async function fetchCommitSha(owner, repo, branch, path, lookupState) {
  const globalPauseReason = getGlobalLookupPauseReason();
  if (globalPauseReason)
    return { commitSha: null, failureReason: globalPauseReason };

  const cacheKey = `${owner}/${repo}/${branch}/${path}`;
  const cachedLookup = lookupState.cache.get(cacheKey);
  if (cachedLookup) return cachedLookup;

  const lookupPromise = (async () => {
    const encodedPath = path
      .split('/')
      .filter(Boolean)
      .map(encodeURIComponent)
      .join('/');
    const commitsUrl = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(branch)}${encodedPath ? `/${encodedPath}` : ''}`;

    await throttleLookup(lookupState);
    let res;
    try {
      res = await fetch(commitsUrl, {
        headers: { 'User-Agent': USER_AGENT },
      });
    } catch {
      return {
        commitSha: null,
        failureReason: 'request to GitHub failed',
      };
    }
    lookupState.lastRequestAt = Date.now();

    if (res.status === 429) {
      return {
        commitSha: null,
        failureReason: setGlobalLookupPauseReason(res),
      };
    }

    if (!res.ok) {
      const reason =
        res.status === 403
          ? 'GitHub returned 403 (likely rate limit/abuse protection while fetching commits page)'
          : `GitHub returned ${res.status} while fetching commits page`;
      return {
        commitSha: null,
        failureReason: reason,
      };
    }

    const html = await res.text();
    const repoCommitRe = new RegExp(
      `/${escapeRegExp(owner)}/${escapeRegExp(repo)}/commit/([0-9a-f]{40})\\b`,
    );
    const fullSha =
      html.match(repoCommitRe)?.[1] ||
      html.match(/\/commit\/([0-9a-f]{40})\b/)?.[1];

    if (fullSha) {
      return {
        commitSha: fullSha.substring(0, FIXED_SHA_LEN),
        failureReason: undefined,
      };
    }
    return {
      commitSha: null,
      failureReason: 'unable to parse commit SHA from GitHub commits page',
    };
  })();

  lookupState.cache.set(cacheKey, lookupPromise);

  try {
    return await lookupPromise;
  } catch {
    lookupState.cache.delete(cacheKey);
    return { commitSha: null, failureReason: 'request to GitHub failed' };
  }
}

/**
 * Build fixed URL: replace ref with commitSha and optionally add from_branch.
 *
 * @param {ParsedGitHubBlobTreeUrl} parsed - result of parseGitHubBlobTreeUrl
 * @param {string} commitSha - 40-char commit hash
 * @param {boolean} addFromBranch - whether to append from_branch query param
 * @returns {string}
 */
function buildFixedUrl(parsed, commitSha, addFromBranch) {
  const newPathname =
    '/' +
    [parsed.owner, parsed.repo, parsed.type, commitSha]
      .concat(parsed.path ? parsed.path.split('/') : [])
      .join('/');
  const newSearch = addFromBranch
    ? parsed.url.search
      ? `${parsed.url.search}&from_branch=${encodeURIComponent(parsed.ref)}`
      : `?from_branch=${encodeURIComponent(parsed.ref)}`
    : parsed.url.search;
  return parsed.url.origin + newPathname + newSearch + parsed.url.hash;
}

/**
 * Check a URL string for GitHub blob/tree URLs that use default branch refs
 * or short commit hashes.
 * Non-default refs (for example tags and releases) are allowed.
 * In fix mode: emit fixInfo only when commit lookup succeeds; otherwise report
 * the issue with an explicit "auto-fix lookup failed (...)" reason.
 *
 * @param {string} urlString - URL content to check
 * @param {number} lineNumber - line number for error reporting
 * @param {number} editColumn - 1-based column of URL in line
 * @param {boolean} isFixMode - whether to resolve and provide fixInfo
 * @param {LookupState} lookupState - commit lookup state for this lint run
 * @param {Function} onError - error reporting function
 * @returns {Promise<void>}
 */
async function checkUrl(
  urlString,
  lineNumber,
  editColumn,
  isFixMode,
  lookupState,
  onError,
) {
  if (!urlString) return;

  if (urlString.includes('{{') && urlString.includes('}}')) return;

  const parsed = parseGitHubBlobTreeUrl(urlString);
  if (!parsed) return;

  const isFullCommitHash = commitHashRe.test(parsed.ref);
  if (isFullCommitHash) return;

  const isShortCommitHash = /^[0-9a-f]{7,39}$/i.test(parsed.ref);
  const isDefaultBranch = defaultBranches.has(parsed.ref);
  if (!isDefaultBranch && !isShortCommitHash) return;

  const detail = isShortCommitHash
    ? `Use a full 40-character commit hash instead of short hash "${parsed.ref}" in GitHub URL`
    : `Use a tag/release ID or full 40-character commit hash instead of default branch ref "${parsed.ref}" in GitHub URL`;
  const context =
    urlString.length > 80
      ? urlString.substring(0, 40) + '…' + urlString.slice(-40)
      : urlString;

  if (isFixMode) {
    const { commitSha, failureReason } = await fetchCommitSha(
      parsed.owner,
      parsed.repo,
      parsed.ref,
      parsed.path,
      lookupState,
    );
    if (commitSha) {
      const newUrl = buildFixedUrl(parsed, commitSha, isDefaultBranch);
      onError({
        lineNumber,
        detail,
        context,
        fixInfo: {
          editColumn,
          deleteCount: urlString.length,
          insertText: newUrl,
        },
      });
    } else {
      onError({
        lineNumber,
        detail: `${detail}; auto-fix lookup failed (${failureReason || 'unknown reason'}), URL left unchanged`,
        context,
      });
    }
  } else {
    onError({ lineNumber, detail, context });
  }
}

/** @type {import("markdownlint").Rule} */
export default {
  names: ['gh-url-hash'],
  description:
    'GitHub blob/tree URLs should use tags/releases or full 40-character commit hashes (and avoid default branch refs)',
  tags: ['custom', 'links', 'github'],
  parser: 'micromark',
  asynchronous: true,
  function: async function ghUrlHash(params, onError) {
    // Workaround: markdownlint custom rules do not receive a global fix-mode
    // signal, so detect `--fix` from argv. This avoids costly lookup/fix
    // processing during normal lint runs.
    // Follow-up: https://github.com/DavidAnson/markdownlint/issues/1979
    // (switch to official params field if/when added).
    const isFixMode = process.argv.includes('--fix');
    const lookupState = createLookupState();

    const linkDestinations = filterByTypes(
      params.parsers.micromark.tokens,
      /** @type {any} */ ([
        'resourceDestinationString',
        'definitionDestinationString',
        'autolinkProtocol',
        'literalAutolinkHttp',
      ]),
    );

    const lines = params.lines;

    for (const token of linkDestinations) {
      const lineNumber = token.startLine;
      const line = lines[lineNumber - 1];
      const editColumn =
        token.startColumn != null
          ? token.startColumn
          : line
            ? line.indexOf(token.text) + 1
            : 1;
      await checkUrl(
        token.text,
        lineNumber,
        editColumn,
        isFixMode,
        lookupState,
        onError,
      );
    }
  },
};
