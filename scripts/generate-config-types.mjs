#!/usr/bin/env node
/**
 * Build-time script: transforms the raw OpenTelemetry configuration JSON Schema
 * into the pre-processed format consumed by the configuration types accordion.
 *
 * Input:  content-modules/opentelemetry-configuration/opentelemetry_configuration.json
 * Output: tmp/config-types.json  (mounted to static/schemas/config-types.json by Hugo)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { transformSchema } from '../assets/js/lib/configSchemaTransform.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

const schemaPath = join(
  root,
  'content-modules/opentelemetry-configuration/opentelemetry_configuration.json',
);
const outputDir = join(root, 'tmp/schemas');
const outputPath = join(outputDir, 'config-types.json');

const rawSchema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const result = transformSchema(rawSchema);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n');

console.log(
  `Generated ${outputPath} with ${result.types.length} configuration types`,
);