/**
 * Shared helpers for `live-check.test.mjs` files (plain ESM so `node --test`
 * does not need to load this module from TypeScript).
 *
 * `LIVE_CHECK_BASE_URL` must match the key set in each `live-check.mjs`
 * launcher before spawning `node --test`.
 */

import assert from 'node:assert/strict';

/** Must match the key set in `live-check.mjs` before spawning `node --test`. */
export const LIVE_CHECK_BASE_URL_ENV = 'LIVE_CHECK_BASE_URL';

export function resolveBaseRef(raw) {
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return new URL(withScheme.endsWith('/') ? withScheme : `${withScheme}/`);
}

export function absUrl(path, baseRef) {
  return new URL(path, baseRef).href;
}

export function baseRef() {
  const raw = process.env[LIVE_CHECK_BASE_URL_ENV]?.trim();
  assert.ok(raw, 'Run live checks via: node .../live-check.mjs [-h] [BASE]');
  return resolveBaseRef(raw);
}

export function expectedConfigTag(baseRef) {
  return (
    'config-' +
    (baseRef.hostname === 'opentelemetry.io' ? 'present' : 'missing')
  );
}
