// Pure library for computing the VERSION and BRANCH env vars for the
// "Update <repo> integration branch" family of workflows.
//
// Side-effecting concerns (subprocess invocation, $GITHUB_ENV writes, opening
// issues, argv parsing) live in ./cli.mjs.
//
// cSpell:ignore dedup

/**
 * Map from `--spec` flag value to the upstream repo configuration.
 * Add new specs here when wiring up additional workflows.
 *
 * @type {Readonly<Record<string, { repo: string, abbr: string }>>}
 */
export const SPECS = Object.freeze({
  otel: { repo: 'opentelemetry-specification', abbr: 'spec' },
  semconv: { repo: 'semantic-conventions', abbr: 'semconv' },
});

/**
 * @typedef {Object} ComputeInput
 * @property {string} branchPrefix
 *   Branch prefix, e.g. `otelbot/spec-integration`.
 * @property {string} branchesOutput
 *   Raw output of `git branch -r` (one ref per line).
 * @property {(version: string) => boolean} isReleased
 *   Returns true iff `version` is an existing tag in the upstream repo.
 * @property {() => string} getLatestReleaseTag
 *   Returns the latest release tag (e.g. `v1.42.0`).
 * @property {(msg: string) => void} [log]
 *   Optional informational logger; defaults to `console.log`.
 * @property {(msg: string) => void} [warn]
 *   Optional warning collector; defaults to `log`. Used for conditions that
 *   should also be surfaced via a tracking issue (e.g. stale branches).
 */

/**
 * @param {ComputeInput} input
 * @returns {{ version: string, branch: string, warnings: string[], latestRelease: string }}
 *   `version` is the next dev version to integrate (e.g. `v1.56.0`).
 *   `latestRelease` is the most recent published release tag of the upstream
 *   repo (e.g. `v1.55.0`), included for reporting.
 */
export function computeIntegrationVersion({
  branchPrefix,
  branchesOutput,
  isReleased,
  getLatestReleaseTag,
  log = console.log,
  warn,
}) {
  const warnings = [];
  const collectWarning = (msg) => {
    warnings.push(msg);
    (warn ?? log)(msg);
  };

  const latestRelease = getLatestReleaseTag();

  let version = extractVersionFromBranches(
    branchesOutput,
    branchPrefix,
    collectWarning,
  );

  if (version && isReleased(version)) {
    const bumped = bumpMinor(version);
    log(`Version ${version} has already been released; bumping to ${bumped}.`);
    version = bumped;
  } else if (version) {
    log(`Version ${version} has not been released; using ${version}.`);
  }

  if (!version) {
    version = bumpMinor(latestRelease);
  }

  return {
    version,
    branch: `${branchPrefix}-${version}-dev`,
    warnings,
    latestRelease,
  };
}

/**
 * Find the integration branch matching `<prefix>-vX.Y.Z-dev` in `git branch -r`
 * output and return the embedded version (e.g. `v1.42.0`).
 *
 * Returns `''` if no matching branch exists. If more than one matches, calls
 * `warn` with a description and returns the numerically latest version.
 *
 * @param {string} branchesOutput
 * @param {string} branchPrefix
 * @param {(msg: string) => void} [warn]
 * @returns {string}
 */
export function extractVersionFromBranches(
  branchesOutput,
  branchPrefix,
  warn = console.log,
) {
  const re = new RegExp(
    `^\\s*origin/${escapeRegExp(branchPrefix)}-(v\\d+\\.\\d+\\.\\d+)-dev\\s*$`,
  );
  const matches = branchesOutput
    .split('\n')
    .map((line) => line.match(re))
    .filter((m) => m !== null)
    .map((m) => m[1]);

  if (matches.length > 1) {
    matches.sort(compareVersionsDesc);
    warn(
      `Multiple integration branches found (${matches.join(', ')}); using latest: ${matches[0]}. Older branches should be deleted.`,
    );
  }
  return matches[0] ?? '';
}

