const gulp = require('gulp');
const through2 = require('through2');
const markdownlint = require('markdownlint');
const { taskArgs } = require('./_util');

const defaultGlob = '**/*.md';
const markdownFiles = [
  '!.github/**',
  '!content-modules/**',
  '!layouts/**',
  '!node_modules/**',
  '!themes/**',
  '!tmp/**',
];

let numFilesProcessed = 0,
  numFilesWithIssues = 0;

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
