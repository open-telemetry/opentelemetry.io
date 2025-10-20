// Custom markdownlint rule to validate links against given regex patterns.

module.exports = {
  names: ['validate-links'],
  description: 'Validate links against given regex patterns',
  tags: ['custom', 'links', 'validation'],
  function: (params, onError) => {
    // Get regex patterns from config
    const configPatterns = params.config.patterns;

    // Convert string regexes to RegExp objects
    const urlPatterns = configPatterns.map((p) => ({
      regex: new RegExp(p.regex, 'g'),
      message: p.message,
    }));

    params.tokens.forEach(processToken.bind({ onError, urlPatterns }));
  },
};

function processToken(token) {
  const { onError, urlPatterns } = this;

  // Check tokens with href attributes (link_open, etc.)
  if (token.attrs) {
    for (const attr of token.attrs) {
      if (attr[0] !== 'href') continue;
      checkContentForUrls(attr[1], token.lineNumber, onError, urlPatterns);
    }
  }

  if (!token.children) return;
  // Recursively check child tokens
  token.children.forEach((child) => processToken.call(this, child));
}

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
        lineNumber: lineNumber,
        detail: pattern.message,
        context: content.substring(contextStart, contextEnd),
      });
    }
  }
}
