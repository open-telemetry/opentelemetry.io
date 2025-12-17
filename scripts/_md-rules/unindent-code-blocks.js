// Custom Markdownlint rule to unindent code blocks by removing excess indentation.

module.exports = {
  names: ['unindent-code-blocks'],
  description:
    'Remove excess indentation while preserving relative indentation. Use `--fix` flag to fix.',
  tags: ['custom'],
  function: (params, onError) => {
    params.tokens.forEach((token) => {
      if (token.type !== 'fence') return;

      const lines = token.content.split('\n');
      const originalNumLines = lines.length;

      // Calculate minimum indentation
      let minIndent = Infinity;
      for (const line of lines) {
        if (!line.trim().length) continue;
        const currentIndent = line.length - line.trimStart().length;
        minIndent = Math.min(minIndent, currentIndent);
      }

      // If no indentation to remove, skip
      if (minIndent === 0 || minIndent === Infinity) return;

      // Unindent lines
      const fixedLines = lines.map(
        (line) =>
          line.trim().length === 0
            ? line // Keep blank lines as-is
            : line.substring(minIndent), // Unindent
      );

      // Check if any lines need fixing
      let needsFixing = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] !== fixedLines[i]) {
          needsFixing = true;
          break;
        }
      }
      if (!needsFixing) return;

      // Are we in fix mode? Test the args. This isn't ideal, but there's no API
      // to test it otherwise.
      const isFixMode = process.argv.includes('--fix');

      const contentStartLine = token.map[0] + 2; // First line after opening fence (1-based)

      const endLineIndex = isFixMode ? lines.length : 1;
      for (let i = 0; i < endLineIndex; i++) {
        const originalLine = lines[i];
        const fixedLine = fixedLines[i];

        // Only process lines that need unindenting
        if (originalLine.trim().length > 0 && originalLine !== fixedLine) {
          onError({
            lineNumber: contentStartLine + i,
            // detail: 'Remove excess indentation',
            context: token.line,
            fixInfo: {
              editColumn: 1,
              deleteCount: originalLine.length,
              insertText: fixedLine,
            },
          });
        }
      }
    });
  },
};
