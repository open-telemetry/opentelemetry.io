/**
 * Configuration Snippets parser
 *
 * Pure helpers for turning the OpenTelemetry configuration repo's snippet files
 * into the structure consumed by the configuration types accordion.
 *
 * Snippet files live in the opentelemetry-configuration repo under `snippets/`
 * and are named `<JsonSchemaType>_<snake_case_description>.yaml`. We display the
 * full file contents as a complete, runnable example, stripping only the
 * `# SNIPPET_START` marker comment. The marker also serves as a demarcation
 * point: the lines from the marker onward are the type-relevant portion, which
 * the UI highlights subtly within the surrounding context.
 */

const SNIPPET_START = '# SNIPPET_START';
const YAML_EXT = '.yaml';

/**
 * Convert a snake_case string to Title Case.
 * "parent_based_typical" -> "Parent Based Typical"
 * @param {string} snake
 * @returns {string}
 */
export function toTitleCase(snake) {
  if (!snake) return '';
  return snake
    .split('_')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ')
    .trim();
}

/**
 * Parse a snippet filename into its type name and human-readable description.
 * "Sampler_parent_based_typical.yaml" ->
 *   { typeName: "Sampler", description: "Parent Based Typical" }
 * @param {string} filename
 * @returns {{ typeName: string, description: string }}
 */
export function parseSnippetFilename(filename) {
  const base = filename.endsWith(YAML_EXT)
    ? filename.slice(0, -YAML_EXT.length)
    : filename;
  const sep = base.indexOf('_');
  if (sep === -1) {
    return { typeName: base, description: '' };
  }
  return {
    typeName: base.slice(0, sep),
    description: toTitleCase(base.slice(sep + 1)),
  };
}

/**
 * Extract the snippet body from raw file content: the full file with the
 * `# SNIPPET_START` marker line removed and surrounding blank lines trimmed,
 * plus the line index where the highlighted (type-relevant) portion begins.
 *
 * `highlightStart` is a 0-based line index into `content` pointing at the line
 * that followed the marker. It is `null` when there is no marker, and equal to
 * the line count when the marker was the last line (nothing to highlight).
 * @param {string} rawContent
 * @returns {{ content: string, highlightStart: number|null }}
 */
export function extractSnippet(rawContent) {
  const lines = rawContent.replace(/\r\n/g, '\n').split('\n');

  const kept = [];
  let highlightStart = null;
  for (const line of lines) {
    if (line.includes(SNIPPET_START)) {
      // The next kept line begins the highlighted portion.
      highlightStart = kept.length;
      continue;
    }
    kept.push(line);
  }

  // Trim leading/trailing blank lines, adjusting the highlight index for any
  // leading lines removed.
  let lead = 0;
  while (lead < kept.length && kept[lead].trim() === '') lead++;
  let end = kept.length;
  while (end > lead && kept[end - 1].trim() === '') end--;
  const trimmed = kept.slice(lead, end);

  if (highlightStart !== null) {
    highlightStart = Math.max(
      0,
      Math.min(highlightStart - lead, trimmed.length),
    );
  }

  return { content: trimmed.join('\n'), highlightStart };
}

/**
 * Convenience wrapper returning only the snippet text.
 * @param {string} rawContent
 * @returns {string}
 */
export function extractSnippetContent(rawContent) {
  return extractSnippet(rawContent).content;
}

/**
 * Parse a snippet file (name + content) into its structured form.
 * @param {string} filename
 * @param {string} rawContent
 * @returns {{ typeName: string, description: string, content: string, highlightStart: number|null }}
 */
export function parseSnippet(filename, rawContent) {
  const { typeName, description } = parseSnippetFilename(filename);
  const { content, highlightStart } = extractSnippet(rawContent);
  return { typeName, description, content, highlightStart };
}
