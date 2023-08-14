// Markdownlint custom rules

const { trimBlankLinesFromArray } = require('../_util');

module.exports = {
  names: ['trim-code-block-and-unindent'],
  description:
    'Code block: avoid leading/trailing empty lines and unnecessary indentation',
  tags: ['custom'],
  function: (params, onError) => {
    // const frontMatterLines = params.frontMatterLines;

    params.tokens.forEach((token) => {
      if (token.type === 'fence') {
        const lines = token.content.split('\n');
        const originalNumLines = lines.length;

        let minIndent = Infinity;
        for (const line of lines) {
          if (line.trim().length > 0) {
            const currentIndent = line.length - line.trimStart().length;
            minIndent = Math.min(minIndent, currentIndent);
          }
        }

        let fixedLines = lines.map(
          (line) =>
            line.trim().length === 0
              ? '' // Blank-only lines
              : line.substring(minIndent), // Unindent
        );
        fixedLines = trimBlankLinesFromArray(fixedLines);
        const fixedContent = fixedLines.join('\n');

        if (token.content !== fixedContent + '\n') {
          const offset = 1; // 1-based
          const codeFenceLineCount = 1;
          const args = {
            lineNumber: token.map[0] + offset + codeFenceLineCount,
            detail: 'Trim empty lines and/or unindent',
            context: token.line,
            fixInfo: {
              // Using the following as an endLineNumber
              lineNumber:
                token.map[0] + originalNumLines + offset - codeFenceLineCount,
              insertText: fixedContent,
            },
          };
          // console.log(JSON.stringify(args, null, 2));
          // console.log(`${token.lineNumber} - Line ${token.map[0]} to ${token.map[1]}:`, token.content);
          onError(args);
        }
      }
    });
  },
};
