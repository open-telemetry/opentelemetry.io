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
 * @property {string} [prState]          PR state at the time of the request:
 *                                       'open' or 'closed' (merged PRs are
 *                                       closed). '' is treated as open for
 *                                       callers that don't gate on state.
 * @property {string} [prMerged]         'true' when the PR is merged.
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
  prState,
  prMerged,
  generateResult,
  patchSkipped,
  commandExitStatus,
  applyResult,
  runId,
  runUrl,
  hint,
}) {
  const what = label ? `\`${label}\`` : 'the requested action';
  const logs = `See [run ${runId}](${runUrl}).`;

  // 0. The PR isn't open: nothing ran (the pipeline gates on PR state).
  if (prState && prState !== 'open') {
    const why = prMerged === 'true' ? 'has already been merged' : 'is closed';
    return `❌ This PR ${why}, so ${what} was not run: such actions only apply to open PRs. ${logs}`;
  }

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
    return `ℹ️ ${what} made no changes; nothing to commit. ${logs}`;
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
  return `✅ ${what} applied successfully. ${logs}`;
}
