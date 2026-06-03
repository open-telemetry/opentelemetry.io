/**
 * Unit tests for Configuration Snippets parser
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  toTitleCase,
  parseSnippetFilename,
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
  test('returns lines after the marker, dedented by its column', () => {
    const raw = [
      'tracer_provider:',
      '  sampler:',
      '    # SNIPPET_START',
      '    parent_based:',
      '      root:',
      '        always_on:',
    ].join('\n');

    assert.equal(
      extractSnippetContent(raw),
      ['parent_based:', '  root:', '    always_on:'].join('\n'),
    );
  });

  test('does not dedent when the marker is at column 0', () => {
    const raw = ['# SNIPPET_START', 'foo:', '  bar: baz'].join('\n');
    assert.equal(extractSnippetContent(raw), ['foo:', '  bar: baz'].join('\n'));
  });

  test('preserves blank lines between content', () => {
    const raw = ['  # SNIPPET_START', '  foo:', '', '  bar:'].join('\n');
    assert.equal(extractSnippetContent(raw), ['foo:', '', 'bar:'].join('\n'));
  });

  test('does not throw when a line is shorter than the marker column', () => {
    const raw = ['    # SNIPPET_START', '  ab', '    cd: ef'].join('\n');
    // The short line dedents to '' (substring clamps).
    assert.equal(extractSnippetContent(raw), ['', 'cd: ef'].join('\n'));
  });

  test('normalizes CRLF line endings', () => {
    const raw = '# SNIPPET_START\r\nfoo: bar\r\n';
    assert.equal(extractSnippetContent(raw), 'foo: bar');
  });

  test('returns an empty string when the marker is absent', () => {
    assert.equal(extractSnippetContent('foo: bar\nbaz: qux'), '');
  });
});

describe('parseSnippet', () => {
  test('combines filename and content parsing', () => {
    const raw = [
      'tracer_provider:',
      '  sampler:',
      '    # SNIPPET_START',
      '    always_on:',
    ].join('\n');

    assert.deepEqual(parseSnippet('Sampler_always_on.yaml', raw), {
      typeName: 'Sampler',
      description: 'Always On',
      content: 'always_on:',
    });
  });
});
