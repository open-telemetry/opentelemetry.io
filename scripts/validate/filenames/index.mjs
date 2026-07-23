#!/usr/bin/env node
// File and directory name checks backing the `FILENAME check` PR check. For
// what the check enforces and contributor-facing guidance, see DOC_URL below.
//
// Usage:
//   node scripts/validate/filenames/index.mjs [--fix]
//
// With --fix, obsolete paths are DELETED and non-kebab-case names are
// renamed. Without --fix, the command exits non-zero when violations are
// found.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DOC_URL =
  'https://opentelemetry.io/docs/contributing/pr-checks/#filename-check';

// Directories scanned for kebab-case violations.
export const SCAN_DIRS = ['assets', 'content', 'static'];

// Violation messages must be self-contained: under GitHub Actions each one is
// emitted as a per-file error annotation, read without the surrounding output.

export const KEBAB_CASE_MESSAGE =
  'File and directory names must be in kebab-case: rename it, or run `npm run fix:filenames`. ' +
  'See https://opentelemetry.io/docs/contributing/style-guide/#file-names';

// Paths deleted from `main` that PRs occasionally reintroduce, usually the
// sign of a stale branch. This table is canonical; the "Obsolete files and
// folders" list of content/en/docs/contributing/pr-checks.md mirrors it for
// contributors (drift-guarded by index.test.mjs).
export const OBSOLETE_PATHS = [
  {
    path: 'tools',
    message:
      'Obsolete folder: the code-excerpts tooling now comes from an npm package (PR #9638). ' +
      'Delete the folder by running `npm run fix:filenames`.',
  },
  {
    path: 'static/refcache.json',
    message:
      'Obsolete file: deleted when link checking switched to Lychee (PR #10911). ' +
      'Your branch is probably stale: update it by merging in the latest `main`. ' +
      'For details, see https://github.com/open-telemetry/opentelemetry.io/issues/10990',
  },
];

// True when a file or directory basename violates the kebab-case convention.
// `_`- and `.`-prefixed names (Hugo `_index.md` files, dotfiles) are exempt.
export function isBadName(name) {
  return name.includes('_') && !name.startsWith('_') && !name.startsWith('.');
}

/**
 * Walks the given directories (relative to cwd), returning the sorted
 * repo-relative paths of every file or directory whose basename violates
 * kebab-case. Missing directories are skipped; see main() for the existence
 * check that keeps that tolerance from masking a misconfiguration.
 *
 * @param {string[]} dirs
 * @param {{ cwd?: string }} [options]
 * @returns {string[]}
 */
export function findBadFilenames(dirs = SCAN_DIRS, { cwd = '.' } = {}) {
  const out = [];
  for (const dir of dirs) walk(dir);
  return out.sort();

  function walk(rel) {
    let entries;
    try {
      entries = fs.readdirSync(path.join(cwd, rel), { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const relChild = `${rel}/${entry.name}`;
      if (isBadName(entry.name)) out.push(relChild);
      if (entry.isDirectory()) walk(relChild);
    }
  }
}

/**
 * Returns the entries of `obsolete` whose path exists under cwd.
 *
 * @param {typeof OBSOLETE_PATHS} [obsolete]
 * @param {{ cwd?: string }} [options]
 */
export function findObsoletePaths(
  obsolete = OBSOLETE_PATHS,
  { cwd = '.' } = {},
) {
  return obsolete.filter((entry) => fs.existsSync(path.join(cwd, entry.path)));
}

/**
 * Deletes obsolete paths and renames kebab-case violations (underscores to
 * dashes). Renames are applied deepest-first so that renaming a directory
 * doesn't invalidate the paths of violations nested inside it.
 *
 * @param {{
 *   badNames?: string[],
 *   obsolete?: typeof OBSOLETE_PATHS,
 *   cwd?: string,
 *   log?: (message: string) => void,
 * }} options
 */
export function fixViolations({
  badNames = [],
  obsolete = [],
  cwd = '.',
  log = console.log,
} = {}) {
  for (const { path: p } of obsolete) {
    log(`Removing obsolete path: ${p}`);
    fs.rmSync(path.join(cwd, p), { recursive: true, force: true });
  }
  const deepestFirst = [...badNames].sort(
    (a, b) => b.split('/').length - a.split('/').length,
  );
  for (const p of deepestFirst) {
    if (!fs.existsSync(path.join(cwd, p))) continue; // gone with an obsolete path
    const to = path.posix.join(
      path.posix.dirname(p),
      path.posix.basename(p).replaceAll('_', '-'),
    );
    log(`Renaming: ${p} -> ${to}`);
    fs.renameSync(path.join(cwd, p), path.join(cwd, to));
  }
}

// Escapes annotation message data; see
// https://github.com/actions/toolkit/blob/main/docs/commands.md
export function escapeAnnotation(message) {
  return message
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A');
}

function main() {
  const fix = process.argv.includes('--fix');

  const missing = SCAN_DIRS.filter((dir) => !fs.existsSync(dir));
  if (missing.length > 0) {
    console.error(
      `ERROR: expected to find and scan [${missing.join(', ')}]; ` +
        'run this script from the repository root.',
    );
    return 1;
  }

  const badNames = findBadFilenames();
  const obsolete = findObsoletePaths();
  const violations = [
    ...badNames.map((p) => ({
      path: p,
      title: 'Name is not kebab-case',
      message: KEBAB_CASE_MESSAGE,
    })),
    ...obsolete.map(({ path: p, message }) => ({
      path: p,
      title: 'Obsolete path',
      message,
    })),
  ];

  if (violations.length === 0) {
    console.log(
      '✓ filenames: no kebab-case violations or obsolete paths found.',
    );
    return 0;
  }

  console.log(`filenames: found ${violations.length} violation(s):\n`);
  for (const { path: p, title, message } of violations) {
    console.log(`  ${p}\n    └─ ${message}`);
    if (process.env.GITHUB_ACTIONS === 'true') {
      console.log(
        `::error file=${p},title=${title}::${escapeAnnotation(message)}`,
      );
    }
  }

  if (fix) {
    console.log('');
    fixViolations({ badNames, obsolete });
    console.log(`\n✓ Fixed ${violations.length} violation(s).`);
    return 0;
  }

  console.log(`\nFor details, see ${DOC_URL}`);
  return 1;
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;
if (isMain) {
  process.exit(main());
}
