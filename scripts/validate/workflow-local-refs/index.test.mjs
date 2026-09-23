// Unit tests for the reference extractor plus a repo-wide guard asserting that
// every local file referenced by a workflow actually exists. The guard is what
// catches a script/action being moved or renamed without updating its caller.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { candidatePaths, findWorkflowReferences } from './index.mjs';

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const workflowsDir = new URL('.github/workflows/', `file://${repoRoot}`)
  .pathname;

describe('findWorkflowReferences', () => {
  test('finds a node script invocation', () => {
    const refs = findWorkflowReferences(
      '        run: node scripts/gh/x/cli.mjs',
    );
    assert.deepEqual(refs, [
      { kind: 'script', ref: 'scripts/gh/x/cli.mjs', line: 1 },
    ]);
  });

  test('finds a script invocation with arguments and ./ prefix', () => {
    const refs = findWorkflowReferences('run: node ./scripts/a/b.mjs --flag=1');
    assert.equal(refs.length, 1);
    assert.equal(refs[0].ref, 'scripts/a/b.mjs');
  });

  test('finds a local composite-action or reusable-workflow use', () => {
    const refs = findWorkflowReferences('        uses: ./.github/actions/foo');
    assert.deepEqual(refs, [
      { kind: 'action', ref: './.github/actions/foo', line: 1 },
    ]);
  });

  test('ignores remote (non-local) uses', () => {
    assert.deepEqual(findWorkflowReferences('  uses: actions/checkout@v4'), []);
  });

  test('ignores commented-out lines', () => {
    const yaml = [
      '#     uses: ./.github/workflows/reusable.yml',
      '   # run: node scripts/old/cli.mjs',
    ].join('\n');
    assert.deepEqual(findWorkflowReferences(yaml), []);
  });

  test('reports correct line numbers across a file', () => {
    const yaml = ['jobs:', '  a:', '    run: node scripts/x/cli.mjs'].join(
      '\n',
    );
    assert.equal(findWorkflowReferences(yaml)[0].line, 3);
  });
});

describe('candidatePaths', () => {
  test('script: the path itself', () => {
    assert.deepEqual(
      candidatePaths({ kind: 'script', ref: 'scripts/x/cli.mjs' }),
      ['scripts/x/cli.mjs'],
    );
  });

  test('action directory: action.yml or action.yaml', () => {
    assert.deepEqual(
      candidatePaths({ kind: 'action', ref: './.github/actions/foo' }),
      ['.github/actions/foo/action.yml', '.github/actions/foo/action.yaml'],
    );
  });

  test('reusable workflow: the file itself', () => {
    assert.deepEqual(
      candidatePaths({ kind: 'action', ref: './.github/workflows/r.yml' }),
      ['.github/workflows/r.yml'],
    );
  });
});

describe('every workflow references files that exist', () => {
  const files = readdirSync(workflowsDir).filter((f) => /\.ya?ml$/.test(f));

  assert.ok(files.length > 0, 'expected to find workflow files');

  for (const file of files) {
    test(file, () => {
      const text = readFileSync(`${workflowsDir}${file}`, 'utf8');
      for (const reference of findWorkflowReferences(text)) {
        const candidates = candidatePaths(reference);
        const found = candidates.some((p) => existsSync(`${repoRoot}${p}`));
        assert.ok(
          found,
          `${file}:${reference.line} references "${reference.ref}" but none of ` +
            `[${candidates.join(', ')}] exist`,
        );
      }
    });
  }
});
