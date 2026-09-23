// Guards the shared-chrome contract of lean builds (the default; the `lean`
// npm script sets HUGO_PARAMS_TD_CHROME=shared): donor pages such as home and
// the docs landing page render the real chrome, while other pages emit
// placeholders that hydration logic in the main JS bundle fills in client
// side. Without the parameter, every page renders full chrome.
//
// The test reads the built site: it skips when there is no build, but fails
// on missing pages. Tests under `tests/public/` run via `test:public`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const publicDir = path.join(repoRoot, 'public');
const read = (...segments) => {
  const file = path.join(publicDir, ...segments);
  assert.ok(fs.existsSync(file), `public/${segments.join('/')} is published`);
  return fs.readFileSync(file, 'utf8');
};

const DEEP_PAGE = ['docs', 'concepts', 'index.html'];

if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
  test(
    'shared chrome (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  test('deep docs page uses chrome placeholders, not inline chrome', () => {
    const deep = read(...DEEP_PAGE);
    const placeholders = deep.match(/<div[^>]*td-chrome-placeholder[^>]*>/g);
    const regions = (placeholders ?? []).map(
      (tag) => tag.match(/data-chrome-region="([^"]*)"/)?.[1],
    );
    for (const region of ['navbar', 'footer']) {
      assert.ok(regions.includes(region), `${region} chrome placeholder`);
    }
    for (const tag of placeholders ?? []) {
      assert.match(tag, /data-chrome-donor="[^"]+"/, 'placeholder names donor');
    }
    assert.doesNotMatch(
      deep,
      /<nav[^>]*td-navbar/,
      'navbar comes from hydration (shared chrome is in effect)',
    );
  });

  test('deep docs page uses a sidebar-nav placeholder', () => {
    const deep = read(...DEEP_PAGE);
    assert.match(
      deep,
      /<div[^>]*td-sidebar-chrome-placeholder[^>]*data-nav-donor="[^"]+"/,
      'sidebar placeholder names its nav donor',
    );
  });

  test('donor pages render the real chrome', () => {
    const home = read('index.html');
    const docsLanding = read('docs', 'index.html');
    assert.match(home, /<nav[^>]*td-navbar/, 'home page renders the navbar');
    assert.doesNotMatch(
      home,
      /td-chrome-placeholder/,
      'home page is a donor (chrome rendered inline)',
    );
    assert.match(
      docsLanding,
      /<nav[^>]*td-sidebar-nav/,
      'docs landing page renders the sidebar nav',
    );
  });

  test('chrome hydration ships in the main JS bundle', () => {
    const deep = read(...DEEP_PAGE);
    const mainJs = read('js', 'main.js');
    for (const marker of ['td-chrome-placeholder', 'data-chrome-donor']) {
      assert.ok(mainJs.includes(marker), `main.js handles ${marker}`);
    }
    assert.match(
      deep,
      /<script src="\/js\/main\.js">/,
      'deep page loads the main JS bundle',
    );
  });
}
