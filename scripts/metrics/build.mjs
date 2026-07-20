#!/usr/bin/env node
// TEMPORARY tool. Gathers summary metrics for one build kind: build time, files,
// links visited, and link-check time for both checkers (htmltest, lychee).
// See docsy#2659 / otel.io#10449.
//
// Usage:
//   node scripts/metrics/build.mjs          # regular build (default)
//   node scripts/metrics/build.mjs --lean    # lean build
//   node scripts/metrics/build.mjs -n        # --no-build: reuse existing tmp/m/*
//
// Notes:
//   - The build goes to tmp/m/<kind>/public so it doesn't clobber ./public.
//   - To compare kinds, run once per kind (e.g. regular vs --lean).
//   - Link checks run offline/internal for clean, reproducible, network-free
//     timing (isolates the chrome-dedup effect; no refcache/external variance).
//   - Logs are kept under tmp/m/*.log for inspection.

import { execSync } from 'node:child_process';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  rmSync,
  globSync,
} from 'node:fs';

const ROOT = process.cwd();
const OUT = `${ROOT}/tmp/m`;
const HTMLTEST = existsSync(`${ROOT}/tmp/bin/htmltest`)
  ? `${ROOT}/tmp/bin/htmltest`
  : 'htmltest';

const args = process.argv.slice(2);
const doBuild = !args.some((a) => a === '--no-build' || a === '-n');
const lean = args.includes('--lean');
const KIND = lean ? 'lean' : 'regular';
const BUILD_ENV = lean ? { HUGO_PARAMS_TD_CHROME: 'shared' } : {};

const sh = (cmd, opts = {}) =>
  execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], ...opts });

function timed(fn) {
  const t0 = process.hrtime.bigint();
  const r = fn();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { ms, r };
}

// Tool-independent link counter: deduped, fragment/query-stripped targets.
function scanLinks(dir) {
  const files = globSync(`${dir}/**/*.html`);
  let occurrences = 0;
  const ext = new Set();
  const int = new Set();
  const re = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  for (const f of files) {
    const html = readFileSync(f, 'utf8');
    let m;
    while ((m = re.exec(html))) {
      let u = m[1].trim();
      if (!u || /^(#|data:|javascript:|mailto:|tel:)/i.test(u)) continue;
      u = u.split('#')[0].split('?')[0];
      if (!u) continue;
      occurrences++;
      (/^https?:\/\//i.test(u) ? ext : int).add(u);
    }
  }
  return { files: files.length, occurrences, ext, int };
}

function build(dest) {
  const env = { ...process.env, ...BUILD_ENV };
  const log = `${OUT}/${KIND}-build.log`;
  const { ms } = timed(() =>
    execSync(
      `npm run _hugo -- -e dev --buildDrafts --buildFuture --baseURL http://localhost --destination ${dest} > ${log} 2>&1`,
      { cwd: ROOT, env },
    ),
  );
  const hugoMs = (readFileSync(log, 'utf8').match(/Total in (\d+) ms/) ||
    [])[1];
  return { ms, hugoMs: hugoMs ? Number(hugoMs) : null };
}

function runHtmltest(dir) {
  const cfg = `${OUT}/ht-${KIND}.yml`;
  const base = readFileSync(`${ROOT}/.htmltest.yml`, 'utf8');
  writeFileSync(
    cfg,
    base.replace(/^DirectoryPath:.*$/m, `DirectoryPath: ${dir}`),
  );
  const log = `${OUT}/ht-${KIND}.log`;
  const { ms } = timed(() => {
    try {
      execSync(`${HTMLTEST} --skip-external -c ${cfg} > ${log} 2>&1`, {
        cwd: ROOT,
      });
    } catch {
      /* htmltest exits non-zero on findings; we still want the timing */
    }
  });
  const docs = (readFileSync(log, 'utf8').match(/tested (\d+) documents/) ||
    [])[1];
  return { ms, docs: docs ? Number(docs) : null };
}

function runLychee(dir) {
  const log = `${OUT}/ly-${KIND}.log`;
  const { ms } = timed(() => {
    try {
      execSync(
        `lychee --config lychee.toml --offline --root-dir ${dir} ${dir} > ${log} 2>&1`,
        { cwd: ROOT },
      );
    } catch {
      /* offline run can flag mailto/etc.; timing still valid */
    }
  });
  const out = readFileSync(log, 'utf8');
  const total = (out.match(/(\d+)\s+Total/) || [])[1];
  const unique = (out.match(/(\d+)\s+Unique/) || [])[1];
  return {
    ms,
    total: total ? Number(total) : null,
    unique: unique ? Number(unique) : null,
  };
}

const fmt = (ms) => (ms == null ? '—' : `${(ms / 1000).toFixed(2)}s`);
const num = (n) => (n == null ? '—' : n.toLocaleString('en-US'));

function main() {
  mkdirSync(OUT, { recursive: true });
  // Ensure configs exist.
  sh('npm run generate:config:links');
  if (!existsSync(`${ROOT}/lychee.toml`))
    sh('npm run generate:config:links:lychee');
  if (!existsSync(`${ROOT}/.lycheecache`)) sh('npm run _lychee:seed-cache');

  const dest = `${OUT}/${KIND}/public`;
  let buildInfo = { ms: null, hugoMs: null };
  if (doBuild) {
    rmSync(`${OUT}/${KIND}`, { recursive: true, force: true });
    buildInfo = build(dest);
  }

  const scan = scanLinks(dest);
  const ht = runHtmltest(dest);
  const ly = runLychee(dest);

  console.log(`\n# Build metrics — ${KIND}\n`);

  console.log('## Build\n');
  console.log('| metric | value |');
  console.log('|---|---|');
  console.log(
    `| Hugo Total in | ${buildInfo.hugoMs ? buildInfo.hugoMs + ' ms' : '—'} |`,
  );
  console.log(`| wall | ${fmt(buildInfo.ms)} |`);
  console.log(`| files | ${num(scan.files)} |`);
  console.log(`| link occurrences | ${num(scan.occurrences)} |`);
  console.log(`| unique internal targets | ${num(scan.int.size)} |`);
  console.log(`| unique external targets | ${num(scan.ext.size)} |`);

  console.log('\n## Link check (offline/internal)\n');
  console.log('| checker | files / links | time |');
  console.log('|---|---|---|');
  console.log(`| htmltest | ${num(ht.docs)} docs | ${fmt(ht.ms)} |`);
  console.log(
    `| lychee | ${num(scan.files)} files / ${num(ly.total)} total · ${num(ly.unique)} uniq | ${fmt(ly.ms)} |`,
  );
}

main();
