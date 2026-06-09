// Logic library for the "Locale auto-merge" workflow, plus a small filesystem
// helper (`discoverLocales`) for the locale set. The orchestrator
// (`runAutoMergeCommand`) funnels every GitHub side effect through an injected
// `runGh` runner so it stays unit-testable; ./cli.mjs wires in the real `gh`.
//
// Design: a locale team member comments `/auto-merge` (or `/auto-merge:enable`
// / `:disable`) on a locale-only PR; the workflow runs this helper as the DOCS
// bot (which has the permissions needed) to enable GitHub-native auto-merge. The
// bot only flips the "merge when ready" switch — branch protection and CODEOWNERS
// remain the hard gate, so the PR still won't merge until every required code
// owner has approved and all checks pass. The helper adds two guards of its
// own: (1) every changed file must be locale-owned, and (2) the commenter must
// be a member of the maintainer team for every locale the PR touches.

import { readdirSync } from 'node:fs';

// Files with no code owner (see .github/CODEOWNERS) that may appear in an
// otherwise locale-only PR without making it ineligible.
const NO_OWNER_PATHS = new Set(['static/refcache.json']);

// The default content language. `content/en/` is the source English content,
// owned by docs maintainers — not a translation locale — so it is excluded from
// the discovered locale set and never counts as locale-owned.
const DEFAULT_LOCALE = 'en';

// Default cap on the number of per-file lines emitted in verbose mode, so a
// huge PR can't flood the workflow log. Override via runAutoMergeCommand.
const DEFAULT_VERBOSE_FILE_LIMIT = 100;

/**
 * Discover the set of translation locale ids, i.e. the immediate subdirectories
 * of the Hugo `content/` tree (`ja`, `zh`, ...), excluding the default English
 * content (`content/en/`), which is maintainer-owned rather than locale-owned.
 *
 * @param {string} [contentDir] Path to the content root. Defaults to `content`.
 * @returns {Set<string>}
 */
export function discoverLocales(contentDir = 'content') {
  return new Set(
    readdirSync(contentDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => name !== DEFAULT_LOCALE),
  );
}

/**
 * Parse a PR comment body into an auto-merge action.
 *
 * Strict matcher: the trimmed comment must be exactly `/auto-merge`,
 * `/auto-merge:enable`, or `/auto-merge:disable` with no surrounding text.
 * Bare `/auto-merge` is shorthand for `enable`.
 *
 * @param {unknown} body Raw comment body.
 * @returns {'enable'|'disable'|null}
 */
export function parseCommand(body) {
  if (typeof body !== 'string') return null;
  const match = body.trim().match(/^\/auto-merge(?::(enable|disable))?$/);
  if (!match) return null;
  return match[1] ?? 'enable';
}

/**
 * Map a changed-file path to the locale that owns it, or `null` if the path is
 * not a recognized locale-owned path.
 *
 * Recognized locale-owned paths (mirrors .github/CODEOWNERS and Appendix A of
 * the plan):
 *   - `content/<loc>/**`
 *   - `.cspell/<loc>-*.txt`
 *   - `prh/<loc>.yml`
 *
 * The `<loc>` token must be a member of `knownLocales`; this rejects non-locale
 * files such as `.cspell/all-words.txt`.
 *
 * @param {unknown} path Changed-file path (POSIX separators).
 * @param {Set<string>} knownLocales Set of valid locale ids.
 * @returns {string|null}
 */
export function localeForPath(path, knownLocales) {
  if (typeof path !== 'string' || path === '') return null;

  const patterns = [
    /^content\/([^/]+)\/.+/,
    /^\.cspell\/([^/]+)-[^/]*\.txt$/,
    /^prh\/([^/]+)\.yml$/,
  ];

  for (const re of patterns) {
    const match = path.match(re);
    if (match && knownLocales.has(match[1])) return match[1];
  }
  return null;
}

/**
 * Result of an eligibility evaluation.
 *
 * @typedef {Object} Eligibility
 * @property {boolean} eligible True iff every changed path is locale-owned (or
 *   a recognized shared, no-owner file) and at least one locale is touched.
 * @property {string[]} locales The locales the PR touches, sorted.
 * @property {string[]} offending Paths that are neither locale-owned nor
 *   shared, in input order.
 */

