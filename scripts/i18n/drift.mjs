#!/usr/bin/env node

// Drift-status core: answers "which localized pages have drifted from their
// source-language counterparts?" as a library (link-check config gen, npm scripts) and a
// thin CLI. Semantics match scripts/check-i18n.sh: a page with front-matter
// pin `default_lang_commit: SHA` is drifted iff its source counterpart changed in
// `git diff SHA...HEAD` (three-dot); a missing source counterpart is reported as
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

export const DEFAULT_LANG = 'en';
export const CONTENT_DIR = 'content';
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
// the page is presumed out of sync with source (its source counterpart changed or
// was deleted), so its outbound links are not checked.
export function isDriftedStatus(status) {
  return status === 'true' || status === 'file not found';
}

export function sourceCounterpartOf(pagePath) {
  return pagePath.replace(
    new RegExp(`^${CONTENT_DIR}/[^/]{2,5}/`),
    `${CONTENT_DIR}/${DEFAULT_LANG}/`,
  );
}

// Backward-compatible alias.
export function enCounterpartOf(pagePath) {
  return sourceCounterpartOf(pagePath);
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
    useSrcLatest: false,
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
    else if (arg === '--from-src-latest') cli.useSrcLatest = true;
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

  if (cli.useSrcLatest) {
    if (cli.noun === 'diff') {
      throw new Error(`--from-src-latest applies to status/commit only`);
    }
    if (cli.hash) {
      throw new Error(`Use either --from-src-latest or HASH|HEAD, not both`);
    }
    cli.noun = 'commit';
    cli.write = true;
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
  if (
    (cli.hash || cli.useSrcLatest) &&
    !cli.paths.length &&
    cli.list === 'drifted'
  ) {
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

// Core engine, effects injected: `sourceExists(sourcePath)` and async
// `changedSourceSince(sha)` -> Set of source-language pages changed in SHA...HEAD.
// Returns Map page -> { status, sha?, patched? } with status one of:
// 'drifted' | 'in-sync' | 'file not found' | 'new' | 'error'.
export async function driftReport(
  pagePins,
  { sourceExists, changedSourceSince, enExists, changedEnSince },
) {
  // Compatibility fallback for existing call sites/tests using old option keys.
  sourceExists ??= enExists;
  changedSourceSince ??= changedEnSince;

  const report = new Map();
  const pending = new Map(); // sha -> pages awaiting that pin's diff

  for (const [page, pin] of pagePins) {
    if (!sourceExists(sourceCounterpartOf(page))) {
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
    let changedSourcePages;
    let status;
    try {
      changedSourcePages = await changedSourceSince(sha);
    } catch {
      status = 'error';
    }
    for (const [page, pin] of pending.get(sha)) {
      report.set(page, {
        ...pin,
        status:
          status ??
          (changedSourcePages.has(sourceCounterpartOf(page))
            ? 'drifted'
            : 'in-sync'),
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
  const sourceLangPrefix = path.join(CONTENT_DIR, DEFAULT_LANG) + path.sep;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (
        entry.name.endsWith('.md') &&
        !p.startsWith(path.join(rootDir, sourceLangPrefix))
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
    sourceExists: (sourcePath) => existsSync(path.join(rootDir, sourcePath)),
    changedSourceSince: async (sha) => {
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
// copies of source-language pages changed (or deleted) since then get skipped,
// unless the
// copy itself changed too (activity exemption: someone is working on it, and
// stored-status semantics check unmarked pages anyway).

export const STATUS_BASELINE_PATH = 'data/l10n-drift.yaml';

// `commit:` line of the baseline file. The file lives under data/, where Hugo
// parses everything as site data, so it must stay valid YAML; this scoped
// regex keeps drift.mjs dependency-free (the file is bot-written, and
// anything unexpected must fail loudly anyway). Keep the accepted shape in
// sync with the deepen step in .github/workflows/check-links.yml, which
// extracts the same line.
const BASELINE_COMMIT_RE = /^commit: ([0-9a-f]{40})$/m;

// Baseline lifecycle thresholds (coupled: the refresh heartbeat must stay
// well below the staleness warning, so a healthy system — statuses changing
// most nights, a heartbeat bump otherwise — never trips the warning).
export const BASELINE_REFRESH_DAYS = 7;
export const STALE_BASELINE_DAYS = 14;

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
  const match = readFileSync(file, 'utf8').match(BASELINE_COMMIT_RE);
  if (!match) {
    throw new Error(
      `malformed drift-status baseline in ${STATUS_BASELINE_PATH}: ` +
        `expected a 'commit: FULL_SHA' line`,
    );
  }
  return match[1];
}

// Age in days of the given commit (its committer time vs now).
export async function baselineAgeDays(rootDir, sha) {
  const commitTime = Number(
    await git(rootDir, 'log', '-1', '--format=%ct', sha),
  );
  return (Date.now() / 1000 - commitTime) / 86400;
}

// Whether a tree-wide sync that changed no statuses should refresh the
// baseline anyway: yes when the committed baseline is missing, malformed,
// unresolvable, or older than the refresh heartbeat. (Any status-relevant source
// change flips a status on the next sweep and refreshes the baseline through
// the statuses-changed arm, so a quiet stretch leaves nothing new to skip;
// the heartbeat is a freshness bound, not a correctness need.)
export async function baselineNeedsRefresh(rootDir) {
  let sha;
  try {
    sha = readBaseline(rootDir);
  } catch {
    return true; // missing or malformed: (re)seed it
  }
  try {
    return (await baselineAgeDays(rootDir, sha)) > BASELINE_REFRESH_DAYS;
  } catch {
    return true; // unresolvable: replace it with a resolvable one
  }
}

// Record the drift-status baseline: the commit the statuses just written are
// accurate as of. That's the merge-base of HEAD and main: in the Housekeeping
// checkout (HEAD == main) it is main's HEAD; on any checkout behind main
// (older branch, PR run) it errs older, which only widens the overlay —
// under-checking, never a spurious red. Recording `main` itself would be
// wrong there: a baseline newer than the tree the statuses were computed
// against leaves the source-language changes in between covered by neither the stored
// statuses nor the overlay. As an ancestor of main, the recorded SHA is also
// always fetchable from the canonical repo (the CHECK LINKS deepen step).
export async function writeBaseline(rootDir) {
  const sha = await git(rootDir, 'merge-base', 'HEAD', 'main');
  const content =
    '# DO NOT EDIT — written by tree-wide drift-status syncs (npm run fix:i18n).\n' +
    '# The `main` commit that stored drift statuses are accurate as of; the\n' +
    "# link-check config's drift-pending overlay starts its window here.\n" +
    `commit: ${sha}\n`;
  writeFileSync(path.join(rootDir, STATUS_BASELINE_PATH), content);
  return sha;
}

// Pure core: locale copies presumed drifted, given the source-language pages
// changed since the baseline. Deleted source pages are covered too: their locale copies
// still exist and are what gets reported. Copies in `changedLocalePages` are
// exempt (activity exemption). `pageExists` is injected for testability.
export function driftPendingPages(
  changedSourcePages,
  locales,
  pageExists,
  changedLocalePages = new Set(),
) {
  const pages = [];
  const sourceLangPrefix = `${CONTENT_DIR}/${DEFAULT_LANG}/`;
  for (const sourcePath of changedSourcePages) {
    // `.md` only: no localized `.html` pages exist in the content tree; if
    // that ever changes, align this filter with pageIgnoreDirOf's
    // `.md`/`.html` mapping in scripts/lychee/config/index.mjs.
    if (!sourcePath.startsWith(sourceLangPrefix) || !sourcePath.endsWith('.md'))
      continue;
    const subPath = sourcePath.slice(sourceLangPrefix.length);
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
// shallow clone suffices), split source / non-source. Throws when the baseline
// isn't resolvable (e.g. too-shallow clone).
export async function driftPendingForRepo(rootDir, baseline) {
  const source = baseline
    ? 'the DRIFT_BASELINE override'
    : STATUS_BASELINE_PATH;
  baseline ??= readBaseline(rootDir);
  let diffOut;
  try {
    diffOut = await git(
      rootDir,
      'diff',
      '--name-only',
      '--no-renames',
      baseline,
      '--',
      CONTENT_DIR,
    );
  } catch (e) {
    // Rethrow with the baseline's provenance and the local remedies; the raw
    // git error (`fatal: bad object …`) says nothing actionable.
    throw new Error(
      `cannot diff against the drift-status baseline '${baseline}' ` +
        `(from ${source}). If your clone is shallow or predates the ` +
        `baseline, fetch it (e.g. \`git fetch upstream main\`) or override ` +
        `it with DRIFT_BASELINE=HEAD. Underlying error: ${e.message.trim()}`,
    );
  }
  const changed = diffOut.split('\n').filter(Boolean);

  // A stale baseline is silent coverage loss: the overlay only widens, so a
  // stalled Housekeeping cycle never turns anything red. Surface it — in CI
  // also as a workflow annotation, since nobody reads a green job's log.
  const ageDays = await baselineAgeDays(rootDir, baseline);
  if (ageDays > STALE_BASELINE_DAYS) {
    const msg =
      `the drift-status baseline (from ${source}) is ` +
      `${Math.floor(ageDays)} days old; ever more localized pages are ` +
      `being skipped by link checking. Is the nightly Housekeeping ` +
      `sync running and getting merged?`;
    console.error(`WARNING: ${msg}`);
    if (process.env.GITHUB_ACTIONS)
      console.log(`::warning file=${STATUS_BASELINE_PATH}::${msg}`);
  }

  const locales = readdirSync(path.join(rootDir, CONTENT_DIR), {
    withFileTypes: true,
  })
    .filter((e) => e.isDirectory() && e.name !== DEFAULT_LANG)
    .map((e) => e.name);
  const sourceLangPrefix = `${CONTENT_DIR}/${DEFAULT_LANG}/`;
  return driftPendingPages(
    changed.filter((p) => p.startsWith(sourceLangPrefix)),
    locales,
    (p) => existsSync(path.join(rootDir, p)),
    new Set(changed.filter((p) => !p.startsWith(sourceLangPrefix))),
  );
}

// Write operations. Both return the per-page actions they performed
// ([page, action] with action ADDED | UPDATED | REMOVED), skipping no-ops.

// Persists the report's statuses (status --write, was -D): drifted -> true,
// missing source page -> "file not found", in-sync or unpinned-in-sync -> status
// removed. Pages whose pin errored are left untouched, as are unpinned
// pages whose source counterpart is gone (no pin line to anchor the status —
// pin them first, e.g. with `--from-src-latest --new`).
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
          `'file not found' status; pin the page first (--from-src-latest --new)`,
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

// A page with no pin: `new`, or `file not found` when its source counterpart is
// gone too (bash's `-n` list kind selected both — pin presence alone).
export function isUnpinned({ status, sha }) {
  return status === 'new' || (status === 'file not found' && !sha);
}

function selectPagesForPinWrite(report, list) {
  return [...report].filter(([, r]) =>
    list === 'all'
      ? r.status !== 'error'
      : list === 'new'
        ? isUnpinned(r)
        : ['drifted', 'new'].includes(r.status),
  );
}

// Upserts pins (commit HASH|HEAD, was -c) on the pages the report and list
// kind select: `new` -> unpinned pages only (as bash `-n`, source counterpart or
// not); `drifted` (default) -> drifted and unpinned-with-source pages, as in
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

  const selected = selectPagesForPinWrite(report, list);

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

export async function writePinsFromEnLatest(rootDir, report, { list }) {
  // In source-latest mode, include error pages so broken pins can be repaired.
  const selected = [...report].filter(([, r]) =>
    list === 'all'
      ? true
      : list === 'new'
        ? isUnpinned(r)
        : ['drifted', 'new', 'error'].includes(r.status),
  );

  const actions = [];
  const written = [];
  let hadErrors = false;
  for (const [page] of selected) {
    const sourcePath = sourceCounterpartOf(page);
    if (!existsSync(path.join(rootDir, sourcePath))) {
      console.error(
        `ERROR: cannot determine latest commit for source-language file: ${page} -> ${sourcePath}`,
      );
      hadErrors = true;
      continue;
    }

    const resolved = await git(
      rootDir,
      'log',
      '-1',
      '--format=%H',
      '--',
      sourcePath,
    );
    if (!resolved) {
      console.error(
        `ERROR: cannot determine latest commit for source-language file: ${page} -> ${sourcePath}`,
      );
      hadErrors = true;
      continue;
    }

    const abs = path.join(rootDir, page);
    const { text, action } = setPinInText(readFileSync(abs, 'utf8'), resolved);
    if (!action) continue;
    writeFileSync(abs, text);
    actions.push([page, action]);
    written.push(page);
  }

  if (written.length) {
    const postReport = await driftReportForRepo(rootDir, written);
    actions.push(
      ...writeStatuses(rootDir, postReport).map(([page, action]) => [
        page,
        `status ${action}`,
      ]),
    );
  }

  if (hadErrors) process.exitCode = 1;
  return actions;
}

const USAGE = `Usage: drift.mjs [NOUN] [OPTIONS] [--] [PATHS...]

Report, and optionally update, the drift state of localized pages relative to
their source-language counterparts. Nouns name the aspects of a page's drift state;
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
      --from-src-latest               commit write mode: pin each page to the
                                      latest commit of its source counterpart
  drift.mjs diff PATHS...           Read: source changes since each page's pin
  drift.mjs commit [PATHS...]       Read: print pinned commits
  drift.mjs commit HASH|HEAD PATHS  Write: upsert default_lang_commit to HASH
                                    (HEAD = main's HEAD) and sync the status of
                                    written pages

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
    // A tree-wide sync leaves every stored status accurate as of the
    // checkout's merge-base with main: record that commit as the
    // drift-status baseline (see the overlay section above). Scoped syncs
    // (`--all` with PATHS included) refresh only the listed pages, so they
    // must not advance the tree-wide baseline. Quiet nights don't rewrite it
    // either (#decision @chalin 2026-07-28, 3-POV CI-3): a bump-only rewrite
    // would make every nightly Housekeeping PR non-empty, and a no-change
    // sweep leaves nothing new for the overlay to cover — so the write is
    // gated on a status change, with a BASELINE_REFRESH_DAYS heartbeat as
    // the freshness bound.
    if (cli.list === 'all' && !cli.paths.length) {
      if (actions.length || (await baselineNeedsRefresh(rootDir))) {
        const sha = await writeBaseline(rootDir);
        console.log(`Status baseline: ${sha} -> ${STATUS_BASELINE_PATH}`);
      } else {
        console.log(
          `Status baseline: fresh and no status changed; not rewritten`,
        );
      }
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
      sourceCounterpartOf(page),
    );
    console.log(diff);
  }
}

async function commitCLI(rootDir, cli, report) {
  if (cli.hash || cli.useSrcLatest) {
    const actions = cli.useSrcLatest
      ? await writePinsFromEnLatest(rootDir, report, {
          list: cli.list,
        })
      : await writePins(rootDir, report, {
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
