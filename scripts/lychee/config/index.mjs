#!/usr/bin/env node
// Generate `lychee.toml` = `lychee.base.toml` (hand-maintained, committed) +
// an `exclude_path` block derived from page front matter
// (`link_check_exclude_path` patterns and `drifted_from_default` pages), plus
// fragment-only `exclude` entries for links into drifted pages. Drift-pending
// pages count as drifted (semantics: scripts/i18n/drift.mjs). For the
// configuration model and front-matter semantics, see:
// https://opentelemetry.io/site/build/link-checking/#configuration
//
// Usage: node scripts/lychee/config/index.mjs (npm run generate:config:links)
//        DRIFT_BASELINE=<commit> overrides the committed baseline (local use)

import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { load as yamlLoad } from 'js-yaml';

import {
  driftPendingForRepo,
  isDriftedStatus,
  parseStatus,
} from '../../i18n/drift.mjs';

export const FRONT_MATTER_KEY = 'link_check_exclude_path';

// Extract the front-matter text of a page, or undefined if there is none.
export function frontMatterOf(text) {
  const m = text.match(/^---\n(.*?)\n---/s);
  return m?.[1];
}

// Return the page's `link_check_exclude_path` patterns ([] if absent). Throws
// on YAML or shape errors: a malformed config must fail the generation, not
// drop the patterns silently.
export function excludePathPatternsOf(frontMatter, filePath) {
  if (!new RegExp(`^${FRONT_MATTER_KEY}:`, 'm').test(frontMatter)) return [];
  const fm = yamlLoad(frontMatter);
  const patterns = fm[FRONT_MATTER_KEY];
  // An empty pattern would translate to `/public/`, excluding every page.
  if (
    !Array.isArray(patterns) ||
    patterns.length === 0 ||
    !patterns.every((p) => typeof p === 'string' && /\S/.test(p))
  ) {
    throw new Error(
      `${filePath}: front-matter '${FRONT_MATTER_KEY}' must be a non-empty list of non-blank regex strings`,
    );
  }
  return patterns;
}

// If the page is a stored-drifted localized page (`drifted_from_default`
// status `true` or `file not found`, per isDriftedStatus in drift.mjs),
// return an end-anchored regex for its output directory relative to
// `public/`; otherwise return undefined.
export function driftedIgnoreDirOf(pageText, filePath) {
  if (!isDriftedStatus(parseStatus(pageText))) return;
  return pageIgnoreDirOf(filePath);
}

