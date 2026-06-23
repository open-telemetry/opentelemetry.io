// Sanity-checks the favicons in the built site. Docsy's default partial
// discovers icons from the site root and emits the corresponding <link> tags
// (google/docsy#2654), so this guards that:
//
// - the expected lean icon set is published at the site root,
// - the home page links those icons plus the web manifest, and
// - no leftover legacy references remain (the old /favicons/ set, the Safari
//   mask-icon, or MS tiles).
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
const indexPath = path.join(publicDir, 'index.html');

const ICONS = ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'];
const MANIFEST_ASSETS = [
  'site.webmanifest',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
];

if (!fs.existsSync(indexPath)) {
  test(
    'favicons (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  const html = fs.readFileSync(indexPath, 'utf8');
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  const attr = (tag, name) =>
    tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] ?? '';
  const linkFor = (rel, file) =>
    links.find(
      (t) => attr(t, 'rel') === rel && attr(t, 'href').endsWith(`/${file}`),
    );

  test('icon and manifest files are published at the site root', () => {
    for (const file of [...ICONS, ...MANIFEST_ASSETS]) {
      assert.ok(
        fs.existsSync(path.join(publicDir, file)),
        `public/${file} is published`,
      );
    }
  });

  test('home page links the expected icons and manifest', () => {
    const svg = linkFor('icon', 'favicon.svg');
    assert.ok(svg, 'favicon.svg is linked (rel=icon)');
    assert.strictEqual(attr(svg, 'type'), 'image/svg+xml', 'favicon.svg type');
    assert.ok(
      linkFor('icon', 'favicon.ico'),
      'favicon.ico is linked (rel=icon)',
    );
    assert.ok(
      linkFor('apple-touch-icon', 'apple-touch-icon.png'),
      'apple-touch-icon.png is linked (rel=apple-touch-icon)',
    );
    assert.ok(
      linkFor('manifest', 'site.webmanifest'),
      'site.webmanifest is linked (rel=manifest)',
    );
  });

  test('no legacy favicon references remain', () => {
    assert.ok(
      !fs.existsSync(path.join(publicDir, 'favicons')),
      'legacy public/favicons/ is removed',
    );
    assert.doesNotMatch(
      html,
      /href=["'][^"']*\/favicons\//i,
      'favicon links resolve at the site root',
    );
    assert.doesNotMatch(
      html,
      /rel=["']mask-icon["']|msapplication/i,
      'legacy mask-icon and MS tile tags are dropped',
    );
  });

  test('manifest icons resolve to published files', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(publicDir, 'site.webmanifest'), 'utf8'),
    );
    for (const icon of manifest.icons ?? []) {
      assert.ok(
        fs.existsSync(path.join(publicDir, icon.src.replace(/^\//, ''))),
        `manifest icon is published: ${icon.src}`,
      );
    }
  });
}
