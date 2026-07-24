// Pure library for parsing `/fix` PR-comment directives.
//
// The `pr-actions` workflow turns a maintainer comment such as `/fix` or
// `/fix:link-cache` into the npm script it should run. This module isolates that
// parsing and the backward-compatibility mapping so the logic is unit-testable;
// see ./cli.mjs for the workflow wiring and ./index.test.mjs for the tests.

// Single source of truth for how to phrase a directive; also surfaced by the
// report job as a hint when a request could not be identified.
export const DIRECTIVE_HINT =
  'Start your comment with `/fix` or `/fix:<name>` on a line of its own.';

export const INVALID_DIRECTIVE_MESSAGE = `❌ Invalid fix directive. ${DIRECTIVE_HINT}`;

export const FIX_ALL_COMPAT_MESSAGE =
  'ℹ️ INFO: Running `/fix` for `/fix:all` (compat mode). Use `/fix` moving forward.';

export const FIX_REFCACHE_COMPAT_MESSAGE =
  'ℹ️ INFO: `/fix:refcache` is deprecated. Use `/fix:link-cache` moving forward.';

// The first line of the comment must be exactly `/fix` optionally followed by
// one or more `:segment` parts, where a segment is one or more of `-_0-9a-zA-Z`.
// Any following lines are ignored.
const DIRECTIVE_RE = /^\/(fix(?::[-_0-9A-Za-z]+)*)$/;

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
 * Only the first line of the comment is considered (so a directive may be
 * followed by free-form text on subsequent lines).
 *
 * The compat mapping preserves historical behavior:
 *  - `/fix:all` runs `fix` (the modern command), with an info message.
 *  - `/fix:ALL` lets maintainers still run the literal `fix:all` script.
 *  - `/fix:refcache` still runs the `fix:refcache` script, with a deprecation
 *    notice. The resolved script runs on the PR head, and pre-rename heads
 *    only have `fix:refcache`; post-rename package.json forwards it to
 *    `fix:link-cache`.
 *
 * @param {string} commentBody
 * @returns {FixDirective}
 */
export function parseFixDirective(commentBody) {
  const firstLine = (commentBody ?? '').split('\n', 1)[0].trim();
  const match = DIRECTIVE_RE.exec(firstLine);
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

  if (actionName === 'fix:refcache') {
    return {
      valid: true,
      actionName,
      command: actionName,
      info: FIX_REFCACHE_COMPAT_MESSAGE,
    };
  }

  return { valid: true, actionName, command: actionName };
}
