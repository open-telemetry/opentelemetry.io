// @ts-check
//
// Tests for gh-url-hash rule

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lint } from 'markdownlint/promise';
import rule from './index.mjs';

const config = {
  default: false,
  'gh-url-hash': true,
};

/**
 * Run the gh-url-hash rule on markdown content.
 * @param {string} content - Markdown content to lint
 * @returns {Promise<Array>} - Array of lint errors
 */
async function lintContent(content) {
  const results = await lint({
    strings: { test: content },
    customRules: [rule],
    config,
  });
  return results.test || [];
}

describe('gh-url-hash', () => {
  // --- Should flag (default branch names) ---

  it('should flag blob URL with "main" branch', async () => {
    const errors = await lintContent(
      '[file](https://github.com/open-telemetry/opentelemetry-js/blob/main/README.md)',
    );
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].errorDetail.includes('main'));
  });

  it('should flag blob URL with "master" branch', async () => {
    const errors = await lintContent(
      '[file](https://github.com/org/repo/blob/master/src/index.ts)',
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should flag tree URL with "main" branch name', async () => {
    const errors = await lintContent(
      '[dir](https://github.com/org/repo/tree/main/src)',
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should flag tree URL at repo root with "main" branch', async () => {
    const errors = await lintContent(
      '[repo](https://github.com/org/repo/tree/main)',
    );
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].errorDetail.includes('main'));
  });

  it('should flag tree URL at repo root with "master" branch', async () => {
    const errors = await lintContent(
      '[repo](https://github.com/org/repo/tree/master)',
    );
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].errorDetail.includes('master'));
  });

  it('should pass for URL with tag-like ref (not a hash)', async () => {
    const errors = await lintContent(
      '[file](https://github.com/org/repo/blob/v1.2.3/README.md)',
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should pass for URL with feature branch name', async () => {
    const errors = await lintContent(
      '[file](https://github.com/org/repo/blob/feature/my-branch/README.md)',
    );
    assert.strictEqual(errors.length, 0);
  });

  // --- Should NOT flag (tag/release IDs and commit hashes) ---

  it('should pass for blob URL with full 40-char hash', async () => {
    const errors = await lintContent(
      '[file](https://github.com/org/repo/blob/abc1234def5678901234567890abcdef12345678/README.md)',
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should pass for blob URL with uppercase full 40-char hash', async () => {
    const errors = await lintContent(
      '[file](https://github.com/org/repo/blob/ABC1234DEF5678901234567890ABCDEF12345678/README.md)',
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should flag blob URL with short 7-char hash', async () => {
    const errors = await lintContent(
      '[file](https://github.com/org/repo/blob/abc1234/README.md)',
    );
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].errorDetail.includes('full 40-character'));
  });

  it('should flag blob URL with uppercase short 7-char hash', async () => {
    const errors = await lintContent(
      '[file](https://github.com/org/repo/blob/ABC1234/README.md)',
    );
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].errorDetail.includes('full 40-character'));
  });

  it('should pass for tree URL with hash', async () => {
    const errors = await lintContent(
      '[dir](https://github.com/org/repo/tree/abc1234def5678901234567890abcdef12345678/src)',
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should pass for tree URL at repo root with full hash', async () => {
    const errors = await lintContent(
      '[repo](https://github.com/org/repo/tree/abc1234def5678901234567890abcdef12345678)',
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should pass for tree URL at repo root with full hash and from_branch query', async () => {
    const errors = await lintContent(
      '[repo](https://github.com/org/repo/tree/abc1234def5678901234567890abcdef12345678?from_branch=agentic-workflows)',
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should flag tree URL at repo root with short hash', async () => {
    const errors = await lintContent(
      '[repo](https://github.com/org/repo/tree/abc1234)',
    );
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].errorDetail.includes('full 40-character'));
  });

  // --- Should NOT flag (non-matching URLs) ---

  it('should pass for non-GitHub URL', async () => {
    const errors = await lintContent(
      '[file](https://gitlab.com/org/repo/blob/main/README.md)',
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should pass for GitHub URL without blob or tree', async () => {
    const errors = await lintContent(
      '[issue](https://github.com/org/repo/issues/123)',
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should pass for GitHub repo root URL', async () => {
    const errors = await lintContent('[repo](https://github.com/org/repo)');
    assert.strictEqual(errors.length, 0);
  });

  it('should pass for tree URL at repo root with non-main/master branch', async () => {
    const errors = await lintContent(
      '[repo](https://github.com/org/repo/tree/feature-branch)',
    );
    assert.strictEqual(errors.length, 0);
  });

  // --- Various Markdown link types ---

  it('should flag reference-style link definitions', async () => {
    const content = `
See [config][] for details.

[config]: https://github.com/org/repo/blob/main/config.yaml
`;
    const errors = await lintContent(content);
    assert.strictEqual(errors.length, 1);
  });

  it('should flag autolinks', async () => {
    const errors = await lintContent(
      'See <https://github.com/org/repo/blob/main/README.md> for info.',
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should flag bare URLs', async () => {
    const errors = await lintContent(
      'See https://github.com/org/repo/blob/main/README.md for info.',
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should flag image URLs', async () => {
    const errors = await lintContent(
      '![diagram](https://github.com/org/repo/blob/main/docs/arch.png)',
    );
    assert.strictEqual(errors.length, 1);
  });

  // --- Multiple links ---

  it('should flag only default-branch URLs when mixed', async () => {
    const content = `
[good](https://github.com/org/repo/blob/abc1234def5678901234567890abcdef12345678/README.md)
[bad](https://github.com/org/repo/blob/main/README.md)
[also-good](https://opentelemetry.io)
[also-good-branch](https://github.com/org/repo/tree/develop/src)
`;
    const errors = await lintContent(content);
    assert.strictEqual(errors.length, 1);
  });

  // --- Edge cases ---

  it('should skip URLs with Hugo template directives', async () => {
    const errors = await lintContent(
      '[file]({{ .Get "url" }}/blob/main/README.md)',
    );
    assert.strictEqual(errors.length, 0);
  });
});

// --- Fix mode tests ---

/**
 * Run the gh-url-hash rule in simulated fix mode by temporarily adding
 * `--fix` to process argv.
 *
 * @param {string} content - Markdown content to lint
 * @returns {Promise<Array>} - Array of lint errors
 */
async function lintContentInFixMode(content) {
  const originalArgv = process.argv;
  const hasFixArg = originalArgv.includes('--fix');
  if (!hasFixArg) {
    process.argv = [...originalArgv, '--fix'];
  }
  try {
    const results = await lint({
      strings: { test: content },
      customRules: [rule],
      config,
    });
    return results.test || [];
  } finally {
    if (!hasFixArg) {
      process.argv = originalArgv;
    }
  }
}

/**
 * Apply a markdownlint fixInfo to a line of text.
 * @param {string} line
 * @param {object} fixInfo
 * @returns {string}
 */
function applyFix(line, fixInfo) {
  const col = (fixInfo.editColumn || 1) - 1;
  const del = fixInfo.deleteCount || 0;
  const ins = fixInfo.insertText || '';
  return line.substring(0, col) + ins + line.substring(col + del);
}

const TEST_SHA = 'abc1234def5678901234567890abcdef12345678';

/**
 * Mock fetch to simulate GitHub commits page responses.
 *
 * The rule uses a single request per URL:
 *   GET https://github.com/{owner}/{repo}/commits/{ref}/{path}
 *
 * - fileExists=true: HTML includes a commit link with a full SHA.
 * - fileExists=false: HTML does not include any commit link.
 *
 * @param {object} t - test context
 * @param {{ fileExists?: boolean }} [options]
 */
function mockGitHubGet(t, { fileExists = true } = {}) {
  const html = fileExists
    ? `<a href="/open-telemetry/community/commit/${TEST_SHA}">commit</a>`
    : '<html><body>No commits found</body></html>';
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    text: async () => html,
  }));
}

