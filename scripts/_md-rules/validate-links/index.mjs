// @ts-check
//
// Custom markdownlint rule to validate links against given regex patterns.

import { filterByTypes } from 'markdownlint-rule-helpers/micromark';

/**
 * Check content for URLs matching the given patterns.
 *
 * @param {string} content - content to check
 * @param {number} lineNumber - line number for error reporting
 * @param {Function} onError - error reporting function
 * @param {Array} urlPatterns - patterns to match against
 */
function checkContentForUrls(content, lineNumber, onError, urlPatterns) {
  if (!content) return;

  // Skip URLs that contain Hugo template directives
  if (content.includes('{{') && content.includes('}}')) return;

  for (const pattern of urlPatterns) {
    let match;
    // Reset regex lastIndex to ensure global regex works correctly
    pattern.regex.lastIndex = 0;

    while ((match = pattern.regex.exec(content)) !== null) {
      const contextStart = Math.max(0, match.index - 20);
      const contextEnd = match.index + match[0].length + 20;
      onError({
        lineNumber,
        detail: pattern.message,
        context: content.substring(contextStart, contextEnd),
      });
    }
  }
}

/** @type {import("markdownlint").Rule} */
export default {
  names: ['validate-links'],
  description: 'Validate links against given regex patterns',
  tags: ['custom', 'links', 'validation'],
  parser: 'micromark',
  function: function validateLinks(params, onError) {
    // Get regex patterns from config
    /** @type {{regex: string, message: string}[]} */
    const configPatterns = params.config.patterns;

    // Convert string regexes to RegExp objects
    const urlPatterns = configPatterns.map((p) => ({
      regex: new RegExp(p.regex, 'g'),
      message: p.message,
    }));

    // Find all link destination strings (URLs in various Markdown constructs)
    const linkDestinations = filterByTypes(
      params.parsers.micromark.tokens,
      /** @type {any} */ ([
        'resourceDestinationString', // inline link [text](url) or image ![alt](url)
        'definitionDestinationString', // reference definition [label]: url
        'autolinkProtocol', // autolink: <https://...>
        'literalAutolinkHttp', // bare URL: https://... (GFM extension)
      ]),
    );

    for (const token of linkDestinations) {
      checkContentForUrls(token.text, token.startLine, onError, urlPatterns);
    }
  },
};
