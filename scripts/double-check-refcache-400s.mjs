#!/usr/bin/env node

import fs from 'fs/promises';
import { getUrlStatus, isHttp2XX } from './get-url-status.mjs';

const CACHE_FILE = 'static/refcache.json';

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
  const cache = await readRefcache();
  let updated = false;

  for (const [url, details] of Object.entries(cache)) {
    const { StatusCode, LastSeen } = details;
    if (isHttp2XX(StatusCode)) continue;
    if (StatusCode === 404) {
      console.log(`Skipping 404: ${url} (last seen ${LastSeen}).`);
      continue;
    }

    process.stdout.write(`Checking: ${url} (was ${StatusCode})... `);
    const status = await getUrlStatus(url);
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

await retry400sAndUpdateCache();
