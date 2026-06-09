// Pure library for parsing `/fix` PR-comment directives.
//
// The `pr-actions` workflow turns a maintainer comment such as `/fix` or
// `/fix:refcache` into the npm script it should run. This module isolates that
// parsing and the backward-compatibility mapping so the logic is unit-testable;
// see ./cli.mjs for the workflow wiring and ./index.test.mjs for the tests.

export const INVALID_DIRECTIVE_MESSAGE =
  '❌ Invalid fix directive. Use `/fix` or `/fix:<name>` and no other text.';

export const FIX_ALL_COMPAT_MESSAGE =
  'ℹ️ INFO: Running `/fix` for `/fix:all` (compat mode). Use `/fix` moving forward.';

// A directive is a line that is exactly `/fix` optionally followed by one or
// more `:segment` parts, where a segment is one or more of `-_0-9a-zA-Z`.
const DIRECTIVE_RE = /^\/(fix(?::[-_0-9A-Za-z]+)*)$/m;

/**
 * Result of parsing a `/fix` directive.
 *
 * @typedef {Object} FixDirective
 * @property {boolean} valid       Whether the comment is a valid directive.
 * @property {string} [error]      User-facing error when `valid` is false.
 * @property {string} [actionName] The directive as written (e.g. `fix:all`),
 *                                 used for user-facing messages.
 * @property {string} [command]    The npm script to actually run, after compat
 *                                 mapping (e.g. `fix:all` -> `fix`).
 * @property {string} [info]       Optional informational message to surface.
 */

/**
 * Parse a PR comment body into a `/fix` directive.
 *
 * The compat mapping preserves historical behavior:
 *  - `/fix:all` runs `fix` (the modern command), with an info message.
 *  - `/fix:ALL` lets maintainers still run the literal `fix:all` script.
 *
 * @param {string} commentBody
 * @returns {FixDirective}
 */
export function parseFixDirective(commentBody) {
  const match = DIRECTIVE_RE.exec(commentBody ?? '');
  if (!match) {
    return { valid: false, error: INVALID_DIRECTIVE_MESSAGE };
  }

  const actionName = match[1];

  if (actionName === 'fix:all') {
    return {
      valid: true,
      actionName,
      command: 'fix',
      info: FIX_ALL_COMPAT_MESSAGE,
    };
  }

  if (actionName === 'fix:ALL') {
    return { valid: true, actionName, command: 'fix:all' };
  }

  return { valid: true, actionName, command: actionName };
}