describe('gh-url-hash fix', { concurrency: 1 }, () => {
  it('should provide fixInfo that replaces branch with full hash and adds from_branch', async (t) => {
    mockGitHubGet(t);

    const content =
      '[link](https://github.com/open-telemetry/community/blob/main/guides/contributor-guide.md)';
    const errors = await lintContentInFixMode(content);
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].fixInfo, 'fixInfo should be present');

    const fixedLine = applyFix(content, errors[0].fixInfo);
    assert.strictEqual(
      fixedLine,
      `[link](https://github.com/open-telemetry/community/blob/${TEST_SHA}/guides/contributor-guide.md?from_branch=main)`,
    );
  });

  it('should provide fixInfo that replaces short hash with full hash', async (t) => {
    mockGitHubGet(t);

    const content =
      '[link](https://github.com/open-telemetry/community/blob/abc1234/guides/contributor-guide.md)';
    const errors = await lintContentInFixMode(content);
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].fixInfo, 'fixInfo should be present');

    const fixedLine = applyFix(content, errors[0].fixInfo);
    assert.strictEqual(
      fixedLine,
      `[link](https://github.com/open-telemetry/community/blob/${TEST_SHA}/guides/contributor-guide.md)`,
    );
  });

  it('should not provide fixInfo when file no longer exists on branch', async (t) => {
    mockGitHubGet(t, { fileExists: false });

    const content =
      '[link](https://github.com/org/repo/blob/main/deleted-file.md)';
    const errors = await lintContentInFixMode(content);
    assert.strictEqual(errors.length, 1);
    assert.ok(
      !errors[0].fixInfo,
      'fixInfo should NOT be present for deleted files',
    );
    assert.ok(
      errors[0]?.errorDetail?.includes('auto-fix lookup failed'),
      'error detail should explain that auto-fix lookup failed',
    );
  });

  it('should report 404 lookup failure without fixInfo', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => ({
      ok: false,
      status: 404,
      headers: { get: () => null },
      text: async () => '',
    }));

    const content = '[link](https://github.com/org/repo/blob/main/missing.md)';
    const errors = await lintContentInFixMode(content);
    assert.strictEqual(errors.length, 1);
    assert.ok(!errors[0].fixInfo, 'fixInfo should NOT be present for 404');
    assert.ok(
      errors[0]?.errorDetail?.includes('GitHub returned 404'),
      'error detail should include the 404 reason',
    );
  });

  it('should not provide fixInfo when fix mode is not enabled (even with rule config)', async () => {
    const content = '[link](https://github.com/org/repo/blob/main/README.md)';
    const results = await lint({
      strings: { test: content },
      customRules: [rule],
      config: { default: false, 'gh-url-hash': { fix: true } },
    });

    const errors = results.test;
    assert.strictEqual(errors.length, 1);
    assert.ok(
      !errors[0].fixInfo,
      'fixInfo should NOT be present when fix mode is off',
    );
  });

  it('should reuse lookup results for duplicate URLs in fix mode', async (t) => {
    let fetchCalls = 0;
    t.mock.method(globalThis, 'fetch', async () => {
      fetchCalls += 1;
      return {
        ok: true,
        status: 200,
        text: async () => `<a href="/org/repo/commit/${TEST_SHA}">commit</a>`,
      };
    });

    const content = `
[a](https://github.com/org/repo/blob/main/README.md)
[b](https://github.com/org/repo/blob/main/README.md)
`;
    const errors = await lintContentInFixMode(content);
    assert.strictEqual(errors.length, 2);
    assert.ok(errors[0].fixInfo, 'first duplicate URL should be fixable');
    assert.ok(errors[1].fixInfo, 'second duplicate URL should be fixable');
    assert.strictEqual(
      fetchCalls,
      1,
      'duplicate URL should trigger one lookup',
    );
  });

  it('should pause lookups process-wide after first 429 and honor Retry-After', async (t) => {
    let fetchCalls = 0;
    t.mock.method(globalThis, 'fetch', async () => {
      fetchCalls += 1;
      return {
        ok: false,
        status: 429,
        headers: { get: () => '120' },
        text: async () => '',
      };
    });

    const firstContent = `
[a](https://github.com/org/repo/blob/main/README-a.md)
[b](https://github.com/org/repo/blob/main/README-b.md)
[c](https://github.com/org/repo/blob/main/README-c.md)
[d](https://github.com/org/repo/blob/main/README-d.md)
`;
    const firstErrors = await lintContentInFixMode(firstContent);
    assert.strictEqual(firstErrors.length, 4);
    assert.ok(
      firstErrors.every((e) =>
        e?.errorDetail?.includes('Paused lookups process-wide'),
      ),
      'all errors should indicate global lookup pause',
    );
    assert.ok(
      fetchCalls === 1,
      `expected first 429 to pause lookups immediately, saw ${fetchCalls} requests`,
    );

    const secondErrors = await lintContentInFixMode(
      '[x](https://github.com/org/repo/blob/main/README-later.md)',
    );
    assert.strictEqual(secondErrors.length, 1);
    assert.ok(
      secondErrors[0]?.errorDetail?.includes('retry after about 120s'),
      'error detail should include Retry-After based global cooldown',
    );
    assert.strictEqual(
      fetchCalls,
      1,
      'second invocation should not perform additional lookups while globally paused',
    );
  });
});
