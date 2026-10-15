#!/usr/bin/env node
// Run the site link check (lychee-norm-cache) and make the outcome
// actionable: a notice when the committed link cache changed, and reports
// that name what failed and where the fix is (also in the CI step summary).
// `--production` is this wrapper's flag; other arguments pass through to
// lychee.

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ROOT_MARKDOWN_GLOB,
  cacheUpdatedNotice,
  deadLinksReport,
  missingPagesReport,
  partitionFailures,
} from './index.mjs';

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);

// The link-cache bin, invoked by path so that output is captured
// npm-noise-free and the exit status observed; failures are parsed for the
// reports.
//
// Output streams through as it arrives: a link check can take minutes, and
// buffering it until exit would leave the terminal frozen.
const args = process.argv.slice(2);
const production = args.includes('--production');
const offline = args.includes('--offline');
const bin = path.join(root, 'node_modules', '.bin', 'lychee-norm-cache');
const child = spawn(
  bin,
  [...args.filter((a) => a !== '--production'), ROOT_MARKDOWN_GLOB],
  {
    cwd: root,
    stdio: ['inherit', 'pipe', 'pipe'],
  },
);
let output = '';
child.stdout.setEncoding('utf8');
child.stderr.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  output += chunk;
});
child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
  output += chunk;
});
child.on('error', (err) => {
  console.error(err.message);
  process.exitCode = 1;
});
child.on('close', (code) => {
  const status = code ?? 1;
  if (status === 0) {
    if (cacheModified()) console.log(cacheUpdatedNotice());
  } else {
    const { missingPages, other } = partitionFailures(output, { production });
    for (const [report, title] of [
      [
        missingPagesReport(missingPages),
        'Links into pages missing from the production build',
      ],
      [deadLinksReport(other, { offline }), 'Unreachable links'],
    ]) {
      if (!report) continue;
      console.log(report);
      appendToStepSummary(report, title);
    }
  }
  // Not process.exit(status): a hard exit can drop buffered stdout/stderr
  // (e.g. a large dead-links report when output is piped, as under npm/tee).
  process.exitCode = status;
});

// In CI (e.g., a bot `fix:link-cache` run), surface the report in the
// workflow step summary as well.
function appendToStepSummary(report, title) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  fs.appendFileSync(
    summaryPath,
    `### ${title}\n\n\`\`\`text\n${report}\n\`\`\`\n`,
  );
}

// True when link-cache.jsonc has unstaged changes: the local analogue of the CI
// `CACHE updates committed?` verdict (see .github/workflows/check-links.yml).
function cacheModified() {
  const r = spawnSync('git', ['diff', '--quiet', '--', 'link-cache.jsonc'], {
    cwd: root,
  });
  return r.status === 1;
}
