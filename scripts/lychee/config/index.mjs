#!/usr/bin/env node
// Generate `lychee.toml` = `lychee.base.toml` (hand-maintained, committed) +
// an `exclude_path` block derived from page front matter
// (`link_check_exclude_path` patterns and `drifted_from_default` pages). For
// the configuration model and front-matter semantics, see:
// https://opentelemetry.io/site/build/link-checking/#configuration
//
// Stored drift statuses are only as fresh as the last nightly Housekeeping
// sync, so the generator also excludes the locale copies of English pages
// changed since the recorded status baseline ("drift pending" — the pages
// that the next nightly sync will mark drifted). Drift semantics, the
// baseline, and the activity exemption live in scripts/i18n/drift.mjs; this
// script only maps the resulting pages to lychee exclude patterns.
//
// Front matter expresses paths relative to the site root, while lychee's
// `exclude_path` matches the absolute path of each input file it scans. So
// every pattern is re-anchored (verbatim — they are regexes) onto the
// `/public/` path segment, accounting for Hugo's pretty-URL `index.html` page
// files:
//
//   `^bn/docs/demo/$`        (a single page)   -> /public/bn/docs/demo/index\.html$
//   `^(../)?blog/20(19|2.)/` (a whole subtree) -> /public/(../)?blog/20(19|2.)/
//
// Usage: node scripts/lychee/config/index.mjs (npm run generate:config:links)
//        DRIFT_BASELINE=<commit> overrides the committed baseline (local use)

import {
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

// --- pure helpers (unit-tested) ---------------------------------------------

// Extract the front-matter text of a page, or undefined if there is none.
export function frontMatterOf(text) {
  const m = text.match(/^---\n(.*?)\n---/s);
  return m?.[1];
}

// Return the page's `link_check_exclude_path` patterns ([] if absent). Throws
// on YAML or shape errors so a malformed config fails the generation loudly
// (the htmltest-era extractor warned and skipped, silently dropping config).
export function excludePathPatternsOf(frontMatter, filePath) {
  if (!new RegExp(`^${FRONT_MATTER_KEY}:`, 'm').test(frontMatter)) return [];
  const fm = yamlLoad(frontMatter);
  const patterns = fm[FRONT_MATTER_KEY];
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
// status `true` or `file not found` — the shared predicate in drift.mjs),
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
  // Strip the leading 'content/' source prefix.
  let p = filePath.replace(/^\.\//, '');
  if (!p.startsWith('content/')) return;
  p = p.slice('content/'.length);

  // Skip files under underscore-prefixed directories (e.g. '_includes'): they
  // are fragments, not standalone output pages.
  if (/(^|\/)_[^/]+\//.test(p)) return;

  // Map the source file to its pretty-URL output directory.
  const m = p.match(/^(.*)\/(?:_index|index)\.(?:md|html)$/);
  p = m
    ? m[1] // section or leaf bundle: directory is the URL
    : p.replace(/\.(?:md|html)$/, ''); // leaf page: filename slug is the URL segment

  return `^${p}/$`;
}

// Translate one site-relative exclude regex into a lychee `exclude_path` regex
// anchored onto the `/public/` path segment (see the header comment).
export function translate(pattern) {
  const body = pattern.replace(/^\^/, '');
  if (body.endsWith('/$')) {
    // a single page bundle: that directory's index.html
    return `/public/${body.slice(0, -1)}index\\.html$`;
  }
  // trailing `/` (subtree) or arbitrary tail (substring) — anchor onto /public/
  return `/public/${body.replace(/\$$/, '')}`;
}

// Collect and translate the exclude_path entries for the given pages, given as
// [filePath, fileText] pairs, plus any drift-pending ignore dirs: front-matter
// patterns first (in file order), then drifted-page directories (sorted), then
// drift-pending directories (sorted); de-duplicated, first-seen order.
export function toExcludePaths(pages, driftPendingDirs = []) {
  const patterns = [];
  const drifted = [];
  for (const [filePath, text] of pages) {
    const fm = frontMatterOf(text);
    if (fm === undefined) continue;
    patterns.push(...excludePathPatternsOf(fm, filePath));
    const dir = driftedIgnoreDirOf(text, filePath);
    if (dir) drifted.push(dir);
  }
  drifted.sort();
  const driftPending = [...driftPendingDirs].sort();
  const entries = [
    ...new Set([...patterns, ...drifted, ...driftPending].map(translate)),
  ];
  return { patterns, drifted, driftPending, entries };
}

// --- generation --------------------------------------------------------------

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
  // Throws when the baseline is missing or unresolvable (e.g. too-shallow CI
  // clone): a silent empty overlay would false-green drift-pending pages.
  const baseline = process.env.DRIFT_BASELINE;
  const driftPendingDirs = (await driftPendingForRepo(rootDir, baseline))
    .map(pageIgnoreDirOf)
    .filter(Boolean);

  const { patterns, drifted, driftPending, entries } = toExcludePaths(
    contentPages(rootDir),
    driftPendingDirs,
  );

  const lines = [
    readFileSync(path.join(rootDir, 'lychee.base.toml'), 'utf8'),
    '# --- exclude_path (GENERATED) ---',
    '# Pages the link checker skips (blog pagination, old blog posts, drifted',
    '# localized pages), derived from content front matter. Do not edit here;',
    '# regenerate with:',
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
      `${entries.length} exclude_path entries.`,
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
