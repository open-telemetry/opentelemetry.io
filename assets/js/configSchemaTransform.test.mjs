/**
 * Unit tests for Configuration Schema Transformer
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveType,
  buildConstraints,
  cleanDescription,
  processProperty,
  buildTypeConstraints,
  processType,
  extractTypes,
  transformSchema,
} from './configSchemaTransform.mjs';

describe('resolveType', () => {
  test('resolves types correctly', () => {
    const cases = [
      [{ type: 'string' }, 'string'],
      [{ type: ['string', 'null'] }, 'string, null'],
      [{ $ref: '#/$defs/LogRecordProcessor' }, 'LogRecordProcessor'],
      [{ description: 'Some property' }, 'object'],
    ];

    cases.forEach(([input, expected]) => {
      assert.equal(resolveType(input), expected);
    });
  });
});

describe('buildConstraints', () => {
  test('builds constraints correctly', () => {
    const cases = [
      [{ minimum: 1, maximum: 100 }, 'minimum: 1, maximum: 100'],
      [{ minLength: 1, maxLength: 50 }, 'minLength: 1, maxLength: 50'],
      [{ pattern: '^[a-z]+$' }, 'pattern: ^[a-z]+$'],
      [{ enum: ['debug', 'info', 'warn', 'error'] }, 'enum: [debug, info, warn, error]'],
      [{ minProperties: 1, maxProperties: 10 }, 'minProperties: 1, maxProperties: 10'],
      [{ minItems: 1, maxItems: 5 }, 'minItems: 1, maxItems: 5'],
      [{ type: 'string' }, ''],
    ];

    cases.forEach(([input, expected]) => {
      assert.equal(buildConstraints(input), expected);
    });
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

  test('linkifies URLs with correct attributes', () => {
    const result = cleanDescription('See https://example.com for details');
    assert.match(result, /<a href="https:\/\/example\.com"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
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
    assert.equal(result.default, 'info');
    assert.equal(result.constraints, 'enum: [debug, info, warn, error]');
    assert.equal(result.description, 'The log level');
  });
});

describe('buildTypeConstraints', () => {
  test('handles individual constraints', () => {
    const cases = [
      [{ additionalProperties: false }, 'additionalProperties: false.'],
      [{ required: ['name', 'type'] }, 'Required properties: name, type.'],
      [{ minProperties: 1, maxProperties: 5 }, 'minProperties: 1. maxProperties: 5.'],
      [{ properties: {} }, ''],
    ];

    cases.forEach(([input, expected]) => {
      assert.equal(buildTypeConstraints(input), expected);
    });
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