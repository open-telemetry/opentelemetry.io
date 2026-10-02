// Derives lychee's .lycheecache from the committed link-cache.jsonc, exactly as
// lychee-norm-cache does before a full run, for callers that invoke lychee
// directly. Through link-cache's cache codec (the same interim deep import the
// double-check uses) until 0.6.0's successor exposes a public entry point.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  CSV_FILE,
  OWNED_FILE,
  parseOwned,
  projectToCsv,
  serializeCsv,
} from 'link-cache/lib/cache.mjs';

export function projectCache(cwd = process.cwd()) {
  const owned = parseOwned(readFileSync(path.join(cwd, OWNED_FILE), 'utf8'));
  writeFileSync(
    path.join(cwd, CSV_FILE),
    serializeCsv(projectToCsv(owned.entries)),
  );
}