/**
 * Decide whether a PR's changed files are confined to locale-owned paths. A PR
 * may touch more than one locale (e.g. a cross-locale broken-link fix); all
 * touched locales are reported so the caller can require authorization for each.
 *
 * @param {string[]} paths Changed-file paths.
 * @param {Set<string>} knownLocales Set of valid locale ids.
 * @param {(file: { path: string, kind: 'locale'|'shared'|'offending',
 *   locale: string|null }) => void} [onFile] Optional per-file callback,
 *   invoked once per path with its classification (used by verbose mode).
 * @returns {Eligibility}
 */
export function evaluateEligibility(paths, knownLocales, onFile) {
  const offending = [];
  const locales = new Set();

  for (const path of paths) {
    if (NO_OWNER_PATHS.has(path)) {
      onFile?.({ path, kind: 'shared', locale: null });
      continue;
    }
    const locale = localeForPath(path, knownLocales);
    if (locale == null) {
      offending.push(path);
      onFile?.({ path, kind: 'offending', locale: null });
    } else {
      locales.add(locale);
      onFile?.({ path, kind: 'locale', locale });
    }
  }

  const eligible = offending.length === 0 && locales.size > 0;
  return { eligible, locales: [...locales].sort(), offending };
}

/**
 * Authorization result for a commenter against a set of locales.
 *
 * @typedef {Object} Authorization
 * @property {boolean} authorized True iff the user is a member of every
 *   touched locale's maintainer team.
 * @property {string[]} missing Locales whose maintainer team the user is *not* a
 *   member of, sorted.
 */

/**
 * Report whether `user` may enable auto-merge for the given `locales`, i.e. is
 * a member of `@<org>/docs-<loc>-maintainers` for *every* locale.
 *
 * GitHub natively limits "Enable auto-merge" to users with write access, but
 * acting through the DOCS bot token bypasses that gate — so we re-check the
 * commenter's authority explicitly, by locale maintainer-team membership (the
 * relevant authority under CODEOWNERS delegation, where locale teams need not
 * hold repo write at all). Note this is the locale *maintainers* team, a
 * stricter bar than the `docs-<loc>-approvers` team that CODEOWNERS uses to gate
 * the merge itself.
 *
 * @param {(args: string[]) => GhResult} runGh
 * @param {string} org GitHub org login (e.g. `open-telemetry`).
 * @param {string} user Login to check (lower-cased for comparison).
 * @param {string[]} locales Locales the PR touches.
 * @param {(check: { locale: string, team: string, member: boolean }) => void}
 *   [onCheck] Optional per-locale callback, invoked once per membership check
 *   with its pass/fail result (used by verbose mode).
 * @returns {Authorization}
 */
export function authorizeForLocales(runGh, org, user, locales, onCheck) {
  const target = String(user).toLowerCase();
  const missing = [];

  for (const loc of locales) {
    const team = `docs-${loc}-maintainers`;
    const { stdout, status } = runGh([
      'api',
      '--paginate',
      `/orgs/${org}/teams/${team}/members`,
      '--jq',
      '.[].login',
    ]);
    const members =
      status === 0
        ? stdout
            .split('\n')
            .map((m) => m.trim().toLowerCase())
            .filter(Boolean)
        : [];
    const member = members.includes(target);
    if (!member) missing.push(loc);
    onCheck?.({ locale: loc, team, member });
  }

  return { authorized: missing.length === 0, missing: missing.sort() };
}

/**
 * A decision verdict for a parsed auto-merge command.
 *
 * @typedef {Object} Verdict
 * @property {'ineligible'|'unauthorized'|'noop'|'apply'} outcome
 * @property {number} exitCode `1` for failures, `0` for no-ops and applied
 *   actions.
 * @property {string} message Human-readable PR comment body.
 * @property {'enable'|'disable'|null} apply The auto-merge mutation to perform,
 *   or `null` when nothing should be mutated.
 */

