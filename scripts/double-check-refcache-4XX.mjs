#!/usr/bin/env node

import fs from 'fs/promises';
import { parseArgs } from 'node:util';
import {
  getUrlStatus,
  isStatusNotFound,
  isHttp2XX,
} from './get-url-status.mjs';
import { exit } from 'process';

const CACHE_FILE = 'static/refcache.json';
const GOOGLE_DOCS_URL = 'https://docs.google.com/';
const DEFAULT_MAX_NUM_TO_UPDATE = null; // no max

let verbose = false;
let checkForFragments = false;
let maxNumEntriesToUpdate = DEFAULT_MAX_NUM_TO_UPDATE;

// Magic numbers that we use to determine if a URL with a fragment has been
// checked with this script. Since we can't add new fields to the cache, we
// encode "magic" values in the LastSeen field.
const fragSecondsOk = 12;
const fragMillisecondsOk = 345;
const fragSecondsInvalid = 59;
const fragMillisecondsInvalid = 999;

function isHttp2XXForFragments(StatusCode, lastSeenDate) {
  return (
    isHttp2XX(StatusCode) &&
    lastSeenDate.getSeconds() === fragSecondsOk &&
    lastSeenDate.getMilliseconds() === fragMillisecondsOk
  );
}

function is4XXForFragments(StatusCode, lastSeenDate) {
  return (
    lastSeenDate.getSeconds() === fragSecondsInvalid &&
    lastSeenDate.getMilliseconds() === fragMillisecondsInvalid
  );
}

// Ensure date has a format compatible with htmltest's JSON date format, which
// in Go, is RFC3339Nano, which "removes trailing zeros from the seconds field".
// Quoted from https://pkg.go.dev/time#pkg-constants
function normalizeDate(date) {
  // Drop trailing zeros in milliseconds: `.200Z` -> `.2Z`, `.340Z` -> `.34Z`
  return date
    .replace(/\.0*Z$/, 'Z') // Remove fraction if all 0s: `.00Z` -> `Z`
    .replace(/(\.\d*[1-9])0+Z$/, '$1Z'); // Remove trailing zeros but keep non-zeros
}

async function readRefcache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${CACHE_FILE}:`, error.message);
    process.exit(1);
  }
}

async function writeRefcache(cache) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n', 'utf8');
  console.log(`Wrote updated ${CACHE_FILE}.`);
}

// Retry HTTP status check for refcache URLs with non-200s and not 404
async function retry400sAndUpdateCache() {
  console.log(`Checking ${CACHE_FILE} for 4XX status URLs ...`);
  const cache = await readRefcache();
  let updatedCount = 0;
  let entriesCount = 0;
  let urlWithFragmentCount = 0;
  let urlWithInvalidFragCount = 0;
  let statusCounts = {};
  let exitingBeforeEnd = false;

  for (const [url, _details] of Object.entries(cache)) {
    entriesCount++;
    const parsedUrl = new URL(url);
    if (parsedUrl.hash) urlWithFragmentCount++;
    let { StatusCode, LastSeen } = _details;

    // Ensure that LastSeen date is normalized. This script emits normalized
    // dates, but the refcache input might have been edited manually.
    LastSeen = normalizeDate(LastSeen);
    if (LastSeen !== _details.LastSeen) {
      console.log(
        `Normalizing LastSeen date for ${url} to RFC3339Nano: ${LastSeen}`,
      );
      cache[url].LastSeen = LastSeen;
      updatedCount++;
    }
    const lastSeenDate = new Date(LastSeen);

    if (
      checkForFragments && parsedUrl.hash
        ? isHttp2XXForFragments(StatusCode, lastSeenDate)
        : isHttp2XX(StatusCode)
    ) {
      // process.stdout.write('.');
      continue;
    }

    if (
      isStatusNotFound(StatusCode, url) ||
      (parsedUrl.hash && is4XXForFragments(StatusCode, lastSeenDate))
    ) {
      console.log(
        `Skipping ${StatusCode}: ${url} (last seen ${lastSeenDate.toLocaleDateString()})${
          is4XXForFragments(StatusCode, lastSeenDate) ? ' INVALID FRAGMENT' : ''
        }`,
      );
      if (parsedUrl.hash) urlWithInvalidFragCount++;
      continue;
    }

    if (url.startsWith(GOOGLE_DOCS_URL)) {
      // console.log(`Skipping Google Docs URL (for now): ${url}.`);
      // process.stdout.write('.');
      continue;
      /*
      URLs are of the form:
      https://docs.google.com/document/d/15vR7D1x2tKd7u3zaTF0yH1WaHkUr2T4hhr7OyiZgmBg/edit?tab=t.0#heading=h.4xuru5ljcups
      We can simply check for the presence of the heading query parameter value in the page.
      "ps_hdid":"h.4xuru5ljcups" # cSpell:disable-line
      */
    }

    if (
      maxNumEntriesToUpdate !== null &&
      updatedCount >= maxNumEntriesToUpdate
    ) {
      console.log(
        `Updated ${updatedCount} entries. Reach our max of ${maxNumEntriesToUpdate}, exiting.`,
      );
      exitingBeforeEnd = true;
      break;
    }

    process.stdout.write(
      `Checking${
        parsedUrl.hash ? ` for fragment in` : `:`
      } ${url} (was ${StatusCode}) ... `,
    );

    let status = await getUrlStatus(url, verbose);
    console.log(`${status}.`);

    let now = new Date();
    if (parsedUrl.hash) {
      if (isHttp2XX(status)) {
        // Encore that the fragment was checked and is valid.
        now.setSeconds(fragSecondsOk);
        now.setMilliseconds(fragMillisecondsOk);
      } else {
        status = StatusCode; // Keep the original status, rather than our custom 4XX status.
        now.setSeconds(fragSecondsInvalid);
        now.setMilliseconds(fragMillisecondsInvalid);
        urlWithInvalidFragCount++;
      }
    } else if (!isHttp2XX(status)) {
      continue;
    }

    cache[url] = {
      StatusCode: status,
      LastSeen: normalizeDate(now.toISOString()),
    };
    updatedCount++;
  }

  if (updatedCount > 0) {
    await writeRefcache(cache);
  } else if (!exitingBeforeEnd) {
    console.log(`No updates needed.`);
  }

  // Gather per-status stats about the updated refcache entries.
  for (const [url, details] of Object.entries(cache)) {
    const parsedUrl = new URL(url);
    const { StatusCode, LastSeen } = details;
    const lastSeenDate = new Date(LastSeen);
    countStatuses(StatusCode, parsedUrl, lastSeenDate, statusCounts);
  }

  console.log(
    `Processed ${entriesCount} URLs${
      checkForFragments
        ? ` (${urlWithFragmentCount} with fragments, ${urlWithInvalidFragCount} are invalid)`
        : ''
    }`,
  );
  console.log(`Updated ${updatedCount} entries.\n`);
  console.log(`Final HTTP status counts of entries:`);
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`  ${status}: ${count}`);
  }
}

function countStatuses(StatusCode, parsedUrl, lastSeenDate, statusCounts) {
  let sc = StatusCode;
  if (checkForFragments) {
    sc += parsedUrl.hash
      ? ' frag ' +
        (isHttp2XXForFragments(StatusCode, lastSeenDate) ? 'ok' : 'er')
      : ' no frag';
  }
  statusCounts[sc] = (statusCounts[sc] || 0) + 1;
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function usage(exitCode = 0) {
  console.log(`
