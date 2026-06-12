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
 * @param {Object} [filters]
 * @param {string[]} [filters.locales] Restrict to these locales.
 * @param {string[]} [filters.users] Restrict to these users.
 * @param {number} [filters.max] Bound the number of removals.
 * @param {string} [filters.self] Login of the runner: excluded from removals
 *   unless selfToo is set, since self-removal destroys the runner's
 *   team-maintainer role on that team (which the other removals may depend
 *   on) and cannot be undone by the runner.
 * @param {boolean} [filters.selfToo] Also remove the runner — last from each
 *   team, so the other removals still succeed.
 * @returns {{ team: string, user: string }[]} In removal order.
 */
export function planRemovals(rosters, filters = {}) {
  const { locales, users, max = Infinity, self, selfToo = false } = filters;
  const candidates = (users ?? DOCS_CORE).filter(
    (u) => DOCS_CORE.includes(u) && u !== self,
  );
  if (selfToo && self && (users ?? DOCS_CORE).includes(self)) {
    candidates.push(self);
  }
  const removals = [];
  for (const team of teamsInRemovalOrder(locales)) {
    const roster = rosters.get(team);
    if (!roster) continue;
    const locale = team.split('-')[1];
    const keep = new Set(KEEP[locale] ?? []);
    for (const user of candidates) {
      if (removals.length >= max) return removals;
      if (roster.has(user) && !keep.has(user)) removals.push({ team, user });
    }
  }
  return removals;
}

/**
 * Fetch rosters, plan removals, and (unless dryRun) perform them. The whole
 * run is idempotent: it plans from live rosters, so re-running after a
 * (partial) cleanup finds only what is still left to remove.
 *
 * @param {Object} opts
 * @param {(args: string[]) => { stdout: string, stderr?: string,
 *   status: number }} opts.runGh Injected `gh` runner.
 * @param {boolean} [opts.dryRun]
 * @param {string[]} [opts.locales] Restrict to these locales.
 * @param {string[]} [opts.users] Restrict to these users.
 * @param {number} [opts.max] Bound the number of removals.
 * @param {string} [opts.self] Login of the runner; excluded unless selfToo.
 * @param {boolean} [opts.selfToo] Also remove the runner, last per team.
 * @param {(msg: string) => void} [opts.log]
 * @returns {{ removals: { team: string, user: string, status: string }[],
 *   exitCode: number }}
 */
export function runCleanup({
  runGh,
  dryRun = true,
  locales,
  users,
  max,
  self,
  selfToo = false,
  log = () => {},
}) {
  const rosters = new Map();
  for (const team of teamsInRemovalOrder(locales)) {
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

  const planned = planRemovals(rosters, { locales, users, max, self, selfToo });
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
