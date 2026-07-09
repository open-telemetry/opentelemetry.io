// Pure library for creating or finalizing the pull request of an
// "Update <repo> integration branch" workflow run, based on the MODE computed
// by ../pick-branch (dev vs release) and the current PR state.
//
// Side-effecting concerns (subprocess invocation, argv/env handling) live in
// ./cli.mjs.

/**
 * Result of an injected `gh`/`git` invocation.
 *
 * @typedef {Object} RunResult
 * @property {string} stdout
 * @property {number} status   Exit code (0 on success).
 */

/**
 * @typedef {Object} EnsurePrResult
 * @property {'none'
 *   | 'created-draft' | 'bootstrapped-and-created-draft'
 *   | 'created-release' | 'finalized' | 'title-synced'
 *   | 'would-create-draft' | 'would-bootstrap-and-create-draft'
 *   | 'would-create-release' | 'would-finalize' | 'would-sync-title'
 * } action
 *   What was done (or, in dry-run mode, would have been done):
 *   - `none`: PR already in the desired state.
 *   - `created-draft` / `bootstrapped-and-created-draft`: dev mode opened the
 *     draft integration PR (bootstrapping with an empty commit when the
 *     branch had none).
 *   - `created-release`: release mode opened a new non-draft release PR.
 *   - `finalized`: release mode promoted the dev-cycle draft PR (ready +
 *     title + body).
 *   - `title-synced`: release mode re-synced the title of an already-final
 *     PR, leaving the body alone.
 */

/**
 * Ensure the integration branch has the pull request that the current MODE
 * calls for:
 *
 * - **dev**: an open PR of any kind suffices; otherwise create the draft
 *   integration PR, bootstrapping the branch with an empty commit when it has
 *   no commits over main (`gh pr create` fails otherwise).
 * - **release**: no PR → create the non-draft release PR; draft PR → one-time
 *   finalization (`gh pr ready` + title + body); non-draft PR → re-sync the
 *   title only (e.g. a newer release while the PR awaits merge), preserving
 *   any notes maintainers may have added to the body.
 *
 * The body of the release PR is thus written exactly once.
 *
 * In dry-run mode the read-only PR/branch state queries still run, but all
 * writes are skipped and reported via `would-*` actions.
 *
 * @param {Object} input
 * @param {'dev'|'release'} input.mode
 * @param {string} input.repo      Upstream repo name, e.g. `semantic-conventions`.
 * @param {string} input.version   Version to integrate, e.g. `v1.59.0`.
 * @param {string} input.branch    Integration branch name.
 * @param {boolean} input.dryRun
 * @param {(args: string[]) => RunResult} input.runGh
 *   Synchronous `gh` runner. Receives the argv (without `gh`).
 * @param {(args: string[]) => RunResult} input.runGit
 *   Synchronous `git` runner. Receives the argv (without `git`).
 * @param {(msg: string) => void} [input.log]
 * @returns {EnsurePrResult}
 */
export function ensurePullRequest({
  mode,
  repo,
  version,
  branch,
  dryRun,
  runGh,
  runGit,
  log = console.log,
}) {
  if (mode !== 'dev' && mode !== 'release') {
    throw new Error(`unexpected mode: ${mode} (expected dev or release)`);
  }

  const list = must(
    runGh([
      'pr',
      'list',
      '--state',
      'open',
      '--head',
      branch,
      '--json',
      'number,isDraft,title',
    ]),
    'gh pr list',
  );
  const pr = JSON.parse(list.stdout || '[]')[0] ?? null;

  return mode === 'dev'
    ? ensureDevPr({ pr, repo, version, branch, dryRun, runGh, runGit, log })
    : ensureReleasePr({ pr, repo, version, branch, dryRun, runGh, log });
}

/** Dev mode: make sure the draft integration PR exists. */
function ensureDevPr({
  pr,
  repo,
  version,
  branch,
  dryRun,
  runGh,
  runGit,
  log,
}) {
  if (pr) {
    log(`PR #${pr.number} is already open for ${branch}; nothing to do.`);
    return { action: 'none' };
  }

  const revList = must(
    runGit(['rev-list', 'origin/main..HEAD']),
    'git rev-list',
  );
  const needsBootstrap = revList.stdout.trim() === '';

  const title = `DRAFT Update ${repo} to unreleased ${version}-dev`;
  const body = `This is a draft PR used for identifying issues integrating the latest (unreleased) [${repo}](https://github.com/open-telemetry/${repo}).`;

  if (dryRun) {
    log(
      `[dry-run] Would create draft PR "${title}"${needsBootstrap ? ' after bootstrapping the branch with an empty commit' : ''}.`,
    );
    return {
      action: needsBootstrap
        ? 'would-bootstrap-and-create-draft'
        : 'would-create-draft',
    };
  }

  if (needsBootstrap) {
    // Bootstrap this long-lived integration branch with an empty commit so
    // that PR creation succeeds (gh pr create fails when there are no
    // commits between main and the branch).
    log(`Bootstrapping ${branch} with an empty commit.`);
    must(
      runGit([
        'commit',
        '--allow-empty',
        '-m',
        `Trigger PR creation for ${branch}`,
      ]),
      'git commit',
    );
    must(runGit(['push']), 'git push');
  }

  must(
    runGh(['pr', 'create', '--title', title, '--body', body, '--draft']),
    'gh pr create',
  );
  log(`Created draft PR "${title}".`);
  return {
    action: needsBootstrap ? 'bootstrapped-and-created-draft' : 'created-draft',
  };
}

