/**
 * Unit tests for Configuration Snippets parser
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  toTitleCase,
  parseSnippetFilename,
  extractSnippet,
  extractSnippetContent,
  parseSnippet,
} from './configSnippets.mjs';

describe('toTitleCase', () => {
  test('converts snake_case to Title Case', () => {
    assert.equal(toTitleCase('parent_based_typical'), 'Parent Based Typical');
  });

  test('handles a single word', () => {
    assert.equal(toTitleCase('custom'), 'Custom');
  });

  test('handles an empty string', () => {
    assert.equal(toTitleCase(''), '');
  });
});

describe('parseSnippetFilename', () => {
  test('splits type name from description', () => {
    assert.deepEqual(
      parseSnippetFilename('Sampler_parent_based_typical.yaml'),
      {
        typeName: 'Sampler',
        description: 'Parent Based Typical',
      },
    );
  });

  test('preserves schema casing of the type name', () => {
    assert.deepEqual(
      parseSnippetFilename('OtlpHttpExporter_traces_kitchen_sink.yaml'),
      { typeName: 'OtlpHttpExporter', description: 'Traces Kitchen Sink' },
    );
  });

  test('handles a filename with no underscore', () => {
    assert.deepEqual(parseSnippetFilename('Resource.yaml'), {
      typeName: 'Resource',
      description: '',
    });
  });
});

describe('extractSnippetContent', () => {
  test('returns the full file with the marker line removed', () => {
    const raw = [
      'file_format: "1.0"',
      'tracer_provider:',
      '  sampler:',
      '    # SNIPPET_START',
      '    parent_based:',
      '      root:',
      '        always_on:',
    ].join('\n');

    assert.equal(
      extractSnippetContent(raw),
      [
        'file_format: "1.0"',
        'tracer_provider:',
        '  sampler:',
        '    parent_based:',
        '      root:',
        '        always_on:',
      ].join('\n'),
    );
  });

  test('keeps non-marker comment lines', () => {
    const raw = [
      '  sampler:',
      '    # SNIPPET_START',
      '    # configure the sampler',
      '    always_on:',
    ].join('\n');

    assert.equal(
      extractSnippetContent(raw),
      ['  sampler:', '    # configure the sampler', '    always_on:'].join(
        '\n',
      ),
    );
  });

  test('preserves blank lines between content', () => {
    const raw = ['foo:', '', 'bar:', '# SNIPPET_START'].join('\n');
    assert.equal(extractSnippetContent(raw), ['foo:', '', 'bar:'].join('\n'));
  });

  test('normalizes CRLF and trims surrounding blank lines', () => {
    const raw = '\r\nfile_format: "1.0"\r\n# SNIPPET_START\r\nfoo: bar\r\n\r\n';
    assert.equal(
      extractSnippetContent(raw),
      ['file_format: "1.0"', 'foo: bar'].join('\n'),
    );
  });

  test('returns the whole file unchanged when no marker is present', () => {
    assert.equal(
      extractSnippetContent('foo: bar\nbaz: qux'),
      'foo: bar\nbaz: qux',
    );
  });
});

describe('extractSnippet highlightStart', () => {
  test('points at the line that followed the marker', () => {
    const raw = [
      'file_format: "1.0"', // 0
      'tracer_provider:', //   1
      '  sampler:', //         2
      '    # SNIPPET_START',
      '    parent_based:', //  3 (after marker removed)
      '      root:', //        4
    ].join('\n');

    assert.deepEqual(extractSnippet(raw), {
      content: [
        'file_format: "1.0"',
        'tracer_provider:',
        '  sampler:',
        '    parent_based:',
        '      root:',
      ].join('\n'),
      highlightStart: 3,
    });
  });

  test('is null when there is no marker', () => {
    assert.deepEqual(extractSnippet('foo: bar'), {
      content: 'foo: bar',
      highlightStart: null,
    });
  });

  test('equals the line count when the marker is the last line', () => {
    const raw = ['foo:', '  bar: baz', '# SNIPPET_START'].join('\n');
    assert.deepEqual(extractSnippet(raw), {
      content: ['foo:', '  bar: baz'].join('\n'),
      highlightStart: 2,
    });
  });

  test('is 0 when the marker precedes all content', () => {
    const raw = ['# SNIPPET_START', 'foo:', '  bar: baz'].join('\n');
    assert.deepEqual(extractSnippet(raw), {
      content: ['foo:', '  bar: baz'].join('\n'),
      highlightStart: 0,
    });
  });

  test('adjusts for trimmed leading blank lines', () => {
    const raw = ['', '', 'file_format: "1.0"', '# SNIPPET_START', 'foo:'].join(
      '\n',
    );
    assert.deepEqual(extractSnippet(raw), {
      content: ['file_format: "1.0"', 'foo:'].join('\n'),
      highlightStart: 1,
    });
  });
});

describe('parseSnippet', () => {
  test('combines filename and content parsing', () => {
    const raw = [
      'file_format: "1.0"',
      'tracer_provider:',
      '  sampler:',
      '    # SNIPPET_START',
      '    always_on:',
    ].join('\n');

    assert.deepEqual(parseSnippet('Sampler_always_on.yaml', raw), {
      typeName: 'Sampler',
      description: 'Always On',
      content: [
        'file_format: "1.0"',
        'tracer_provider:',
        '  sampler:',
        '    always_on:',
      ].join('\n'),
      highlightStart: 3,
    });
  });
});