/**
 * Resolve the verdict for a parsed command, given the PR's eligibility, the
 * commenter's authorization, and the PR's current auto-merge state. Pure: it
 * performs no I/O and returns the verdict the caller should act on.
 *
 * Enabling auto-merge only flips the "merge when ready" switch; required
 * reviews (via CODEOWNERS) and required checks remain the gate that decides
 * whether the PR actually lands. The helper's only added guards are locale
 * eligibility and locale-team authorization — it does not re-implement the
 * review checks GitHub already enforces.
 *
 * @param {Object} input
 * @param {'enable'|'disable'} input.action
 * @param {Eligibility} input.eligibility
 * @param {Authorization} input.authorization
 * @param {boolean} input.autoMergeEnabled
 * @param {string} [input.author] Requesting user, for the enable proof line.
 * @returns {Verdict}
 */
export function resolveVerdict({
  action,
  eligibility,
  authorization,
  autoMergeEnabled,
  author,
}) {
  if (!eligibility.eligible) {
    const reason =
      eligibility.offending.length > 0
        ? `it changes files outside the locale-owned set:\n${eligibility.offending
            .map((p) => `- \`${p}\``)
            .join('\n')}`
        : 'it does not change any locale-owned files.';
    return {
      outcome: 'ineligible',
      exitCode: 1,
      apply: null,
      message: `❌ This PR is not eligible for locale auto-merge: ${reason}`,
    };
  }

  if (!authorization.authorized) {
    const teams = authorization.missing
      .map((loc) => `\`@open-telemetry/docs-${loc}-maintainers\``)
      .join(', ');
    return {
      outcome: 'unauthorized',
      exitCode: 1,
      apply: null,
      message:
        `❌ You must be a member of the maintainer team for every locale this ` +
        `PR touches to change auto-merge. Missing: ${teams}.`,
    };
  }

  if (action === 'enable' && autoMergeEnabled) {
    return {
      outcome: 'noop',
      exitCode: 0,
      apply: null,
      message: 'ℹ️ Auto-merge is already enabled. No action taken.',
    };
  }

  if (action === 'disable' && !autoMergeEnabled) {
    return {
      outcome: 'noop',
      exitCode: 0,
      apply: null,
      message: 'ℹ️ Auto-merge is not enabled. No action taken.',
    };
  }

  const locales = eligibility.locales.map((l) => `\`${l}\``).join(', ');
  if (action === 'enable') {
    // Auditable proof line: records who was verified and against which locale
    // teams, so the PR carries a record of why the bot acted.
    const who = author ? `@${author}` : 'the requester';
    const teams = eligibility.locales
      .map((loc) => `\`@open-telemetry/docs-${loc}-maintainers\``)
      .join(', ');
    const proof =
      `\n\n<sub>Verified ${who} is a member of the maintainer team for every ` +
      `locale this PR touches: ${teams}.</sub>`;
    return {
      outcome: 'apply',
      exitCode: 0,
      apply: 'enable',
      message:
        `✅ Auto-merge enabled: for locale(s) ${locales}. All PR files are ` +
        `locale-owned or shared and can be changed by the locale(s). The PR ` +
        `will merge automatically once all required checks pass and code ` +
        `owners approve.` +
        proof,
    };
  }
  return {
    outcome: 'apply',
    exitCode: 0,
    apply: 'disable',
    message: `✅ Auto-merge disabled for this locale PR (${locales}).`,
  };
}

/**
 * Result of an injected `gh` invocation.
 *
 * @typedef {Object} GhResult
 * @property {string} stdout
 * @property {number} status   Exit code (0 on success).
 */

/**
 * Run `gh` via the injected runner and throw with context on a non-zero exit.
 *
 * @param {(args: string[]) => GhResult} runGh
 * @param {string[]} args
 * @returns {string} stdout
 */
function requireGh(runGh, args) {
  const { stdout, status } = runGh(args);
  if (status !== 0) {
    throw new Error(
      `gh ${args.slice(0, 2).join(' ')} failed with exit code ${status}`,
    );
  }
  return stdout;
}

