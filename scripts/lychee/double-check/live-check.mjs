#!/usr/bin/env node
// Live smoke check for the double-check probe: end-to-end probes (real
// browser, real network) of a few URLs known to block plain HTTP clients.
// Opt-in via `npm run test:double-check:live`; not part of default CI.
// Requires Chrome (CHROME_PATH, or puppeteer's managed install).

import { getUrlStatus, isHttp2XX } from './get-url-status.mjs';

// URLs that Lychee's plain client cannot verify, with the probe outcome we
// expect.
const cases = [
  { url: 'https://crates.io/crates/opentelemetry', expect: [206] },
  { url: 'https://www.npmjs.com/package/@opentelemetry/api', expect: '2xx' },
  { url: 'https://opentelemetry.io/#what-is-opentelemetry', expect: '2xx' },
];

let failures = 0;
for (const { url, expect } of cases) {
  const status = await getUrlStatus(url, true);
  console.log();
  const ok =
    expect === '2xx' ? isHttp2XX(status) : expect.includes(status ?? -1);
  console.log(`${ok ? 'PASS' : 'FAIL'} [${status}] ${url}`);
  if (!ok) failures++;
}

if (cases.length === 0 || failures > 0) {
  console.error(`\n${failures} of ${cases.length} live probe(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} live probes passed.`);
