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

Use --num <n> to limit the number of entries pruned by date.
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
    list: {
      type: 'boolean',
      description: 'List the <num> + 1 oldest entries. No entries are pruned.',
    },
  }).argv;

  const n = argv.num > 0 ? argv.num : n_default;
  const beforeDate = argv.before
    ? new Date(argv.before)
    : new Date('9999-12-31');
  const prune4xx = !argv['keep-4xx'];
  const list = argv['list'];

  if (argv.info) {
    // Info about options was already displayed by yargs.help().
    console.log(info);
    return;
  }

  // Deletes (prunes) 4XX entries from `entries`.
  // Returns the number of entries deleted.
  function prune4xxEntriesAndReturnCount(entries) {
    const entriesWith4xxStatus = Object.keys(entries)
      .map((url) => [url, entries[url].LastSeen, entries[url].StatusCode])
      .filter(
        ([url, date, statusCode]) => 400 <= statusCode && statusCode <= 499,
      );

    var msg = `INFO: ${entriesWith4xxStatus.length} entries with 4XX status.`;
    if (prune4xx && entriesWith4xxStatus.length > 0) {
      msg += ' Pruning them.';
      const keysToPrune = entriesWith4xxStatus.map((item) => item[0]);
      keysToPrune.forEach((key) => delete entries[key]);
    }
    console.log(msg);
    return entriesWith4xxStatus.length;
  }

  try {
    const json = await fs.readFile(refcacheFile, 'utf8');
    const entries = JSON.parse(json);

    if (list) {
      listOldest(entries, n + 1);
      return;
    }

    const numEntriesWith4xxStatus = prune4xxEntriesAndReturnCount(entries);

    // Create array of entries of prune candidates by date, sorted by LastSeen:
    const pruneCandidatesByDate__sorted = Object.keys(entries)
      .map((url) => [url, entries[url].LastSeen, entries[url].StatusCode])
      .filter(([url, date, statusCode]) => new Date(date) < beforeDate)
      .sort((a, b) => new Date(a[1]) - new Date(b[1]));

    if (pruneCandidatesByDate__sorted.length === 0) {
      console.log('INFO: no entries to prune for given date.');
      return;
    } else {
      console.log(
        `INFO: ${
          pruneCandidatesByDate__sorted.length
        } entries as prune candidates for before-date ${formattedDate(
          beforeDate,
        )}.`,
      );
    }

    if (n == 0) {
      console.log(
        `WARN: num is ${n} so no entries will be pruned by date. Specify number of entries to prune as --num <n>.`,
      );
      if (numEntriesWith4xxStatus == 0) return;
    }

    // Get keys of at most n entries to prune
    const keysToPrune = pruneCandidatesByDate__sorted
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

function listOldest(entries, numberOfEntries) {
  const entriesArray = Object.keys(entries)
    .map((url) => [url, entries[url].LastSeen, entries[url].StatusCode])
    .sort((a, b) => new Date(a[1]) - new Date(b[1]));
  const oldestEntries = entriesArray.slice(0, numberOfEntries);

  if (oldestEntries.length > 0)
    console.log(`Listing oldest ${numberOfEntries} entries:`);

  oldestEntries.forEach((e) => {
    const date = new Date(e[1]);
    console.log(`  ${formattedDate(date)} ${formattedTime(date)} for ${e[0]}`);
  });
}

pruneTask.description = `Prune --num <n> entries from ${refcacheFile} file. For details, use --info.`;

gulp.task('prune', pruneTask);

function formattedDate(date) {
  return date
    .toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-');
}

function formattedTime(date) {
  return date.toLocaleTimeString('en-CA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
