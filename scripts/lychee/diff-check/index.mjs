#!/usr/bin/env node
// Diff-scoped lychee check: run lychee only over the built HTML for content
// files changed in this PR / working tree; no-op (exit 0) when nothing maps.
// Delegates to scripts/lychee/check/index.sh so the absolute
// `--root-dir public` handling stays in one place.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Deep import (no side effects: the bin runs only as an entry point).
import { sortCacheText } from 'link-cache/check/index.mjs';
import { mappedHtmlFiles } from '../changed-html/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

let files;
try {
  files = mappedHtmlFiles();
} catch (e) {
  console.error(`[help] ${e.message}`);
  process.exit(1);
}

if (files.length === 0) {
  console.log('No changed content pages map to built HTML; nothing to check.');
  process.exit(0);
}

console.log(`Checking ${files.length} changed page(s) with lychee:`);
for (const f of files) console.log(`  - ${path.relative(process.cwd(), f)}`);

const res = spawnSync(path.join(here, '..', 'check', 'index.sh'), files, {
  stdio: 'inherit',
});

// Normalize the committed cache: lychee appends new entries in nondeterministic
// order; sorting keeps the diff-scoped run's additions commit-ready.
const cachePath = path.join(process.cwd(), '.lycheecache');
if (existsSync(cachePath)) {
  writeFileSync(cachePath, sortCacheText(readFileSync(cachePath, 'utf8')));
}

process.exit(res.status ?? 1);
