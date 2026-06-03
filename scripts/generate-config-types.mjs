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

const rawSchema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const result = transformSchema(rawSchema);

// Read example snippets and group them by the schema type they illustrate.
// Snippet files are named `<JsonSchemaType>_<snake_case_description>.yaml`.
const snippetsByType = {};
let snippetCount = 0;
for (const file of readdirSync(snippetsDir).sort()) {
  if (!file.endsWith('.yaml')) continue;
  const raw = readFileSync(join(snippetsDir, file), 'utf8');
  if (!raw.includes('# SNIPPET_START')) {
    throw new Error(`Snippet ${file} is missing a "# SNIPPET_START" marker`);
  }
  const { typeName, description, content } = parseSnippet(file, raw);
  // A marker with nothing after it (e.g. the console exporter, which takes no
  // config) yields an empty fragment — there's nothing to show, so skip it.
  if (!content.trim()) continue;
  (snippetsByType[typeName] ??= []).push({ description, content });
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
