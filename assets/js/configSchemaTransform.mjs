/**
 * Configuration Schema Transformer
 *
 * Transforms the raw OpenTelemetry configuration JSON Schema into a simplified
 * format optimized for the configuration types accordion UI.
 *
 * Input:  Raw JSON Schema from /schemas/opentelemetry_configuration.json
 * Output: Simplified structure for accordion rendering
 *
 * This module extracts type definitions, processes properties, and resolves constraints
 */

/**
 * Resolve type information from a property definition
 * Handles arrays, single values, and $ref pointers
 * @param {Object} propDef - Property definition from JSON Schema
 * @returns {string} Comma-delimited type string
 */
export function resolveType(propDef) {
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
export function buildConstraints(propDef) {
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
 * Converts markdown lists to HTML, linkifies URLs, and normalizes whitespace
 * @param {string} description - Raw description text
 * @returns {string} Cleaned description with HTML formatting
 */
export function cleanDescription(description) {
  if (!description) return '';

  let result = description.trim();

  const lines = result.split('\n');
  const processed = [];
  let currentList = null;
  let listType = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Check for unordered list item (- or *)
    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      if (listType !== 'ul') {
        // Close any open list
        if (currentList) {
          processed.push(currentList);
        }
        currentList = { type: 'ul', items: [] };
        listType = 'ul';
      }
      currentList.items.push(unorderedMatch[1]);
      continue;
    }

    // Check for ordered list item (1. 2. etc.)
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (listType !== 'ol') {
        // Close any open list
        if (currentList) {
          processed.push(currentList);
        }
        currentList = { type: 'ol', items: [] };
        listType = 'ol';
      }
      currentList.items.push(orderedMatch[1]);
      continue;
    }

    // Not a list item - close any open list
    if (currentList) {
      processed.push(currentList);
      currentList = null;
      listType = null;
    }

    // Add non-list line
    processed.push(line);
  }

  // Close final list if still open
  if (currentList) {
    processed.push(currentList);
  }

  // Convert processed structure to HTML
  result = processed.map(item => {
    if (typeof item === 'string') {
      return item;
    } else if (item.type === 'ul') {
      const items = item.items.map(i => `<li>${i}</li>`).join('');
      return `<ul>${items}</ul>`;
    } else if (item.type === 'ol') {
      const items = item.items.map(i => `<li>${i}</li>`).join('');
      return `<ol>${items}</ol>`;
    }
    return '';
  }).join(' ');

  // Linkify URLs after list processing
  result = result.replace(/(https?:\/\/[^\s<>"]+)/g, (url) => {
    // Don't linkify if already in a href attribute
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });

  // Normalize excessive whitespace between non-HTML content
  result = result.replace(/>\s+</g, '><');  // Remove whitespace between tags
  result = result.replace(/\s+/g, ' ').trim();  // Normalize other whitespace

  return result;
}

/**
 * Process a single property definition
 * @param {string} propName - Property name
 * @param {Object} propDef - Property definition from JSON Schema
 * @returns {Object} Simplified property object
 */
export function processProperty(propName, propDef) {
  return {
    name: propName,
    type: resolveType(propDef),
    default: propDef.default,
    constraints: buildConstraints(propDef),
    description: cleanDescription(propDef.description),
  };
}

/**
 * Build type-level constraints string
 * @param {Object} typeDef - Type definition from JSON Schema
 * @returns {string} Formatted constraints string
 */
export function buildTypeConstraints(typeDef) {
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
export function processType(typeName, typeDef) {
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
    constraints: buildTypeConstraints(typeDef),
  };
}

/**
 * Extract and process all type definitions from JSON Schema
 * @param {Object} schema - Complete JSON Schema object
 * @returns {Array} Array of processed type objects
 */
export function extractTypes(schema) {
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
 * Transforms raw JSON Schema to simplified format for accordion UI
 * @param {Object} rawSchema - Raw JSON Schema object
 * @returns {Object} Simplified data structure { types: [...] }
 */
export function transformSchema(rawSchema) {
  // Extract and process types
  const types = extractTypes(rawSchema);

  // Create output structure
  return { types };
}
