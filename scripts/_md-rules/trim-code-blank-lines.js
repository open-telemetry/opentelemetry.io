// Custom Markdownlint rule to trim leading and trailing blank lines from code blocks.

module.exports = {
  names: ['trim-code-blank-lines'],
  description:
    'Remove leading and trailing blank lines from code block. Use `--fix` flag to fix.',
  tags: ['custom'],
  function: (params, onError) => {
    params.tokens.forEach((token) => {
      if (token.type !== 'fence') return;

      const lines = token.content.split('\n');
      const originalNumLines = lines.length;

      // Count leading and trailing blank lines BEFORE trimming
      let leadingBlanks = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().length === 0) {
          leadingBlanks++;
        } else {
          break;
        }
      }

      let trailingBlanks = 0;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim().length === 0) {
          trailingBlanks++;
        } else {
          break;
        }
      }

      // Trim blank lines
      const fixedLines = trimBlankLinesFromArray([...lines]);
      const fixedContent = fixedLines.join('\n');

      // If content is already correct, skip
      if (token.content === fixedContent + '\n') return;

      // Are we in fix mode? Test the args. This isn't ideal, but there's no API
      // to test it otherwise.
      const isFixMode = process.argv.includes('--fix');

      const contentStartLine = token.map[0] + 2;

      // When not in fix mode, only report an error for the first line of the
      // code block, not for every blank line to be removed.
      const endLineIndex = isFixMode ? lines.length : 1;

      // Delete leading blank lines by replacing with empty string
      for (let i = 0; i < Math.min(leadingBlanks, endLineIndex); i++) {
        const onErrInfo = {
          lineNumber: contentStartLine + i,
          context: token.line,
          fixInfo: {
            deleteCount: -1, // Delete entire line
          },
        };
        // console.log('TRACE: On error info:', onErrInfo);
        onError(onErrInfo);
      }

      // Delete trailing blank lines by replacing with empty string
      let numTrailingBlanksToDelete = Math.min(trailingBlanks, endLineIndex);
      numTrailingBlanksToDelete--; // Don't delete the closing fence
      for (let i = 0; i < numTrailingBlanksToDelete; i++) {
        const lineIndex = lines.length - trailingBlanks + i;
        const onErrInfo = {
          lineNumber: contentStartLine + lineIndex,
          context: token.line,
          fixInfo: {
            deleteCount: -1, // Delete entire line
          },
        };
        // console.log('TRACE: On error info:', onErrInfo);
        onError(onErrInfo);
      }
    });
  },
};

function trimBlankLinesFromArray(lines) {
  // Remove leading empty lines
  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }

  // Remove trailing empty lines
  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  return lines;
}
