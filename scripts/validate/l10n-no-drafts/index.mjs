#!/usr/bin/env node
// Localization guideline check: localized pages never set `draft`.
//
// Enforces https://opentelemetry.io/docs/contributing/localization/#drafts:
// a localized page must not have a `draft` front-matter field, whatever its
// value, at any depth (a `cascade` block included).
//
// Usage:
//   node scripts/validate/l10n-no-drafts/index.mjs
//
// Exits non-zero when a localized page has a `draft` field. There is no --fix:
// whether to publish the translation or remove the page is an editorial choice.
//
// The scan is lexical, one line-anchored match per front-matter line, so a
// flow-style mapping (`cascade: {draft: true}`) is not detected.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DOC_URL =
  'https://opentelemetry.io/docs/contributing/localization/#drafts';

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

// A `draft` key at any indentation, as a mapping entry or a list item.
const DRAFT_KEY_RE = /^\s*(?:-\s+)?["']?draft["']?\s*:/im;

// True for a non-English content page path (content/<lang>/**/*.md).
export function isLocalizedPagePath(p) {
  const normalized = p.split(path.sep).join('/');
  const m = normalized.match(/^content\/([^/]+)\/.*\.md$/);
  return !!m && m[1] !== 'en';
}

// True when the page's YAML front matter has a `draft` key. Body text is
// never considered.
export function hasDraftKey(text) {
  const fm = FRONT_MATTER_RE.exec(text)?.[1];
  return !!fm && DRAFT_KEY_RE.test(fm);
}

// Returns the localized pages among `files` that have a `draft` key, reading
// them through `fsApi.readFileSync`.
export function findDraftPages(files, fsApi) {
  return files.filter(
    (file) =>
      isLocalizedPagePath(file) &&
      hasDraftKey(fsApi.readFileSync(file, 'utf8')),
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
    console.log('✓ no-drafts: no localized page has a `draft` field.');
    return 0;
  }

  console.log(
    `no-drafts: found ${violations.length} localized page(s) with a \`draft\` front-matter field:`,
  );
  for (const file of violations) {
    console.log(`  ${file}`);
  }
  console.log(
    `\nLocalized pages never set \`draft\`. Remove the field; if the English page is still` +
      `\nunpublished, remove the localized page instead.` +
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
