// Logic library for the locale CODEOWNERS generator. See ./README.md for
// context (opentelemetry.io#10374). The locale section of .github/CODEOWNERS
// is generated from the data/locale-teams.yaml registry; this module holds
// the pure logic so it is unit-testable. ./cli.mjs wires the file system.

export const ORG_PREFIX = '@open-telemetry';
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
 * no overlap between maintainers and approvers of a locale.
 *
 * @param {Object} registry Parsed data/locale-teams.yaml.
 * @returns {string[]} Problems found; empty when valid.
 */
export function validateRegistry(registry) {
  const problems = [];
  if (!registry?.locales || typeof registry.locales !== 'object') {
    return ['missing top-level `locales` map'];
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
