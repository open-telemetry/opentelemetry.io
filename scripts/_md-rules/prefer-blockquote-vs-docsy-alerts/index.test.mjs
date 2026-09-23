// @ts-check
//
// Tests for prefer-blockquote-vs-docsy-alerts rule

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lint } from 'markdownlint/promise';
import rule from './index.mjs';

const config = {
  default: false,
  'prefer-blockquote-vs-docsy-alerts': true,
};

/**
 * @param {string} filePath - Virtual path (rule is on/off via config, not path)
 * @param {string} content
 */
async function lintFile(filePath, content) {
  const results = await lint({
    strings: { [filePath]: content },
    customRules: [rule],
    config,
  });
  return results[filePath] || [];
}

describe('prefer-blockquote-vs-docsy-alerts', () => {
  it('flags {{% alert', async () => {
    const errors = await lintFile(
      'content/en/docs/example.md',
      'Intro\n\n{{% alert title="Note" %}}\nBody\n{{% /alert %}}\n',
    );
    assert.equal(errors.length, 1);
    const err = errors[0];
    assert.ok(err && (err.errorDetail ?? '').includes('blockquote'));
  });

  it('flags {{< alert', async () => {
    const errors = await lintFile(
      'content/en/docs/example.md',
      '{{< alert type="note" >}} One line {{< /alert >}}\n',
    );
    assert.equal(errors.length, 1);
  });

  it('flags alert shortcode inside fenced code (Hugo still processes unless escaped)', async () => {
    const errors = await lintFile(
      'content/en/docs/example.md',
      '```markdown\n{{% alert title="Note" %}}\n```\n',
    );
    assert.equal(errors.length, 1);
  });

  // Hugo “commented” shortcode delimiters (see README / Hugo docs); not real calls.
  it('does not flag standard-notation commented alert shortcode', async () => {
    const errors = await lintFile(
      'content/en/docs/example.md',
      '{{</* alert type="note" */>}}\n',
    );
    assert.equal(errors.length, 0);
  });

  it('does not flag markdown-notation commented alert shortcode', async () => {
    const errors = await lintFile(
      'content/en/docs/example.md',
      '{{%/* alert title="Note" */%}}\n',
    );
    assert.equal(errors.length, 0);
  });

  it('flags shortcode text inside inline code', async () => {
    const errors = await lintFile(
      'content/en/docs/example.md',
      'Prefer blockquotes over the legacy `{{% alert title="Note" %}}` syntax.\n',
    );
    assert.equal(errors.length, 1);
  });

  // Indented lines can still be real Hugo shortcodes (not just “code samples”);
  // keep flagging so authors convert or explicitly suppress.
  it('flags shortcode inside indented code block', async () => {
    const errors = await lintFile(
      'content/en/docs/example.md',
      'Example paragraph.\n\n    {{% alert title="Note" %}}\n',
    );
    assert.equal(errors.length, 1);
  });

  it('flags regardless of virtual path when rule is enabled', async () => {
    const errors = await lintFile(
      'README.md',
      '{{% alert title="Note" %}}\n{{% /alert %}}\n',
    );
    assert.equal(errors.length, 1);
  });
});
