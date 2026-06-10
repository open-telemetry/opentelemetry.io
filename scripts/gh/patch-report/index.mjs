// Pure library for composing the comment that reports a patch-pipeline outcome.
//
// A workflow that generates a patch and applies it can funnel every outcome
// through this builder so the requestor always learns the result, even when the
// patch could not be generated or applied. This module isolates the
// message-selection logic so it is unit-testable; see ./cli.mjs for the workflow
// wiring and ./index.test.mjs for the tests.

/**
 * Inputs describing how a patch-pipeline run turned out. All values come from
 * job results and outputs in the workflow, so they are plain strings (and may be
 * empty when an upstream step never ran).
 *
 * @typedef {Object} OutcomeInput
 * @property {string} label              The action as requested (e.g. the
 *                                       command); '' when it could not be
 *                                       identified.
 * @property {string} generateResult     Result of the patch-generation job:
 *                                       'success' | 'failure' | 'cancelled'.
 * @property {string} patchSkipped       'true' when generation produced no
 *                                       changes; 'false' otherwise.
 * @property {string} commandExitStatus  Exit status of the command that produced
 *                                       the patch ('0' on success).
 * @property {string} applyResult        Result of the apply job: 'success' |
 *                                       'failure' | 'cancelled' | 'skipped'.
 * @property {string} runId              GitHub Actions run id.
 * @property {string} runUrl             URL of the workflow run.
 * @property {string} [hint]             Optional caller-supplied guidance shown
 *                                       when the request could not be identified
 *                                       (e.g. how to phrase it correctly).
 */

/**
 * Build the single comment that tells the requestor how their run turned out,
 * for every outcome including failures that happen before any patch is produced
 * (unidentifiable request, oversized patch, setup errors). This is the one
 * message the workflow posts, so it must cover all paths.
 *
 * @param {OutcomeInput} input
 * @returns {string} The comment body.
 */
export function buildOutcomeComment({
  label,
  generateResult,
  patchSkipped,
  commandExitStatus,
  applyResult,
  runId,
  runUrl,
  hint,
}) {
  const what = label ? `\`${label}\`` : 'the requested action';
  const logs = `See logs: ${runUrl}`;

  // 1. Patch generation did not succeed: no changes were ever captured.
  if (generateResult === 'cancelled') {
    return `⚠️ ${what} was cancelled before any changes were generated. ${logs}`;
  }
  if (generateResult !== 'success') {
    if (!label) {
      const guidance = hint ? ` ${hint}` : '';
      return `❌ The request could not be processed.${guidance} ${logs}`;
    }
    return `❌ ${what} could not be run, or its changes could not be captured. ${logs}`;
  }

  // 2. Generation succeeded but produced no changes.
  if (patchSkipped === 'true') {
    if (commandExitStatus && commandExitStatus !== '0') {
      return (
        `❌ ${what} failed (exit status ${commandExitStatus}) ` +
        `and made no changes. ${logs}`
      );
    }
    return `ℹ️ ${what} made no changes in [run ${runId}](${runUrl}). Nothing to commit.`;
  }

  // 3. Changes were produced: report how applying them went.
  if (applyResult === 'cancelled') {
    return `⚠️ ${what} produced changes, but applying them was cancelled. ${logs}`;
  }
  if (applyResult !== 'success') {
    return `❌ ${what} produced changes, but they could not be applied or pushed. ${logs}`;
  }
  if (commandExitStatus && commandExitStatus !== '0') {
    return (
      `⚠️ ${what} exited with a non-zero status (${commandExitStatus}), ` +
      `but the resulting changes were applied. ${logs}`
    );
  }
  return `✅ ${what} applied successfully in [run ${runId}](${runUrl}).`;
}
