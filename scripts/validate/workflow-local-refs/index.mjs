// Pure helpers for checking that GitHub Actions workflow files only reference
// local files that actually exist.
//
// Renaming or moving a script or composite action is easy to do without
// updating the workflow YAML that points at it, because that reference is just a
// string the YAML never validates. These helpers extract those local references
// so a test can assert each one resolves on disk; see ./index.test.mjs.

/**
 * A local reference found in a workflow file.
 *
 * @typedef {Object} WorkflowReference
 * @property {'script' | 'action'} kind  'script' for `node <path>` invocations;
 *                                        'action' for local `uses: ./<path>`.
 * @property {string} ref                The reference exactly as written.
 * @property {number} line               1-based line number of the reference.
 */

const SCRIPT_RE = /\bnode\s+(?:\.\/)?(scripts\/[^\s'"`\\]+\.m?js)/;
const USES_LOCAL_RE = /\buses:\s*(\.\/[^\s'"`]+)/;

/**
 * Extract local file references (`node scripts/...` invocations and local
 * `uses: ./...` steps) from a workflow file's text. Commented-out lines are
 * ignored so example snippets in comments don't count.
 *
 * @param {string} yamlText  Raw workflow file contents.
 * @returns {WorkflowReference[]}
 */
export function findWorkflowReferences(yamlText) {
  const refs = [];
  const lines = yamlText.split('\n');

  lines.forEach((line, index) => {
    if (line.trimStart().startsWith('#')) return; // skip comments

    const script = line.match(SCRIPT_RE);
    if (script) {
      refs.push({ kind: 'script', ref: script[1], line: index + 1 });
    }

    const uses = line.match(USES_LOCAL_RE);
    if (uses) {
      refs.push({ kind: 'action', ref: uses[1], line: index + 1 });
    }
  });

  return refs;
}

/**
 * Repo-relative paths that would satisfy a reference. A reference resolves when
 * at least one candidate exists. A local `uses:` can point either at a composite
 * action directory (which holds an `action.yml`) or directly at a reusable
 * workflow file, so both shapes are offered.
 *
 * @param {WorkflowReference} reference
 * @returns {string[]}
 */
export function candidatePaths({ kind, ref }) {
  if (kind === 'script') return [ref];

  const target = ref.replace(/^\.\//, '');
  if (/\.ya?ml$/.test(target)) return [target]; // reusable workflow file
  return [`${target}/action.yml`, `${target}/action.yaml`]; // composite action
}
