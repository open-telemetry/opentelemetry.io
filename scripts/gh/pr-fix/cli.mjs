#!/usr/bin/env node
// CLI entry point: parse a `/fix` PR-comment directive for the `pr-actions`
// workflow. All pure logic lives in ./index.mjs.
//
// Reads the comment body from the environment and, on a valid directive, writes
// `action_name` and `command` to $GITHUB_OUTPUT. On an invalid directive it
// prints the error and exits non-zero.
//
// Required environment:
//   COMMENT         The PR comment body.
//
// Optional environment:
//   GITHUB_OUTPUT   Path written by GitHub Actions. If unset, the outputs are
//                   printed to stdout only (useful for local runs).

import { appendFileSync } from 'node:fs';

import { parseFixDirective } from './index.mjs';

const directive = parseFixDirective(process.env.COMMENT);

if (!directive.valid) {
  console.error(directive.error);
  process.exit(1);
}

if (directive.info) {
  console.log(directive.info);
}

const outputs = `action_name=${directive.actionName}\ncommand=${directive.command}\n`;

const githubOutput = process.env.GITHUB_OUTPUT;
if (githubOutput) {
  appendFileSync(githubOutput, outputs);
}
process.stdout.write(outputs);
