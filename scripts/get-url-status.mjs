#!/usr/bin/env node

import puppeteer from 'puppeteer'; // Consider using puppeteer-core

const cratesIoURL = 'https://crates.io/crates/';
let verbose = false;

function log(...args) {
  if (!verbose) return;
  const lastArg = args[args.length - 1];
  if (typeof lastArg === 'string' && lastArg.endsWith(' ')) {
    process.stdout.write(args.join(' '));
  } else {
    console.log(...args);
  }
}

async function getUrlHeadless(url) {
  // Get the URL, headless, while trying our best to avoid triggering
  // bot-rejection from some servers. Returns the HTTP status code.

  log(`Headless fetch of ${url} ... `);

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

    const status = response.status();
    log(`HTTP status code: ${status}`);

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
  if (!isHttp2XX(status) && status !== 404) {
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
