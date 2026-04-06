#!/usr/bin/env node

/**
 * Update Configuration Data
 *
 * Downloads and transforms the raw OpenTelemetry configuration JSON Schema into
 * a simplified format optimized for the configuration types accordion UI.
 *
 * Source: https://github.com/open-telemetry/opentelemetry-configuration
 * Output: data/opentelemetry/configurationTypes.json (simplified structure)
 *
 * This script downloads the schema, extracts type definitions, processes properties,
 * resolves constraints, and generates human-readable default text.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SCHEMA_URL =
  'https://raw.githubusercontent.com/open-telemetry/opentelemetry-configuration/main/opentelemetry_configuration.json';
const OUTPUT_FILE = 'data/opentelemetry/configurationTypes.json';

/**
 * Resolve type information from a property definition
 * Handles arrays, single values, and $ref pointers
 * @param {Object} propDef - Property definition from JSON Schema
 * @returns {string} Comma-delimited type string
 */
function resolveType(propDef) {
  let types;

  if (Array.isArray(propDef.type)) {
    types = propDef.type;
  } else if (propDef.type) {
    types = [propDef.type];
  } else if (propDef.$ref) {
    // Extract type name from reference like "#/$defs/TypeName"
    const refParts = propDef.$ref.split('/');
    types = [refParts[refParts.length - 1]];
  } else {
    types = ['object'];
  }

  return types.join(', ');
}

/**
 * Build constraints string from property definition
 * Extracts validation rules like minimum, maximum, pattern, enum, etc.
 * @param {Object} propDef - Property definition from JSON Schema
 * @returns {string} Comma-delimited constraints string
 */
function buildConstraints(propDef) {
  const parts = [];

  if (propDef.minimum !== undefined) {
    parts.push(`minimum: ${propDef.minimum}`);
  }
  if (propDef.maximum !== undefined) {
    parts.push(`maximum: ${propDef.maximum}`);
  }

  if (propDef.minLength !== undefined) {
    parts.push(`minLength: ${propDef.minLength}`);
  }
  if (propDef.maxLength !== undefined) {
    parts.push(`maxLength: ${propDef.maxLength}`);
  }
  if (propDef.pattern) {
    parts.push(`pattern: ${propDef.pattern}`);
  }

  if (propDef.enum) {
    const enumVals = propDef.enum.join(', ');
    parts.push(`enum: [${enumVals}]`);
  }

  if (propDef.minProperties !== undefined) {
    parts.push(`minProperties: ${propDef.minProperties}`);
  }
  if (propDef.maxProperties !== undefined) {
    parts.push(`maxProperties: ${propDef.maxProperties}`);
  }

  if (propDef.minItems !== undefined) {
    parts.push(`minItems: ${propDef.minItems}`);
  }
  if (propDef.maxItems !== undefined) {
    parts.push(`maxItems: ${propDef.maxItems}`);
  }

  return parts.join(', ');
}

/**
 * Clean description text
 * Normalizes whitespace and trims
 * @param {string} description - Raw description text
 * @returns {string} Cleaned description
 */
function cleanDescription(description) {
  if (!description) return '';

  // Replace multiple whitespace characters with single space
  return description.replace(/\s+/g, ' ').trim();
}

/**
 * Process a single property definition
 * @param {string} propName - Property name
 * @param {Object} propDef - Property definition from JSON Schema
 * @returns {Object} Simplified property object
 */
function processProperty(propName, propDef) {
  return {
    name: propName,
    type: resolveType(propDef),
    constraints: buildConstraints(propDef),
    description: cleanDescription(propDef.description),
  };
}

/**
 * Build type-level constraints string
 * @param {Object} typeDef - Type definition from JSON Schema
 * @returns {string} Formatted constraints string
 */
function buildTypeConstraints(typeDef) {
  const parts = [];

  if (typeDef.additionalProperties === false) {
    parts.push('additionalProperties: false');
  }

  if (typeDef.minProperties !== undefined) {
    parts.push(`minProperties: ${typeDef.minProperties}`);
  }

  if (typeDef.maxProperties !== undefined) {
    parts.push(`maxProperties: ${typeDef.maxProperties}`);
  }

  if (typeDef.required && typeDef.required.length > 0) {
    const requiredProps = typeDef.required.join(', ');
    parts.push(`Required properties: ${requiredProps}`);
  }

  if (parts.length === 0) return '';
  return parts.join('. ') + '.';
}

/**
 * Process a single type definition
 * @param {string} typeName - Type name
 * @param {Object} typeDef - Type definition from JSON Schema
 * @returns {Object} Simplified type object
 */
function processType(typeName, typeDef) {
  const properties = [];

  if (typeDef.properties) {
    for (const [propName, propDef] of Object.entries(typeDef.properties)) {
      properties.push(processProperty(propName, propDef));
    }
  }

  return {
    id: typeName.toLowerCase(),
    name: typeName,
    isExperimental: typeName.startsWith('Experimental'),
    hasNoProperties: properties.length === 0,
    properties,
    constraints: buildTypeConstraints(typeDef),
  };
}

/**
 * Fetch JSON from a URL
 * @param {string} url - URL to fetch from
 * @returns {Promise<Object>} Parsed JSON object
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download schema: HTTP ${res.statusCode} ${res.statusMessage}`,
            ),
          );
          res.resume();
          return;
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });
      })
      .on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });
  });
}

/**
 * Extract and process all type definitions from JSON Schema
 * @param {Object} schema - Complete JSON Schema object
 * @returns {Array} Array of processed type objects
 */
function extractTypes(schema) {
  if (!schema.$defs) {
    throw new Error('No $defs found in schema');
  }

  const types = [];

  for (const [typeName, typeDef] of Object.entries(schema.$defs)) {
    // Skip private types (those starting with underscore)
    if (typeName.startsWith('_')) {
      continue;
    }

    types.push(processType(typeName, typeDef));
  }

  types.sort((a, b) => a.name.localeCompare(b.name));

  return types;
}

/**
 * Main transformation function
 * Downloads JSON Schema from URL, transforms it, and writes simplified output
 */
async function run() {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const outputPath = path.join(projectRoot, OUTPUT_FILE);

    console.log(`Downloading schema from: ${SCHEMA_URL}`);
    const schema = await fetchJson(SCHEMA_URL);

    console.log('Extracting and processing type definitions...');
    const types = extractTypes(schema);

    console.log(`Processed ${types.length} type definitions`);

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const output = { types };
    console.log(`Writing formatted data to: ${outputPath}`);
    fs.writeFileSync(
      outputPath,
      JSON.stringify(output, null, 2) + '\n',
      'utf8',
    );

    console.log('Transformation complete!');
    console.log(`  Source: ${SCHEMA_URL}`);
    console.log(`  Output: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error during transformation:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run transformation if executed directly
if (require.main === module) {
  run().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = {
  transform: run,
};
