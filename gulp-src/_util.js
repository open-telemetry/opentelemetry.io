const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

exports.taskArgs = () =>
  yargs(hideBin(process.argv).slice(1))
    .strict()
    .help('info')
    // To avoid "task did not complete" errors, prevent help option from exiting
    .exitProcess(false);
