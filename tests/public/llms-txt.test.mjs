// Guards the generated llms.txt hierarchy. The root index exposes one level of
// section indexes; deeper indexes provide progressive disclosure without
// making the root file too large. AFDocs follows the first level and treats
// deeper index paths as intentionally omitted subtrees when measuring sitemap
// coverage.

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
const rootIndexPath = path.join(publicDir, 'llms.txt');
const locales = ['bn', 'es', 'fr', 'ja', 'ko', 'pl', 'pt', 'ro', 'uk', 'zh'];
const nonDocPrefixes = [
  '/blog',
  '/pricing',
  '/about',
  '/career',
  '/careers',
  '/job',
  '/jobs',
  '/contact',
  '/legal',
  '/privacy',
  '/terms',
  '/login',
  '/signup',
  '/sign-up',
  '/sign-in',
  '/register',
  '/404',
  '/500',
];

const markdownLinks = (content) =>
  [...content.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(
    ([, href]) => new URL(href, 'https://opentelemetry.io'),
  );

const outputPath = (url) =>
  path.join(publicDir, decodeURIComponent(url.pathname).replace(/^\/+/, ''));

const readOutput = (url) => {
  const file = outputPath(url);
  assert.ok(fs.existsSync(file), `${url.pathname} is published`);
  return fs.readFileSync(file, 'utf8');
};

const agentLinks = (content) =>
  markdownLinks(content).filter(
    ({ pathname }) => pathname.endsWith('.md') || pathname.endsWith('.txt'),
  );

const canonicalPagePath = ({ pathname }) =>
  pathname.endsWith('/index.md')
    ? pathname.slice(0, -'index.md'.length)
    : pathname.slice(0, -'.md'.length);

const subtreePath = ({ pathname }) => pathname.slice(0, -'llms.txt'.length);

const isNonDocPath = (pathname) =>
  nonDocPrefixes.some(
    (prefix) => pathname === `${prefix}/` || pathname.startsWith(`${prefix}/`),
  );

if (!fs.existsSync(rootIndexPath)) {
  test(
    'llms.txt indexes (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  const rootContent = fs.readFileSync(rootIndexPath, 'utf8');

  test('llms.txt indexes are hierarchical and locale-scoped', () => {
    const rootLinks = agentLinks(rootContent);
    assert.ok(
      rootLinks.some(({ pathname }) => pathname === '/docs/llms.txt'),
      'root links the documentation index',
    );
    assert.ok(
      rootLinks.some(({ pathname }) => pathname === '/ecosystem/llms.txt'),
      'root links the ecosystem index',
    );
    assert.doesNotMatch(
      rootContent,
      new RegExp(`/(?:${locales.join('|')})/`),
      'English root does not mix in localized pages',
    );
    for (const locale of locales) {
      assert.ok(
        fs.existsSync(path.join(publicDir, locale, 'llms.txt')),
        `${locale}/llms.txt is published`,
      );
    }
  });

  test('llms.txt links resolve and indexes stay below 50K', () => {
    const pending = [new URL('/llms.txt', 'https://opentelemetry.io')];
    const visited = new Set();

    while (pending.length > 0) {
      const index = pending.pop();
      if (visited.has(index.pathname)) continue;
      visited.add(index.pathname);

      const content = readOutput(index);
      assert.ok(
        content.length < 50_000,
        `${index.pathname} is under 50K characters`,
      );
      for (const link of agentLinks(content)) {
        readOutput(link);
        if (link.pathname.endsWith('.txt')) pending.push(link);
      }
    }

    assert.ok(visited.size > 100, 'root reaches the generated index hierarchy');
  });

  test('llms.txt covers at least 95% of sitemap documentation pages', () => {
    const directPages = new Set();
    const omittedSubtrees = [];

    for (const rootLink of agentLinks(rootContent)) {
      if (rootLink.pathname.endsWith('.md')) {
        directPages.add(canonicalPagePath(rootLink));
        continue;
      }

      for (const nestedLink of agentLinks(readOutput(rootLink))) {
        if (nestedLink.pathname.endsWith('.md')) {
          directPages.add(canonicalPagePath(nestedLink));
        } else {
          omittedSubtrees.push(subtreePath(nestedLink));
        }
      }
    }

    const sitemap = fs.readFileSync(
      path.join(publicDir, 'en', 'sitemap.xml'),
      'utf8',
    );
    const sitemapPages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      ([, loc]) => new URL(loc).pathname,
    );
    const measuredPages = sitemapPages.filter(
      (pathname) =>
        !isNonDocPath(pathname) &&
        !omittedSubtrees.some((prefix) => pathname.startsWith(prefix)),
    );
    const missing = measuredPages.filter(
      (pathname) => !directPages.has(pathname),
    );
    const coverage =
      ((measuredPages.length - missing.length) / measuredPages.length) * 100;

    assert.ok(
      coverage >= 95,
      `coverage ${coverage.toFixed(0)}%; missing: ${missing.join(', ')}`,
    );
  });
}
