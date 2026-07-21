#!/usr/bin/env node
// Map changed content files to their built `public/` HTML, for a fast,
// diff-scoped lychee run. Best-effort: front-matter `url`/`slug` overrides,
// aliases, and drafts may not map — those are reported on stderr, so fall
// back to `npm run check:links` for guaranteed full coverage.
//
// cSpell:ignore unmappable unbuilt

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_BRANCH = 'main';

// Run a git command and return its stdout. Strict by default: a failure
// throws (naming the command), since misreading it as empty output would
// silently shrink the diff scope. Pass `{ mayFail: true }` only where failure
// legitimately means "no result" (e.g. no merge base).
function git(args, { mayFail = false } = {}) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (err) {
    if (mayFail) return '';
    throw new Error(`git ${args.join(' ')} failed`, { cause: err });
  }
}

function splitLines(out) {
  return out
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Changed files vs the merge-base with the default branch (the PR's commits),
// union working-tree (staged + unstaged) and untracked files. De-duplicated.
// Throws when the diff base cannot be resolved (missing branch,
// shallow/single-branch clone, or a mistyped LYCHEE_DIFF_BASE): a silent empty
// diff would false-green the check.
export function changedFiles() {
  const baseRef = process.env.LYCHEE_DIFF_BASE || DEFAULT_BRANCH;
  const base = git(['merge-base', baseRef, 'HEAD'], { mayFail: true }).trim();
  if (!base) {
    throw new Error(
      `cannot resolve the diff base '${baseRef}': ensure that it exists ` +
        `locally (in shallow or single-branch clones, fetch it first), or ` +
        `set LYCHEE_DIFF_BASE to a valid ref`,
    );
  }
  const files = new Set();
  splitLines(git(['diff', '--name-only', base])).forEach((f) => files.add(f));
  splitLines(git(['diff', '--name-only'])).forEach((f) => files.add(f));
  splitLines(git(['diff', '--name-only', '--cached'])).forEach((f) =>
    files.add(f),
  );
  splitLines(git(['ls-files', '--others', '--exclude-standard'])).forEach((f) =>
    files.add(f),
  );
  return [...files];
}

// `content/<lang>/<rest>.md` -> built `public/[<lang>/]<pretty>/index.html`
// (default-language strip, `_index.md`/`index.md` -> `.../index.html`), or
// `null` if the file isn't a mappable content page. Pure (no filesystem
// access).
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

// Resolve a `public/...` path (from `contentToPublic`) to an absolute path, but
// only if it stays within `<root>/public`. Returns `null` on escape, so a `..`
// segment in a changed-file path (whether from a crafted diff or an odd git
// report) can't steer the lychee run at files outside the built site. Pure.
export function confineToPublic(rel, root = process.cwd()) {
  if (!rel) return null;
  const pubRoot = path.resolve(root, 'public');
  const abs = path.resolve(root, rel);
  return abs === pubRoot || abs.startsWith(pubRoot + path.sep) ? abs : null;
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
    const abs = confineToPublic(rel, root);
    if (abs && existsSync(abs)) {
      mapped.push(abs);
    } else {
      let why;
      if (!rel) why = 'unmappable';
      else if (!abs) why = 'maps outside public/ (skipped)';
      else why = 'no built HTML (draft / url override / alias?)';
      skipped.push([f, why]);
    }
  }
  const unique = [...new Set(mapped)];
  if (skipped.length) {
    console.error(
      `Note: ${skipped.length} changed file(s) not covered by the diff check ` +
        `(run \`npm run check:links\` for full coverage):`,
    );
    for (const [f, why] of skipped) console.error(`  - ${f}  (${why})`);
  }
  return unique;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const f of mappedHtmlFiles()) console.log(f);
}
