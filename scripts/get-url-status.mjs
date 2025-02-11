#!/usr/bin/env node

import puppeteer from 'puppeteer'; // Consider using puppeteer-core
import { URL } from 'url';

const DOCS_ORACLE_URL = 'https://docs.oracle.com/';
const STATUS_OK_BUT_FRAG_NOT_FOUND = 422;

const cratesIoURL = 'https://crates.io/crates/';
let verbose = false;

export function log(...args) {
  if (!verbose) return;
  const lastArg = args[args.length - 1];
  if (typeof lastArg === 'string' && lastArg.endsWith(' ')) {
    process.stdout.write(args.join(' '));
  } else {
    console.log(...args);
  }
}

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
    // cSpell:ignore KHTML
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--user-agent=${userAgent}`,
      ],
    });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
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

    // Handles special case of crates.io. For details, see:
    // https://github.com/rust-lang/crates.io/issues/788
    if (url.startsWith(cratesIoURL)) {
      const crateName = url.split('/').pop();
      // E.g. 'https://crates.io/crates/opentelemetry-sdk' -> 'opentelemetry-sdk'
      const crateNameRegex = new RegExp(crateName.replace(/-/g, '[-_]'));
      // Crate found if title starts with createName (in kebab or snake case)
      if (!crateNameRegex.test(title)) status = 404;
    }

    status = await checkForFragment(url, page, status);
    log(`${status}; page title: '${title}'`);

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
    browser = await puppeteer.launch({ headless: false });

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
  // If headless fetch fails, try in browser for non-404 statuses
  if (!isHttp2XX(status) && status !== 404 && status !== 422) {
    log(`\n\t retrying in browser ... `);
    status = await getUrlInBrowser(url);
  }
  return status;
}

async function mainCLI() {
  const url = process.argv[2];
  verbose = !process.argv.includes('--quiet');

  if (!url) {
    console.error(`Usage: ${process.argv[1]} URL`);
    process.exit(1);
  }

  const status = await getUrlStatus(url, verbose);
  if (!verbose) console.log(status);

  process.exit(isHttp2XX(status) ? 0 : 1);
}

// Only run if script is executed directly (CLI)
if (import.meta.url === `file://${process.argv[1]}`) await mainCLI();
