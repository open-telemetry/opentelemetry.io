// cSpell:ignore refcache

const gulp = require('gulp');
const fs = require('fs').promises;
const { taskArgs } = require('./_util');

const refcacheFile = 'static/refcache.json';
const n_default = 0;
const info = `
Prune entries from ${refcacheFile} file that meet one of following conditions:

- Status 4XX, unless the --keep-4xx option is specified
- The oldest entries, optionally before the date specified by --before <date>

Use --num <n> to limit the number of pruned entries.
`;

// The refcacheFile is a JSON map with each map entry of the form, e.g.:
//
// "https://cncf.io": {
//     "StatusCode": 206,
//     "LastSeen": "2023-06-29T13:38:47.996793-04:00"
//   },

// Prune the oldest <n> entries from refcacheFile in a way that avoids
// reordering entries (makes diffs easier to manage).
async function pruneTask() {
  const argv = taskArgs().options({
    num: {
      alias: 'n',
      type: 'number',
      description: 'Maximum number of entries to prune.',
      default: n_default,
    },
    before: {
      type: 'string',
      description:
        'Only consider for pruning entries LastSeen before this date (YYYY-MM-DD). Default is consider all entries.',
    },
    'keep-4xx': {
      type: 'boolean',
      description:
        'Keep all refcache entries with StatusCode in the 400 range. Default is to prune them regardless of the last seen date.',
      default: false,
    },
  }).argv;

  const n = argv.num > 0 ? argv.num : n_default;
  const beforeDate = argv.before ? new Date(argv.before) : null;
  const prune4xx = !argv['keep-4xx'];

  if (argv.info) {
    // Info about options was already displayed by yargs.help().
    console.log(info);
    return;
  }

  try {
    const json = await fs.readFile(refcacheFile, 'utf8');
    const entries = JSON.parse(json);

    // Create array of entries of prune candidates only, sorted by LastSeen:
    const sortedEntriesOfPruneCandidates = Object.keys(entries)
      .map((url) => [url, entries[url].LastSeen, entries[url].StatusCode])
      .filter(
        (
          [url, date, statusCode] // True for prune candidates:
        ) =>
          // Include entry if pruning 4xx and status code is in 4xx
          (prune4xx && 400 <= statusCode && statusCode <= 499) ||
          // Or if it is before the given date
          (beforeDate ? new Date(date) < beforeDate : true)
      )
      .sort((a, b) => new Date(a[1]) - new Date(b[1]));

    if (sortedEntriesOfPruneCandidates.length === 0) {
      console.log('INFO: no entries to prune under given options.');
      return;
    } else {
      console.log(
        `INFO: ${sortedEntriesOfPruneCandidates.length} entries as prune candidates under given options.`
      );
    }

    if (!n) {
      console.log(`WARN: num is ${n} so nothing will be pruned. Specify number of entries to prune as --num <n>.`);
      return;
    }

    // Get keys of at most n entries to prune
    const keysToPrune = sortedEntriesOfPruneCandidates
      .slice(0, n)
      .map((item) => item[0]);
    keysToPrune.forEach((key) => delete entries[key]);
    console.log(`INFO: ${keysToPrune.length} entries pruned.`);

    const prettyJson = JSON.stringify(entries, null, 2) + '\n';
    await fs.writeFile(refcacheFile, prettyJson, 'utf8');
  } catch (err) {
    console.error(err);
  }
}

pruneTask.description = `Prune --num <n> entries from ${refcacheFile} file. For details, use --info.`;

gulp.task('prune', pruneTask);
