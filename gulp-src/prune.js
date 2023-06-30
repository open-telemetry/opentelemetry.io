// cSpell:ignore refcache

const gulp = require('gulp');
const fs = require('fs').promises;
const { taskArgs } = require('./_util');

const refcacheFile = 'static/refcache.json';
const n_default = 25;

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
      description: 'Number of oldest refcache entries to drop.',
      default: n_default,
    },
  }).argv;

  const n = argv.num > 0 ? argv.num : n_default;

  if (argv.info) return; // Info was already displayed

  try {
    const json = await fs.readFile(refcacheFile, 'utf8');
    const entries = JSON.parse(json);

    // Create a sorted array of URL keys and `LastSeen` dates
    const sortedUrlsAndDates = Object.keys(entries)
      .map((url) => [url, entries[url].LastSeen])
      .sort((a, b) => new Date(a[1]) - new Date(b[1]));

    // Get oldest argv.num keys
    const oldestKeys = sortedUrlsAndDates.slice(0, n).map((item) => item[0]);

    // Remove oldest entries
    oldestKeys.forEach((key) => delete entries[key]);

    const prettyJson = JSON.stringify(entries, null, 2) + '\n';
    await fs.writeFile(refcacheFile, prettyJson, 'utf8');
  } catch (err) {
    console.error(err);
  }
}

pruneTask.description = `Prune the oldest '--num <n>' entries from ${refcacheFile} file (default ${n_default}).`;

gulp.task('prune', pruneTask);
