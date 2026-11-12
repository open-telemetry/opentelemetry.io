// Logic library for the locale CODEOWNERS generator. See ./README.md for
// context (opentelemetry.io#10374). The locale section of .github/CODEOWNERS
// is generated from the data/locale-teams.yaml registry; this module holds
// the pure logic so it is unit-testable. ./cli.mjs wires the file system.

export const ORG = 'open-telemetry';
export const ORG_PREFIX = `@${ORG}`;
export const DOCS_APPROVERS = `${ORG_PREFIX}/docs-approvers`;

export const BEGIN_MARKER =
  '# BEGIN locale-owners -- generated from data/locale-teams.yaml' +
  ' via `npm run fix:codeowners`; do not edit below';
export const END_MARKER = '# END locale-owners';

/**
 * Is the locale staffed? A locale with at least one maintainer gates its own
 * PRs; otherwise @open-telemetry/docs-approvers is added as a fallback.
 *
 * @param {{ maintainers?: string[] }} teams
 */
export function isStaffed(teams) {
  return (teams.maintainers ?? []).length > 0;
}

/**
 * Generate the locale section of CODEOWNERS (without markers).
 *
 * @param {Object} registry Parsed data/locale-teams.yaml.
 * @param {Object} opts
 * @param {(path: string) => boolean} opts.fileExists Repo-relative check.
 * @returns {string}
 */
export function genLocaleSection(registry, { fileExists }) {
  const locales = Object.keys(registry.locales).sort();
  const blocks = locales.map((loc) => {
    const teams = registry.locales[loc];
    const owners = [`${ORG_PREFIX}/docs-${loc}-approvers`];
    if (!isStaffed(teams)) owners.push(DOCS_APPROVERS);
    const paths = [`/.cspell/${loc}-*.txt`, `/content/${loc}/`];
    const prhYml = `prh/${loc}.yml`;
    if (fileExists(prhYml)) paths.push(`/${prhYml}`);
    const lines = paths.map((p) => ({ path: p, owners: owners.join(' ') }));
    const header = `# ${loc}${isStaffed(teams) ? '' : ' (unstaffed)'}`;
    return { header, lines };
  });

  // Align the owners column across the whole section.
  const width = Math.max(
    ...blocks.flatMap((b) => b.lines.map((l) => l.path.length)),
  );
  return blocks
    .map(
      ({ header, lines }) =>
        header +
        '\n' +
        lines.map((l) => `${l.path.padEnd(width)} ${l.owners}`).join('\n'),
    )
    .join('\n\n');
}

/**
 * Replace the marked locale section within a CODEOWNERS file.
 *
 * @param {string} content Current CODEOWNERS content.
 * @param {string} section Generated section (without markers).
 * @returns {string} Updated content.
 * @throws If the markers are missing or malformed.
 */
export function updateCodeowners(content, section) {
  const begin = content.indexOf(BEGIN_MARKER);
  const end = content.indexOf(END_MARKER);
  if (begin < 0 || end < 0 || end < begin) {
    throw new Error(
      `CODEOWNERS is missing the locale-owners BEGIN/END markers.`,
    );
  }
  return (
    content.slice(0, begin + BEGIN_MARKER.length) +
    '\n\n' +
    section +
    '\n\n' +
    content.slice(end)
  );
}

/**
 * Basic registry validation: structure, sorted + duplicate-free rosters,
 * no overlap between maintainers and approvers of a locale. When
 * `localeDirs` is given, registry keys must match it exactly.
 *
 * @param {Object} registry Parsed data/locale-teams.yaml.
 * @param {Object} [opts]
 * @param {string[]} [opts.localeDirs] Locale dirs under content/ (sans en).
 * @returns {string[]} Problems found; empty when valid.
 */
export function validateRegistry(registry, { localeDirs } = {}) {
  const problems = [];
  if (!registry?.locales || typeof registry.locales !== 'object') {
    return ['missing top-level `locales` map'];
  }
  if (localeDirs) {
    const keys = new Set(Object.keys(registry.locales));
    for (const dir of localeDirs) {
      if (!keys.has(dir))
        problems.push(`${dir}: content/ locale not in registry`);
    }
    for (const loc of keys) {
      if (!localeDirs.includes(loc)) {
        problems.push(`${loc}: registry locale has no content/ directory`);
      }
    }
  }
  for (const [loc, teams] of Object.entries(registry.locales)) {
    if (!/^[a-z]{2}(-[a-z]{2,4})?$/i.test(loc)) {
      problems.push(`${loc}: unexpected locale code`);
    }
    for (const kind of ['maintainers', 'approvers']) {
      const list = teams?.[kind];
      if (!Array.isArray(list)) {
        problems.push(`${loc}: \`${kind}\` must be a list`);
        continue;
      }
      const lower = list.map((u) => u.toLowerCase());
      const sorted = [...lower].sort();
      if (lower.join() !== sorted.join()) {
        problems.push(`${loc}: \`${kind}\` is not sorted`);
      }
      if (new Set(lower).size !== lower.length) {
        problems.push(`${loc}: \`${kind}\` has duplicates`);
      }
    }
    if (Array.isArray(teams?.maintainers) && Array.isArray(teams?.approvers)) {
      const m = new Set(teams.maintainers.map((u) => u.toLowerCase()));
      for (const u of teams.approvers) {
        if (m.has(u.toLowerCase())) {
          problems.push(
            `${loc}: ${u} is listed under both maintainers and approvers`,
          );
        }
      }
    }
  }
  return problems;
}

