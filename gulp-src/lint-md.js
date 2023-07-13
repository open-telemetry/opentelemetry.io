const gulp = require('gulp');
const through2 = require('through2');
const markdownlint = require('markdownlint');
const { taskArgs } = require('./_util');
const fs = require('fs');

const defaultGlob = '**/*.md';
const markdownFiles = [
  '!.github/**',
  '!content-modules/**',
  '!layouts/**',
  '!node_modules/**',
  '!themes/**',
  '!tmp/**',
];

let fileCounter = 0,
  issueCount = 0;

function markdownLintFile(file, encoding, callback) {
  // const config = require('../.markdownlint.json');
  const config = JSON.parse(fs.readFileSync('./.markdownlint.json'));
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
      issueCount++;
    }
    fileCounter++;
    callback(null, file);
  });
}

function lintMarkdown() {
  const argv = taskArgs().options({
    glob: {
      alias: 'g',
      type: 'string',
      description: 'Glob of files to run through markdownlint.',
      default: defaultGlob,
    },
  }).argv;

  if (argv.info) {
    // Info about options was already displayed by yargs.help().
    return Promise.resolve();
  }

  return gulp
    .src([argv.glob, ...markdownFiles])
    .pipe(through2.obj(markdownLintFile))
    .on('end', () => {
      console.log(
        `Processed ${fileCounter} file${
          fileCounter == 1 ? '' : 's'
        }, ${issueCount} had issues.`,
      );
    });
}

lintMarkdown.description = `Check markdownlint rules. For details, use --info.`;

gulp.task('lint-md', lintMarkdown);
