#!/usr/bin/env node

// Migration parity gate for the drift *write* path: runs the legacy
// `scripts/check-i18n.sh -D` and the module's `status --write` over the same
// perturbed working tree and compares the resulting `git diff -- content`
// byte for byte; then compares pin writes (`-c HEAD` vs `commit HEAD`) on a
// sample locale, where the module's status sync is an expected, spec'd
// divergence (drift-status-home § drift.mjs CLI surface): after stripping
// drifted_from_default line edits from both diffs, the rest must match, and
// the module-only residue must consist of drifted_from_default removals.
//
// The tree is perturbed identically before each run (a stored status removed
// from one drifted page, a spurious one added to an in-sync page) so that a
// no-op sweep can't masquerade as parity; the content tree must start clean
// and is restored after each run. Keep green while both implementations
// coexist; retire with the bash script.
//
// Usage: node scripts/i18n/drift-write-parity.mjs [--repo DIR]

import { execFile } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';

import { driftReportForRepo, setStatusInText } from './drift.mjs';

const execFileP = promisify(execFile);

const repoArgIdx = process.argv.indexOf('--repo');
const rootDir = repoArgIdx > 0 ? process.argv[repoArgIdx + 1] : process.cwd();
const SAMPLE = 'content/ja';

async function run(cmd, args, opts = {}) {
  const { stdout } = await execFileP(cmd, args, {
    cwd: rootDir,
    maxBuffer: 64 * 1024 * 1024,
    ...opts,
  });
  return stdout;
}

const git = (...args) => run('git', args);

async function requireCleanContent() {
  const out = await git('status', '--porcelain', '--', 'content');
  if (out.trim()) {
    console.error('ERROR: content/ tree is not clean; commit or stash first.');
    process.exit(2);
  }
}

async function restoreContent() {
  await git('checkout', '--', 'content');
}

// Perturbs the tree so both writers have work to do: strips the stored
// status from a drifted page, and plants a spurious one on an in-sync page.
async function perturb() {
  const report = await driftReportForRepo(rootDir);
  let stripped, planted;
  for (const [page, { status }] of report) {
    const abs = path.join(rootDir, page);
    const text = readFileSync(abs, 'utf8');
    if (
      !stripped &&
      status === 'drifted' &&
      /^drifted_from_default:/m.test(text)
    ) {
      writeFileSync(abs, setStatusInText(text, false).text);
      stripped = page;
    } else if (
      !planted &&
      status === 'in-sync' &&
      !/^drifted_from_default:/m.test(text)
    ) {
      writeFileSync(abs, setStatusInText(text, 'true').text);
      planted = page;
    }
    if (stripped && planted) break;
  }
  if (!stripped || !planted) {
    console.error(
      'ERROR: could not perturb (need a drifted and an in-sync page)',
    );
    process.exit(2);
  }
  return { stripped, planted };
}

const contentDiff = () => git('diff', '--', 'content');

// Reduces a diff to its per-file front-matter edits: which pin lines and
// which status lines were added/removed in each file. Hunk headers and
// context lines are ignored, so the comparison is insensitive to the line
// shifts that the module's extra status edits introduce.
function frontMatterEditsOf(diff) {
  const byFile = new Map();
  let current;
  for (const line of diff.split('\n')) {
    const m = /^diff --git a\/(\S+) /.exec(line);
    if (m) {
      current = { pins: [], statuses: [] };
      byFile.set(m[1], current);
      continue;
    }
    if (!current || !/^[-+][^-+]/.test(line)) continue;
    if (/^[-+]default_lang_commit:/.test(line)) current.pins.push(line);
    else if (/^[-+]drifted_from_default:/.test(line))
      current.statuses.push(line);
    else current.pins.push(line); // unexpected edit: surface it as a mismatch
  }
  return byFile;
}

