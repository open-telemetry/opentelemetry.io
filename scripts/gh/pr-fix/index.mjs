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

/**
 * Inputs needed to describe how a `/fix` run turned out. All values come from
 * job results and outputs in the workflow, so they are plain strings (and may be
 * empty when an upstream step never ran).
 *
 * @typedef {Object} OutcomeInput
 * @property {string} actionName        The directive as written; '' when the
 *                                      directive was invalid or never parsed.
 * @property {string} generateResult    Result of the patch-generation job:
 *                                      'success' | 'failure' | 'cancelled'.
 * @property {string} patchSkipped      'true' when generation produced no
 *                                      changes; 'false' otherwise.
 * @property {string} actionExitStatus  Exit status of the fix command ('0' on
 *                                      success).
 * @property {string} applyResult       Result of the apply job: 'success' |
 *                                      'failure' | 'cancelled' | 'skipped'.
 * @property {string} runId             GitHub Actions run id.
 * @property {string} runUrl            URL of the workflow run.
 */

/**
 * Build the single comment that tells the requestor how their `/fix` directive
 * turned out, for every outcome including failures that happen before any patch
 * is produced (invalid directive, oversized patch, setup errors). This is the
 * one message the workflow posts, so it must cover all paths.
 *
 * @param {OutcomeInput} input
 * @returns {string} The comment body.
 */
export function buildOutcomeComment({
  actionName,
  generateResult,
  patchSkipped,
  actionExitStatus,
  applyResult,
  runId,
  runUrl,
}) {
  const cmd = actionName ? `\`${actionName}\`` : 'your `/fix` directive';
  const logs = `See logs: ${runUrl}`;

  // 1. Patch generation did not succeed: no changes were ever captured.
  if (generateResult === 'cancelled') {
    return `⚠️ ${cmd} was cancelled before any changes were generated. ${logs}`;
  }
  if (generateResult !== 'success') {
    if (!actionName) {
      return (
        '❌ Invalid `/fix` directive, or it could not be processed. ' +
        `Use \`/fix\` or \`/fix:<name>\` and no other text. ${logs}`
      );
    }
    return `❌ ${cmd} could not be run, or its changes could not be captured. ${logs}`;
  }

  // 2. Generation succeeded but produced no changes.
  if (patchSkipped === 'true') {
    return `ℹ️ ${cmd} made no changes. Nothing to commit.`;
  }

  // 3. Changes were produced: report how applying them went.
  if (applyResult === 'cancelled') {
    return `⚠️ ${cmd} produced changes, but applying them was cancelled. ${logs}`;
  }
  if (applyResult !== 'success') {
    return `❌ ${cmd} produced changes, but they could not be applied or pushed. ${logs}`;
  }
  if (actionExitStatus !== '0') {
    return (
      `⚠️ ${cmd} exited with a non-zero status (${actionExitStatus}), ` +
      `but the resulting changes were applied. ${logs}`
    );
  }
  return `✅ ${cmd} applied successfully in [run ${runId}](${runUrl}).`;
}
