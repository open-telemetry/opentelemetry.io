#!/usr/bin/env node
// CLI entry point: parse a `/fix` PR-comment directive for the `pr-actions`
// workflow. All pure logic lives in ./index.mjs.

import { appendFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { parseFixDirective } from './index.mjs';

const HELP = `Usage: cli.mjs --comment <body>

Parse a \`/fix\` PR-comment directive. On a valid directive, prints
\`action_name\` and \`command\` key=value pairs (and appends them to
$GITHUB_OUTPUT when set, as under GitHub Actions). On an invalid directive,
prints the error and exits non-zero.

Options:
  -c, --comment <body>  The PR comment body to parse. Required.
  -h, --help            Show this help.
`;

const { values } = parseArgs({
  options: {
    comment: { type: 'string', short: 'c' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

if (values.comment === undefined) {
  console.error('Missing required option: --comment\n');
  console.error(HELP);
  process.exit(1);
}

const directive = parseFixDirective(values.comment);

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
