// Pure library for creating or finalizing the pull request of an
// "Update <repo> integration branch" workflow run, based on the MODE computed
// by ../pick-branch (dev vs release) and the current PR state.
//
// Side-effecting concerns (subprocess invocation, argv/env handling) live in
// the command file, ../create-or-finalize-pr.mjs.

/**
 * Result of an injected `gh`/`git` invocation.
 *
 * @typedef {Object} RunResult
 * @property {string} stdout
 * @property {number} status   Exit code (0 on success).
 */

/**
 * Outcome of a {@link createOrFinalizePullRequest} run, from the PR's point of
 * view. In dry-run mode, the outcome that a write run would have produced.
 *
 * @typedef {'created' | 'updated' | 'unchanged'} PrOutcome
 *   - `created`: a new PR was opened — the draft integration PR in dev mode
 *     (bootstrapping the branch with an empty commit when it had none), the
 *     release PR in release mode.
 *   - `updated`: the existing PR was modified — release-mode one-time
 *     finalization of the draft (ready + title + body), or a title re-sync of
 *     an already-final PR.
 *   - `unchanged`: the PR was already in the desired state.
 */

/**
 * Create or finalize the integration branch's pull request, as the current
 * MODE calls for:
 *
 * - **dev**: an open PR of any kind suffices; otherwise create the draft
 *   integration PR, bootstrapping the branch with an empty commit when it has
 *   no commits over main (`gh pr create` fails otherwise).
 * - **release**: no PR → create the non-draft release PR; draft PR → one-time
 *   finalization (title + body + `gh pr ready`); non-draft PR → re-sync the
 *   title only (e.g. a newer release while the PR awaits merge), preserving
 *   any notes maintainers may have added to the body.
 *
 * The body of the release PR is thus written only during finalization.
 *
 * In dry-run mode the read-only PR/branch state queries still run, but all
 * writes are skipped; log lines are prefixed with `[dry-run]`.
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
 * @returns {PrOutcome}
 */
export function createOrFinalizePullRequest({
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
    ? createDevPrIfMissing({
        pr,
        repo,
        version,
        branch,
        dryRun,
        runGh,
        runGit,
        log,
      })
    : createOrFinalizeReleasePr({
        pr,
        repo,
        version,
        branch,
        dryRun,
        runGh,
        log,
      });
}

/** Dev mode: make sure the draft integration PR exists. */
function createDevPrIfMissing({
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
    return 'unchanged';
  }

  const revList = must(
    runGit(['rev-list', 'origin/main..HEAD']),
    'git rev-list',
  );
  const needsBootstrap = revList.stdout.trim() === '';

  const title = `DRAFT Update ${repo} to unreleased ${version}-dev`;
  const body = `This is a draft PR used for identifying issues integrating the latest (unreleased) [${repo}](https://github.com/open-telemetry/${repo}).`;
  const prefix = dryRun ? '[dry-run] ' : '';

  if (needsBootstrap) {
    // Bootstrap this long-lived integration branch with an empty commit so
    // that PR creation succeeds (gh pr create fails when there are no
    // commits between main and the branch).
    log(`${prefix}Bootstrapping ${branch} with an empty commit.`);
    if (!dryRun) {
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
  }

  log(`${prefix}Creating draft PR "${title}".`);
  if (!dryRun) {
    must(
      runGh(['pr', 'create', '--title', title, '--body', body, '--draft']),
      'gh pr create',
    );
  }
  return 'created';
}

/** Release mode: create the release PR, or finalize/re-sync the existing one. */
function createOrFinalizeReleasePr({
  pr,
  repo,
  version,
  branch,
  dryRun,
  runGh,
  log,
}) {
  const title = `Update ${repo} version to ${version}`;
  const body = `Update ${repo} version to \`${version}\`.\n\nSee https://github.com/open-telemetry/${repo}/releases/tag/${version}.`;
  const prefix = dryRun ? '[dry-run] ' : '';

  if (!pr) {
    log(`${prefix}Creating release PR "${title}".`);
    if (!dryRun) {
      must(
        runGh(['pr', 'create', '--title', title, '--body', body]),
        'gh pr create',
      );
    }
    return 'created';
  }

  if (pr.isDraft) {
    // One-time finalization of the dev-cycle draft PR; the body is written
    // only here. Edit before ready: should `ready` fail, the PR remains a
    // draft and the next run redoes the finalization.
    log(`${prefix}Finalizing PR #${pr.number} as "${title}".`);
    if (!dryRun) {
      must(
        runGh(['pr', 'edit', branch, '--title', title, '--body', body]),
        'gh pr edit',
      );
      must(runGh(['pr', 'ready', branch]), 'gh pr ready');
    }
    return 'updated';
  }

  if (pr.title === title) {
    log(`PR #${pr.number} is already finalized as "${title}"; nothing to do.`);
    return 'unchanged';
  }

  // Already finalized under another title (e.g. a newer release while this
  // PR awaits merge): re-sync the title, but leave the body alone to
  // preserve notes that maintainers may have added.
  log(`${prefix}Re-titling PR #${pr.number} to "${title}".`);
  if (!dryRun) {
    must(runGh(['pr', 'edit', branch, '--title', title]), 'gh pr edit');
  }
  return 'updated';
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
