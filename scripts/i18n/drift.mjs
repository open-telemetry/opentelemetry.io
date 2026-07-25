#!/usr/bin/env node

// Drift-status core: answers "which localized pages have drifted from their
// EN counterparts?" as a library (link-check config gen, npm scripts) and a
// thin CLI. Semantics match scripts/check-i18n.sh: a page with front-matter
// pin `default_lang_commit: SHA` is drifted iff its EN counterpart changed in
// `git diff SHA...HEAD` (three-dot); a missing EN counterpart is reported as
// `file not found`; a page without a pin is `new`. Precise mode needs history
// back to the oldest pin (fine locally and in Housekeeping; not in shallow CI
// checkouts — there, the link-check config gen uses its baseline overlay).

import { execFile } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);

const DEFAULT_LANG = 'en';
const CONTENT_DIR = 'content';
const GIT_CONCURRENCY = 12;

// Matches scripts/check-i18n.sh pin extraction: line-anchored, first match,
// case-insensitive; `# patched` marks a manually reconciled pin.
const PIN_RE =
  /^default_lang_commit:\s*([a-f0-9]+)(?<patched>\s*#\s*patched)?/im;

export function parsePin(fileText) {
  const m = PIN_RE.exec(fileText);
  if (!m) return null;
  return { sha: m[1], patched: !!m.groups.patched };
}

export function enCounterpartOf(pagePath) {
  return pagePath.replace(
    new RegExp(`^${CONTENT_DIR}/[^/]{2,5}/`),
    `${CONTENT_DIR}/${DEFAULT_LANG}/`,
  );
}

export function groupByPin(pagePins) {
  const groups = new Map();
  for (const [page, pin] of pagePins) {
    if (!pin) continue;
    if (!groups.has(pin.sha)) groups.set(pin.sha, []);
    groups.get(pin.sha).push(page);
  }
  return groups;
}

// Core engine, effects injected: `enExists(enPath)` and async
// `changedEnSince(sha)` -> Set of EN paths changed in SHA...HEAD.
// Returns Map page -> { status, sha?, patched? } with status one of:
// 'drifted' | 'in-sync' | 'file not found' | 'new' | 'error'.
export async function driftReport(pagePins, { enExists, changedEnSince }) {
  const report = new Map();
  const pending = new Map(); // sha -> pages awaiting that pin's diff

  for (const [page, pin] of pagePins) {
    if (!enExists(enCounterpartOf(page))) {
      report.set(page, { ...(pin ?? {}), status: 'file not found' });
    } else if (!pin) {
      report.set(page, { status: 'new' });
    } else {
      if (!pending.has(pin.sha)) pending.set(pin.sha, []);
      pending.get(pin.sha).push([page, pin]);
    }
  }

  const shas = [...pending.keys()];
  await mapLimit(shas, GIT_CONCURRENCY, async (sha) => {
    let changed;
    let status;
    try {
      changed = await changedEnSince(sha);
    } catch {
      status = 'error';
    }
    for (const [page, pin] of pending.get(sha)) {
      report.set(page, {
        ...pin,
        status:
          status ??
          (changed.has(enCounterpartOf(page)) ? 'drifted' : 'in-sync'),
      });
    }
  });

  return report;
}

async function mapLimit(items, limit, fn) {
  const queue = [...items];
  async function worker() {
    while (queue.length) await fn(queue.shift());
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
}

// Real-repo adapters.

export function localizedPagesOf(rootDir, targets = [CONTENT_DIR]) {
  const pages = [];
  const enPrefix = path.join(CONTENT_DIR, DEFAULT_LANG) + path.sep;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (
        entry.name.endsWith('.md') &&
        !p.startsWith(path.join(rootDir, enPrefix))
      )
        pages.push(path.relative(rootDir, p));
    }
  };
  for (const target of targets) {
    const abs = path.join(rootDir, target);
    if (statSync(abs).isFile()) pages.push(target);
    else walk(abs);
  }
  return pages.sort();
}

export async function driftReportForRepo(rootDir, targets) {
  const pages = localizedPagesOf(rootDir, targets);
  const pagePins = new Map(
    pages.map((p) => [
      p,
      parsePin(readFileSync(path.join(rootDir, p), 'utf8')),
    ]),
  );
  return driftReport(pagePins, {
    enExists: (enPath) => existsSync(path.join(rootDir, enPath)),
    changedEnSince: async (sha) => {
      const { stdout } = await execFileP(
        'git',
        [
          'diff',
          '--name-only',
          `${sha}...HEAD`,
          '--',
          `${CONTENT_DIR}/${DEFAULT_LANG}`,
        ],
        { cwd: rootDir, maxBuffer: 16 * 1024 * 1024 },
      );
      return new Set(stdout.split('\n').filter(Boolean));
    },
  });
}

async function mainCLI() {
  const args = process.argv.slice(2);
  const quiet = args.includes('-q');
  const json = args.includes('--json');
  const targets = args.filter((a) => !a.startsWith('-'));

  const report = await driftReportForRepo(
    process.cwd(),
    targets.length ? targets : undefined,
  );

  if (json) {
    console.log(JSON.stringify(Object.fromEntries(report), null, 2));
    return;
  }

  const counts = {};
  for (const [page, { status }] of report) {
    counts[status] = (counts[status] ?? 0) + 1;
    if (quiet || status === 'in-sync') continue;
    if (status === 'drifted') console.log(`> Drifted file: ${page}`);
    else if (status === 'file not found')
      console.log(
        `File not found:\t${page} - ${DEFAULT_LANG} page was removed or renamed`,
      );
    else if (status === 'new') console.log(`New i18n file - ${page}`);
    else console.log(`ERROR\t${page}: git diff error or invalid hash`);
  }
  const listed = report.size - (counts['in-sync'] ?? 0);
  console.log(`DRIFTED files: ${listed} out of ${report.size}`);
  process.exitCode = counts.error ? 2 : 0;
}

// Robust under symlinked invocation paths (worktrees): compare real paths.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  await mainCLI();
}
