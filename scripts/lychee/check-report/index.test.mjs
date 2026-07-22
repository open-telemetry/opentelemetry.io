import { test, suite } from 'node:test';
import assert from 'node:assert/strict';
import { cacheUpdatedNotice } from './index.mjs';

suite('cacheUpdatedNotice', () => {
  test('says the cache was updated and how to commit it', () => {
    const notice = cacheUpdatedNotice();
    assert.match(notice, /\.lycheecache/);
    assert.match(notice, /commit/i);
  });
});
