// Pure library for composing the `/fix` run outcome comment.
//
// The `pr-actions` workflow funnels every `/fix` outcome through a single
// trusted job so the requestor always learns the result. This module isolates
// the message-selection logic so it is unit-testable; see ./cli.mjs for the
// workflow wiring and ./index.test.mjs for the tests.

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
