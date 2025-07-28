#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Recursively get all markdown files in a directory
 */
function getMarkdownFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getMarkdownFiles(fullPath, files);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Generate header ID from header text
 * Transform to lowercase and replace spaces with dashes
 */
function generateHeaderId(headerText) {
  return headerText
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, ''); // Remove special characters except dashes
}

/**
 * Extract headers from markdown content
 */
function extractHeaders(content) {
  const headerRegex = /^(#+)\s+(.+)$/gm;
  const headers = [];
  let match;
  
  while ((match = headerRegex.exec(content)) !== null) {
    headers.push({
      level: match[1], // The # symbols
      text: match[2].trim(), // The header text
      fullMatch: match[0] // The complete header line
    });
  }
  
  return headers;
}

/**
 * Process a single file pair (source and target)
 */
function processFilePair(sourcePath, targetPath) {
  console.log(`Processing: ${path.relative(process.cwd(), sourcePath)}`);
  
  // Check if target file exists
  if (!fs.existsSync(targetPath)) {
    console.warn(`Target file not found: ${targetPath}`);
    return;
  }
  
  // Read both files
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  const targetContent = fs.readFileSync(targetPath, 'utf8');
  
  // Extract headers from source file
  const sourceHeaders = extractHeaders(sourceContent);
  
  if (sourceHeaders.length === 0) {
    console.log('  No headers found in source file');
    return;
  }
  
  // Process target content
  let updatedTargetContent = targetContent;
  const targetHeaders = extractHeaders(targetContent);
  
  // Match headers by level and order
  let processedCount = 0;
  
  for (let i = 0; i < Math.min(sourceHeaders.length, targetHeaders.length); i++) {
    const sourceHeader = sourceHeaders[i];
    const targetHeader = targetHeaders[i];
    
    // Only process if headers are at the same level
    if (sourceHeader.level === targetHeader.level) {
      const headerId = generateHeaderId(sourceHeader.text);
      const headerIdTag = `{#${headerId}}`;
      
      // Check if ID already exists
      if (!targetHeader.fullMatch.includes(headerIdTag)) {
        // Replace the target header with the header + ID
        const newTargetHeader = `${targetHeader.fullMatch} ${headerIdTag}`;
        updatedTargetContent = updatedTargetContent.replace(
          targetHeader.fullMatch,
          newTargetHeader
        );
        processedCount++;
        console.log(`  Added ID to: ${targetHeader.text} -> ${headerIdTag} (original: ${sourceHeader.fullMatch})`);
      } else {
        console.log(`  ID already exists for: ${targetHeader.text}`);
      }
    }
  }
  
  // Write updated content back to target file
  if (processedCount > 0) {
    fs.writeFileSync(targetPath, updatedTargetContent, 'utf8');
    console.log(`  Updated ${processedCount} headers in target file`);
  } else {
    console.log('  No headers were updated');
  }
}

/**
 * Main function
 */
function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node generate-header-ids.js <source-dir> <destination-dir>');
    console.error('Example: node generate-header-ids.js content/en/docs/zero-code/java content/fr/docs/zero-code/java');
    process.exit(1);
  }
  
  const sourceDir = path.resolve(args[0]);
  const targetDir = path.resolve(args[1]);
  
  // Check if directories exist
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(targetDir)) {
    console.error(`Destination directory not found: ${targetDir}`);
    process.exit(1);
  }
  
  console.log('Starting header ID generation...');
  console.log(`Source directory: ${sourceDir}`);
  console.log(`Target directory: ${targetDir}`);
  console.log('');
  
  // Get all source markdown files
  const sourceFiles = getMarkdownFiles(sourceDir);
  
  console.log(`Found ${sourceFiles.length} source markdown files`);
  console.log('');
  
  // Process each file
  for (const sourceFile of sourceFiles) {
    // Calculate relative path from source dir
    const relativePath = path.relative(sourceDir, sourceFile);
    
    // Construct target file path
    const targetFile = path.join(targetDir, relativePath);
    
    processFilePair(sourceFile, targetFile);
    console.log('');
  }
  
  console.log('Header ID generation completed!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateHeaderId, extractHeaders, processFilePair };
