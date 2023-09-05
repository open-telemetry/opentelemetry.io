const tcb_rule_name = 'trim-code-block-and-unindent';
const trimCodeBlockRule = require('./_md-rules/' + tcb_rule_name);
const gulp = require('gulp');
const through2 = require('through2');
const markdownlint = require('markdownlint');
const { taskArgs, trimBlankLinesFromArray } = require('./_util');
const fs = require('fs');

const defaultGlob = '**/*.md';
const markdownFiles = [
  '!.github/**',
  '!content-modules/**',
  '!layouts/**',
  '!node_modules/**',
  '!scripts/registry-scanner/node_modules/**',
  '!themes/**',
  '!tmp/**',
];

let numFilesProcessed = 0,
  numFilesWithIssues = 0;
let fix = false;

function markdownLintFile(file, encoding, callback) {
  const config = require('../.markdownlint.json');
  const placeholder = 'lint-md';
  const options = {
    // We would normally just pass in the file like this:
    //
    // files: [file.path],
    //
    // But since the checker doesn't understand Hugo {{...}} syntax, we replace
    // such expressions with a placeholder and pass in the simplified file
    // content.
    strings: {
      [file.path]: file.contents
        .toString()
        .replace(/\{\{[^\}]+\}\}/g, placeholder),
    },
    config: config,
    customRules: [trimCodeBlockRule],
  };

  markdownlint(options, function (err, result) {
    if (err) {
      console.error('ERROR occurred while running markdownlint: ', err);
      return callback(err);
    }

    const _resultString = (result || '').toString();
    // Result is a string with lines of the form:
    //
    //   <file-path>:\s*<line-number>: <ID-and-message>
    //
    // Strip out any whitespace between the filepath and line number
    // so that tools can jump directly to the line.
    const resultString = _resultString
      .split('\n')
      .map((line) => line.replace(/^([^:]+):\s*(\d+):(.*)/, '$1:$2:$3'))
      .join('\n');
    if (resultString) {
      console.log(resultString);
      numFilesWithIssues++;
      // Don't report an error yet so that other files can be checked:
      // callback(new Error('...'));
    }
    numFilesProcessed++;

    if (fix) {
      applyCustomRuleFixesHack(result);
    }

    callback(null, file);
  });
}

function applyCustomRuleFixesHack(result) {
  // What is hacky about the current implementation is that we're
  // handling the fixing ourselves and writing out to the affected files
  // instead of using mdl's fix mechanism.

  Object.entries(result).forEach(([filePath, issues]) => {
    let fileContent = fs.readFileSync(filePath, 'utf8');

    // Sort issues by lineNumber in descending order
    const sortedIssues = issues.sort((a, b) => b.lineNumber - a.lineNumber);

    sortedIssues.forEach((issue) => {
      if (
        issue.fixInfo &&
        issue.ruleNames.length == 1 &&
        issue.ruleNames.includes(tcb_rule_name)
      ) {
        fileContent = applyFixesToFileContent(fileContent, issue);
      } else {
        // console.log(`[NOTE] We currently only fix solo ${tcb_rule_name} rules, not: ${issue.ruleNames}`);
        // console.log(JSON.stringify(issue, null, 2));
      }
    });

    fs.writeFileSync(filePath, fileContent, 'utf8');
  });
}

function applyFixesToFileContent(content, issue) {
  // console.log(JSON.stringify(issue, null, 2));

  const startLineNum = issue.lineNumber - 1;
  const endLineNum = issue.ruleNames.includes(tcb_rule_name)
    ? issue.fixInfo.lineNumber
    : startLineNum + 1;
  const fixedLines = issue.fixInfo.insertText.split('\n');

  // Remove lines that need fixing
  const lines = content.split('\n');
  lines.splice(startLineNum, endLineNum - startLineNum);

  // Insert the fixed content
  lines.splice(startLineNum, 0, ...fixedLines);

  return lines.join('\n');
}

function lintMarkdown() {
  const argv = taskArgs().options({
    glob: {
      alias: 'g',
      type: 'string',
      description: 'Glob of files to run through markdownlint.',
      default: defaultGlob,
    },
    fix: {
      type: 'boolean',
      description: 'Fix trim-code-block-and-unindent issues.',
      default: false,
    },
  }).argv;

  if (argv.info) {
    // Info about options was already displayed by yargs.help().
    return Promise.resolve();
  }
  fix = argv.fix;

  return gulp
    .src([argv.glob, ...markdownFiles])
    .pipe(through2.obj(markdownLintFile))
    .on('end', () => {
      const fileOrFiles = 'file' + (numFilesProcessed == 1 ? '' : 's');
      const msg = `Processed ${numFilesProcessed} ${fileOrFiles}, ${numFilesWithIssues} had issues.`;
      if (numFilesWithIssues > 0) {
        throw new Error(msg);
      } else {
        console.log(msg);
      }
    });
}

lintMarkdown.description = `Check markdownlint rules. For details, use --info.`;

gulp.task('lint-md', lintMarkdown);
