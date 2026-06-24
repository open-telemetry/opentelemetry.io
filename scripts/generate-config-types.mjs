#!/usr/bin/env node
/**
 * Build-time script: transforms the raw OpenTelemetry configuration JSON Schema
 * into the pre-processed format consumed by the configuration types accordion.
 *
 * Input:  content-modules/opentelemetry-configuration/opentelemetry_configuration.json
 * Output: tmp/config-types.json  (mounted to static/schemas/config-types.json by Hugo)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { transformSchema } from '../assets/js/lib/configSchemaTransform.mjs';
import { parseSnippet } from '../assets/js/lib/configSnippets.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

const configRoot = join(root, 'content-modules/opentelemetry-configuration');
const schemaPath = join(configRoot, 'opentelemetry_configuration.json');
const snippetsDir = join(configRoot, 'snippets');
const outputDir = join(root, 'tmp/schemas');
const outputPath = join(outputDir, 'config-types.json');

// Resolve the opentelemetry-configuration ref the snippets are pinned to, so we
// can link each snippet back to its source on GitHub. Prefer the `config-pin`
// from .gitmodules (a human-readable tag like `v1.0.0`); fall back to `main`.
const SNIPPET_REPO = 'open-telemetry/opentelemetry-configuration';
function resolveConfigRef() {
  try {
    const gitmodules = readFileSync(join(root, '.gitmodules'), 'utf8');
    const block = gitmodules
      .split(/^\[submodule /m)
      .find((b) => b.includes('opentelemetry-configuration'));
    const pin = block?.match(/config-pin\s*=\s*(\S+)/)?.[1];
    return pin || 'main';
  } catch {
    return 'main';
  }
}
const configRef = resolveConfigRef();
const snippetSourceBase = `https://github.com/${SNIPPET_REPO}/blob/${configRef}/snippets`;

const schemaRawText = readFileSync(schemaPath, 'utf8');
const rawSchema = JSON.parse(schemaRawText);
const result = transformSchema(rawSchema);

// Scan the raw schema text for the 1-indexed line number of each $defs entry so
// we can link directly to the right line on GitHub. Indentation is derived from
// the file itself rather than assumed, so this works regardless of the JSON
// formatting (2-space, 4-space, tabs). Direct $defs entries are the keys one
// level deeper than `"$defs"`; nested keys (deeper still) are ignored, and the
// scan stops when indentation returns to the $defs level (end of the block).
function findDefLineNumbers(text) {
  const lineNumbers = {};
  const lines = text.split('\n');
  let defsIndent = null; // leading whitespace of the `"$defs"` key
  let entryIndent = null; // leading whitespace of a direct $defs entry
  for (let i = 0; i < lines.length; i++) {
    if (defsIndent === null) {
      const m = lines[i].match(/^(\s*)"\$defs"\s*:/);
      if (m) defsIndent = m[1];
      continue;
    }
    const m = lines[i].match(/^(\s*)"([^"]+)"\s*:/);
    if (!m) continue;
    const indent = m[1];
    if (indent.length <= defsIndent.length) break; // left the $defs block
    if (entryIndent === null) entryIndent = indent; // first entry sets the depth
    if (indent === entryIndent) lineNumbers[m[2]] = i + 1;
  }
  return lineNumbers;
}

const defLineNumbers = findDefLineNumbers(schemaRawText);
const schemaGithubBase = `https://github.com/${SNIPPET_REPO}/blob/${configRef}/opentelemetry_configuration.json`;

// Attach the raw $defs entry and a GitHub source link to each type.
// The root type gets the schema minus $defs (which is enormous).
for (const type of result.types) {
  if (type.isRoot) {
    const { $defs, ...rootDef } = rawSchema;
    type.rawDef = rootDef;
    type.sourceUrl = schemaGithubBase;
  } else {
    type.rawDef = rawSchema.$defs[type.name];
    const line = defLineNumbers[type.name];
    type.sourceUrl = line ? `${schemaGithubBase}#L${line}` : schemaGithubBase;
  }
}

// Read example snippets and group them by the schema type they illustrate.
// Snippet files are named `<JsonSchemaType>_<snake_case_description>.yaml`.
const snippetsByType = {};
let snippetCount = 0;
for (const file of readdirSync(snippetsDir).sort()) {
  if (!file.endsWith('.yaml')) continue;
  const raw = readFileSync(join(snippetsDir, file), 'utf8');
  const { typeName, description, content, highlightStart } = parseSnippet(
    file,
    raw,
  );
  if (!content.trim()) continue; // defensive: nothing to show
  (snippetsByType[typeName] ??= []).push({
    description,
    content,
    highlightStart,
    sourceUrl: `${snippetSourceBase}/${file}`,
  });
  snippetCount++;
}

// Attach snippets to their matching type (always an array, like `properties`).
for (const type of result.types) {
  const snippets = snippetsByType[type.name] ?? [];
  snippets.sort((a, b) => a.description.localeCompare(b.description));
  type.snippets = snippets;
}

// Guard against a snippet whose filename prefix isn't a real schema type.
const knownTypes = new Set(result.types.map((t) => t.name));
const orphans = Object.keys(snippetsByType).filter((t) => !knownTypes.has(t));
if (orphans.length > 0) {
  throw new Error(
    `Snippet(s) reference unknown configuration type(s): ${orphans.join(', ')}`,
  );
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n');

console.log(
  `Generated ${outputPath} with ${result.types.length} configuration types ` +
    `and ${snippetCount} example snippets`,
);