/** @param {string} a @param {string} b @returns {number} */
function compareVersionsDesc(a, b) {
  const parse = (v) => v.replace(/^v/, '').split('.').map(Number);
  const [aMajor, aMinor, aPatch] = parse(a);
  const [bMajor, bMinor, bPatch] = parse(b);
  return bMajor - aMajor || bMinor - aMinor || bPatch - aPatch;
}

/**
 * Bump the minor component of a `vMAJOR.MINOR.PATCH[...]` tag, resetting
 * patch to 0. Throws if the tag does not match.
 *
 * @param {string} tag
 * @returns {string}
 */
export function bumpMinor(tag) {
  const m = tag.match(/^v(\d+)\.(\d+)\./);
  if (!m) throw new Error(`unexpected version: ${tag}`);
  const [, major, minor] = m;
  return `v${major}.${Number(minor) + 1}.0`;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Format the lines that get appended to `$GITHUB_ENV` to expose VERSION and
 * BRANCH to subsequent workflow steps.
 *
 * @param {{ version: string, branch: string }} input
 * @returns {string}
 */
export function formatGithubEnv({ version, branch }) {
  return `VERSION=${version}\nBRANCH=${branch}\n`;
}

/**
 * Build the body of the warning tracking issue.
 *
 * @param {{ warnings: string[], repo: string, abbr: string, runUrl?: string|null }} input
 * @returns {string}
 */
export function buildIssueBody({ warnings, repo, abbr, runUrl = null }) {
  const lines = [
    `The \`update-${abbr}-integration-branch\` workflow (for [\`${repo}\`](https://github.com/open-telemetry/${repo})) reported the following warning(s):`,
    '',
    ...warnings.map((w) => `- ${w}`),
    '',
    'This issue was opened automatically; close it once the underlying condition is resolved.',
  ];
  if (runUrl) lines.push('', `Workflow run: ${runUrl}`);
  return lines.join('\n');
}

/**
 * Result of an injected `gh` invocation.
 *
 * @typedef {Object} GhResult
 * @property {string} stdout
 * @property {number} status   Exit code (0 on success).
 */

/**
 * @typedef {Object} EnsureIssueResult
 * @property {'skipped-existing' | 'created' | 'would-create'} action
 *   - `skipped-existing`: an open issue with the label already exists.
 *   - `created`: a new issue was created.
 *   - `would-create`: dry-run; no issue created.
 */

/**
 * Open an issue in the current repository unless one with the given label is
 * already open. Side-effecting `gh` calls (`label create`, `issue create`) are
 * skipped in dry-run mode; the read-only existence check (`gh issue list`)
 * always runs so the dedup decision is real.
 *
 * @param {Object} input
 * @param {string} input.title
 * @param {string} input.label
 * @param {string} input.body
 * @param {boolean} input.dryRun
 * @param {(args: string[]) => GhResult} input.runGh
 *   Synchronous `gh` runner. Receives the argv (without `gh`) and returns
 *   `{ stdout, status }`.
 * @param {(msg: string) => void} [input.log]
 * @returns {EnsureIssueResult}
 */
export function ensureWarningIssueOpen({
  title,
  label,
  body,
  dryRun,
  runGh,
  log = console.log,
}) {
  const list = runGh([
    'issue',
    'list',
    '--state',
    'open',
    '--label',
    label,
    '--json',
    'number',
    '--limit',
    '1',
  ]);
  if (list.status !== 0) {
    throw new Error(
      `gh issue list failed (status ${list.status}): ${list.stdout}`,
    );
  }
  if (JSON.parse(list.stdout || '[]').length > 0) {
    log(`Warning issue with label "${label}" already open; skipping.`);
    return { action: 'skipped-existing' };
  }

  if (dryRun) {
    log(
      `[dry-run] Would open an issue with label "${label}" (no existing open issue found).`,
    );
    log(`[dry-run] Title: ${title}`);
    log(`[dry-run] Body:\n${body}`);
    return { action: 'would-create' };
  }

  // Make sure the label exists; ignore failure if it already does.
  runGh([
    'label',
    'create',
    label,
    '--color',
    'BFD4F2',
    '--description',
    'Warning surfaced by an automation workflow',
  ]);

  const create = runGh([
    'issue',
    'create',
    '--title',
    title,
    '--label',
    label,
    '--body',
    body,
  ]);
  if (create.status !== 0) {
    throw new Error(
      `gh issue create failed (status ${create.status}): ${create.stdout}`,
    );
  }
  return { action: 'created' };
}

/**
 * Parse the CLI argv for `cli.mjs`. Pure: throws on invalid input rather than
 * calling `process.exit`, and reads the GitHub Actions signal from an injected
 * env object.
 *
 * @param {string[]} argv  Argv tail (i.e. without `node` and the script path).
 * @param {Record<string, string|undefined>} [env]  Defaults to `process.env`.
 * @returns {{ spec: string, dryRun: boolean, dryRunReason: string, help: boolean }}
 *   `dryRunReason` explains how `dryRun` was decided; it is suitable for
 *   logging (e.g. "--dry-run flag", "GITHUB_ACTIONS=true",
 *   "GITHUB_ACTIONS not set").
 * @throws {Error}  When an unknown flag or `--spec` value is provided.
 */
export function parseCliArgs(argv, env = process.env) {
  // Handle --dry-run / --no-dry-run ourselves so the default can depend on
  // the environment (node:util.parseArgs has no env-aware defaults and only
  // limited `--no-` support).
  let dryRunOverride; // undefined = use env-based default
  let overrideFlag; // remembers which flag was passed last, for the reason
  const remaining = [];
  for (const arg of argv) {
    if (arg === '--dry-run') {
      dryRunOverride = true;
      overrideFlag = '--dry-run';
    } else if (arg === '--no-dry-run') {
      dryRunOverride = false;
      overrideFlag = '--no-dry-run';
    } else {
      remaining.push(arg);
    }
  }

  let spec = 'otel';
  let help = false;
  for (let i = 0; i < remaining.length; i++) {
    const arg = remaining[i];
    if (arg === '-h' || arg === '--help') {
      help = true;
    } else if (arg === '-s' || arg === '--spec') {
      spec = remaining[++i];
      if (spec === undefined) throw new Error(`Missing value for ${arg}`);
    } else if (arg.startsWith('--spec=')) {
      spec = arg.slice('--spec='.length);
    } else if (arg.startsWith('-s=')) {
      spec = arg.slice('-s='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Object.hasOwn(SPECS, spec)) {
    throw new Error(
      `Unknown --spec value: "${spec}". Allowed: ${Object.keys(SPECS).join(', ')}.`,
    );
  }

  // Default: dry-run on unless running under GitHub Actions. Explicit
  // --dry-run / --no-dry-run always wins.
  let dryRun;
  let dryRunReason;
  if (dryRunOverride !== undefined) {
    dryRun = dryRunOverride;
    dryRunReason = `${overrideFlag} flag`;
  } else if (env.GITHUB_ACTIONS === 'true') {
    dryRun = false;
    dryRunReason = 'GITHUB_ACTIONS=true';
  } else {
    dryRun = true;
    dryRunReason = 'GITHUB_ACTIONS is not set to "true"';
  }

  return { spec, dryRun, dryRunReason, help };
}

/**
 * Help text for `cli.mjs --help`.
 *
 * @returns {string}
 */
export function cliUsage() {
  const allowed = Object.keys(SPECS).join('|');
  return [
    'Pick the next integration-branch version for a spec workflow and write',
    'VERSION/BRANCH to $GITHUB_ENV (or stdout when GITHUB_ENV is unset).',
    'Opens a tracking issue on warnings.',
    '',
    'Usage: node scripts/gh/specs/pick-branch/cli.mjs \\',
    `         [--spec=<${allowed}>] [--[no-]dry-run]`,
    '',
    'Options:',
    `  -s, --spec=<${allowed}>  Selects the upstream spec (default: otel).`,
    '      --dry-run            Skip writes (default when run locally).',
    '      --no-dry-run         Perform writes (default under GitHub Actions).',
    '  -h, --help               Show this help.',
  ].join('\n');
}
