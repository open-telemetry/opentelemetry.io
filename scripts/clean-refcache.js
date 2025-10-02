#!/usr/bin/env node
/**
 * ---
 * THIS SCRIPT IS STILL WIP, but it works well enough to be committed.
 * To generate the input txt file run:
 *   npm install -g @untitaker/hyperlink
 *   (cd public; hyperlink dump-external-links --base-path=. | grep -Ev '^[^h]|^http://(127|localhost)' > ../tmp/external-links.txt)
 * ---
 * Script to clean up refcache.json by removing entries that don't appear in external-links.txt.
 *
 * Usage:
 *     node clean_refcache.js
 *
 * This script will:
 * 1. Read the current refcache.json file
 * 2. Read the external-links.txt file
 * 3. Remove any entries from refcache.json whose URLs don't appear in external-links.txt
 * 4. Write the cleaned refcache.json back to the file
 * 5. Create a backup of the original file
 */

const fs = require('fs');
const path = require('path');

// File paths
const REFCACHE_PATH = 'static/refcache.json';
const EXTERNAL_LINKS_PATH = 'tmp/external-links.txt';

/**
 * Read and parse the refcache.json file
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
 * Read the external-links.txt file and return a set of URLs
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
 * Normalize URL for comparison by decoding URL-encoded characters, HTML entities, and removing query parameters while preserving fragment identifiers
 */
function normalizeUrl(url) {
  try {
    // First decode URL-encoded characters
    let normalized = decodeURIComponent(url);

    // Decode common HTML entities
    normalized = normalized
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");

    // Handle query parameters and fragments
    const questionMarkIndex = normalized.indexOf('?');
    const hashIndex = normalized.indexOf('#');

    if (questionMarkIndex !== -1) {
      if (hashIndex !== -1 && hashIndex > questionMarkIndex) {
        // URL has both query params and fragment: remove only query params
        normalized =
          normalized.substring(0, questionMarkIndex) +
          normalized.substring(hashIndex);
      } else {
        // URL has only query params: remove them
        normalized = normalized.substring(0, questionMarkIndex);
      }
    }
    // If no query params but has fragment, keep the fragment as is

    return normalized;
  } catch (error) {
    // If decoding fails, try to handle HTML entities and remove query parameters from original URL
    let fallback = url
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");

    // Handle query parameters and fragments
    const questionMarkIndex = fallback.indexOf('?');
    const hashIndex = fallback.indexOf('#');

    if (questionMarkIndex !== -1) {
      if (hashIndex !== -1 && hashIndex > questionMarkIndex) {
        // URL has both query params and fragment: remove only query params
        fallback =
          fallback.substring(0, questionMarkIndex) +
          fallback.substring(hashIndex);
      } else {
        // URL has only query params: remove them
        fallback = fallback.substring(0, questionMarkIndex);
      }
    }
    // If no query params but has fragment, keep the fragment as is

    return fallback;
  }
}

/**
 * Create a backup of the original file with timestamp
 */
function backupFile(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = `${filePath}.backup_${timestamp}`;

  try {
    fs.copyFileSync(filePath, backupPath);
    console.log(`Backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error(`Error creating backup: ${error.message}`);
    return null;
  }
}

/**
 * Write the cleaned refcache data back to the file
 */
function writeRefcache(filePath, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf8');
    console.log(`Cleaned refcache written to: ${filePath}`);
  } catch (error) {
    console.error(`Error writing to ${filePath}: ${error.message}`);
  }
}

/**
 * Main function to clean the refcache
 */
function main() {
  console.log('Starting refcache cleanup...');

  // Read the refcache
  console.log(`Reading ${REFCACHE_PATH}...`);
  const refcache = readRefcache(REFCACHE_PATH);
  if (!refcache) {
    process.exit(1);
  }

  const originalCount = Object.keys(refcache).length;
  console.log(`Found ${originalCount} entries in refcache`);

  // Read external links
  console.log(`Reading ${EXTERNAL_LINKS_PATH}...`);
  const externalLinks = readExternalLinks(EXTERNAL_LINKS_PATH);
  if (externalLinks.size === 0) {
    process.exit(1);
  }

  console.log(`Found ${externalLinks.size} URLs in external-links.txt`);

  // Create a set of normalized external links for faster lookup
  const normalizedExternalLinks = new Set();
  for (const url of externalLinks) {
    normalizedExternalLinks.add(normalizeUrl(url));
  }

  // Find URLs in refcache that are not in external-links.txt
  const urlsToRemove = [];
  for (const url of Object.keys(refcache)) {
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedExternalLinks.has(normalizedUrl)) {
      urlsToRemove.push(url);
    }
  }

  console.log(`Found ${urlsToRemove.length} entries to remove`);

  if (urlsToRemove.length === 0) {
    console.log(
      'No cleanup needed - all refcache entries are in external-links.txt',
    );
    return;
  }

  // Create backup
  console.log('Creating backup...');
  const backupPath = backupFile(REFCACHE_PATH);
  if (!backupPath) {
    console.error('Failed to create backup, aborting cleanup');
    process.exit(1);
  }

  // Remove the entries
  for (const url of urlsToRemove) {
    delete refcache[url];
  }

  // Write the cleaned refcache
  console.log('Writing cleaned refcache...');
  writeRefcache(REFCACHE_PATH, refcache);

  // Summary
  const finalCount = Object.keys(refcache).length;
  const removedCount = originalCount - finalCount;
  console.log('\nCleanup complete!');
  console.log(`Original entries: ${originalCount}`);
  console.log(`Removed entries: ${removedCount}`);
  console.log(`Remaining entries: ${finalCount}`);
  console.log(`Backup saved to: ${backupPath}`);
}

// Run the script
if (require.main === module) {
  main();
}
