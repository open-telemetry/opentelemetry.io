// Pure library for the "Report workflow failure" reusable workflow.
//
// On a caller-workflow failure this opens a tracking issue (or comments on the
// already-open one), labels it, and sets its issue type. All side-effecting
// `gh` calls are funneled through an injected `runGh` so the orchestration is
// unit-testable; see ./cli.mjs for the real wiring and ./index.test.mjs for the
// fakes.

/**
 * Result of an injected `gh` invocation.
 *
 * @typedef {Object} GhResult
 * @property {string} stdout
 * @property {number} status   Exit code (0 on success).
 */

/**
 * Build the deduplication title used both to search for an existing issue and
 * to create a new one.
 *
 * @param {{ prefix: string, workflow: string, branch: string }} input
 * @returns {string}
 */
export function buildIssueTitle({ prefix, workflow, branch }) {
  return `${prefix}: ${workflow} on ${branch}`;
}

/**
 * Build the body of a newly created failure issue.
 *
 * @param {{ workflow: string, branch: string, sha: string, runUrl: string, prUrl?: string }} input
 * @returns {string}
 */
export function buildIssueBody({ workflow, branch, sha, runUrl, prUrl = '' }) {
  return [
    'A workflow run failed.',
    '',
    `**Workflow:** ${workflow}`,
    `**Branch:** ${branch}`,
    `**Commit:** ${sha}`,
    `**Run:** ${runUrl}`,
    ...(prUrl ? [`**PR:** ${prUrl}`] : []),
    '',
    'This issue was opened automatically; close it once the failure is resolved.',
  ].join('\n');
}

/**
 * Build the comment appended when a failure issue is already open.
 *
 * @param {{ sha: string, runUrl: string, prUrl?: string }} input
 * @returns {string}
 */
export function buildCommentBody({ sha, runUrl, prUrl = '' }) {
  return [
    'Another failure occurred.',
    '',
    `**Run:** ${runUrl}`,
    `**Commit:** ${sha}`,
    ...(prUrl ? [`**PR:** ${prUrl}`] : []),
  ].join('\n');
}

/**
 * GitHub issue search is fuzzy, so re-filter the candidates for an exact title
 * match and return the first issue number (or `null`).
 *
 * @param {string} issuesJson   Raw stdout of `gh issue list --json number,title`.
 * @param {string} title
 * @returns {number|null}
 */
export function selectIssueNumberByExactTitle(issuesJson, title) {
  let issues;
  try {
    issues = JSON.parse(issuesJson || '[]');
  } catch {
    return null;
  }
  if (!Array.isArray(issues)) return null;
  const match = issues.find((i) => i && i.title === title);
  return match ? match.number : null;
}

/**
 * Run `gh` and throw with context if it exits non-zero.
 *
 * @param {(args: string[]) => GhResult} runGh
 * @param {string[]} args
 * @returns {string} stdout
 */
function gh(runGh, args) {
  const { stdout, status } = runGh(args);
  if (status !== 0) {
    throw new Error(`gh ${args.join(' ')} failed with exit code ${status}`);
  }
  return stdout;
}

/**
 * Resolve the GraphQL node id of an org/repo issue type by name (e.g. `Bug`).
 * Returns `null` if the type is not defined for the repository.
 *
 * @param {(args: string[]) => GhResult} runGh
 * @param {{ owner: string, name: string, issueType: string }} input
 * @returns {string|null}
 */
export function resolveIssueTypeId(runGh, { owner, name, issueType }) {
  const query = `query($owner:String!,$name:String!){
    repository(owner:$owner,name:$name){
      issueTypes(first:20){ nodes{ id name } }
    }
  }`;
  const stdout = gh(runGh, [
    'api',
    'graphql',
    '-f',
    `query=${query}`,
    '-F',
    `owner=${owner}`,
    '-F',
    `name=${name}`,
  ]);
  let nodes;
  try {
    nodes = JSON.parse(stdout).data.repository.issueTypes.nodes;
  } catch {
    return null;
  }
  const found = (nodes || []).find((n) => n && n.name === issueType);
  return found ? found.id : null;
}