/**
 * Structured evidence behind a `CommandResult`, for tests and logging. Fields
 * are filled progressively; those not yet reached stay at their initial value.
 *
 * @typedef {Object} CommandDetails
 * @property {string|number} prNum
 * @property {string} repo
 * @property {string} author Requesting user (the auto-merge comment author)
 *   whose authorization is checked. Not the PR author.
 * @property {'enable'|'disable'|null} command Parsed command, or `null`.
 * @property {string|null} state PR state once fetched.
 * @property {string[]} locales Locales the PR touches.
 * @property {number} fileCount Number of changed files.
 * @property {string[]} files Changed-file paths.
 * @property {string[]} offending Non-locale-owned paths.
 * @property {boolean|null} authorized Authorization result, or `null` if
 *   unchecked (PR ineligible).
 * @property {string[]} unauthorizedLocales Locales the author lacks membership
 *   for.
 * @property {boolean|null} autoMergeEnabled Current auto-merge state.
 * @property {string|null} message The PR comment body for the verdict.
 */

/**
 * Result of running the auto-merge workflow for one PR comment.
 *
 * @typedef {Object} CommandResult
 * @property {'no-command'|'not-open'|'too-many-files'|'ineligible'|'unauthorized'|'noop'|'apply'|'mutation-failed'} outcome
 * @property {number} exitCode
 * @property {CommandDetails} details Structured evidence behind the decision.
 */

/**
 * Orchestrate the auto-merge workflow for a single triggering PR comment:
 * parse the command, gather PR facts, decide, optionally mutate auto-merge, and
 * post a result comment. All `gh` access goes through the injected `runGh`.
 *
 * @param {Object} input
 * @param {string} input.repo `owner/name`.
 * @param {string|number} input.prNum Pull request number.
 * @param {string} input.commentAuthor Login of the comment author.
 * @param {string} input.commentBody Raw triggering comment body.
 * @param {Set<string>} input.knownLocales Valid locale ids.
 * @param {(args: string[]) => GhResult} input.runGh Injected `gh` runner.
 * @param {boolean} [input.dryRun] When true, perform the read-only calls and
 *   compute the verdict as usual, but log the mutating `gh` calls instead of
 *   running them.
 * @param {(message: string) => void} [input.log] Optional logger.
 * @param {boolean} [input.verbose] When true, log each changed file as it is
 *   classified (locale-owned / shared / not-owned) and each locale-team
 *   membership check (pass/fail), up to `verboseLimit` file lines.
 * @param {number} [input.verboseLimit] Cap on per-file verbose lines.
 * @returns {CommandResult}
 */