function pinEditsMatch(legacy, module_) {
  const files = new Set([...legacy.keys(), ...module_.keys()]);
  const mismatches = [];
  const clobbers = [];
  for (const f of files) {
    // Known legacy bug: bash's per-line perl also rewrites body occurrences
    // of the key (e.g. doc examples), recognizable as a removed line whose
    // old value isn't a commit hash. Filter such -/+ pairs out of the legacy
    // edits and report them; the module (correctly) leaves them alone.
    const legacyPins = [...(legacy.get(f)?.pins ?? [])];
    for (let i = 0; i < legacyPins.length - 1; i++) {
      const val = /^-default_lang_commit:\s*(.*)$/.exec(legacyPins[i])?.[1];
      if (val && !/^[0-9a-f]{7,40}( *# *patched)?$/i.test(val.trim())) {
        clobbers.push(`${f}: ${legacyPins[i]}`);
        legacyPins.splice(i, 2); // the '-' line and its '+' replacement
        i--;
      }
    }
    const a = legacyPins.join('\n') || '(file untouched)';
    const b = module_.get(f)?.pins?.join('\n') ?? '(file untouched)';
    if (a !== b) mismatches.push(`${f}:\n  legacy: ${a}\n  module: ${b}`);
  }
  return { mismatches, clobbers };
}

let ok = true;
function verdict(label, pass, detail = '') {
  console.log(
    `${pass ? 'OK  ' : 'FAIL'} ${label}${detail ? `: ${detail}` : ''}`,
  );
  ok &&= pass;
}

await requireCleanContent();

// --- Phase 1: status writes (-D vs status --write) must match byte for byte.

await perturb();
await run(path.join(rootDir, 'scripts/check-i18n.sh'), ['-D', '-q']);
const legacyStatusDiff = await contentDiff();
await restoreContent();

await perturb();
await run('node', [
  path.join(rootDir, 'scripts/i18n/drift.mjs'),
  'status',
  '--write',
  '-q',
]);
const moduleStatusDiff = await contentDiff();
await restoreContent();

verdict(
  'status writes are non-empty (perturbation took)',
  legacyStatusDiff.trim().length > 0 && moduleStatusDiff.trim().length > 0,
);
verdict(
  'status --write matches check-i18n.sh -D byte for byte',
  legacyStatusDiff === moduleStatusDiff,
  `legacy ${legacyStatusDiff.length}B, module ${moduleStatusDiff.length}B`,
);

// --- Phase 2: pin writes (-c HEAD vs commit HEAD) on the sample locale.
// Expected divergence: the module also syncs written pages' statuses.

await run(path.join(rootDir, 'scripts/check-i18n.sh'), [
  '-c',
  'HEAD',
  '-q',
  SAMPLE,
]);
const legacyPinDiff = await contentDiff();
await restoreContent();

await run('node', [
  path.join(rootDir, 'scripts/i18n/drift.mjs'),
  'commit',
  'HEAD',
  '-q',
  SAMPLE,
]);
const modulePinDiff = await contentDiff();
await restoreContent();

const legacyEdits = frontMatterEditsOf(legacyPinDiff);
const moduleEdits = frontMatterEditsOf(modulePinDiff);
const { mismatches: pinMismatches, clobbers } = pinEditsMatch(
  legacyEdits,
  moduleEdits,
);
const legacyStatusEdits = [...legacyEdits.values()].flatMap((e) => e.statuses);
const moduleStatusEdits = [...moduleEdits.values()].flatMap((e) => e.statuses);

for (const c of clobbers) {
  console.log(`NOTE legacy body clobber (known bash bug, module fixes): ${c}`);
}

verdict(
  'pin writes are non-empty',
  legacyPinDiff.trim().length > 0 && modulePinDiff.trim().length > 0,
);
verdict(
  'pin edits match file for file',
  pinMismatches.length === 0,
  pinMismatches.length ? `\n${pinMismatches.join('\n')}` : '',
);
verdict(
  'legacy pin write leaves statuses untouched (baseline assumption)',
  legacyStatusEdits.length === 0,
);
verdict(
  'module status edits are removals only (the spec’d catch-up sync)',
  moduleStatusEdits.length > 0 &&
    moduleStatusEdits.every((l) => l.startsWith('-drifted_from_default:')),
  `${moduleStatusEdits.length} status-line edits`,
);

console.log(ok ? 'PARITY-OK' : 'PARITY-FAIL');
process.exitCode = ok ? 0 : 1;
