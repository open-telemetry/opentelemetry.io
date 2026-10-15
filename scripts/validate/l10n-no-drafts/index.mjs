#!/usr/bin/env node
// Localization guideline check: localized pages are never drafts.
//
// A localized page marked `draft: true` owns its path in its locale, so it
// blocks the English fallback there, yet the production build omits it. Once
// the English page is published, readers of that locale get a 404 instead of
// the English page. The rule is unconditional (it doesn't look at the English
// page's state) so that publishing an English page never obliges its author
// to fix localized front matter. Guideline:
// https://opentelemetry.io/docs/contributing/localization/#drafts
//
// Usage:
//   node scripts/validate/l10n-no-drafts/index.mjs
//
// Exits non-zero when a localized page sets `draft: true` in its front matter,
// at the top level or inside a `cascade` block. There is no --fix: whether to
// publish the translation or remove the page is an editorial choice.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DOC_URL =
  'https://opentelemetry.io/docs/contributing/localization/#drafts';

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

// Any `draft: true` key in the front matter, at any indentation, so that a
// `cascade` block drafting a whole section is caught too. Hugo also reads a
// quoted "true" as true.
const DRAFT_TRUE_RE = /^\s*draft:\s*["']?true["']?\s*(?:#.*)?$/m;

// True for a non-English content page path (content/<lang>/**/*.md).
export function isLocalizedPagePath(p) {
  const normalized = p.split(path.sep).join('/');
  const m = normalized.match(/^content\/([^/]+)\/.*\.md$/);
  return !!m && m[1] !== 'en';
}

// True when the page text has a YAML front-matter block that sets
// `draft: true` (top level or cascaded). Body text is never considered.
export function isDraftPage(text) {
  const fm = FRONT_MATTER_RE.exec(text)?.[1];
  return !!fm && DRAFT_TRUE_RE.test(fm);
}

// Pure rule: given candidate file paths and a minimal fs API
// ({ readFileSync }), returns the localized draft pages. Dependency-injected
// so it is unit-testable without touching the real filesystem.
export function findDraftPages(files, fsApi) {
  return files.filter(
    (file) =>
      isLocalizedPagePath(file) &&
      isDraftPage(fsApi.readFileSync(file, 'utf8')),
  );
}

// Walks content/<lang>/ for every locale except en, collecting markdown page
// paths as forward-slash relative paths.
export function collectLocalizedPages(contentDir = 'content') {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(contentDir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'en') continue;
    walk(path.join(contentDir, entry.name));
  }
  return out;

  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md')) out.push(p.split(path.sep).join('/'));
    }
  }
}

function main() {
  const violations = findDraftPages(collectLocalizedPages('content'), fs);

  if (violations.length === 0) {
    console.log('✓ no-drafts: no localized page is a draft.');
    return 0;
  }

  console.log(
    `no-drafts: found ${violations.length} localized page(s) marked \`draft: true\`:`,
  );
  for (const file of violations) {
    console.log(`  ${file}`);
  }
  console.log(
    `\nLocalized pages must not be drafts: a draft blocks the English fallback for its path` +
      `\nwithout being published, so readers get a 404 once the English page is published.` +
      `\nRemove \`draft: true\` to publish the translation, or remove the page until its English` +
      `\nversion is published.` +
      `\nSee ${DOC_URL}`,
  );
  return 1;
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;
if (isMain) {
  process.exit(main());
}
