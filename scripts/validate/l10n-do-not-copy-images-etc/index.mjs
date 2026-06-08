#!/usr/bin/env node
// Localization guideline checks.
//
// Enforces aspects of https://opentelemetry.io/docs/contributing/localization/
// that can be validated mechanically. Currently implements:
//
//   - copied-images: a localized page bundle must NOT contain a byte-identical
//     copy of an image that already exists in the corresponding English bundle.
//     Hugo shares a single English asset across localizations, so such copies
//     are both a guideline violation and redundant. A genuinely localized image
//     (text translated inside the image) differs in bytes and is allowed.
//
// Usage:
//   node scripts/validate/l10n-do-not-copy-images-etc/index.mjs [--fix]
//
// With --fix, redundant copies are removed (the shared English asset keeps the
// page rendering). Without --fix, the command exits non-zero when violations
// are found.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DOC_URL =
  'https://opentelemetry.io/docs/contributing/localization/#images';

// Binary/image asset extensions that may be shared across localizations.
export const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'avif',
  'ico',
  'bmp',
  'tif',
  'tiff',
  'pdf',
  'mp4',
  'webm',
]);

// Returns true for paths whose extension is a shareable image/asset type.
export function isImagePath(p) {
  const ext = p.split('.').pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.has(ext);
}

// Maps a localized content path to its English counterpart, or null when the
// path is not a non-English content path. E.g.
//   content/ja/docs/x/img.png -> content/en/docs/x/img.png
export function enCounterpart(p) {
  const normalized = p.split(path.sep).join('/');
  const m = normalized.match(/^content\/([^/]+)\/(.*)$/);
  if (!m || m[1] === 'en') return null;
  return `content/en/${m[2]}`;
}

// Pure rule: given a list of candidate file paths and a minimal fs API
// ({ existsSync, readFileSync }), returns the copied-image violations as
// { file, enFile } records. Kept dependency-injected so it is unit-testable
// without touching the real filesystem.
export function findCopiedImages(files, fsApi) {
  const violations = [];
  for (const file of files) {
    if (!isImagePath(file)) continue;
    const enFile = enCounterpart(file);
    if (!enFile || !fsApi.existsSync(enFile)) continue;
    if (fsApi.readFileSync(file).equals(fsApi.readFileSync(enFile))) {
      violations.push({ file, enFile });
    }
  }
  return violations;
}

// Walks content/<loc>/ (for every locale except en) collecting image asset
// paths as forward-slash relative paths.
export function collectLocaleImageFiles(contentDir = 'content') {
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
      else if (isImagePath(p)) out.push(p.split(path.sep).join('/'));
    }
  }
}

function main() {
  const fix = process.argv.includes('--fix');
  const files = collectLocaleImageFiles('content');
  const violations = findCopiedImages(files, fs);

  if (violations.length === 0) {
    console.log('✓ do-not-copy-images: no copied images found.');
    return 0;
  }

  console.log(
    `do-not-copy-images: found ${violations.length} copied image(s) that duplicate the English asset:`,
  );
  for (const { file, enFile } of violations) {
    console.log(`  ${file}\n    └─ identical to ${enFile}`);
  }

  if (fix) {
    for (const { file } of violations) fs.rmSync(file);
    console.log(
      `\n✓ Removed ${violations.length} redundant copy(ies). The shared English asset still renders on localized pages.`,
    );
    return 0;
  }

  console.log(
    `\nDo not copy images across localizations; Hugo shares the English asset automatically.` +
      `\nRemove the copies (or run \`npm run fix:l10n:do-not-copy-images-etc\`), or localize the image text so it differs.` +
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
