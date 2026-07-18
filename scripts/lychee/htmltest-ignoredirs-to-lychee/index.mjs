#!/usr/bin/env node
// Translate htmltest `IgnoreDirs` regexes (from the generated `.htmltest.yml`)
// into lychee `exclude_path` regexes.
//
// htmltest matches each `IgnoreDirs` regex against a page's output directory,
// expressed relative to `public/` (e.g. `bn/docs/demo/`, `blog/2024/foo/`).
// lychee's `exclude_path` matches against the input file path it scans — here
// the absolute path of each built `public/**/*.html`. So we re-anchor every
// pattern onto the `/public/` path segment and account for Hugo's pretty-URL
// `index.html` page files:
//
//   `^bn/docs/demo/$`               (a single page) -> /public/bn/docs/demo/index\.html$
//   `^(../)?blog/20(19|2.)/`        (a whole subtree) -> /public/(../)?blog/20(19|2.)/
//   `^(../)?blog/(\d+/)?page/\d+`   (substring)       -> /public/(../)?blog/(\d+/)?page/\d+
//
// htmltest's `(../)?` prefix is regex (the `.`s are wildcards), so it optionally
// matches *any two characters + slash* — i.e. a 2-letter locale segment such as
// `ja/`, `es/`, `pt/`. That is how htmltest ignores old blog posts in every
// locale, not just EN. We preserve `(../)?` verbatim (re-anchored onto the
// `/public/` segment) to keep exact parity; dropping it would only exclude EN
// and leave localized old-blog externals to be (wrongly) scanned.
//
// Usage: node scripts/lychee/htmltest-ignoredirs-to-lychee/index.mjs <.htmltest.yml>
// Prints TOML-ready `exclude_path` array lines on stdout.
//
// cSpell:ignore ignoredirs

import { readFileSync } from 'node:fs';

// Extract the `IgnoreDirs:` block's list items from `.htmltest.yml` text,
// skipping comments and blank lines.
export function parseIgnoreDirs(text) {
  const patterns = [];
  let inBlock = false;
  for (const line of text.split('\n')) {
    if (/^IgnoreDirs:/.test(line)) {
      inBlock = true;
      continue;
    }
    if (!inBlock) continue;
    if (/^[A-Za-z]/.test(line)) break; // next top-level key
    const m = line.match(/^\s*-\s*'?([^'\n]+?)'?\s*$/);
    if (m && !line.trimStart().startsWith('#')) patterns.push(m[1]);
  }
  return patterns;
}

// Translate one htmltest `IgnoreDirs` regex into a lychee `exclude_path` regex.
// `(../)?` is preserved verbatim so it keeps matching an optional locale
// segment (see the header comment); dropping it would only exclude EN.
export function translate(pattern) {
  const body = pattern.replace(/^\^/, '');
  if (body.endsWith('/$')) {
    // a single page bundle: that directory's index.html
    return `/public/${body.slice(0, -1)}index\\.html$`;
  }
  // trailing `/` (subtree) or arbitrary tail (substring) — anchor onto /public/
  return `/public/${body.replace(/\$$/, '')}`;
}

// Parse + translate + de-duplicate, preserving first-seen order.
export function toExcludePaths(text) {
  const patterns = parseIgnoreDirs(text);
  const entries = [...new Set(patterns.map(translate))];
  return { patterns, entries };
}

function mainCLI() {
  const [, , inPath = '.htmltest.yml'] = process.argv;
  const { patterns, entries } = toExcludePaths(readFileSync(inPath, 'utf8'));
  for (const e of entries) console.log(`  '${e}',`);
  console.error(
    `Translated ${patterns.length} IgnoreDirs -> ${entries.length} exclude_path entries.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) mainCLI();