/**
 * Set the issue type of an issue via GraphQL. No-op (returns false) when the
 * requested type can't be resolved, so a missing type never fails the report.
 *
 * @param {(args: string[]) => GhResult} runGh
 * @param {{ repo: string, issueNumber: number, issueType: string, log?: (m: string) => void }} input
 * @returns {boolean} whether the type was set
 */
export function setIssueType(
  runGh,
  { repo, issueNumber, issueType, log = console.log },
) {
  const [owner, name] = repo.split('/');
  const typeId = resolveIssueTypeId(runGh, { owner, name, issueType });
  if (!typeId) {
    log(`Issue type "${issueType}" is not defined for ${repo}; skipping.`);
    return false;
  }

  const issueId = gh(runGh, [
    'issue',
    'view',
    String(issueNumber),
    '--repo',
    repo,
    '--json',
    'id',
    '--jq',
    '.id',
  ]).trim();
  if (!issueId) {
    log(`Could not resolve node id for issue #${issueNumber}; skipping type.`);
    return false;
  }

  const mutation = `mutation($issueId:ID!,$typeId:ID!){
    updateIssueIssueType(input:{issueId:$issueId, issueTypeId:$typeId}){
      issue{ number }
    }
  }`;
  gh(runGh, [
    'api',
    'graphql',
    '-f',
    `query=${mutation}`,
    '-F',
    `issueId=${issueId}`,
    '-F',
    `typeId=${typeId}`,
  ]);
  return true;
}

/**
 * @typedef {Object} ReportResult
 * @property {'commented' | 'created'} action
 * @property {number} issueNumber
 * @property {boolean} typeSet
 */

/**
 * Open (or comment on) the failure tracking issue for the current run.
 *
 * @param {Object} input
 * @param {string} input.repo        `owner/name`.
 * @param {string} input.workflow    Caller workflow name.
 * @param {string} input.branch
 * @param {string} input.sha
 * @param {string} input.runUrl
 * @param {string} input.label       Existing label to apply / search by.
 * @param {string} input.issueType   Org issue type name (e.g. `Bug`).
 * @param {string} input.issuePrefix Title prefix (e.g. `Workflow failed`).
 * @param {string} [input.prUrl]     URL of a related PR to link, if any.
 * @param {(args: string[]) => GhResult} input.runGh
 * @param {(msg: string) => void} [input.log]
 * @returns {ReportResult}
 */
export function reportFailure({
  repo,
  workflow,
  branch,
  sha,
  runUrl,
  label,
  issueType,
  issuePrefix,
  prUrl = '',
  runGh,
  log = console.log,
}) {
  const title = buildIssueTitle({ prefix: issuePrefix, workflow, branch });

  const listed = gh(runGh, [
    'issue',
    'list',
    '--repo',
    repo,
    '--state',
    'open',
    '--label',
    label,
    '--search',
    `${title} in:title`,
    '--json',
    'number,title',
  ]);
  const existing = selectIssueNumberByExactTitle(listed, title);

  if (existing) {
    gh(runGh, [
      'issue',
      'comment',
      String(existing),
      '--repo',
      repo,
      '--body',
      buildCommentBody({ sha, runUrl, prUrl }),
    ]);
    log(`Commented on existing issue #${existing}.`);
    return { action: 'commented', issueNumber: existing, typeSet: false };
  }

  const createdUrl = gh(runGh, [
    'issue',
    'create',
    '--repo',
    repo,
    '--title',
    title,
    '--label',
    label,
    '--body',
    buildIssueBody({ workflow, branch, sha, runUrl, prUrl }),
  ]).trim();
  const issueNumber = Number(createdUrl.split('/').pop());
  if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
    throw new Error(
      `Could not parse issue number from gh issue create output: ${createdUrl}`,
    );
  }
  log(`Created issue #${issueNumber}.`);

  // gh has no flag to set an issue's type, so do it via GraphQL.
  let typeSet = false;
  try {
    typeSet = setIssueType(runGh, {
      repo,
      issueNumber,
      issueType,
      log,
    });
  } catch (err) {
    log(`Could not set issue type "${issueType}"; skipping. ${err.message}`);
  }

  return { action: 'created', issueNumber, typeSet };
}
