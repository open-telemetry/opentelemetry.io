#!/usr/bin/env node

import fs from 'fs/promises';
import { getUrlStatus, isHttp2XX } from './get-url-status.mjs';
import { exit } from 'process';

const CACHE_FILE = 'static/refcache.json';
const GOOGLE_DOCS_URL = 'https://docs.google.com/';
let maxFragEntries = 3;
const cratesIoURL = 'https://crates.io/crates/';

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
  console.log(`Updated ${CACHE_FILE} with fixed links.`);
}

// Retry HTTP status check for refcache URLs with non-200s and not 404
async function retry400sAndUpdateCache() {
  console.log(`Checking ${CACHE_FILE} for 4XX status URLs ...`);
  const cache = await readRefcache();
  let updated = false;
  let entriesCount = 0;
  let urlWithFragmentCount = 0;

  for (const [url, details] of Object.entries(cache)) {
    entriesCount++;
    const parsedUrl = new URL(url);
    const { StatusCode, LastSeen } = details;

    if (isHttp2XX(StatusCode)) continue;
    if (isHttp2XX(StatusCode) && (!parsedUrl.hash || StatusCode >= 210))
      continue;

    if (
      (StatusCode === 404 && !url.startsWith(cratesIoURL)) ||
      StatusCode === 422
    ) {
      const lastSeenDate = new Date(LastSeen).toLocaleString();
      console.log(
        `Skipping ${StatusCode}: ${url} (last seen ${lastSeenDate}).`,
      );
      continue;
    }
    if (url.startsWith(GOOGLE_DOCS_URL)) {
      // console.log(`Skipping Google Docs URL (for now): ${url}.`);
      continue;
      /*
      URLs are of the form:
      https://docs.google.com/document/d/15vR7D1x2tKd7u3zaTF0yH1WaHkUr2T4hhr7OyiZgmBg/edit?tab=t.0#heading=h.4xuru5ljcups
      We can simply check for the presence of the heading query parameter value in the page.
      "ps_hdid":"h.4xuru5ljcups" # cSpell:disable-line
      */
    }

    if (
      parsedUrl.hash &&
      StatusCode < 210 &&
      ++urlWithFragmentCount > maxFragEntries
    )
      break;

    process.stdout.write(
      `Checking${
        parsedUrl.hash ? ` for fragment in` : `:`
      } ${url} (was ${StatusCode}) ... `,
    );

    const verbose = false;
    let status = await getUrlStatus(url, verbose);
    if (parsedUrl.hash && isHttp2XX(status)) status += 10;

    console.log(`${status}.`);

    if (!isHttp2XX(status)) continue;

    cache[url] = {
      StatusCode: status,
      LastSeen: new Date().toISOString(),
    };

    updated = true;
  }

  if (updated) {
    await writeRefcache(cache);
  } else {
    console.log(`No updates needed.`);
  }
}

function getNumericFlagValue(flagName) {
  const flagArg = process.argv.find((arg) => arg.startsWith(flagName));
  if (!flagArg) return;

  const valueArg = flagArg.includes('=')
    ? flagArg.split('=')[1]
    : process.argv[process.argv.indexOf(flagName) + 1];
  let value = parseInt(valueArg);

  if (!value) {
    console.error(
      `ERROR: invalid value for ${flagName}: ${valueArg}. ` +
        `Must be a number > 0. Using default ${maxFragEntries}.`,
    );
    exit(1);
  }
  return value;
}

const _maxFragEntriesFlag = getNumericFlagValue('--max-frag-entries');
if (_maxFragEntriesFlag) maxFragEntries = _maxFragEntriesFlag;

await retry400sAndUpdateCache();
