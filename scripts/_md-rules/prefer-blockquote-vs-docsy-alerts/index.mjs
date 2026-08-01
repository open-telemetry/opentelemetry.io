// @ts-check
//
// Nudge Docsy/Hugo sites toward GFM/Obsidian blockquote alerts instead of the
// Docsy `alert` shortcode. For details, see README.md.

const OPENING_ALERT_SHORTCODE = /\{\{[%<]\s*alert\b/;
const STYLE_GUIDE_ALERTS =
  'https://opentelemetry.io/docs/contributing/style-guide/#alerts';

/** @type {import('markdownlint').Rule} */
export default {
  names: ['prefer-blockquote-vs-docsy-alerts'],
  description:
    'Prefer blockquote alert syntax (> [!NOTE], etc.) over Docsy alert shortcode calls',
  tags: ['custom', 'alerts', 'hugo', 'docsy'],
  parser: 'none',
  function: function preferBlockquoteVsDocsyAlerts(params, onError) {
    for (let i = 0; i < params.lines.length; i++) {
      const line = params.lines[i];
      const lineNumber = i + 1;

      if (OPENING_ALERT_SHORTCODE.test(line)) {
        onError({
          lineNumber,
          detail: `Prefer blockquote alerts (e.g. > [!NOTE]) over Docsy alert shortcode calls. See ${STYLE_GUIDE_ALERTS}`,
          context: line.trim().slice(0, 100),
        });
      }
    }
  },
};
