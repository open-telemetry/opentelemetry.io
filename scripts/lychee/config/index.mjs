#!/usr/bin/env node
// Generate `lychee.toml` = `lychee.base.toml` + an `exclude_path` block derived
// from content front matter. The base is hand-maintained and committed;
// `lychee.toml` is generated and gitignored. Two front-matter sources feed the
// block:
//
// - `link_check_exclude_path` — a list of site-relative regexes for pages the
//   link checker must skip (e.g. blog pagination, old blog posts); see
//   content/en/blog/_index.md.
// - `drifted_from_default: true` — drifted localized pages. Link checking
//   originating from drifted pages is skipped (their links may be stale), but
//   the pages remain resolvable as anchor targets, so inbound links from
//   non-drifted pages keep being validated.
//
// Both express paths relative to the site root (`public/`), while lychee's
// `exclude_path` matches the absolute path of each input file it scans. So
// every pattern is re-anchored onto the `/public/` path segment, accounting for
// Hugo's pretty-URL `index.html` page files:
//
//   `^bn/docs/demo/$`             (a single page)   -> /public/bn/docs/demo/index\.html$
//   `^(../)?blog/20(19|2.)/`      (a whole subtree) -> /public/(../)?blog/20(19|2.)/
//   `^(../)?blog/(\d+/)?page/\d+` (substring)       -> /public/(../)?blog/(\d+/)?page/\d+
//
// The `(../)?` prefix is regex (the `.`s are wildcards): it optionally matches
// *any two characters + slash* — i.e. a 2-letter locale segment such as `ja/`,
// `es/`, `pt/`. That is how a single pattern skips old blog posts in every
// locale, not just EN. It is preserved verbatim; dropping it would only exclude
// EN and leave localized old-blog externals to be (wrongly) scanned.
//
// Usage: node scripts/lychee/config/index.mjs
// Run via `npm run generate:config:links`.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad } from 'js-yaml';

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

// If the page is a drifted localized page (`drifted_from_default: true`),
// return an end-anchored regex for its output directory relative to `public/`;
// otherwise return undefined.
export function driftedIgnoreDirOf(frontMatter, filePath) {
  if (!/^drifted_from_default:\s*true\s*$/m.test(frontMatter)) return;

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
// [filePath, fileText] pairs: front-matter patterns first (in file order), then
// drifted-page directories (sorted); de-duplicated, first-seen order.
export function toExcludePaths(pages) {
  const patterns = [];
  const drifted = [];
  for (const [filePath, text] of pages) {
    const fm = frontMatterOf(text);
    if (fm === undefined) continue;
    patterns.push(...excludePathPatternsOf(fm, filePath));
    const dir = driftedIgnoreDirOf(fm, filePath);
    if (dir) drifted.push(dir);
  }
  drifted.sort();
  const entries = [...new Set([...patterns, ...drifted].map(translate))];
  return { patterns, drifted, entries };
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

function mainCLI() {
  const rootDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../..',
  );
  const { patterns, drifted, entries } = toExcludePaths(contentPages(rootDir));

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
      `patterns -> ${entries.length} exclude_path entries.`,
  );
  console.error('Generated lychee.toml.');
}

if (import.meta.url === `file://${process.argv[1]}`) mainCLI();
