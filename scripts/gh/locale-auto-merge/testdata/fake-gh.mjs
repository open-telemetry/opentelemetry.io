#!/usr/bin/env node
// Fake `gh` for the cli.mjs functional test. Copied onto a temp dir that is
// prepended to PATH, so the CLI's real `spawnSync('gh', ...)` finds this stub.
//
// Canned responses come from the environment so the test stays declarative:
//   FAKE_GH_FILES     Comma-separated changed-file paths for `pr view`.
//   FAKE_GH_AUTOMERGE `1` => auto-merge already enabled; anything else => off.
//   FAKE_GH_STATE     PR state for `pr view`. Default: OPEN.
//   FAKE_GH_TEAMS     JSON object of team-slug -> [logins] for membership API.
//   FAKE_GH_LOGIN     Login returned by `api user`. Default: octocat.
//   FAKE_GH_LOG       File to append each invocation's args to (one per line).
//   FAKE_GH_FAIL      First two args of the call that should exit non-zero
//                     (e.g. "pr view"), to simulate an infrastructure error.

import { appendFileSync } from 'node:fs';

// cspell:ignore octocat

const args = process.argv.slice(2);
const key = args.slice(0, 2).join(' ');

if (process.env.FAKE_GH_LOG) {
  appendFileSync(process.env.FAKE_GH_LOG, `${args.join(' ')}\n`);
}

if (process.env.FAKE_GH_FAIL && key === process.env.FAKE_GH_FAIL) {
  process.exit(1);
}

if (key === 'pr view') {
  const files = (process.env.FAKE_GH_FILES ?? '')
    .split(',')
    .filter(Boolean)
    .map((path) => ({ path }));
  const autoMergeRequest = process.env.FAKE_GH_AUTOMERGE === '1' ? {} : null;
  const state = process.env.FAKE_GH_STATE ?? 'OPEN';
  process.stdout.write(JSON.stringify({ files, autoMergeRequest, state }));
} else if (key === 'api user') {
  process.stdout.write(`${process.env.FAKE_GH_LOGIN ?? 'octocat'}\n`);
} else if (args[0] === 'api') {
  // Team membership: /orgs/<org>/teams/<slug>/members
  const ref = args.find((a) => a.includes('/teams/'));
  const m = ref && ref.match(/teams\/([^/]+)\/members/);
  if (m) {
    const teams = process.env.FAKE_GH_TEAMS
      ? JSON.parse(process.env.FAKE_GH_TEAMS)
      : {};
    const members = teams[m[1]] ?? [];
    process.stdout.write(members.join('\n'));
  }
}

process.exit(0);
