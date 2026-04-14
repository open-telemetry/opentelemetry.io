/**
 * Unit tests for Configuration Schema Transformer
 * Uses Node.js built-in test runner (node:test)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveType,
  buildConstraints,
  generateDefaultText,
  cleanDescription,
  processProperty,
  buildTypeConstraints,
  processType,
  extractTypes,
  transformSchema,
} from './configSchemaTransform.mjs';

describe('resolveType', () => {
  test('handles single type string', () => {
    const propDef = { type: 'string' };
    assert.equal(resolveType(propDef), 'string');
  });

  test('handles array of types', () => {
    const propDef = { type: ['string', 'null'] };
    assert.equal(resolveType(propDef), 'string, null');
  });

  test('handles $ref pointer', () => {
    const propDef = { $ref: '#/$defs/LogRecordProcessor' };
    assert.equal(resolveType(propDef), 'LogRecordProcessor');
  });

  test('defaults to object when no type or $ref', () => {
    const propDef = { description: 'Some property' };
    assert.equal(resolveType(propDef), 'object');
  });
});

describe('buildConstraints', () => {
  test('handles numeric constraints', () => {
    const propDef = { minimum: 1, maximum: 100 };
    assert.equal(buildConstraints(propDef), 'minimum: 1, maximum: 100');
  });

  test('handles string length constraints', () => {
    const propDef = { minLength: 1, maxLength: 50 };
    assert.equal(buildConstraints(propDef), 'minLength: 1, maxLength: 50');
  });

  test('handles pattern constraint', () => {
    const propDef = { pattern: '^[a-z]+$' };
    assert.equal(buildConstraints(propDef), 'pattern: ^[a-z]+$');
  });

  test('handles enum constraint', () => {
    const propDef = { enum: ['debug', 'info', 'warn', 'error'] };
    assert.equal(
      buildConstraints(propDef),
      'enum: [debug, info, warn, error]',
    );
  });

  test('handles object property constraints', () => {
    const propDef = { minProperties: 1, maxProperties: 10 };
    assert.equal(
      buildConstraints(propDef),
      'minProperties: 1, maxProperties: 10',
    );
  });

  test('handles array item constraints', () => {
    const propDef = { minItems: 1, maxItems: 5 };
    assert.equal(buildConstraints(propDef), 'minItems: 1, maxItems: 5');
  });

  test('returns empty string when no constraints', () => {
    const propDef = { type: 'string' };
    assert.equal(buildConstraints(propDef), '');
  });
});

describe('generateDefaultText', () => {
  test('uses explicit default value', () => {
    const propDef = { default: 'info' };
    assert.equal(generateDefaultText(propDef), 'If omitted, info is used.');
  });

  test('handles null type', () => {
    const propDef = { type: ['string', 'null'] };
    assert.equal(
      generateDefaultText(propDef),
      'If omitted or null, default behavior applies.',
    );
  });

  test('generic message for no default', () => {
    const propDef = { type: 'string' };
    assert.equal(
      generateDefaultText(propDef),
      'If omitted, default behavior applies.',
    );
  });
});

describe('cleanDescription', () => {
  test('returns empty string for null/undefined', () => {
    assert.equal(cleanDescription(null), '');
    assert.equal(cleanDescription(undefined), '');
    assert.equal(cleanDescription(''), '');
  });

  test('trims whitespace', () => {
    assert.equal(cleanDescription('  Hello world  '), 'Hello world');
  });

  test('converts markdown unordered list to HTML', () => {
    const input = '- Item 1\n- Item 2\n- Item 3';
    const expected = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
    assert.equal(cleanDescription(input), expected);
  });

  test('converts markdown ordered list to HTML', () => {
    const input = '1. First\n2. Second\n3. Third';
    const expected = '<ol><li>First</li><li>Second</li><li>Third</li></ol>';
    assert.equal(cleanDescription(input), expected);
  });

  test('linkifies URLs', () => {
    const input = 'See https://example.com for details';
    const result = cleanDescription(input);
    assert.ok(result.includes('<a href="https://example.com"'));
    assert.ok(result.includes('target="_blank"'));
    assert.ok(result.includes('rel="noopener noreferrer"'));
  });

  test('handles mixed content with lists and text', () => {
    const input = 'Introduction:\n- Item 1\n- Item 2\nConclusion';
    const result = cleanDescription(input);
    assert.ok(result.includes('Introduction:'));
    assert.ok(result.includes('<ul>'));
    assert.ok(result.includes('Conclusion'));
  });
});

describe('processProperty', () => {
  test('processes complete property definition', () => {
    const propDef = {
      type: 'string',
      description: 'The log level',
      default: 'info',
      enum: ['debug', 'info', 'warn', 'error'],
    };

    const result = processProperty('level', propDef);

    assert.equal(result.name, 'level');
    assert.equal(result.type, 'string');
    assert.equal(result.default, 'If omitted, info is used.');
    assert.equal(result.constraints, 'enum: [debug, info, warn, error]');
    assert.equal(result.description, 'The log level');
  });
});

describe('buildTypeConstraints', () => {
  test('handles additionalProperties: false', () => {
    const typeDef = { additionalProperties: false };
    assert.equal(buildTypeConstraints(typeDef), 'additionalProperties: false.');
  });

  test('handles required properties', () => {
    const typeDef = { required: ['name', 'type'] };
    assert.equal(
      buildTypeConstraints(typeDef),
      'Required properties: name, type.',
    );
  });

  test('handles min/max properties', () => {
    const typeDef = { minProperties: 1, maxProperties: 5 };
    assert.equal(
      buildTypeConstraints(typeDef),
      'minProperties: 1. maxProperties: 5.',
    );
  });

  test('combines multiple constraints', () => {
    const typeDef = {
      additionalProperties: false,
      required: ['id'],
      minProperties: 1,
    };
    const result = buildTypeConstraints(typeDef);
    assert.ok(result.includes('additionalProperties: false'));
    assert.ok(result.includes('Required properties: id'));
    assert.ok(result.includes('minProperties: 1'));
  });

  test('returns empty string when no constraints', () => {
    const typeDef = { properties: {} };
    assert.equal(buildTypeConstraints(typeDef), '');
  });
});

describe('processType', () => {
  test('processes type with properties', () => {
    const typeDef = {
      properties: {
        name: { type: 'string' },
        enabled: { type: 'boolean', default: false },
      },
      required: ['name'],
    };

    const result = processType('LoggerProvider', typeDef);

    assert.equal(result.id, 'loggerprovider');
    assert.equal(result.name, 'LoggerProvider');
    assert.equal(result.isExperimental, false);
    assert.equal(result.hasNoProperties, false);
    assert.equal(result.properties.length, 2);
    assert.equal(result.properties[0].name, 'name');
    assert.equal(result.properties[1].name, 'enabled');
  });

  test('marks experimental types', () => {
    const typeDef = { properties: {} };
    const result = processType('ExperimentalFeature', typeDef);
    assert.equal(result.isExperimental, true);
  });

  test('handles type with no properties', () => {
    const typeDef = {};
    const result = processType('EmptyType', typeDef);
    assert.equal(result.hasNoProperties, true);
    assert.equal(result.properties.length, 0);
  });
});

describe('extractTypes', () => {
  test('extracts and processes all types from schema', () => {
    const schema = {
      $defs: {
        TypeA: { properties: { foo: { type: 'string' } } },
        TypeB: { properties: { bar: { type: 'number' } } },
        _PrivateType: { properties: { hidden: { type: 'boolean' } } },
      },
    };

    const result = extractTypes(schema);

    assert.equal(result.length, 2); // _PrivateType should be filtered out
    assert.equal(result[0].name, 'TypeA');
    assert.equal(result[1].name, 'TypeB');
  });

  test('sorts types alphabetically', () => {
    const schema = {
      $defs: {
        Zebra: { properties: {} },
        Apple: { properties: {} },
        Mango: { properties: {} },
      },
    };

    const result = extractTypes(schema);

    assert.equal(result[0].name, 'Apple');
    assert.equal(result[1].name, 'Mango');
    assert.equal(result[2].name, 'Zebra');
  });

  test('throws error when $defs is missing', () => {
    const schema = { properties: {} };
    assert.throws(() => extractTypes(schema), {
      message: 'No $defs found in schema',
    });
  });

  test('filters out private types starting with underscore', () => {
    const schema = {
      $defs: {
        PublicType: { properties: {} },
        _InternalType: { properties: {} },
        __PrivateType: { properties: {} },
      },
    };

    const result = extractTypes(schema);

    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'PublicType');
  });
});

describe('transformSchema', () => {
  test('transforms complete schema successfully', () => {
    const rawSchema = {
      $defs: {
        LoggerProvider: {
          properties: {
            processors: {
              type: 'array',
              items: { $ref: '#/$defs/LogRecordProcessor' },
            },
          },
          required: ['processors'],
        },
        LogRecordProcessor: {
          properties: {
            type: { type: 'string' },
          },
        },
      },
    };

    const result = transformSchema(rawSchema);

    assert.ok(result.types);
    assert.equal(result.types.length, 2);
    // Types are sorted alphabetically
    assert.equal(result.types[0].name, 'LoggerProvider');
    assert.equal(result.types[1].name, 'LogRecordProcessor');
  });

  test('throws error for invalid schema', () => {
    const invalidSchema = { properties: {} }; // Missing $defs

    assert.throws(() => transformSchema(invalidSchema), {
      message: 'No $defs found in schema',
    });
  });
});
