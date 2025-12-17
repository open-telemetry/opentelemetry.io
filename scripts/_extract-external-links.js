#!/usr/bin/env node
/**
 * Extract external links from all HTML files in the public directory.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const HTML_DIR = 'public';
const OUTPUT_FILE = 'tmp/external-links.txt';

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile()) {
      if (entry.name.endsWith('.html')) files.push(fullPath);
      continue;
    }

    if (entry.isDirectory()) {
      // Slight optimization: skip old blog posts (match corresponding htmltest
      // IgnoreDirs rule)
      if (dir.endsWith('/blog') && /^20(19|21|22|23)$/.test(entry.name)) {
        continue;
      }
      findHtmlFiles(fullPath, files);
    }
  }
  return files;
}

/**
 * Decode HTML entities in a string
 */
function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
}

/**
 * Extract external links from an HTML file using regex
 */
function extractLinksFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const links = [];

  // Regex to find href and src attributes with URLs
  const urlRegex = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    let url = match[1];

    // Decode HTML entities
    url = decodeHtmlEntities(url);

    // Skip if url is empty or starts with #
    if (!url || url.startsWith('#')) continue;

    // Skip if it's a relative URL (internal link)
    if (!url.startsWith('http')) continue;

    // Skip localhost and 127.0.0.1
    if (url.startsWith('http://127.') || url.startsWith('http://localhost'))
      continue;

    links.push(url);
  }

  return links;
}

function main() {
  console.log('Extracting external links from site HTML files...');

  // Find all HTML files
  const htmlFiles = findHtmlFiles(HTML_DIR);
  console.log(`Found ${htmlFiles.length} HTML files`);

  // Extract links from all files
  const allLinks = new Set();
  let processedFiles = 0;

  for (const file of htmlFiles) {
    try {
      const links = extractLinksFromFile(file);
      links.forEach((link) => allLinks.add(link));
      processedFiles++;

      if (processedFiles % 100 === 0) {
        // console.log(`Processed ${processedFiles}/${htmlFiles.length} files...`);
      }
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
    }
  }

  console.log(
    `Processed ${processedFiles} files, found ${allLinks.size} unique external links`,
  );

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write links to file, sorted for consistency
  const sortedLinks = Array.from(allLinks).sort();
  const content = sortedLinks.join('\n') + '\n';
  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');

  console.log(`External links written to: ${OUTPUT_FILE}`);
}

// Run the script
if (require.main === module) {
  main();
}
