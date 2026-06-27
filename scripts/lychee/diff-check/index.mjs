#!/usr/bin/env node
// Diff-scoped lychee check: run lychee only over the built HTML for content
// files changed in this PR / working tree. No-op (exit 0) when nothing maps, so
// it's cheap to run on docs-free changes. Delegates to scripts/lychee/check/index.sh
// so the absolute `--root-dir public` handling stays in one place.

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mappedHtmlFiles } from '../changed-html/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const files = mappedHtmlFiles();

if (files.length === 0) {
  console.log('No changed content pages map to built HTML; nothing to check.');
  process.exit(0);
}

console.log(`Checking ${files.length} changed page(s) with lychee:`);
for (const f of files) console.log(`  - ${path.relative(process.cwd(), f)}`);

const res = spawnSync(path.join(here, '..', 'check', 'index.sh'), files, {
  stdio: 'inherit',
});
process.exit(res.status ?? 1);
