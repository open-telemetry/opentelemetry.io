#!/usr/bin/env node

/**
 * Configuration Schema Transformer
 *
 * Transforms the raw OpenTelemetry configuration JSON Schema into a simplified
 * format optimized for the configuration types accordion UI.
 *
 * Input:  data/opentelemetry/configuration.json (standard JSON Schema)
 * Output: data/opentelemetry/configuration-types.json (simplified structure)
 *
 * This script extracts type definitions, processes properties, resolves constraints,
 * and generates human-readable default text - all logic previously done in Hugo templates.
 */

const fs = require('fs');
const path = require('path');

// File paths relative to project root
const INPUT_FILE = 'data/opentelemetry/configuration.json';
const OUTPUT_FILE = 'data/opentelemetry/configuration-types.json';

/**
 * Resolve type information from a property definition
 * Handles arrays, single values, and $ref pointers
 * @param {Object} propDef - Property definition from JSON Schema
 * @returns {string} Comma-delimited type string
 */
function resolveType(propDef) {
  let types = [];

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

  // Numeric constraints
  if (propDef.minimum !== undefined) {
    parts.push(`minimum: ${propDef.minimum}`);
  }
  if (propDef.maximum !== undefined) {
    parts.push(`maximum: ${propDef.maximum}`);
  }

  // String constraints
  if (propDef.minLength !== undefined) {
    parts.push(`minLength: ${propDef.minLength}`);
  }
  if (propDef.maxLength !== undefined) {
    parts.push(`maxLength: ${propDef.maxLength}`);
  }
  if (propDef.pattern) {
    parts.push(`pattern: ${propDef.pattern}`);
  }

  // Enum constraint
  if (propDef.enum) {
    const enumVals = propDef.enum.join(', ');
    parts.push(`enum: [${enumVals}]`);
  }

  // Object constraints
  if (propDef.minProperties !== undefined) {
    parts.push(`minProperties: ${propDef.minProperties}`);
  }
  if (propDef.maxProperties !== undefined) {
    parts.push(`maxProperties: ${propDef.maxProperties}`);
  }

  // Array constraints
  if (propDef.minItems !== undefined) {
    parts.push(`minItems: ${propDef.minItems}`);
  }
  if (propDef.maxItems !== undefined) {
    parts.push(`maxItems: ${propDef.maxItems}`);
  }

  return parts.join(', ');
}

/**
 * Generate human-readable default behavior text
 * @param {Object} propDef - Property definition from JSON Schema
 * @returns {string} Default behavior description
 */
function generateDefaultText(propDef) {
  if (propDef.default !== undefined) {
    return `If omitted, ${propDef.default} is used.`;
  }

  // Check if null is an allowed type
  const types = Array.isArray(propDef.type) ? propDef.type : [propDef.type];
  if (types.includes('null')) {
    return 'If omitted or null, default behavior applies.';
  }

  return 'If omitted, default behavior applies.';
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
    default: generateDefaultText(propDef),
    constraints: buildConstraints(propDef),
    description: cleanDescription(propDef.description)
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

  // Join with periods and add trailing period
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
  let hasNoProperties = true;

  // Process properties if they exist
  if (typeDef.properties) {
    hasNoProperties = false;
    for (const [propName, propDef] of Object.entries(typeDef.properties)) {
      properties.push(processProperty(propName, propDef));
    }
  }

  return {
    id: typeName.toLowerCase(),
    name: typeName,
    isExperimental: typeName.startsWith('Experimental'),
    hasNoProperties,
    properties,
    constraints: buildTypeConstraints(typeDef)
  };
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

  // Sort by name
  types.sort((a, b) => a.name.localeCompare(b.name));

  return types;
}

/**
 * Main transformation function
 * Reads input JSON Schema, transforms it, and writes simplified output
 */
function transform() {
  try {
    // Resolve paths relative to project root
    const projectRoot = path.resolve(__dirname, '..');
    const inputPath = path.join(projectRoot, INPUT_FILE);
    const outputPath = path.join(projectRoot, OUTPUT_FILE);

    console.log(`Reading JSON Schema from: ${inputPath}`);

    // Read and parse input schema
    const schemaContent = fs.readFileSync(inputPath, 'utf8');
    const schema = JSON.parse(schemaContent);

    console.log('Extracting and processing type definitions...');

    // Extract and process types
    const types = extractTypes(schema);

    console.log(`Processed ${types.length} type definitions`);

    // Create output structure
    const output = { types };

    // Write output file
    console.log(`Writing simplified data to: ${outputPath}`);
    fs.writeFileSync(
      outputPath,
      JSON.stringify(output, null, 2) + '\n',
      'utf8'
    );

    console.log('✓ Transformation complete!');
    console.log(`  Input:  ${INPUT_FILE}`);
    console.log(`  Output: ${OUTPUT_FILE}`);
    console.log(`  Types:  ${types.length}`);

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
  transform();
}

module.exports = {
  resolveType,
  buildConstraints,
  generateDefaultText,
  cleanDescription,
  processProperty,
  processType,
  extractTypes,
  transform
};