/** Release mode: create the release PR, or finalize/re-sync the existing one. */
function ensureReleasePr({ pr, repo, version, branch, dryRun, runGh, log }) {
  const title = `Update ${repo} version to ${version}`;
  const body = `Update ${repo} version to \`${version}\`.\n\nSee https://github.com/open-telemetry/${repo}/releases/tag/${version}.`;

  if (!pr) {
    if (dryRun) {
      log(`[dry-run] Would create release PR "${title}".`);
      return { action: 'would-create-release' };
    }
    must(
      runGh(['pr', 'create', '--title', title, '--body', body]),
      'gh pr create',
    );
    log(`Created release PR "${title}".`);
    return { action: 'created-release' };
  }

  if (pr.isDraft) {
    // One-time finalization of the dev-cycle draft PR; the body is written
    // here and never again.
    if (dryRun) {
      log(`[dry-run] Would finalize draft PR #${pr.number} as "${title}".`);
      return { action: 'would-finalize' };
    }
    must(runGh(['pr', 'ready', branch]), 'gh pr ready');
    must(
      runGh(['pr', 'edit', branch, '--title', title, '--body', body]),
      'gh pr edit',
    );
    log(`Finalized PR #${pr.number} as "${title}".`);
    return { action: 'finalized' };
  }

  if (pr.title === title) {
    log(`PR #${pr.number} is already finalized as "${title}"; nothing to do.`);
    return { action: 'none' };
  }

  // Already finalized under another title (e.g. a newer release while this
  // PR awaits merge): re-sync the title, but leave the body alone to
  // preserve notes that maintainers may have added.
  if (dryRun) {
    log(`[dry-run] Would re-title PR #${pr.number} to "${title}".`);
    return { action: 'would-sync-title' };
  }
  must(runGh(['pr', 'edit', branch, '--title', title]), 'gh pr edit');
  log(`Re-titled PR #${pr.number} to "${title}".`);
  return { action: 'title-synced' };
}

/**
 * @param {RunResult} result
 * @param {string} what  Human-readable command label, e.g. `gh pr create`.
 * @returns {RunResult}
 */
function must(result, what) {
  if (result.status !== 0) {
    throw new Error(
      `${what} failed (status ${result.status}): ${result.stdout}`,
    );
  }
  return result;
}

/**
 * Validate and extract the MODE/VERSION/BRANCH environment values written to
 * `$GITHUB_ENV` by ../pick-branch. Throws on missing or malformed values so
 * that misconfiguration fails the workflow loudly.
 *
 * @param {Record<string, string|undefined>} env
 * @param {{ abbr: string }} spec  The spec entry (for the branch pattern).
 * @returns {{ mode: 'dev'|'release', version: string, branch: string }}
 */
export function readEnvInputs(env, { abbr }) {
  const { MODE: mode, VERSION: version, BRANCH: branch } = env;
  if (mode !== 'dev' && mode !== 'release') {
    throw new Error(`unexpected MODE: ${mode} (expected dev or release)`);
  }
  if (!/^v\d+\.\d+\.\d+$/.test(version ?? '')) {
    throw new Error(`unexpected VERSION: ${version} (expected vX.Y.Z)`);
  }
  const branchRe = new RegExp(
    `^otelbot/${abbr}-integration-v\\d+\\.\\d+\\.\\d+-dev$`,
  );
  if (!branchRe.test(branch ?? '')) {
    throw new Error(
      `unexpected BRANCH: ${branch} (expected otelbot/${abbr}-integration-vX.Y.Z-dev)`,
    );
  }
  return { mode, version, branch };
}

/**
 * Help text for `cli.mjs --help`.
 *
 * @returns {string}
 */
export function cliUsage() {
  return [
    'Create or finalize the pull request of an integration-branch workflow',
    'run. In dev mode, open the draft integration PR if none exists; in',
    'release mode, create the release PR, promote the existing draft, or',
    're-sync the title of an already-final PR.',
    '',
    'Reads MODE, VERSION and BRANCH from the environment (as written by',
    'pick-branch via $GITHUB_ENV) and expects the integration branch to be',
    'checked out.',
    '',
    'Usage: node scripts/gh/specs/ensure-pr/cli.mjs \\',
    '         [--spec=<otel|semconv>] [--[no-]dry-run]',
    '',
    'Options:',
    '  -s, --spec=<otel|semconv>  Selects the upstream spec (default: otel).',
    '      --dry-run              Skip writes (default when run locally).',
    '      --no-dry-run           Perform writes (default under GitHub Actions).',
    '  -h, --help                 Show this help.',
  ].join('\n');
}
