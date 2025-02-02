#!/usr/bin/env node

import puppeteer from 'puppeteer';

const cratesIoURL = 'https://crates.io/crates/';
let verbose = false;

function log(...args) {
  if (verbose) console.log(...args);
}

async function getUrlHeadless(url) {
  let browser;

  log(`Trying headless fetch of ${url}`);

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 9000,
    });

    if (!response) throw new Error('No response from server.');

    let status = response.status();
    const title = await page.title();

    // Handles special case of crates.io. For details, see:
    // https://github.com/rust-lang/crates.io/issues/788
    if (url.startsWith(cratesIoURL)) {
      const crateName = url.split('/').pop();
      // Crate found iff title is `${crateName} - crates.io: Rust Package Registry`
      if (!title.startsWith(crateName)) status = 404;
    }
    
    log(`Headless fetch returned HTTP status code: ${status}; page title: '${title}'`);

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
  verbose = true; // process.argv.includes('--verbose');

  if (!url) {
    console.error(`Usage: ${process.argv[1]} URL`);
    process.exit(1);
  }

  const status = await getUrlStatus(url, verbose);
  process.exit(isHttp2XX(status) ? 0 : 1);
}

// Only run if script is executed directly (CLI)
if (import.meta.url === `file://${process.argv[1]}`) await mainCLI();
