#!/usr/bin/env node

import puppeteer from 'puppeteer-core';
import { URL } from 'url';
import { execSync } from 'child_process';

const DOCS_ORACLE_URL = 'https://docs.oracle.com/';
const STATUS_OK_BUT_FRAG_NOT_FOUND = 422;
const STATUS_OK_BY_ANALYSIS = 206; // Partial Content

const NPMJS_URL_REGEX = regexX(String.raw`
  ^https://            # Protocol
  (?:www\.)?             # Optional www subdomain
  npmjs\.com/package/  # Domain and path
  (                    # Start package name capture group
    @?[^#?\/]+         #   Optional @ + scope/package name (no /, #, ?)
    (?:\/[^#?\/]+)?    #   Optional /sub-package-name for scoped packages
  )                    # End package name capture group
  (?:\/|#|\?|$)        # End with /, #, ?, or end of string
`);

// NOTE about crates.io
// --------------------
// The crates.io server always returns 404. For details,
// see: https://github.com/rust-lang/crates.io/issues/788. To determine if a
// link into crates.io is valid, we need to inspect the response body. So, we'll
// assume that a 404 from crates.io is not a real 404.
//
// (Actually, you can get it to always return 200, even for invalid paths, by
// doing requests with 'Accept: text/html'.)
const cratesIoURL = 'https://crates.io/';

let verbose = false;

// Check for fragment and corresponding anchor ID in page.
async function checkForFragment(_url, page, status) {
  // FIXME: htmltest seems to mistakenly double escape '+' in URLs, and
  // ampersands as `\u0026`. Let's attempt to patch that there. TODO: address
  // this upstream; at least create an issue.
  // DISABLING FOR NOW:
  const url = _url; // .replace(/&#43;/g, '+').replace(/\\u0026/g, '&');
  const parsedUrl = new URL(url);
  if (parsedUrl.hash) {
    let fragmentID = parsedUrl.hash.substring(1); // Remove the leading '#'
    // if (url.startsWith(DOCS_ORACLE_URL)) { // Would also need for GitHub.com
    fragmentID = decodeURIComponent(fragmentID);
    // }

    let anchorExists =
      //
      // Look for ID attribute in the page.
      //
      (await page.evaluate((id) => {
        return !!document.getElementById(id);
      }, fragmentID)) ||
      //
      // Look for named anchors
      //
      (await page.evaluate((name) => {
        const elt = document.querySelector(`a[name="${name}"]`);
        return !!elt;
      }, fragmentID)) ||
      //
      // Github.com repo special cases
      //
      (url.startsWith('https://github.com/') &&
        (await anchorExistsInGitHub(page, fragmentID)));

    if (!anchorExists) status = STATUS_OK_BUT_FRAG_NOT_FOUND;
  }
  return status;
}

async function anchorExistsInGitHub(page, fragmentID) {
  if (/L\d+(-L\d+)?/.test(fragmentID)) {
    // Handle line references in GitHub repos.
    return await page.evaluate((name) => {
      // Look for references to the fragment in the page, possibly with an
      // `-ov-file` suffix (used as anchors of tabs in repo landing pages).
      return !!document.querySelector('div.highlighted-line');
    }, fragmentID);
  }

  // Handle other fragment references in GitHub repos, link references
  // to files (such as README), or to headings inside of displayed markdown.
  return await page.evaluate((name) => {
    // Look for references to the fragment in the page, possibly with an
    // `-ov-file` suffix (used as anchors of tabs in repo landing pages).
    const elt = document.querySelector(
      `a[href="#${name}"], a[href="#${name}-ov-file"]`,
    );
    return !!elt;
  }, fragmentID);
}