// -- Live team roster sync ---------------------------------------------------
// Reads the *direct* membership of each docs-<loc>-{maintainers,approvers}
// team and renders it as the registry's `locales:` map, so the registry can be
// refreshed from live state through a normal PR. Nothing here writes to
// GitHub. Every GitHub call goes through an injected `runGh` runner.

// `membership: IMMEDIATE` excludes members inherited from child teams, which
// the REST members endpoint (and GraphQL's default) folds into the parent.
export const TEAM_MEMBERS_QUERY = `query($org: String!, $slug: String!) {
  organization(login: $org) {
    team(slug: $slug) {
      members(first: 100, membership: IMMEDIATE) {
        totalCount
        pageInfo { hasNextPage }
        nodes { login }
      }
    }
  }
}`;

/**
 * Direct members of a team.
 *
 * @param {Object} opts
 * @param {(args: string[]) => { stdout: string, stderr?: string,
 *   status: number }} opts.runGh Injected `gh` runner.
 * @param {string} opts.team Team slug.
 * @returns {string[]} Logins.
 * @throws If the roster cannot be fetched completely.
 */
export function fetchDirectMembers({ runGh, team }) {
  const res = runGh([
    'api',
    'graphql',
    '-f',
    `query=${TEAM_MEMBERS_QUERY}`,
    '-f',
    `org=${ORG}`,
    '-f',
    `slug=${team}`,
  ]);
  if (res.status !== 0) {
    throw new Error(
      `${team}: gh failed (auth/access?): ${(res.stderr ?? '').trim()}`,
    );
  }
  let body;
  try {
    body = JSON.parse(res.stdout);
  } catch {
    throw new Error(`${team}: unparsable gh output`);
  }
  if (body.errors?.length) {
    throw new Error(`${team}: ${body.errors.map((e) => e.message).join('; ')}`);
  }
  // A missing team, and a team the token cannot read, both come back as
  // `null` with a success status.
  const members = body.data?.organization?.team?.members;
  if (!members) {
    throw new Error(`${team}: team not found or not readable with this token`);
  }
  if (
    members.pageInfo.hasNextPage ||
    members.nodes.length !== members.totalCount
  ) {
    throw new Error(`${team}: incomplete roster (more than one page)`);
  }
  return members.nodes.map((n) => n.login);
}

// Order used by validateRegistry: case-insensitive, code-unit order.
const sortLogins = (list) =>
  [...list].sort((a, b) => {
    const [x, y] = [a.toLowerCase(), b.toLowerCase()];
    return x < y ? -1 : x > y ? 1 : 0;
  });

/**
 * Registry roles are disjoint: approvers are the direct approver-team members
 * who are not direct maintainer-team members.
 *
 * @param {{ maintainers: string[], approvers: string[] }} direct
 * @returns {{ maintainers: string[], approvers: string[] }}
 */
export function normalizeTeams({ maintainers, approvers }) {
  const m = new Set(maintainers.map((u) => u.toLowerCase()));
  return {
    maintainers: sortLogins(maintainers),
    approvers: sortLogins(approvers.filter((u) => !m.has(u.toLowerCase()))),
  };
}

/**
 * Live registry for the given locales. All-or-nothing: throws on the first
 * team that cannot be fetched completely.
 *
 * @param {Object} opts
 * @param {(args: string[]) => { stdout: string, stderr?: string,
 *   status: number }} opts.runGh
 * @param {string[]} opts.locales
 * @returns {{ locales: Object }}
 */
export function fetchLiveRegistry({ runGh, locales }) {
  const registry = { locales: {} };
  for (const loc of [...locales].sort()) {
    registry.locales[loc] = normalizeTeams({
      maintainers: fetchDirectMembers({
        runGh,
        team: `docs-${loc}-maintainers`,
      }),
      approvers: fetchDirectMembers({ runGh, team: `docs-${loc}-approvers` }),
    });
  }
  return registry;
}

// Logins are `[A-Za-z0-9-]`; quote the ones YAML would read as a number,
// boolean or null.
const yamlLogin = (u) =>
  /^[A-Za-z][A-Za-z0-9-]*$/.test(u) &&
  !/^(true|false|null|yes|no|on|off|y|n)$/i.test(u)
    ? u
    : JSON.stringify(u);

/**
 * Render the registry's `locales:` map in the file's flow-list style.
 *
 * @param {{ locales: Object }} registry
 * @returns {string} Ends with a newline.
 */
export function genLocalesBlock(registry) {
  const list = (l) => `[${l.map(yamlLogin).join(', ')}]`;
  const locales = Object.keys(registry.locales).sort();
  return (
    'locales:\n' +
    locales
      .map((loc) => {
        const { maintainers, approvers } = registry.locales[loc];
        return (
          `  ${loc}:\n` +
          `    maintainers: ${list(maintainers)}\n` +
          `    approvers: ${list(approvers)}\n`
        );
      })
      .join('')
  );
}

/**
 * Swap the `locales:` map of a registry file for `block`, keeping the header
 * comments verbatim (a YAML dump would drop them).
 *
 * @param {string} content Current registry file content.
 * @param {string} block From genLocalesBlock.
 * @returns {string}
 * @throws If `locales:` is missing or is not the last top-level key.
 */
export function replaceLocalesBlock(content, block) {
  const start = content.search(/^locales:/m);
  if (start < 0) throw new Error('registry is missing the `locales:` map');
  const trailing = content.slice(start).split('\n').slice(1);
  if (trailing.some((l) => l && !/^\s/.test(l))) {
    throw new Error('registry has content after the `locales:` map');
  }
  return content.slice(0, start) + block;
}