Usage: double-check-refcache-4XX.mjs [OPTIONS]

Check and update refcache.json for URLs with 4XX status codes.

Options:
  --help, -h                 Show this help message and exit
  --max-updates=<N>, -m <N>  Maximum number of entries to update (default: no maximum).
                             Use 0 to have file scanned and checked for updates.
  --check-fragments, -f      Also check URLs with fragments for validity,
                             which htmltest doesn't do.
  --verbose, -v              Show verbose output.
`);
  exit(exitCode);
}

function parseCliArgs() {
  const options = {
    help: {
      type: 'boolean',
      short: 'h',
      default: false,
    },
    'max-updates': {
      type: 'string', // Note: parseArgs only supports 'string' and 'boolean' types
      short: 'm',
    },
    'check-fragments': {
      type: 'boolean',
      short: 'f',
      default: false,
    },
    verbose: {
      type: 'boolean',
      short: 'v',
      default: false,
    },
  };

  let args;
  try {
    args = parseArgs({ options, strict: true });
  } catch (error) {
    console.error(`ERROR: ${error.message}\n`);
    usage(1);
  }

  if (args.values.help) {
    usage();
  }

  // Parse and validate max-num-to-update.
  let maxNumValue = DEFAULT_MAX_NUM_TO_UPDATE;
  if (args.values['max-updates'] !== undefined) {
    maxNumValue = parseInt(args.values['max-updates']);
    if (isNaN(maxNumValue) || maxNumValue < 0) {
      console.error(
        `ERROR: invalid value for --max-updates: ${args.values['max-updates']}. ` +
          `Must be a non-negative number.`,
      );
      usage(1);
    }
  }

  return {
    maxNumEntriesToUpdate: maxNumValue,
    checkForFragments: args.values['check-fragments'],
    verbose: args.values['verbose'],
  };
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  const config = parseCliArgs();

  // Set global configuration variables
  maxNumEntriesToUpdate = config.maxNumEntriesToUpdate;
  checkForFragments = config.checkForFragments;
  verbose = config.verbose;

  await retry400sAndUpdateCache();
}

// ============================================================================
// Main Execution
// ============================================================================

try {
  await main();
} catch (error) {
  console.error('ERROR:', error.message);
  exit(1);
}

exit(0);