// Map a content page path to an end-anchored regex for its output directory
// relative to `public/`, or undefined for paths that aren't standalone output
// pages (fragments, non-content paths).
export function pageIgnoreDirOf(filePath) {
  let p = filePath.replace(/^\.\//, '');
  if (!p.startsWith('content/')) return;
  p = p.slice('content/'.length);

  // Files under underscore-prefixed directories (e.g. '_includes') are
  // fragments, not standalone output pages.
  if (/(^|\/)_[^/]+\//.test(p)) return;

  const m = p.match(/^(.*)\/(?:_index|index)\.(?:md|html)$/);
  p = m
    ? m[1] // section or leaf bundle: directory is the URL
    : p.replace(/\.(?:md|html)$/, ''); // leaf page: filename slug is the URL segment

  return `^${p}/$`;
}

// Strip pageIgnoreDirOf's anchors: `^DIR/$` -> `DIR`.
const pageDirOf = (dir) => dir.replace(/^\^/, '').replace(/\/\$$/, '');

// Translate one site-relative exclude regex into a lychee `exclude_path`
// regex. Front matter expresses paths relative to the site root, while
// `exclude_path` matches the absolute path of each input file, so every
// pattern is re-anchored verbatim (they are regexes) onto the `/public/`
// path segment, accounting for Hugo's pretty-URL `index.html` page files:
//
//   `^bn/docs/demo/$`        (a single page)   -> /public/bn/docs/demo/index\.html$
//   `^(../)?blog/20(19|2.)/` (a whole subtree) -> /public/(../)?blog/20(19|2.)/
//
// Anchoring on `/public/` (here and in fragmentExcludeOf) assumes that no
// site URL has a `public` path segment, so the build directory is the only
// match.
export function translate(pattern) {
  const body = pattern.replace(/^\^/, '');
  if (body.endsWith('/$')) {
    return `/public/${body.slice(0, -1)}index\\.html$`;
  }
  return `/public/${body.replace(/\$$/, '')}`;
}

// Map a page directory (`^DIR/$`, as from pageIgnoreDirOf) to a lychee
// `exclude` regex matching only fragment links into that page: `DIR#…` (the
// form lychee resolves directory links to), `DIR/#…`, and `DIR/index.html#…`.
// DIR is matched literally (regex-escaped), with anchoring as in translate().
export function fragmentExcludeOf(dir) {
  const escaped = pageDirOf(dir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return `/public/${escaped}(/(index\\.html)?)?#`;
}

// Placeholder line in `lychee.base.toml`'s `exclude` array for the generated
// fragment excludes (TOML allows only one `exclude` key, so they can't be
// appended).
export const EXCLUDE_MARKER =
  '# --- GENERATED: drifted-page fragment excludes ---';

// Replace the base's marker line with the given `exclude` entries; throws
// unless the marker occurs exactly once.
export function withFragmentExcludes(baseText, entries) {
  const lines = baseText.split('\n');
  const at = lines.flatMap((l, i) => (l.trim() === EXCLUDE_MARKER ? [i] : []));
  if (at.length !== 1) {
    throw new Error(
      `lychee.base.toml: expected one '${EXCLUDE_MARKER}' marker line in the exclude array, found ${at.length}`,
    );
  }
  lines.splice(at[0], 1, ...entries.map((e) => `  '${e}',`));
  return lines.join('\n');
}

// Collect and translate the exclude_path entries for the given pages
// ([filePath, fileText] pairs) plus any drift-pending ignore dirs:
// front-matter patterns first (in file order), then drifted-page directories
// (sorted), then drift-pending directories (sorted), de-duplicated in
// first-seen order. Also returns `fragmentExcludes`, lychee `exclude` regexes
// for fragment links into the drifted and drift-pending pages, in the same
// order, gated as follows. A lychee `exclude` drops the whole matching link,
// page check included, so the skip stays fragment-only only when the page
// lychee would have checked is the drifted page itself, known to exist:
// `isBuilt(DIR)` must accept the directory (by default nothing is, so a caller
// supplies the gate), and the drifted page must be its directory's only
// content file (a leaf beside a same-path section is shadowed: Hugo serves
// the section). A page failing either test gets no fragment exclude, so a
// missing page keeps failing and a served in-sync page keeps its fragments
// checked.
export function toExcludePaths(
  pages,
  driftPendingDirs = [],
  isBuilt = () => false,
) {
  const patterns = [];
  const drifted = [];
  const claims = new Map(); // output directory -> content files mapping to it
  for (const [filePath, text] of pages) {
    const dir = pageIgnoreDirOf(filePath);
    if (dir) claims.set(dir, (claims.get(dir) ?? 0) + 1);
    const fm = frontMatterOf(text);
    if (fm === undefined) continue;
    patterns.push(...excludePathPatternsOf(fm, filePath));
    if (dir && isDriftedStatus(parseStatus(text))) drifted.push(dir);
  }
  drifted.sort();
  const driftPending = [...driftPendingDirs].sort();
  const entries = [
    ...new Set([...patterns, ...drifted, ...driftPending].map(translate)),
  ];
  const fragmentExcludes = [
    ...new Set(
      [...drifted, ...driftPending]
        .filter((dir) => claims.get(dir) === 1 && isBuilt(pageDirOf(dir)))
        .map(fragmentExcludeOf),
    ),
  ];
  return { patterns, drifted, driftPending, entries, fragmentExcludes };
}

function* contentPages(rootDir) {
  const contentDir = path.join(rootDir, 'content');
  const files = readdirSync(contentDir, { recursive: true })
    .filter((f) => f.endsWith('.md'))
    .sort();
  for (const f of files) {
    const filePath = path.join('content', f);
    yield [filePath, readFileSync(path.join(rootDir, filePath), 'utf8')];
  }
}

async function mainCLI() {
  const rootDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../..',
  );

  // Presumed-drifted locale copies since the status baseline (drift-pending).
  // Throws when the baseline is missing or unresolvable (see readBaseline).
  const baseline = process.env.DRIFT_BASELINE;
  const driftPendingDirs = (await driftPendingForRepo(rootDir, baseline))
    .map(pageIgnoreDirOf)
    .filter(Boolean);

  // Every entry point builds before generating, so `public/` is the build the
  // check runs over, production or not.
  const isBuilt = (dir) =>
    existsSync(path.join(rootDir, 'public', dir, 'index.html'));

  const { patterns, drifted, driftPending, entries, fragmentExcludes } =
    toExcludePaths(contentPages(rootDir), driftPendingDirs, isBuilt);

  const base = readFileSync(path.join(rootDir, 'lychee.base.toml'), 'utf8');
  const lines = [
    withFragmentExcludes(base, fragmentExcludes),
    '# --- exclude_path (GENERATED) ---',
    '# Pages the link checker skips (blog pagination, old blog posts, drifted',
    '# localized pages), derived from page front matter and drift status. Do',
    '# not edit here; regenerate with:',
    '#   npm run generate:config:links',
    'exclude_path = [',
    ...entries.map((e) => `  '${e}',`),
    ']',
    '',
  ];
  writeFileSync(path.join(rootDir, 'lychee.toml'), lines.join('\n'));

  console.error(
    `Translated ${patterns.length} front-matter + ${drifted.length} drifted-page ` +
      `+ ${driftPending.length} drift-pending patterns -> ` +
      `${entries.length} exclude_path entries, ` +
      `${fragmentExcludes.length} fragment excludes.`,
  );
  console.error('Generated lychee.toml.');
}

// Robust under symlinked invocation paths (worktrees): compare real paths.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  await mainCLI();
}
