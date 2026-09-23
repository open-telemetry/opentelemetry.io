#!/usr/bin/env node
// @ts-check
//
// I/O shell of the spec-page importer: loads module versions from
// data/spec-versions.yml (verified against the .gitmodules pins), loads
// patches.yml, and rewrites in place every file given on the command line.
// Invoked by cp-pages.sh from the repo root. The transformations themselves
// live in index.mjs.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { load } from 'js-yaml';
import {
  compilePatches,
  parseGitmodules,
  transform,
  versionErrors,
} from './index.mjs';

const scriptId = path.relative(process.cwd(), process.argv[1]);
const files = process.argv.slice(2);

if (files.length === 0) {
  console.error(`Usage: ${scriptId} FILE...

Rewrites, in place, Markdown pages copied from spec content modules. Run from
the repo root (reads .gitmodules); file paths must start with 'tmp/'.`);
  process.exit(2);
}

const specVersionsPath = 'data/spec-versions.yml';
const versions = /** @type {Record<string, string>} */ (
  load(readFileSync(specVersionsPath, 'utf8'))
);
const pins = parseGitmodules(readFileSync('.gitmodules', 'utf8'));

const errors = versionErrors(versions, pins, [
  'spec',
  'otlp',
  'semconv',
  'opamp',
]);
if (errors.length) {
  for (const error of errors) {
    console.error(`ERROR: ${scriptId}: ${specVersionsPath}: ${error}`);
  }
  process.exit(1);
}

const patchesPath = fileURLToPath(new URL('patches.yml', import.meta.url));
const patches = /** @type {import('./index.mjs').Patch[]} */ (
  load(readFileSync(patchesPath, 'utf8')) ?? []
);
const applyPatches = compilePatches(patches, { pins, versions, scriptId });

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  writeFileSync(file, transform({ path: file, text, versions, applyPatches }));
}
