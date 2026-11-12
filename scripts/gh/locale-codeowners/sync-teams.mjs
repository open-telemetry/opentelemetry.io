#!/usr/bin/env node
// Refresh the `locales:` map of data/locale-teams.yaml from the live direct
// membership of the docs-<loc>-{maintainers,approvers} teams. Read-only
// towards GitHub; needs `gh` authenticated with organization team read
// access. Run from the repo root; see ./README.md.
//
// Deliberately dependency-free (no js-yaml) so it can run before `npm ci`.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

import {
  fetchLiveRegistry,
  genLocalesBlock,
  replaceLocalesBlock,
} from './index.mjs';

const REGISTRY = 'data/locale-teams.yaml';

function runGh(args) {
  const res = spawnSync('gh', args, { encoding: 'utf8', timeout: 30_000 });
  return {
    stdout: res.stdout ?? '',
    stderr: res.stderr || res.error?.message || '',
    status: res.status ?? 1,
  };
}

function main() {
  const locales = fs
    .readdirSync('content', { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'en')
    .map((e) => e.name);

  let live;
  try {
    live = fetchLiveRegistry({ runGh, locales });
  } catch (err) {
    console.error(`ERROR: ${err.message}\n${REGISTRY} left unchanged.`);
    process.exit(1);
  }

  const current = fs.readFileSync(REGISTRY, 'utf8');
  const updated = replaceLocalesBlock(current, genLocalesBlock(live));
  if (updated === current) {
    console.log(`${REGISTRY} matches live team membership.`);
  } else {
    fs.writeFileSync(REGISTRY, updated);
    console.log(`Updated ${REGISTRY} from live team membership.`);
  }
}

main();
