#!/usr/bin/env node
// Translate htmltest's static/refcache.json into a lychee `.lycheecache` file.
//
// htmltest refcache entry:  "<url>": { "StatusCode": 200|206, "LastSeen": "<ISO8601>" }
// lychee .lycheecache row:  <url>,<status_code>,<unix_seconds>
//
// lychee classifies any 2xx code (200, 206, ...) as a cache "Ok", so the bare
// status code is written through unchanged. Errors are intentionally NOT seeded
// (lychee always rechecks failures), but the OTel refcache only stores 2xx.
//
// Usage: node scripts/lychee/refcache-to-lycheecache/index.mjs <refcache.json> <.lycheecache>
//
// cSpell:ignore lycheecache

import { readFileSync, writeFileSync } from 'node:fs';

export const csvField = (s) =>
  /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;

// Convert a parsed htmltest refcache object into lychee `.lycheecache` CSV rows.
// Only 2xx entries are seeded (lychee always rechecks failures); entries with an
// unparsable `LastSeen` are skipped too.
export function refcacheToRows(refcache) {
  let written = 0;
  let skipped = 0;
  const rows = [];
  for (const [url, { StatusCode, LastSeen }] of Object.entries(refcache)) {
    if (StatusCode < 200 || StatusCode >= 300) {
      skipped++; // lychee always rechecks non-2xx; don't seed those
      continue;
    }
    const ts = Math.floor(Date.parse(LastSeen) / 1000);
    if (!Number.isFinite(ts)) {
      skipped++;
      continue;
    }
    rows.push(`${csvField(url)},${StatusCode},${ts}`);
    written++;
  }
  return { rows, written, skipped };
}

function mainCLI() {
  const [, , inPath = 'static/refcache.json', outPath = '.lycheecache'] =
    process.argv;
  const refcache = JSON.parse(readFileSync(inPath, 'utf8'));
  const { rows, written, skipped } = refcacheToRows(refcache);
  writeFileSync(outPath, rows.join('\n') + '\n');
  console.error(
    `Wrote ${written} cache rows to ${outPath} (skipped ${skipped}).`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) mainCLI();
