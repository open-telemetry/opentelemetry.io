// @ts-check
//
// Custom markdownlint rule to detect translated alert types in blockquote alerts.
//
// Markdown alerts use syntax like `> [!NOTE]` or `> [!WARNING]`. The alert type
// (NOTE, WARNING, etc.) should NOT be translated in localized content.
//
// This rule helps localization teams catch accidental translations of alert types.
//
// cSpell:ignore blockquotes
//
// TODO: upstream to Docsy

import { filterByTypes } from 'markdownlint-rule-helpers/micromark';

// Valid alert types from GFM and Docsy/Bootstrap
const VALID_ALERT_TYPES = new Set([
  // GFM standard alert types
  'CAUTION',
  'IMPORTANT',
  'NOTE',
  'TIP',
  'WARNING',
  // Docsy/Bootstrap additional types
  'DANGER',
  'DARK',
  'INFO',
  'LIGHT',
  'NB',
  'PRIMARY',
  'SECONDARY',
]);

// Pattern to match alert syntax at start of blockquote: [!TYPE] or [!TYPE] title
const ALERT_PATTERN = /^\[!([^\]]+)\]/;

/** @type {import("markdownlint").Rule} */
export default {
  names: ['alert-type-not-translated'],
  description: 'Alert types in blockquote alerts should not be translated',
  tags: ['custom', 'i18n', 'alerts'],
  parser: 'micromark',
  function: function alertTypeNotTranslated(params, onError) {
    // // Only check localized content (non-English)
    // const filePath = params.name;
    // if (!filePath.includes('/content/') || filePath.includes('/content/en/')) {
    //   return;
    // }

    // Recursively find all blockQuote tokens (includes nested blockquotes in lists)
    const blockquotes = filterByTypes(params.parsers.micromark.tokens, [
      'blockQuote',
    ]);

    for (const blockquote of blockquotes) {
      // Get the first line of the blockquote content
      const firstLine = params.lines[blockquote.startLine - 1];

      // Extract content after the blockquote marker (>)
      const contentMatch = firstLine.match(/^\s*>\s*(.*)/);
      if (!contentMatch) continue;

      const content = contentMatch[1];

      // Check if this looks like an alert (starts with [!TYPE])
      const alertMatch = content.match(ALERT_PATTERN);
      if (!alertMatch) continue;

      const alertType = alertMatch[1].trim().toUpperCase();

      // Check if this is a valid (untranslated) alert type
      if (!VALID_ALERT_TYPES.has(alertType)) {
        onError({
          lineNumber: blockquote.startLine,
          detail: `Invalid alert type "${alertMatch[1]}". Alert types should not be translated. Valid types: ${[...VALID_ALERT_TYPES].sort().join(', ')}`,
          context: firstLine.trim().substring(0, 60),
        });
      }
    }
  },
};
