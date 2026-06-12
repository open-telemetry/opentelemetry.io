// Logic library for the locale team cleanup helper. See ./README.md for
// context (opentelemetry.io#10374) and cautions. The orchestrator
// (`runCleanup`) funnels every GitHub call through an injected `runGh` runner
// so it stays unit-testable; ./cli.mjs wires in the real `gh`.

export const ORG = 'open-telemetry';

// Docs-core (docs-maintainers/approvers) members acting as interim locale
// maintainers — the memberships to clean up.
export const DOCS_CORE = [
  'austinlparker',
  'cartermp',
  'chalin',
  'jaydeluca',
  'maryliag',
  'svrnm',
  'theletterf',
  'tiffany76',
  'vitorvasc',
];

// Locale -> docs-core members to KEEP: genuine locale reviewers (native
// speakers) whose locale-team membership is honest, not interim.
export const KEEP = {
  fr: ['chalin'],
  pt: ['maryliag', 'vitorvasc'],
};

export const LOCALES = ['bn', 'es', 'fr', 'ja', 'pl', 'pt', 'ro', 'uk', 'zh'];

/**
 * The teams to clean, in removal order: for each locale, the child team
 * (maintainers) before its parent (approvers), since GitHub rosters include
 * child-team members and removals must target the direct membership.
 *
 * @param {string[]} [locales]
 * @returns {string[]} Team slugs.
 */
export function teamsInRemovalOrder(locales = LOCALES) {
  return locales.flatMap((loc) => [
    `docs-${loc}-maintainers`,
    `docs-${loc}-approvers`,
  ]);
}

/**
 * Compute the memberships to remove, given live team rosters.
 *
 * @param {Map<string, Set<string>>} rosters Team slug -> member logins.
 * @returns {{ team: string, user: string }[]} In removal order.
 */
export function planRemovals(rosters) {
  const removals = [];
  for (const team of teamsInRemovalOrder()) {
    const roster = rosters.get(team);
    if (!roster) continue;
    const locale = team.split('-')[1];
    const keep = new Set(KEEP[locale] ?? []);
    for (const user of DOCS_CORE) {
      if (roster.has(user) && !keep.has(user)) removals.push({ team, user });
    }
  }
  return removals;
}

/**
 * Fetch rosters, plan removals, and (unless dryRun) perform them.
 *
 * @param {Object} opts
 * @param {(args: string[]) => { stdout: string, stderr?: string,
 *   status: number }} opts.runGh Injected `gh` runner.
 * @param {boolean} [opts.dryRun]
 * @param {(msg: string) => void} [opts.log]
 * @returns {{ removals: { team: string, user: string, status: string }[],
 *   exitCode: number }}
 */
export function runCleanup({ runGh, dryRun = true, log = () => {} }) {
  const rosters = new Map();
  for (const team of teamsInRemovalOrder()) {
    const res = runGh([
      'api',
      `/orgs/${ORG}/teams/${team}/members`,
      '--paginate',
      '-q',
      '.[].login',
    ]);
    if (res.status !== 0) {
      log(`ERROR: could not fetch roster for ${team}: ${res.stderr ?? ''}`);
      return { removals: [], exitCode: 1 };
    }
    rosters.set(team, new Set(res.stdout.split('\n').filter(Boolean)));
  }

  const planned = planRemovals(rosters);
  if (planned.length === 0) {
    log('Nothing to remove; all locale teams are already clean.');
    return { removals: [], exitCode: 0 };
  }

  let failures = 0;
  const removals = planned.map(({ team, user }) => {
    let status;
    if (dryRun) {
      status = 'would remove';
    } else {
      const res = runGh([
        'api',
        '-X',
        'DELETE',
        `/orgs/${ORG}/teams/${team}/memberships/${user}`,
      ]);
      if (res.status === 0) {
        status = 'removed';
      } else if ((res.stderr ?? '').includes('404')) {
        // Not a direct member (e.g. only via the child team): skip.
        status = 'skipped (not a direct member)';
      } else {
        status = `FAILED: ${(res.stderr ?? '').trim()}`;
        failures++;
      }
    }
    log(`${team}: ${user} — ${status}`);
    return { team, user, status };
  });

  if (dryRun) {
    log(
      `\nDry run only: ${planned.length} removal(s) planned. ` +
        `Pass --no-dry-run (-f) to perform them.`,
    );
  }
  return { removals, exitCode: failures ? 1 : 0 };
}
