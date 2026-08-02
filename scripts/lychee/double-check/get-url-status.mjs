#!/usr/bin/env node
//
// Browser-grade URL probe: fetch a URL through headless Chrome (Puppeteer)
// with bot-evasion measures, and report an HTTP-like status. Recovered
// (mostly verbatim) from the pre-Lychee double-check tooling removed in
// 89fe70663 (#10911); for the driver that feeds it Lychee failures, see
// ./cli.mjs.
//
// Beyond the plain HTTP status, the probe verifies URL fragments against the
// rendered page (including GitHub `-ov-file` and line-range anchors), and
// special-cases hosts whose responses are misleading to plain HTTP clients
// (crates.io, npmjs.com). Synthetic statuses:
//
// - 206 ("OK by analysis"): resolved by inspection rather than HTTP status
// - 422: page fetched OK, but the URL fragment was not found
//
// cSpell:ignore networkidle

import puppeteer from 'puppeteer-core';
import { URL } from 'url';
import { execFileSync } from 'child_process';

const STATUS_OK_BUT_FRAG_NOT_FOUND = 422;
export const STATUS_OK_BY_ANALYSIS = 206; // Partial Content

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

// Syntactically valid scoped or unscoped npm package name. Slightly looser
// than npm's rules for new packages (legacy names may contain uppercase),
// but strict enough to exclude shell metacharacters and malformed scopes.
const NPM_PACKAGE_NAME_REGEX = /^(@[a-zA-Z0-9\-._~]+\/)?[a-zA-Z0-9\-._~]+$/;

const cratesIoURL = 'https://crates.io/';

let verbose = false;

async function checkForFragment(url, page, status) {
  const parsedUrl = new URL(url);
  if (parsedUrl.hash) {
    let fragmentID = parsedUrl.hash.substring(1); // Remove the leading '#'
    fragmentID = decodeURIComponent(fragmentID);

    let anchorExists =
      // Element with matching ID
      (await page.evaluate((id) => {
        return !!document.getElementById(id);
      }, fragmentID)) ||
      // Named anchor
      (await page.evaluate((name) => {
        const elt = document.querySelector(`a[name="${name}"]`);
        return !!elt;
      }, fragmentID)) ||
      // Github.com repo special cases
      (url.startsWith('https://github.com/') &&
        (await anchorExistsInGitHub(page, fragmentID)));

    if (!anchorExists) status = STATUS_OK_BUT_FRAG_NOT_FOUND;
  }
  return status;
}

async function anchorExistsInGitHub(page, fragmentID) {
  if (/L\d+(-L\d+)?/.test(fragmentID)) {
    // Line references: GitHub marks the targeted lines as highlighted.
    return await page.evaluate(() => {
      return !!document.querySelector('div.highlighted-line');
    });
  }

  // Other fragments (README tabs, headings in rendered markdown): look for a
  // link to the fragment, possibly with the `-ov-file` suffix that GitHub
  // uses as anchors of tabs on repo landing pages.
  return await page.evaluate((name) => {
    const elt = document.querySelector(
      `a[href="#${name}"], a[href="#${name}-ov-file"]`,
    );
    return !!elt;
  }, fragmentID);
}

// Fetch the URL through headless Chrome, trying our best to avoid triggering
// bot-rejection from some servers. Returns the HTTP status code, a synthetic
// status (206, 422), or null when the fetch errored out.
async function getUrlHeadless(url) {
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
      // The crates.io server returns 404 for HTML page requests even when the
      // page exists (https://github.com/rust-lang/crates.io/issues/788), so
      // ignore the status and check the body instead.
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

  // npmjs.com 403s are a bot wall; ask the npm CLI instead.
  if (status === 403 && NPMJS_URL_REGEX.test(url)) {
    let _status = checkNpmPackageUrlViaCLI(url);
    if (isHttp2XX(_status)) return _status;
  }

  // Retry in a visible browser (local runs only).
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

if (import.meta.url === `file://${process.argv[1]}`) await mainCLI();

// Extract the package name (@scope/package or package) from an npmjs.com URL.
export function npmPackageNameFromUrl(url) {
  const match = url.match(NPMJS_URL_REGEX);
  if (!match) return null;

  // Group 1 is the full package name (@scope/package or package). Reject
  // anything that isn't a syntactically valid package name: the result is
  // passed to the npm CLI.
  const name = match[1];
  return NPM_PACKAGE_NAME_REGEX.test(name) ? name : null;
}

function checkNpmPackageUrlViaCLI(url) {
  const packageName = npmPackageNameFromUrl(url);

  if (!packageName) {
    log(`Unable to extract package name from: ${url}`);
    return 404;
  }

  try {
    // execFileSync with an argument array: no shell, no interpolation.
    execFileSync('npm', ['view', packageName, 'name'], {
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

function getChromePath() {
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }

  try {
    // Install Chrome if not present, or just return the path if already
    // installed. Uses the dependency-provided puppeteer bin (`npm exec --no`
    // never falls back to the public registry).
    const output = execFileSync(
      'npm',
      ['exec', '--no', 'puppeteer', 'browsers', 'install', 'chrome'],
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      },
    ).trim();

    // Output is of the form: chrome@<buildID> <path>
    const spaceIndex = output.indexOf(' ');
    if (spaceIndex !== -1) {
      const path = output.substring(spaceIndex + 1);
      return path;
    }
  } catch (error) {
    // Fall through to the throw below
  }

  throw new Error(
    'Chrome not found. Install with: npm exec --no puppeteer browsers install chrome',
  );
}

// Returns true iff status is a 404 that we trust: crates.io 404s are
// unreliable (see the body-analysis branch in getUrlHeadless).
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

// Verbose regex (like Perl's /x flag): whitespace and `#` comments stripped.
function regexX(pattern, flags = '') {
  const cleaned = pattern
    .replace(/\s+#.*$/gm, '') // strip `#` comments
    .replace(/\s+/g, '');
  return new RegExp(cleaned, flags);
}
