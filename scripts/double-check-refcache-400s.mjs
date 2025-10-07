#!/usr/bin/env node

import fs from 'fs/promises';
import { getUrlStatus, isHttp2XX } from './get-url-status.mjs';
import { exit } from 'process';

const CACHE_FILE = 'static/refcache.json';
const GOOGLE_DOCS_URL = 'https://docs.google.com/';
let checkForFragments = false;
let maxNumEntriesToUpdate = 3;
const cratesIoURL = 'https://crates.io/crates/';

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

// Ensure LastSeen format matches what htmltest uses.
function normalizeLastSeenDate(lastSeenDate) {
  // Drop trailing zero in milliseconds, if present: e.g., `.340Z` -> `.34Z`
  return lastSeenDate.replace(/(\.\d\d)0Z$/, '$1Z');
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
  Object.values(cache).forEach((entry) => {
    entry.LastSeen = normalizeLastSeenDate(entry.LastSeen);
  });
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

  for (const [url, details] of Object.entries(cache)) {
    entriesCount++;
    const parsedUrl = new URL(url);
    if (parsedUrl.hash) urlWithFragmentCount++;
    const { StatusCode, LastSeen } = details;
    const lastSeenDate = new Date(LastSeen);

    countStatuses(StatusCode, parsedUrl, lastSeenDate, statusCounts);

    if (
      checkForFragments && parsedUrl.hash
        ? isHttp2XXForFragments(StatusCode, lastSeenDate)
        : isHttp2XX(StatusCode)
    ) {
      // process.stdout.write('.');
      continue;
    }

    if (
      (StatusCode === 404 &&
        // Handles special case of crates.io. For details, see:
        // https://github.com/rust-lang/crates.io/issues/788
        !url.startsWith(cratesIoURL)) ||
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

    if (maxNumEntriesToUpdate && updatedCount >= maxNumEntriesToUpdate) {
      console.log(`Updated max of ${maxNumEntriesToUpdate} entries, exiting.`);
      break;
    }

    process.stdout.write(
      `Checking${
        parsedUrl.hash ? ` for fragment in` : `:`
      } ${url} (was ${StatusCode}) ... `,
    );

    let status = await getUrlStatus(url);
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
      LastSeen: now.toISOString(),
    };
    updatedCount++;
  }

  if (updatedCount) {
    await writeRefcache(cache);
  } else {
    console.log(`No updates needed.`);
  }

  console.log(
    `Processed ${entriesCount} URLs${
      checkForFragments
        ? ` (${urlWithFragmentCount} with fragments, ${urlWithInvalidFragCount} are invalid)`
        : ''
    }`,
  );
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`Status ${status}: ${count}`);
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

function getNumericFlagValue(flagName) {
  const flagArg = process.argv.find((arg) => arg.startsWith(flagName));
  if (!flagArg) return;

  const valueArg = flagArg.includes('=')
    ? flagArg.split('=')[1]
    : process.argv[process.argv.indexOf(flagName) + 1];
  let value = parseInt(valueArg);

  if (value < 0) {
    console.error(
      `ERROR: invalid value for ${flagName}: ${valueArg}. ` +
        `Must be a number > 0. Using default ${maxNumEntriesToUpdate}.`,
    );
    exit(1);
  }
  return value;
}

const _maxNumEntriesToUpdateFlag = getNumericFlagValue('--max-num-to-update');
if (_maxNumEntriesToUpdateFlag >= 0)
  maxNumEntriesToUpdate = _maxNumEntriesToUpdateFlag;
checkForFragments =
  process.argv.includes('--check-for-fragments') || process.argv.includes('-f');

await retry400sAndUpdateCache();
