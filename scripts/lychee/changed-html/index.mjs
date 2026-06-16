#!/usr/bin/env node
// Map changed content files to their built `public/` HTML, for a fast,
// diff-scoped lychee run. "Changed" = everything since the merge-base with the
// default branch (the PR's commits) plus staged, unstaged, and untracked files.
//
// Hugo builds `content/<lang>/<path>.md` into pretty-URL HTML under `public/`.
// We replicate the common mapping (default-language strip, locale prefix,
// `_index.md`/`index.md` -> `.../index.html`) and keep only paths that
// actually exist in the build. This is best-effort: front-matter `url`/`slug`
// overrides, aliases, and drafts may not map — those are reported on stderr, so
// fall back to `npm run check:links:lychee` for guaranteed full coverage.
//
// cSpell:ignore unmappable unbuilt

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_BRANCH = process.env.LYCHEE_DIFF_BASE || 'main';

function git(args) {
  try {
    return execSync(`git ${args}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function splitLines(out) {
  return out
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Changed files vs the merge-base with the default branch, union working-tree
// (staged + unstaged) and untracked files. De-duplicated.
export function changedFiles() {
  const files = new Set();
  const base = git(`merge-base ${DEFAULT_BRANCH} HEAD`).trim();
  if (base)
    splitLines(git(`diff --name-only ${base}`)).forEach((f) => files.add(f));
  splitLines(git('diff --name-only')).forEach((f) => files.add(f));
  splitLines(git('diff --name-only --cached')).forEach((f) => files.add(f));
  splitLines(git('ls-files --others --exclude-standard')).forEach((f) =>
    files.add(f),
  );
  return [...files];
}

// `content/<lang>/<rest>.md` -> built `public/[<lang>/]<pretty>/index.html`, or
// `null` if the file isn't a mappable content page. Pure (no filesystem access).
export function contentToPublic(file) {
  const m = /^content\/([^/]+)\/(.+)\.md$/.exec(file);
  if (!m) return null;
  const [, lang, rest] = m;
  const prefix = lang === 'en' ? '' : `${lang}/`;
  let urlPath;
  if (rest === '_index' || rest === 'index') urlPath = '';
  else if (rest.endsWith('/_index') || rest.endsWith('/index'))
    urlPath = rest.replace(/\/(_index|index)$/, '') + '/';
  else urlPath = `${rest}/`;
  return path.posix.join('public', prefix + urlPath, 'index.html');
}

// Mapped, existing, absolute public HTML files for the current diff. Reports
// unmappable / unbuilt changes on stderr.
export function mappedHtmlFiles(root = process.cwd()) {
  const mapped = [];
  const skipped = [];
  for (const f of changedFiles()) {
    if (!/^content\/.+\.md$/.test(f)) {
      if (/^(layouts|assets|data|i18n|static|config|hugo\.|go\.)/.test(f))
        skipped.push([f, 'site-wide/non-content change']);
      continue;
    }
    const rel = contentToPublic(f);
    const abs = rel ? path.join(root, rel) : null;
    if (abs && existsSync(abs)) mapped.push(abs);
    else
      skipped.push([
        f,
        rel ? 'no built HTML (draft / url override / alias?)' : 'unmappable',
      ]);
  }
  const unique = [...new Set(mapped)];
  if (skipped.length) {
    console.error(
      `Note: ${skipped.length} changed file(s) not covered by the diff check ` +
        `(run \`npm run check:links:lychee\` for full coverage):`,
    );
    for (const [f, why] of skipped) console.error(`  - ${f}  (${why})`);
  }
  return unique;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const f of mappedHtmlFiles()) console.log(f);
}
