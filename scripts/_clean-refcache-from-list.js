#!/usr/bin/env node
/**
 * Clean up refcache.json by removing entries that don't appear in
 * EXTERNAL_LINKS_PATH.
 *
 * Usage: node clean_refcache.js
 *
 * This script will:
 *
 * 1. Read the current refcache.json file
 * 2. Read the EXTERNAL_LINKS_PATH file
 * 3. Remove any entries from refcache.json whose URLs don't appear in
 *    EXTERNAL_LINKS_PATH. Note that URLs from EXTERNAL_LINKS_PATH are normalized
 *    to match how htmltest saves external URLs (see `normalizeUrl` below).
 * 4. Write the cleaned refcache.json back to the file
 */

const fs = require('fs');
const path = require('path');

const REFCACHE_PATH = 'static/refcache.json';
const EXTERNAL_LINKS_PATH = 'tmp/external-links.txt';

/**
 * Read and parse REFCACHE_PATH file
 */
function readRefcache(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: ${filePath} not found`);
    } else if (error instanceof SyntaxError) {
      console.error(`Error parsing ${filePath}: ${error.message}`);
    } else {
      console.error(`Error reading ${filePath}: ${error.message}`);
    }
    return null;
  }
}

/**
 * Read EXTERNAL_LINKS_PATH file and return a set of URLs
 */
function readExternalLinks(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');
    // Filter out empty lines and strip whitespace
    const urls = new Set(
      lines.map((line) => line.trim()).filter((line) => line.length > 0),
    );
    return urls;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: ${filePath} not found`);
    } else {
      console.error(`Error reading ${filePath}: ${error.message}`);
    }
    return new Set();
  }
}

/**
 * Normalize URL to match how htmltest saves external URLs, that is, drop:
 * - Query parameters and fragments.
 * - Empty fragments.
 */
function normalizeUrl(url) {
  try {
    // Decode URL-encoded characters
    let normalized = decodeURIComponent(url);

    // Decode common HTML entities
    normalized = normalized
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");

    // Drop query parameters and everything after
    const questionMarkIndex = normalized.indexOf('?');
    if (questionMarkIndex !== -1) {
      normalized = normalized.substring(0, questionMarkIndex);
    }

    // Drop empty fragments (just # with nothing after it)
    if (normalized.endsWith('#')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch (error) {
    console.error(`Error normalizing URL: ${url}`, error);
    return url;
  }
}

/**
 * Write the cleaned refcache data back to the file
 */
function writeRefcache(filePath, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString + '\n', 'utf8');
    console.log(`Cleaned refcache written to: ${filePath}`);
  } catch (error) {
    console.error(`Error writing to ${filePath}: ${error.message}`);
  }
}

/**
 * Main function to clean the refcache
 */
function main() {
  // Read refcache
  const refcache = readRefcache(REFCACHE_PATH);
  if (!refcache) process.exit(1);
  const originalCount = Object.keys(refcache).length;
  console.log(`Refcache has ${originalCount} entries`);

  // Read external links list
  const externalLinks = readExternalLinks(EXTERNAL_LINKS_PATH);
  if (externalLinks.size === 0) process.exit(1);
  console.log(
    `List of actively used external links has ${externalLinks.size} URLs`,
  );

  // Create a set of normalized external links for faster lookup
  const normalizedExternalLinks = new Set();
  for (const url of externalLinks) {
    normalizedExternalLinks.add(normalizeUrl(url));
  }

  // Find URLs in refcache that are not in the external links list
  const urlsToRemove = [];
  for (const url of Object.keys(refcache)) {
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedExternalLinks.has(normalizedUrl)) {
      urlsToRemove.push(url);
    }
  }

  if (urlsToRemove.length === 0) {
    console.log(
      `No cleanup needed - all refcache entries are in ${EXTERNAL_LINKS_PATH}`,
    );
    return;
  }

  console.log(`Found ${urlsToRemove.length} unused refcache entries`);

  // Remove entries
  for (const url of urlsToRemove) {
    delete refcache[url];
  }

  // Write cleaned refcache
  writeRefcache(REFCACHE_PATH, refcache);

  // Summary
  const finalCount = Object.keys(refcache).length;
  const removedCount = originalCount - finalCount;
  console.log(`\nOriginal entries:  ${originalCount}`);
  console.log(`Removed entries:   ${removedCount}`);
  console.log(`Remaining entries: ${finalCount}`);
}

if (require.main === module) {
  main();
}
