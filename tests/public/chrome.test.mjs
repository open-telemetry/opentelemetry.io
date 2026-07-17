// Sanity-checks Docsy's shared chrome mode in the built site. Lean builds set
// `HUGO_PARAMS_TD_CHROME=shared` (google/docsy#2662 replaced the older
// `td.lean_render` param): donor pages render real chrome once, other pages
// emit placeholders that `chrome-nav.js` hydrates client side. If the env-var
// contract regresses, Hugo silently renders full chrome on every page and CI
// would otherwise stay green — so this guards that after a default (lean)
// build:
//
// - a deep docs page uses navbar/footer/sidebar chrome placeholders rather
//   than inline chrome,
// - the donor pages (home, docs landing) still render the real chrome, and
// - the hydration logic ships in the main JS bundle the deep page loads.
//
// It reads the built site, so it skips when `public/` is absent. Tests under
// `tests/public/` follow this convention and run via `test:public`.

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
const read = (...segments) =>
  fs.readFileSync(path.join(publicDir, ...segments), 'utf8');

const DEEP_PAGE = ['docs', 'concepts', 'index.html'];

if (!fs.existsSync(path.join(publicDir, ...DEEP_PAGE))) {
  test(
    'shared chrome (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  const deep = read(...DEEP_PAGE);
  const home = read('index.html');
  const docsLanding = read('docs', 'index.html');

  test('deep docs page uses chrome placeholders, not inline chrome', () => {
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
    assert.match(
      deep,
      /<div[^>]*td-sidebar-chrome-placeholder[^>]*data-nav-donor="[^"]+"/,
      'sidebar placeholder names its nav donor',
    );
  });

  test('donor pages render the real chrome', () => {
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
