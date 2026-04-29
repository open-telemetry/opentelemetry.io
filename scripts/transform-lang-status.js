#!/usr/bin/env node

/**
 * Language Status Transformer
 *
 * Downloads language implementation status from opentelemetry-configuration
 * repository and injects it into our language-status.md page.
 *
 * Usage: node transform-lang-status.js <source-file> <target-file>
 *
 * Source: language-support-status.md from opentelemetry-configuration
 * Target: content/en/docs/specs/declarative-configuration/language-status.md
 */

const fs = require('fs');
const path = require('path');

// Marker comments for generated content
const BEGIN_MARKER =
  '<!-- BEGIN GENERATED: language-implementation-status SOURCE: opentelemetry-configuration -->';
const END_MARKER =
  '<!-- END GENERATED: language-implementation-status SOURCE: opentelemetry-configuration -->';

/**
 * Extract language sections from the downloaded markdown
 * Looks for sections like "## cpp", "## go", etc.
 * @param {string} content - Raw markdown content
 * @returns {string} Extracted language sections
 */
function extractLanguageSections(content) {
  // Find the first language heading
  // Format can be either:
  //   ## cpp <a id="cpp"></a>  (from upstream)
  //   ## cpp {#cpp}            (Hugo format)
  const firstLangMatch = content.match(
    /^## [a-z_]+\s*(?:<a id="[a-z_]+">\s*<\/a>|\{#[a-z_]+\})?\s*$/m,
  );
  if (!firstLangMatch) {
    console.warn('Warning: No language sections found in source file');
    return '';
  }

  // Extract everything from the first language heading to the end
  const startIndex = firstLangMatch.index;
  let extracted = content.substring(startIndex);

  // Remove any trailing whitespace and ensure single newline at end
  extracted = extracted.trim() + '\n';

  return extracted;
}

/**
 * Convert HTML anchor tags to Hugo-style anchors
 * Changes: ## cpp <a id="cpp"></a> -> ## cpp {#cpp}
 * @param {string} content - Markdown content with HTML anchors
 * @returns {string} Content with Hugo-style anchors
 */
function convertAnchors(content) {
  // Replace HTML anchor tags with Hugo shorthand
  return content.replace(
    /^(## [a-z_]+)\s*<a id="([a-z_]+)"><\/a>\s*$/gm,
    '$1 {#$2}',
  );
}

/**
 * Transform links from schema-docs.md references to local type page references
 * Changes: schema-docs.md#typename -> ../#typename
 * @param {string} content - Markdown content with links
 * @returns {string} Content with transformed links
 */
function transformLinks(content) {
  // Match markdown links like [text](schema-docs.md#anchor)
  // Also handles parenthetical links without link text like (schema-docs.md#anchor)
  return content.replace(
    /(\[`?[^\]]+`?\]|\()\(schema-docs\.md(#[a-z0-9_-]+)\)/gi,
    '$1(../$2)',
  );
}

/**
 * Wrap content in the accordion container div
 * @param {string} content - Language sections content
 * @returns {string} Wrapped content
 */
function wrapContent(content) {
  return `{{< config-lang-status-accordion >}}

<div class="language-implementation-status-content visually-hidden">

${content}
</div>
`;
}

/**
 * Inject generated content between markers in target file
 * Preserves all content outside the markers
 * @param {string} targetPath - Path to target markdown file
 * @param {string} generatedContent - Content to inject
 */
function injectBetweenMarkers(targetPath, generatedContent) {
  console.log(`Reading target file: ${targetPath}`);

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Target file not found: ${targetPath}`);
  }

  const targetContent = fs.readFileSync(targetPath, 'utf8');

  // Find marker positions
  const beginIndex = targetContent.indexOf(BEGIN_MARKER);
  const endIndex = targetContent.indexOf(END_MARKER);

  if (beginIndex === -1) {
    throw new Error(`BEGIN marker not found in target file: ${targetPath}`);
  }

  if (endIndex === -1) {
    throw new Error(`END marker not found in target file: ${targetPath}`);
  }

  if (endIndex <= beginIndex) {
    throw new Error('END marker appears before BEGIN marker in target file');
  }

  // Build new content: before + markers + generated + after
  const before = targetContent.substring(0, beginIndex + BEGIN_MARKER.length);
  const after = targetContent.substring(endIndex);

  const newContent = `${before}

${generatedContent}
${after}`;

  console.log(`Writing updated content to: ${targetPath}`);
  fs.writeFileSync(targetPath, newContent, 'utf8');
}

/**
 * Count languages and types in the generated content
 * @param {string} content - Generated content
 * @returns {Object} Statistics object
 */
function getStats(content) {
  // Count language sections (lines starting with "## ")
  const languageMatches = content.match(/^## [a-z_]+/gm);
  const languageCount = languageMatches ? languageMatches.length : 0;

  // Count table rows (lines starting with "|" but not header separators)
  const tableRows = content.match(/^\|(?![-:\s|]+\|)/gm);
  const typeCount = tableRows ? tableRows.length - languageCount : 0; // Subtract headers

  return { languageCount, typeCount };
}

/**
 * Main transformation function
 */
function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length < 2) {
      console.error(
        'Usage: node transform-lang-status.js <source-file> <target-file>',
      );
      console.error('');
      console.error('Example:');
      console.error(
        '  node transform-lang-status.js /tmp/language-support-status.md content/en/docs/specs/declarative-configuration/language-status.md',
      );
      process.exit(1);
    }

    const sourcePath = args[0];
    const targetPath = args[1];

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }

    console.log('Starting language status transformation...');
    console.log(`Source: ${sourcePath}`);
    console.log(`Target: ${targetPath}`);
    console.log('');

    console.log('Reading source file...');
    const sourceContent = fs.readFileSync(sourcePath, 'utf8');

    console.log('Extracting language sections...');
    let extracted = extractLanguageSections(sourceContent);

    if (!extracted) {
      throw new Error('No language sections found in source file');
    }

    console.log('Converting anchors to Hugo format...');
    extracted = convertAnchors(extracted);

    console.log('Transforming links...');
    const transformed = transformLinks(extracted);

    console.log('Wrapping content...');
    const wrapped = wrapContent(transformed);

    console.log('Injecting content between markers...');
    injectBetweenMarkers(targetPath, wrapped);

    const stats = getStats(transformed);

    console.log('');
    console.log('✓ Transformation complete!');
    console.log(`  Languages: ${stats.languageCount}`);
    console.log(`  Type rows: ${stats.typeCount}`);
    console.log('');
  } catch (error) {
    console.error('Error during transformation:');
    console.error(error.message);
    if (error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
