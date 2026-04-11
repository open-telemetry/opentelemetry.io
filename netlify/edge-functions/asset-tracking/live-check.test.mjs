/**
 * Live integration tests (node:test). Not discovered by
 * `npm run test:edge-functions` (that command only runs `*.test.ts` files).
 *
 * Run via `live-check.mjs` only; it supplies the base URL for this process. See
 * `live-check.mjs -h`.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ASSET_FETCH_GA_INFO_HEADER,
  INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
} from '../lib/ga4-asset-fetch.ts';
import {
  absUrl,
  baseRef,
  expectedConfigTag,
} from '../../../tests/lib/live-check-base.mjs';

const markdownPath = '/site/testing/tests/regular/index.md';
const textPath = '/llms.txt';
const expectedMarkdownContentType = 'text/markdown; charset=UTF-8';
const expectedPlainTextContentType = 'text/plain; charset=UTF-8';

const regularPageMarkdownHeading = /^# Regular test page/;
const llmsTxtHeading = /^# OpenTelemetry/;
const GROUPED_LIVE_CHECK_ENV = 'EDGE_FUNCTION_LIVE_CHECK_GROUPED';

export function registerLiveChecks(registerTest = test) {
  registerTest('GET explicit .md path → markdown response', async () => {
    const ref = baseRef();
    const url = absUrl(markdownPath, ref);
    const res = await fetch(url);
    const ct = res.headers.get('content-type') ?? '';
    const text = await res.text();

    assert.strictEqual(res.status, 200, 'HTTP status');
    assert.strictEqual(ct, expectedMarkdownContentType, 'Content-Type');
    assert.match(text, regularPageMarkdownHeading, 'Request body');
  });

  registerTest(
    'GET explicit .md path → X-Asset-Fetch-Ga-Info header',
    async () => {
      const ref = baseRef();
      const url = absUrl(markdownPath, ref);
      const res = await fetch(url);

      assert.strictEqual(
        res.headers.get(ASSET_FETCH_GA_INFO_HEADER),
        `${markdownPath};ga-event-candidate,${expectedConfigTag(ref)}`,
        'X-Asset-Fetch-Ga-Info',
      );
    },
  );

  registerTest('HEAD explicit .md path → success with empty body', async () => {
    const ref = baseRef();
    const url = absUrl(markdownPath, ref);
    const res = await fetch(url, { method: 'HEAD' });
    const ct = res.headers.get('content-type') ?? '';
    const buf = await res.arrayBuffer();

    assert.strictEqual(res.status, 200, 'HTTP status');
    assert.strictEqual(ct, expectedMarkdownContentType, 'Content-Type');
    assert.strictEqual(buf.byteLength, 0, 'Response body');
  });

  registerTest(
    'GET explicit .md path with internal marker → same markdown response',
    async () => {
      const ref = baseRef();
      const url = absUrl(markdownPath, ref);
      const res = await fetch(url, {
        headers: {
          [ASSET_FETCH_GA_INFO_HEADER]: INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
        },
      });
      const ct = res.headers.get('content-type') ?? '';
      const text = await res.text();

      assert.strictEqual(res.status, 200, 'HTTP status');
      assert.strictEqual(ct, expectedMarkdownContentType, 'Content-Type');
      assert.match(text, regularPageMarkdownHeading, 'Request body');
    },
  );

  registerTest('GET explicit .txt path → text response', async () => {
    const ref = baseRef();
    const url = absUrl(textPath, ref);
    const res = await fetch(url);
    const ct = res.headers.get('content-type') ?? '';
    const text = await res.text();

    assert.strictEqual(res.status, 200, 'HTTP status');
    assert.strictEqual(ct, expectedPlainTextContentType, 'Content-Type');
    assert.match(text, llmsTxtHeading, 'Request body');
  });

  registerTest(
    'GET explicit .txt path with internal marker → same text response',
    async () => {
      const ref = baseRef();
      const url = absUrl(textPath, ref);
      const res = await fetch(url, {
        headers: {
          [ASSET_FETCH_GA_INFO_HEADER]: INTERNAL_ASSET_FETCH_GA_INFO_VALUE,
        },
      });
      const ct = res.headers.get('content-type') ?? '';
      const text = await res.text();

      assert.strictEqual(res.status, 200, 'HTTP status');
      assert.strictEqual(ct, expectedPlainTextContentType, 'Content-Type');
      assert.match(text, llmsTxtHeading, 'Request body');
    },
  );
}

if (process.env[GROUPED_LIVE_CHECK_ENV] !== '1') {
  registerLiveChecks();
}
