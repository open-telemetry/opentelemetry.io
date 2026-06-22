#!/usr/bin/env node
// CLI for the locale CODEOWNERS generator: regenerates the locale section of
// .github/CODEOWNERS from data/locale-teams.yaml. Run from the repo root.

import fs from 'node:fs';
import { parseArgs } from 'node:util';

import yaml from 'js-yaml';

import {
  genLocaleSection,
  updateCodeowners,
  validateRegistry,
} from './index.mjs';

const REGISTRY = 'data/locale-teams.yaml';
const CODEOWNERS = '.github/CODEOWNERS';

const HELP = `Usage: cli.mjs [options]

Regenerate the locale section of ${CODEOWNERS} from ${REGISTRY};
see scripts/gh/locale-codeowners/README.md and
https://github.com/open-telemetry/opentelemetry.io/issues/10374.

Options:
  -c, --check  Verify that ${CODEOWNERS} is up to date; exit 1 otherwise.
  -h, --help   Show this help.
`;

function main() {
  let values;
  try {
    ({ values } = parseArgs({
      options: {
        check: { type: 'boolean', short: 'c' },
        help: { type: 'boolean', short: 'h' },
      },
    }));
  } catch (err) {
    console.error(`${err.message}\n\n${HELP}`);
    process.exit(2);
  }
  if (values.help) {
    console.log(HELP);
    return;
  }

  const registry = yaml.load(fs.readFileSync(REGISTRY, 'utf8'));
  const localeDirs = fs
    .readdirSync('content', { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'en')
    .map((e) => e.name);
  const problems = validateRegistry(registry, { localeDirs });
  if (problems.length) {
    console.error(`Invalid ${REGISTRY}:\n - ${problems.join('\n - ')}`);
    process.exit(1);
  }

  const section = genLocaleSection(registry, { fileExists: fs.existsSync });
  const current = fs.readFileSync(CODEOWNERS, 'utf8');
  const updated = updateCodeowners(current, section);

  if (values.check) {
    if (current === updated) {
      console.log(`${CODEOWNERS} locale section is up to date.`);
    } else {
      console.error(
        `${CODEOWNERS} locale section is out of date with ${REGISTRY}.\n` +
          `[help] Run: npm run fix:codeowners`,
      );
      process.exit(1);
    }
  } else if (current === updated) {
    console.log(`${CODEOWNERS} locale section is already up to date.`);
  } else {
    fs.writeFileSync(CODEOWNERS, updated);
    console.log(`Updated the locale section of ${CODEOWNERS}.`);
  }
}

main();