export function runAutoMergeCommand({
  repo,
  prNum,
  commentAuthor,
  commentBody,
  knownLocales,
  runGh,
  dryRun = false,
  log = () => {},
  verbose = false,
  verboseLimit = DEFAULT_VERBOSE_FILE_LIMIT,
}) {
  const org = repo.split('/')[0];

  // Route mutating calls through this guard so a dry run touches nothing. In a
  // dry run we echo the command, but elide a multi-line `--body` value (the
  // result comment) since it is reproduced in full by the final verdict log.
  const mutatingRunGh = (args) => {
    if (dryRun) {
      const shown = args.map((arg, i) =>
        args[i - 1] === '--body' && arg.includes('\n')
          ? '<comment body omitted; see verdict below>'
          : arg,
      );
      log(`[dry-run] would run: gh ${shown.join(' ')}`);
      return { stdout: '', status: 0 };
    }
    return runGh(args);
  };

  /** @type {CommandDetails} */
  const details = {
    prNum,
    repo,
    author: commentAuthor,
    command: null,
    state: null,
    locales: [],
    fileCount: 0,
    files: [],
    offending: [],
    authorized: null,
    unauthorizedLocales: [],
    autoMergeEnabled: null,
    message: null,
  };

  const action = parseCommand(commentBody);
  details.command = action;
  if (action === null) {
    log('No recognized /auto-merge command; nothing to do.');
    return { outcome: 'no-command', exitCode: 0, details };
  }

  const pr = JSON.parse(
    requireGh(runGh, [
      'pr',
      'view',
      String(prNum),
      '--repo',
      repo,
      '--json',
      'files,changedFiles,autoMergeRequest,state',
    ]),
  );
  details.state = pr.state;

  if (pr.state !== 'OPEN') {
    const message = `❌ This PR is not open (state: ${pr.state}); auto-merge cannot be changed.`;
    details.message = message;
    mutatingRunGh([
      'pr',
      'comment',
      String(prNum),
      '--repo',
      repo,
      '--body',
      message,
    ]);
    log(`[not-open] ${message}`);
    return { outcome: 'not-open', exitCode: 1, details };
  }

  const paths = (pr.files ?? []).map((f) => f.path);
  const autoMergeEnabled = pr.autoMergeRequest != null;
  details.files = paths;
  details.fileCount = paths.length;
  details.autoMergeEnabled = autoMergeEnabled;

  // `gh pr view --json files` is backed by GraphQL `files(first: 100)` with no
  // pagination, so a PR with more than 100 changed files returns only the first
  // 100. We can't see every path, so we can't prove the PR is locale-only — fail
  // closed rather than risk enabling auto-merge on an unseen, non-locale file.
  if (pr.changedFiles != null && paths.length < pr.changedFiles) {
    const message =
      `❌ This PR changes ${pr.changedFiles} files, more than the ` +
      `${paths.length} this check can read, so locale auto-merge eligibility ` +
      `can't be verified. Please ask a docs maintainer to review and merge.`;
    details.message = message;
    mutatingRunGh([
      'pr',
      'comment',
      String(prNum),
      '--repo',
      repo,
      '--body',
      message,
    ]);
    log(`[too-many-files] ${message}`);
    return { outcome: 'too-many-files', exitCode: 1, details };
  }

  // In verbose mode, log each file as it is classified, capped at verboseLimit
  // lines so a huge PR can't flood the workflow log.
  let filesLogged = 0;
  const fileLogger = verbose
    ? ({ path, kind, locale }) => {
        if (filesLogged >= verboseLimit) return;
        filesLogged++;
        const label =
          kind === 'locale'
            ? `✓ locale-owned (${locale})`
            : kind === 'shared'
              ? '✓ shared (no owner)'
              : '✗ NOT locale-owned';
        log(`[file] ${label}: ${path}`);
        if (filesLogged === verboseLimit && paths.length > verboseLimit) {
          log(
            `[file] … verbose limit (${verboseLimit}) reached; ` +
              `${paths.length - verboseLimit} more file(s) not shown`,
          );
        }
      }
    : undefined;

  const eligibility = evaluateEligibility(paths, knownLocales, fileLogger);
  details.locales = eligibility.locales;
  details.offending = eligibility.offending;

  // Only consult the team-membership API once the PR is known to be eligible.
  const authorization = eligibility.eligible
    ? authorizeForLocales(
        runGh,
        org,
        commentAuthor,
        eligibility.locales,
        verbose
          ? ({ team, member }) =>
              log(
                `[team] @${commentAuthor} ${member ? '✓ is' : '✗ is NOT'} a ` +
                  `member of @${org}/${team}`,
              )
          : undefined,
      )
    : { authorized: false, missing: [] };
  if (eligibility.eligible) {
    details.authorized = authorization.authorized;
    details.unauthorizedLocales = authorization.missing;
  }

  const verdict = resolveVerdict({
    action,
    eligibility,
    authorization,
    autoMergeEnabled,
    author: commentAuthor,
  });

  let { outcome, exitCode, message } = verdict;

  if (verdict.apply) {
    const args =
      verdict.apply === 'enable'
        ? ['pr', 'merge', String(prNum), '--repo', repo, '--auto', '--squash']
        : ['pr', 'merge', String(prNum), '--repo', repo, '--disable-auto'];
    const { status } = mutatingRunGh(args);
    if (status !== 0) {
      outcome = 'mutation-failed';
      exitCode = 1;
      message = `❌ Failed to ${verdict.apply} auto-merge (\`gh pr merge\` exited ${status}).`;
    }
  }

  details.message = message;
  mutatingRunGh([
    'pr',
    'comment',
    String(prNum),
    '--repo',
    repo,
    '--body',
    message,
  ]);
  log(`[${outcome}] ${message}`);
  return { outcome, exitCode, details };
}
