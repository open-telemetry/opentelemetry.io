const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

exports.taskArgs = () =>
  yargs(hideBin(process.argv).slice(1))
    .strict()
    .help('info')
    // To avoid "task did not complete" errors, prevent help option from exiting
    .exitProcess(false);

exports.trimBlankLinesFromArray = (lines) => {
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