async function getUrlHeadless(url) {
  // Get the URL, headless, while trying our best to avoid triggering
  // bot-rejection from some servers. Returns the HTTP status code.

  log(`Fetch ${url} headless ... `);

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: getChromePath(),
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--no-zygote',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const defaultUA = await browser.userAgent();
    const cleanUA = defaultUA.replace(/Headless(Chrome)?/gi, 'Chrome');

    const page = await browser.newPage();
    await page.setUserAgent({ userAgent: cleanUA });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 10_000,
    });

    if (!response) throw new Error('No response from server.');

    let status = response.status();
    const title = await page.title();
    log(`${status}; page title: '${title}'; checking page content: `);

    if (url.startsWith(cratesIoURL)) {
      // Ignore status code, and check body. For details, see "Note about
      // crates.io" above. If response body contains "... not found" return
      // 404, otherwise assume OK.
      const bodyText = await page.content();
      status = /(Page|Crate ["\w\-]+) not found/i.test(bodyText)
        ? 404
        : STATUS_OK_BY_ANALYSIS;
    }

    // npmjs.com can redirect to a signin page for non-existent packages.
    // Confirm that the package name is in the title.
    if (isHttp2XX(status) && NPMJS_URL_REGEX.test(url)) {
      const packageName = npmPackageNameFromUrl(url);
      if (
        !packageName ||
        !title.includes(packageName) ||
        /Sign In/i.test(title)
      ) {
        status = 404;
        log(`not a valid package page; `);
      }
    }

    status = await checkForFragment(url, page, status);
    log(`${status}`);

    return status;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

async function getUrlInBrowser(url) {
  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath: getChromePath(),
      headless: false,
    });

    const page = await browser.newPage();
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    if (!response) throw new Error('No response from server.');

    let status = response.status();
    const title = await page.title();
    status = await checkForFragment(url, page, status);
    log(`${status}; page title: '${title}'`);

    return status;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

export function isHttp2XX(status) {
  return status && status >= 200 && status < 300;
}

export async function getUrlStatus(url, _verbose = false) {
  verbose = _verbose;

  let status = await getUrlHeadless(url);
  if (
    isHttp2XX(status) ||
    status === 404 ||
    status === STATUS_OK_BUT_FRAG_NOT_FOUND
  ) {
    return status;
  }

  // Try to validate npmjs.com package URLs via CLI
  if (status === 403 && NPMJS_URL_REGEX.test(url)) {
    let _status = checkNpmPackageUrlViaCLI(url);
    if (isHttp2XX(_status)) return _status;
  }

  // Headless fetch failed, try in browser (local only)
  const isCI = !!process.env.CI || !!process.env.CHROME_PATH;
  if (isCI) return status;

  log(`\n\t retrying in browser ... `);
  status = await getUrlInBrowser(url);
  return status;
}

async function mainCLI() {
  const url = process.argv[2];
  verbose = !process.argv.includes('--quiet') && !process.argv.includes('-q');

  if (!url) {
    console.error(`Usage: ${process.argv[1]} URL`);
    process.exit(1);
  }

  const status = await getUrlStatus(url, verbose);
  console.log({ status });

  process.exit(isHttp2XX(status) ? 0 : 1);
}

// Only run if script is executed directly (CLI)
if (import.meta.url === `file://${process.argv[1]}`) await mainCLI();

// ================================
// Utility functions

// Extract package name from URL
// Handle scoped packages: @scope/package or regular packages: package
function npmPackageNameFromUrl(url) {
  const match = url.match(NPMJS_URL_REGEX);
  if (!match) return null;

  // Group 1 is the full package name (@scope/package or package)
  return match[1];
}

// Check if an npm package exists using npm CLI
function checkNpmPackageUrlViaCLI(url) {
  const packageName = npmPackageNameFromUrl(url);

  if (!packageName) {
    log(`Unable to extract package name from: ${url}`);
    return 404;
  }

  try {
    execSync(`npm view ${packageName} name`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    log(`> npm view '${packageName}' successful - package exists`);
    return STATUS_OK_BY_ANALYSIS;
  } catch (error) {
    log(`> npm view '${packageName}' failed - package not found`);
    return 404;
  }
}

// Get Chrome executable path
function getChromePath() {
  // Use path set by GitHub workflow if available
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }

  try {
    // Install Chrome if not present, or just return the path if already installed.
    // Output is of the form: chrome@<buildID> <path>
    const output = execSync('npx puppeteer browsers install chrome', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    // Parse output, for example: chrome@141.0.7390.54 /path/to/chrome
    const spaceIndex = output.indexOf(' ');
    if (spaceIndex !== -1) {
      const path = output.substring(spaceIndex + 1);
      return path;
    }
  } catch (error) {
    // Continue to next attempt
  }

  throw new Error(
    'Chrome not found. Install with: npx puppeteer browsers install chrome',
  );
}

// Returns true iff status is 404 and URL is assumed Not Found. See "Note about
// crates.io" for an explanation of the special handling of crates.io.
export function isStatusNotFound(status, url = '') {
  if (url && url.startsWith(cratesIoURL)) return false;
  return status === 404;
}

export function log(...args) {
  if (!verbose) return;
  const lastArg = args[args.length - 1];
  if (typeof lastArg === 'string' && lastArg.endsWith(' ')) {
    process.stdout.write(args.join(' '));
  } else {
    console.log(...args);
  }
}

// Helper to create verbose regex (like Perl's /x flag)
function regexX(pattern, flags = '') {
  // Remove whitespace and comments from the pattern
  const cleaned = pattern
    .replace(/\s+#.*$/gm, '') // Remove comments (space + # to end of line)
    .replace(/\s+/g, ''); // Remove all whitespace
  return new RegExp(cleaned, flags);
}

// ================================
// Test functions
// ================================

// Run: node -e "import('./scripts/get-url-status.mjs').then(m => m.testNpmPackageNameExtraction())"

export function testNpmPackageNameExtraction() {
  const testCases = [
    ['https://www.npmjs.com/package/@otel/rd-aws', '@otel/rd-aws'],
    ['https://npmjs.com/package/@otel/rd-azure', '@otel/rd-azure'],
    ['https://www.npmjs.com/package/express', 'express'],
    ['https://npmjs.com/package/lodash/', 'lodash'],
    ['https://www.npmjs.com/package/@scope/pkg/v/1.0.0', '@scope/pkg'],
    ['https://npmjs.com/package/@otel/api?activeTab=versions', '@otel/api'],
    ['https://www.npmjs.com/package/@scope/pkg#readme', '@scope/pkg'],
    ['https://www.npmjs.com/package/@scope/pkg/', '@scope/pkg'],
    ['https://example.com/package/foo', null],
  ];

  console.log('Testing npmPackageNameFromUrl():');
  let passed = 0;
  let failed = 0;

  testCases.forEach(([url, expected]) => {
    const result = npmPackageNameFromUrl(url);
    const status = result === expected ? '✓' : '✗';
    if (result === expected) {
      passed++;
    } else {
      failed++;
      console.log(`${status} FAIL: ${url}`);
      console.log(`  Expected: ${expected}`);
      console.log(`  Got:      ${result}`);
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  return failed === 0;
}
