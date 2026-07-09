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
 *   - `updated`: the existing PR was modified — in release mode, whichever
 *     combination of title sync, body sync, and draft→ready promotion the PR
 *     needed.
 *   - `unchanged`: the PR was already in the desired state.
 */

/**
 * Create or finalize the integration branch's pull request, as the current
 * MODE calls for:
 *
 * - **dev**: an open PR of any kind suffices; otherwise create the draft
 *   integration PR, bootstrapping the branch with an empty commit when it has
 *   no commits over main (`gh pr create` fails otherwise).
 * - **release**: no PR → create the non-draft release PR; open PR → apply
 *   whichever fixups it needs: sync the title and the body to the release
 *   form, and promote a draft to ready (edit before ready, so a failed run
 *   leaves a draft that the next run re-finalizes).
 *
 * The automation rewrites only text it itself wrote — the dev or release
 * title/body, for any version. Once a maintainer edits the title or the body,
 * that field is theirs and is left alone.
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
      'number,isDraft,title,body',
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

  const { title, body } = devPrText(repo, version);
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
    const created = must(
      runGh(['pr', 'create', '--title', title, '--body', body, '--draft']),
      'gh pr create',
    );
    logUrl(created, log);
  }
  return 'created';
}

/** Release mode: create the release PR, or apply the fixups the open PR needs. */
function createOrFinalizeReleasePr({
  pr,
  repo,
  version,
  branch,
  dryRun,
  runGh,
  log,
}) {
  const { title, body } = releasePrText(repo, version);
  const prefix = dryRun ? '[dry-run] ' : '';

  if (!pr) {
    log(`${prefix}Creating release PR "${title}".`);
    if (!dryRun) {
      const created = must(
        runGh(['pr', 'create', '--title', title, '--body', body]),
        'gh pr create',
      );
      logUrl(created, log);
    }
    return 'created';
  }

  // Independent, idempotent fixups; see the ownership rule in the docs of
  // createOrFinalizePullRequest.
  const editArgs = [];
  if (normalize(pr.title) !== title && isAutomationTitle(pr.title, repo)) {
    editArgs.push('--title', title);
  }
  if (normalize(pr.body) !== body && isAutomationBody(pr.body, repo)) {
    editArgs.push('--body', body);
  }

  if (!editArgs.length && !pr.isDraft) {
    log(`PR #${pr.number} is already finalized; nothing to do.`);
    return 'unchanged';
  }

  const fixes = [
    editArgs.includes('--title') && 'title',
    editArgs.includes('--body') && 'body',
    pr.isDraft && 'ready',
  ]
    .filter(Boolean)
    .join(' + ');
  log(`${prefix}Finalizing PR #${pr.number} for ${version} (${fixes}).`);

  if (!dryRun) {
    // Edit before ready: should `ready` fail, the PR remains a draft and the
    // next run redoes the finalization.
    if (editArgs.length) {
      must(runGh(['pr', 'edit', branch, ...editArgs]), 'gh pr edit');
    }
    if (pr.isDraft) {
      must(runGh(['pr', 'ready', branch]), 'gh pr ready');
    }
  }
  return 'updated';
}

/**
 * Title and body of the dev-cycle draft integration PR.
 *
 * @param {string} repo @param {string} version
 * @returns {{ title: string, body: string }}
 */
function devPrText(repo, version) {
  return {
    title: `DRAFT Update ${repo} to unreleased ${version}-dev`,
    body: `This is a draft PR used for identifying issues integrating the latest (unreleased) [${repo}](https://github.com/open-telemetry/${repo}).`,
  };
}

/**
 * Title and body of the release PR.
 *
 * @param {string} repo @param {string} version
 * @returns {{ title: string, body: string }}
 */
function releasePrText(repo, version) {
  return {
    title: `Update ${repo} version to ${version}`,
    body: `Update ${repo} version to \`${version}\`.\n\nSee https://github.com/open-telemetry/${repo}/releases/tag/${version}.`,
  };
}

/**
 * Placeholder that {@link maskVersions} substitutes for version numbers.
 * Templates instantiated with it compare equal to any-version instances.
 */
const VERSION_MASK = 'vX.Y.Z';

/** @param {string} s @returns {string} */
function maskVersions(s) {
  return s.replace(/\bv\d+\.\d+\.\d+\b/g, VERSION_MASK);
}

/** @param {string} title @param {string} repo @returns {boolean} */
function isAutomationTitle(title, repo) {
  return isAutomationText(title, [
    devPrText(repo, VERSION_MASK).title,
    releasePrText(repo, VERSION_MASK).title,
  ]);
}

/** @param {string} body @param {string} repo @returns {boolean} */
function isAutomationBody(body, repo) {
  return isAutomationText(body, [
    devPrText(repo, VERSION_MASK).body,
    releasePrText(repo, VERSION_MASK).body,
  ]);
}

/**
 * True iff `text` was written by the automation: equal, after normalization
 * and version masking, to one of `templates` (instantiated with
 * {@link VERSION_MASK}). Any other difference means a maintainer edited the
 * text, making it theirs.
 *
 * @param {string|undefined} text
 * @param {string[]} templates
 * @returns {boolean}
 */
function isAutomationText(text, templates) {
  const masked = maskVersions(normalize(text));
  return templates.some((t) => masked === t);
}

/**
 * Normalize line endings and outer whitespace before comparing PR text.
 *
 * @param {string|undefined} text
 * @returns {string}
 */
function normalize(text) {
  return (text ?? '').replace(/\r\n/g, '\n').trim();
}

/**
 * Log a created PR's URL (`gh pr create` prints it on stdout).
 *
 * @param {RunResult} result
 * @param {(msg: string) => void} log
 */
function logUrl(result, log) {
  const url = result.stdout.trim();
  if (url) log(url);
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
