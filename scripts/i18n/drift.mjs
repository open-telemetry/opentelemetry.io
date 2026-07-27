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
  writeFileSync,
} from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);

const DEFAULT_LANG = 'en';
const CONTENT_DIR = 'content';
const GIT_CONCURRENCY = 12;
const I18N_DLC_KEY = 'default_lang_commit';
const I18N_DLD_KEY = 'drifted_from_default';

// Matches scripts/check-i18n.sh pin extraction: line-anchored, first match,
// case-insensitive; `# patched` marks a manually reconciled pin.
const PIN_RE =
  /^default_lang_commit:\s*([a-f0-9]+)(?<patched>\s*#\s*patched)?/im;

export function parsePin(fileText) {
  const m = PIN_RE.exec(fileText);
  if (!m) return null;
  return { sha: m[1], patched: !!m.groups.patched };
}

// Stored drift status of a page: the front-matter `drifted_from_default`
// value, or null when absent. Body occurrences of the key (e.g. the
// localization guide's own examples) are ignored.
export function parseStatus(fileText) {
  const fm = FRONT_MATTER_RE.exec(fileText)?.[0];
  if (!fm) return null;
  const m = new RegExp(`^${I18N_DLD_KEY}:\\s*(.*?)\\s*$`, 'im').exec(fm);
  return m ? m[1] : null;
}

// The one stored-status skip predicate, shared by the status writer and the
// link-check config generation: a `true` or `file not found` status means
// the page is presumed out of sync with EN (its EN counterpart changed or
// was deleted), so its outbound links are not checked.
export function isDriftedStatus(status) {
  return status === 'true' || status === 'file not found';
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

// Front-matter text transforms. Write semantics match the bash writer
// (set_file_i18n_hash / set_file_drifted_status in scripts/check-i18n.sh):
// pin updates replace the whole value (dropping any `# patched` marker — a
// re-pin supersedes the patch); a missing pin is appended at the end of the
// front matter; the drifted status lives immediately after the pin line and
// is removed, not set to false, when a page is in sync.

const PIN_LINE_RE = new RegExp(`^(${I18N_DLC_KEY}):.*$`, 'im');
const STATUS_LINE_RE = new RegExp(`^${I18N_DLD_KEY}:.*\\n`, 'im');
const FRONT_MATTER_RE = /^---\r?\n[\s\S]*?\n---\r?\n/;

// Applies fn to the page's front-matter block only, so that key occurrences
// in the page body (e.g. the localization guide's own examples) are never
// touched. (The legacy bash writer's per-line perl gets this wrong.)
function inFrontMatter(text, fn) {
  const m = FRONT_MATTER_RE.exec(text);
  if (!m) throw new Error('page has no front-matter block');
  const scope = m[0];
  const { text: newScope, action } = fn(scope);
  if (!action) return { text, action };
  return {
    text:
      text.slice(0, m.index) + newScope + text.slice(m.index + scope.length),
    action,
  };
}

export function setPinInText(text, sha) {
  return inFrontMatter(text, (fm) => {
    const pin = parsePin(fm);
    if (pin) {
      if (pin.sha === sha && !pin.patched) return { text: fm, action: null };
      return {
        text: fm.replace(PIN_LINE_RE, `$1: ${sha}`),
        action: 'UPDATED',
      };
    }
    return {
      text: fm.replace(
        /^(---[\s\S]*?)(\n---\r?\n)/,
        `$1\n${I18N_DLC_KEY}: ${sha}$2`,
      ),
      action: 'ADDED',
    };
  });
}

export function setStatusInText(text, status) {
  return inFrontMatter(text, (fm) => {
    const m = STATUS_LINE_RE.exec(fm);
    if (status === false || status === 'false') {
      if (!m) return { text: fm, action: null };
      return { text: fm.replace(STATUS_LINE_RE, ''), action: 'REMOVED' };
    }
    if (m) {
      const line = `${I18N_DLD_KEY}: ${status}\n`;
      if (m[0] === line) return { text: fm, action: null };
      return { text: fm.replace(STATUS_LINE_RE, line), action: 'UPDATED' };
    }
    if (!PIN_LINE_RE.test(fm)) {
      throw new Error(
        `${I18N_DLC_KEY} key is missing; cannot set ${I18N_DLD_KEY}`,
      );
    }
    return {
      text: fm.replace(
        new RegExp(`^(${I18N_DLC_KEY}:.*\\n)`, 'im'),
        `$1${I18N_DLD_KEY}: ${status}\n`,
      ),
      action: 'ADDED',
    };
  });
}

// CLI surface (object scheme): subcommands are nouns naming the aspects of a
// page's drift state — `status` (default), `diff`, `commit`. Bare nouns read;
// a write always carries its payload: the commit-ish for `commit`, `--write`
// for `status`. Everything after `--` is a path, git-style.

const HASH_RE = /^[0-9a-f]{7,40}$/i;

export function classifyCliArgs(args) {
  const cli = {
    noun: 'status',
    write: false,
    hash: null,
    paths: [],
    list: 'drifted',
    check: false,
    quiet: false,
    json: false,
  };

  const dashDash = args.indexOf('--');
  const escapedPaths = dashDash < 0 ? [] : args.slice(dashDash + 1);
  args = dashDash < 0 ? [...args] : args.slice(0, dashDash);

  let writeFlag = false;
  const positionals = [];
  for (const arg of args) {
    if (!arg.startsWith('-')) {
      positionals.push(arg);
    } else if (arg === '--new') cli.list = 'new';
    else if (arg === '--all') cli.list = 'all';
    else if (arg === '--check') cli.check = true;
    else if (arg === '--write') writeFlag = true;
    else if (arg === '--json') cli.json = true;
    else if (arg === '-q' || arg === '--quiet') cli.quiet = true;
    else throw new Error(`Unknown flag: ${arg}`);
  }

  if (['status', 'diff', 'commit'].includes(positionals[0])) {
    cli.noun = positionals.shift();
  }

  if (cli.noun === 'commit' && positionals.length) {
    const first = positionals[0];
    // Normalize case, as bash did: accept `head`, lowercase hex hashes
    // (git object names are lowercase, uppercase would fail rev-parse).
    if (/^head$/i.test(first)) {
      cli.hash = 'HEAD';
      positionals.shift();
    } else if (HASH_RE.test(first)) {
      cli.hash = first.toLowerCase();
      positionals.shift();
    }
  }
  if (writeFlag && cli.noun !== 'status') {
    throw new Error(`--write applies to the status noun only`);
  }
  cli.write = writeFlag || !!cli.hash;
  if (writeFlag && cli.check) {
    throw new Error(`--check is a read-mode flag; drop it with --write`);
  }
  if (writeFlag && cli.list === 'new') {
    throw new Error(
      `--new has no effect with --write: status --write always syncs the full report`,
    );
  }
  if (cli.check && cli.noun !== 'status') {
    throw new Error(`--check applies to the status noun only`);
  }

  cli.paths = [...positionals, ...escapedPaths];

  if (cli.noun === 'diff' && !cli.paths.length) {
    throw new Error('diff requires at least one path');
  }
  if (cli.hash && !cli.paths.length && cli.list === 'drifted') {
    throw new Error(
      'Tree-wide pin write refused: pass PATHS, --new, or an explicit --all',
    );
  }
  if (writeFlag && !cli.paths.length && cli.list !== 'all') {
    throw new Error(
      'Tree-wide status write refused: pass PATHS or an explicit --all',
    );
  }

  return cli;
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
    if (!existsSync(abs)) throw new Error(`path not found: '${target}'`);
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

// --- Drift-pending overlay (baseline mode) ----------------------------------
//
// Shallow CI checkouts can't run the precise per-pin report; instead, the
// link-check config generation overlays the pages *presumed* drifted since
// the status baseline: the commit that the last tree-wide status write (the
// nightly Housekeeping run) computed the stored statuses against. Locale
// copies of EN pages changed (or deleted) since then get skipped, unless the
// copy itself changed too (activity exemption: someone is working on it, and
// stored-status semantics check unmarked pages anyway).

export const STATUS_BASELINE_PATH = 'data/i18n/status-baseline.txt';

const SHA_RE = /^[0-9a-f]{40}$/;

// Read the drift-status baseline SHA. Throws when the file is missing or
// malformed: a silent empty overlay would false-green drift-pending pages.
export function readBaseline(rootDir) {
  const file = path.join(rootDir, STATUS_BASELINE_PATH);
  if (!existsSync(file)) {
    throw new Error(
      `drift-status baseline file is missing: ${STATUS_BASELINE_PATH}; ` +
        `it is written by tree-wide status syncs (npm run fix:i18n)`,
    );
  }
  const sha = readFileSync(file, 'utf8').trim();
  if (!SHA_RE.test(sha)) {
    throw new Error(
      `malformed drift-status baseline in ${STATUS_BASELINE_PATH}: '${sha}'`,
    );
  }
  return sha;
}

// Record `main` as the drift-status baseline: statuses just written are
// accurate as of it. (In the Housekeeping checkout HEAD == main; a local
// run's diverged main only makes the baseline older, which widens the
// overlay — under-checking, never a spurious red.)
export async function writeBaseline(rootDir) {
  const sha = await git(rootDir, 'rev-parse', 'main');
  writeFileSync(path.join(rootDir, STATUS_BASELINE_PATH), `${sha}\n`);
  return sha;
}

// Pure core: locale copies presumed drifted, given the EN pages changed
// since the baseline. Deleted EN pages are covered too: their locale copies
// still exist and are what gets reported. Copies in `changedLocalePages` are
// exempt (activity exemption). `pageExists` is injected for testability.
export function driftPendingPages(
  changedEnPages,
  locales,
  pageExists,
  changedLocalePages = new Set(),
) {
  const pages = [];
  const enPrefix = `${CONTENT_DIR}/${DEFAULT_LANG}/`;
  for (const enPath of changedEnPages) {
    if (!enPath.startsWith(enPrefix) || !enPath.endsWith('.md')) continue;
    const subPath = enPath.slice(enPrefix.length);
    for (const locale of locales) {
      const localePath = `${CONTENT_DIR}/${locale}/${subPath}`;
      if (!pageExists(localePath)) continue;
      if (changedLocalePages.has(localePath)) continue;
      pages.push(localePath);
    }
  }
  return pages.sort();
}

// Repo adapter: one git diff of `content` against the baseline (two-dot,
// vs the working tree — no merge-base needed, so a baseline-deepened
// shallow clone suffices), split EN / non-EN. Throws when the baseline
// isn't resolvable (e.g. too-shallow clone).
export async function driftPendingForRepo(rootDir, baseline) {
  baseline ??= readBaseline(rootDir);
  const changed = (
    await git(
      rootDir,
      'diff',
      '--name-only',
      '--no-renames',
      baseline,
      '--',
      CONTENT_DIR,
    )
  )
    .split('\n')
    .filter(Boolean);
  const locales = readdirSync(path.join(rootDir, CONTENT_DIR), {
    withFileTypes: true,
  })
    .filter((e) => e.isDirectory() && e.name !== DEFAULT_LANG)
    .map((e) => e.name);
  const enPrefix = `${CONTENT_DIR}/${DEFAULT_LANG}/`;
  return driftPendingPages(
    changed.filter((p) => p.startsWith(enPrefix)),
    locales,
    (p) => existsSync(path.join(rootDir, p)),
    new Set(changed.filter((p) => !p.startsWith(enPrefix))),
  );
}

// Write operations. Both return the per-page actions they performed
// ([page, action] with action ADDED | UPDATED | REMOVED), skipping no-ops.

// Persists the report's statuses (status --write, was -D): drifted -> true,
// missing EN -> "file not found", in-sync or unpinned-in-sync -> status
// removed. Pages whose pin errored are left untouched, as are unpinned
// pages whose EN counterpart is gone (no pin line to anchor the status —
// pin them first, e.g. with `commit HEAD --new`).
export function writeStatuses(rootDir, report) {
  const statusOf = {
    drifted: 'true',
    'file not found': 'file not found',
    'in-sync': false,
    new: false,
  };
  const actions = [];
  for (const [page, { status, sha }] of report) {
    if (!(status in statusOf)) continue; // 'error': don't touch the page
    if (status === 'file not found' && !sha) {
      console.error(
        `WARNING: ${page} has no ${I18N_DLC_KEY} key to anchor its ` +
          `'file not found' status; pin the page first (commit HEAD --new)`,
      );
      continue;
    }
    const abs = path.join(rootDir, page);
    const { text, action } = setStatusInText(
      readFileSync(abs, 'utf8'),
      statusOf[status],
    );
    if (!action) continue;
    writeFileSync(abs, text);
    actions.push([page, action]);
  }
  return actions;
}

async function git(rootDir, ...args) {
  const { stdout } = await execFileP('git', args, {
    cwd: rootDir,
    maxBuffer: 16 * 1024 * 1024,
  });
  return stdout.trim();
}

// A page with no pin: `new`, or `file not found` when its EN counterpart is
// gone too (bash's `-n` list kind selected both — pin presence alone).
export function isUnpinned({ status, sha }) {
  return status === 'new' || (status === 'file not found' && !sha);
}

// Upserts pins (commit HASH|HEAD, was -c) on the pages the report and list
// kind select: `new` -> unpinned pages only (as bash `-n`, EN counterpart or
// not); `drifted` (default) -> drifted and unpinned-with-EN pages, as in
// bash; `all` -> every page. As in bash, a pin
// *update* requires the hash to be on main (adds are unchecked), and `HEAD`
// means main's HEAD, not the checked-out commit. Unlike bash, the hash is
// resolved to its full-sha pin form, and each written page's drift status is
// recomputed and synced in the same write, so a catch-up leaves no stale
// `drifted_from_default: true` behind.
export async function writePins(rootDir, report, { hash, list }) {
  const resolved = await git(
    rootDir,
    'rev-parse',
    hash === 'HEAD' ? 'main' : `${hash}^{commit}`,
  );

  const selected = [...report].filter(([, r]) =>
    list === 'all'
      ? r.status !== 'error'
      : list === 'new'
        ? isUnpinned(r)
        : ['drifted', 'new'].includes(r.status),
  );

  const needsOnMainCheck = selected.some(([, { sha }]) => sha);
  if (needsOnMainCheck) {
    const branches = await git(
      rootDir,
      'branch',
      '--contains',
      resolved,
      '--format=%(refname:short)',
    );
    if (!branches.split('\n').includes('main')) {
      throw new Error(
        `hash isn't on the default branch (main), aborting: ${resolved}`,
      );
    }
  }

  const actions = [];
  const written = [];
  for (const [page] of selected) {
    const abs = path.join(rootDir, page);
    const { text, action } = setPinInText(readFileSync(abs, 'utf8'), resolved);
    if (!action) continue;
    writeFileSync(abs, text);
    actions.push([page, action]);
    written.push(page);
  }

  // Sync each written page's status against its new pin.
  if (written.length) {
    const postReport = await driftReportForRepo(rootDir, written);
    actions.push(
      ...writeStatuses(rootDir, postReport).map(([page, action]) => [
        page,
        `status ${action}`,
      ]),
    );
  }
  return actions;
}

const USAGE = `Usage: drift.mjs [NOUN] [OPTIONS] [--] [PATHS...]

Report, and optionally update, the drift state of localized pages relative to
their English counterparts. Nouns name the aspects of a page's drift state;
bare nouns read, a write always carries its payload.

  drift.mjs [status] [PATHS...]     Read (default noun): drift report
      --new                           only pages missing a pin
      --all                           every page with its status
      --check                         exit 1 if anything is listed (CI)
      -q, --quiet                     counts only
      --json                          full report as JSON
      --write                         persist statuses: sets
                                      drifted_from_default to true or "file not
                                      found", removes it from in-sync pages
  drift.mjs diff PATHS...           Read: EN changes since each page's pin
  drift.mjs commit [PATHS...]       Read: print pinned commits
  drift.mjs commit HASH|HEAD PATHS  Write: upsert default_lang_commit to HASH
                                    (HEAD = main's HEAD) and sync the status of
                                    written pages
      --new                           add-only: pages missing the key

PATHS are localized page files or directories; the default is 'content'.
Tree-wide writes require PATHS or an explicit --all (pin writes accept --new
too).`;

function printStatusLine(page, r, list) {
  const { status } = r;
  if (list === 'new' && isUnpinned(r))
    console.log(`${page} - has no ${I18N_DLC_KEY} front-matter key`);
  else if (status === 'drifted') console.log(`> Drifted file: ${page}`);
  else if (status === 'file not found')
    console.log(
      `File not found:\t${page} - ${DEFAULT_LANG} page was removed or renamed`,
    );
  else if (status === 'new') console.log(`New i18n file - ${page}`);
  else console.log(`ERROR\t${page}: git diff error or invalid hash`);
}

async function statusCLI(rootDir, cli, report) {
  if (cli.write) {
    const actions = writeStatuses(rootDir, report);
    if (!cli.quiet) {
      for (const [page, action] of actions)
        console.log(`${page} ${I18N_DLD_KEY} ${action}`);
    }
    console.log(`Status writes: ${actions.length} out of ${report.size}`);
    // A tree-wide sync leaves every stored status accurate as of main:
    // record that commit as the drift-status baseline (see the overlay
    // section above).
    if (cli.list === 'all') {
      const sha = await writeBaseline(rootDir);
      console.log(`Status baseline: ${sha} -> ${STATUS_BASELINE_PATH}`);
    }
    return;
  }

  let listed = 0;
  for (const [page, r] of report) {
    const inList =
      cli.list === 'all' ||
      (cli.list === 'new' ? isUnpinned(r) : r.status !== 'in-sync');
    if (!inList) continue;
    listed++;
    if (cli.quiet || cli.json) continue;
    if (r.status === 'in-sync')
      console.log(`File is in sync\t${page} - ${r.sha}`);
    else printStatusLine(page, r, cli.list);
  }
  if (cli.json) {
    console.log(JSON.stringify(Object.fromEntries(report), null, 2));
  } else {
    console.log(
      `${cli.list.toUpperCase()} files: ${listed} out of ${report.size}`,
    );
  }
  process.exitCode = cli.check && listed ? 1 : 0;
}

async function diffCLI(rootDir, cli, report) {
  for (const [page, { status, sha }] of report) {
    if (status !== 'drifted') {
      console.log(`# ${page}: ${status}`);
      continue;
    }
    console.log(`# ${page}: drifted from ${sha}`);
    const diff = await git(
      rootDir,
      'diff',
      `${sha}...HEAD`,
      '--',
      enCounterpartOf(page),
    );
    console.log(diff);
  }
}

async function commitCLI(rootDir, cli, report) {
  if (cli.hash) {
    const actions = await writePins(rootDir, report, {
      hash: cli.hash,
      list: cli.list,
    });
    if (!cli.quiet) {
      for (const [page, action] of actions) console.log(`${page} ${action}`);
    }
    // Pin writes and their status syncs are distinct action streams; report
    // them separately so the pin count stays comparable to the report size.
    const syncs = actions.filter(([, a]) => a.startsWith('status ')).length;
    console.log(
      `Pin writes: ${actions.length - syncs} out of ${report.size}` +
        `; status syncs: ${syncs}`,
    );
    return;
  }
  for (const [page, { sha, patched }] of report) {
    console.log(
      sha
        ? `${page}: ${sha}${patched ? ' # patched' : ''}`
        : `${page}: no ${I18N_DLC_KEY} key`,
    );
  }
}

async function mainCLI() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    console.log(USAGE);
    return;
  }

  let cli;
  try {
    cli = classifyCliArgs(args);
  } catch (e) {
    console.error(`ERROR: ${e.message}\n\n${USAGE}`);
    process.exitCode = 1;
    return;
  }

  const rootDir = process.cwd();
  let report;
  try {
    report = await driftReportForRepo(
      rootDir,
      cli.paths.length ? cli.paths : undefined,
    );
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exitCode = 2;
    return;
  }

  try {
    if (cli.noun === 'diff') await diffCLI(rootDir, cli, report);
    else if (cli.noun === 'commit') await commitCLI(rootDir, cli, report);
    else await statusCLI(rootDir, cli, report);
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exitCode = 2;
    return;
  }

  // Invalid pins always exit non-zero, whatever the noun or mode.
  if ([...report.values()].some((r) => r.status === 'error')) {
    process.exitCode = 2;
  }
}

// Robust under symlinked invocation paths (worktrees): compare real paths.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  await mainCLI();
}
