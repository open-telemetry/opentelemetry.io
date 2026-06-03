/**
 * Configuration Snippets parser
 *
 * Pure helpers for turning the OpenTelemetry configuration repo's snippet files
 * into the structure consumed by the configuration types accordion.
 *
 * Snippet files live in the opentelemetry-configuration repo under `snippets/`
 * and are named `<JsonSchemaType>_<snake_case_description>.yaml`. Each file
 * contains a `# SNIPPET_START` marker; the relevant example is the lines that
 * follow the marker, dedented by the marker's indentation column.
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
 * Extract the snippet body from raw file content.
 * Finds the `# SNIPPET_START` marker and returns the following lines, dedented
 * by the marker's indentation column. Returns '' when no marker is present
 * (callers decide whether that is an error).
 * @param {string} rawContent
 * @returns {string}
 */
export function extractSnippetContent(rawContent) {
  const lines = rawContent.replace(/\r\n/g, '\n').split('\n');
  const markerIndex = lines.findIndex(
    (line) => line.indexOf(SNIPPET_START) !== -1,
  );
  if (markerIndex === -1) return '';

  const col = lines[markerIndex].indexOf(SNIPPET_START);
  return lines
    .slice(markerIndex + 1)
    .map((line) => line.substring(col))
    .join('\n')
    .replace(/\n+$/, '');
}

/**
 * Parse a snippet file (name + content) into its structured form.
 * @param {string} filename
 * @param {string} rawContent
 * @returns {{ typeName: string, description: string, content: string }}
 */
export function parseSnippet(filename, rawContent) {
  const { typeName, description } = parseSnippetFilename(filename);
  return { typeName, description, content: extractSnippetContent(rawContent) };
}
