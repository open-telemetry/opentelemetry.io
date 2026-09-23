#!/usr/bin/env node

// Migration parity gate: runs the legacy scripts/check-i18n.sh and the
// drift.mjs engine over the same working tree and compares their per-page
// decisions. Keep green while both implementations coexist; retire with the
// bash script. Usage: node scripts/i18n/drift-parity.mjs [--repo DIR]

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { driftReportForRepo } from './drift.mjs';

const execFileP = promisify(execFile);

const repoArgIdx = process.argv.indexOf('--repo');
const rootDir = repoArgIdx > 0 ? process.argv[repoArgIdx + 1] : process.cwd();

function legacySetsOf(stdout) {
  const sets = {
    drifted: new Set(),
    'file not found': new Set(),
    new: new Set(),
    error: new Set(),
  };
  for (const line of stdout.split('\n')) {
    let m;
    if ((m = line.match(/^> Drifted file: (\S+)/))) sets.drifted.add(m[1]);
    else if ((m = line.match(/^File not found:\t(\S+) /)))
      sets['file not found'].add(m[1]);
    else if ((m = line.match(/^New i18n file - (\S+)/))) sets.new.add(m[1]);
    else if ((m = line.match(/^HASH\tERROR\t([^:]+):/))) sets.error.add(m[1]);
  }
  return sets;
}

function moduleSetsOf(report) {
  const sets = {
    drifted: new Set(),
    'file not found': new Set(),
    new: new Set(),
    error: new Set(),
  };
  for (const [page, { status }] of report) sets[status]?.add(page);
  return sets;
}

function diffSets(a, b) {
  return {
    onlyLegacy: [...a].filter((x) => !b.has(x)),
    onlyModule: [...b].filter((x) => !a.has(x)),
  };
}

const t0 = performance.now();
const { stdout } = await execFileP('scripts/check-i18n.sh', [], {
  cwd: rootDir,
  maxBuffer: 16 * 1024 * 1024,
});
const tLegacy = performance.now() - t0;

const t1 = performance.now();
const report = await driftReportForRepo(rootDir);
const tModule = performance.now() - t1;

const legacy = legacySetsOf(stdout);
const module_ = moduleSetsOf(report);

let ok = true;
for (const kind of Object.keys(legacy)) {
  const { onlyLegacy, onlyModule } = diffSets(legacy[kind], module_[kind]);
  const match = onlyLegacy.length === 0 && onlyModule.length === 0;
  console.log(
    `${match ? 'OK  ' : 'FAIL'} ${kind}: legacy ${legacy[kind].size}, module ${module_[kind].size}`,
  );
  for (const p of onlyLegacy) console.log(`  only legacy: ${p}`);
  for (const p of onlyModule) console.log(`  only module: ${p}`);
  ok &&= match;
}
console.log(
  `Timing: legacy ${(tLegacy / 1000).toFixed(1)}s, module ${(tModule / 1000).toFixed(2)}s`,
);

if (legacy.drifted.size + module_.drifted.size === 0) {
  console.error('SUSPECT: neither implementation reports drifted pages');
  ok = false;
}
console.log(ok ? 'PARITY-OK' : 'PARITY-FAIL');
process.exitCode = ok ? 0 : 1;
