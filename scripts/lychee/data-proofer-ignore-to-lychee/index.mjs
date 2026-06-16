#!/usr/bin/env node
// Scan the built `public/` HTML for links that htmltest skips via the
// `data-proofer-ignore` attribute, and emit lychee `exclude` regexes that
// approximate htmltest's element-level ignore.
//
// Why: htmltest's `IgnoreTagAttribute` (default `data-proofer-ignore`) makes it
// skip parsing any element — and its children — carrying that attribute, so the
// links inside are never extracted or checked. lychee has no element-level
// equivalent (see lychee#259 / #1594: only `<pre>`/`<code>` are excluded by
// default, custom element/attribute exclusion was never exposed). On this site
// the attribute appears on Docsy's per-page `<link rel="canonical">` (a
// self-link rendered with the build's base URL) and on the "last modified"
// `commit/<sha>` page-meta links — both carrying volatile tails. We generalize
// each origin's links to their longest common path prefix and emit one regex
// per group, e.g. `^https://github\.com/open-telemetry/opentelemetry\.io/commit/`.
//
// Two safety rails keep the generated excludes honest, since lychee's `exclude`
// is global (it applies to ALL links, not just those under data-proofer-ignore):
//   - Already-covered links are dropped. URLs matched by the existing
//     `lychee.toml` `exclude` array (e.g. the `localhost` canonical self-links)
//     are filtered out, so the scanner only reports the delta.
//   - Collisions are flagged. If a generalized prefix would also match a
//     *checkable* link (one NOT under data-proofer-ignore — e.g. the
//     year-in-review posts' real `compare/<tag>...<tag>` links), the group is
//     withheld from stdout and reported as a conflict, so a broad prefix can't
//     silently suppress a link htmltest checks.
//
// Usage: node scripts/lychee/data-proofer-ignore-to-lychee/index.mjs [public-dir] [lychee-toml]
// Prints TOML-ready `exclude` array lines on stdout; a grouped summary on
// stderr. Re-run after a build and paste the lines into `lychee.toml`.
//
// cSpell:ignore proofer rawtext

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
const RAWTEXT = new Set(['script', 'style']);

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function hrefsIn(attrs) {
  const urls = [];
  const re = /(?:href|src)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  for (const m of attrs.matchAll(re)) {
    const raw = (m[2] ?? m[3] ?? m[4] ?? '').trim();
    if (raw) urls.push(decodeEntities(raw));
  }
  return urls;
}

// Walk the HTML tag stream, tracking how many open ancestors carry
// `data-proofer-ignore`; collect href/src URLs from any element that carries it
// or is nested inside one. A lenient tag matcher is enough for built Hugo HTML.
export function findIgnoredHrefs(html) {
  const urls = [];
  const stack = []; // { tag, ignored }
  let ignoreDepth = 0;
  const tagRe =
    /<!--[\s\S]*?-->|<(\/)?([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>])*?)(\/)?>/g;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[0].startsWith('<!--')) continue;
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrs = m[3] || '';
    const selfClose = m[4] === '/';

    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) {
          for (let j = stack.length - 1; j >= i; j--) {
            if (stack[j].ignored) ignoreDepth--;
          }
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const hasIgnore = /(?:^|\s)data-proofer-ignore(?:[\s=]|$)/i.test(attrs);
    if (hasIgnore || ignoreDepth > 0) urls.push(...hrefsIn(attrs));

    if (VOID.has(tag) || selfClose) continue;
    if (RAWTEXT.has(tag)) {
      // Skip raw-text content so stray `<`/`>` inside scripts/styles don't
      // unbalance the stack.
      const lower = html.toLowerCase();
      const close = lower.indexOf(`</${tag}`, tagRe.lastIndex);
      if (close === -1) break;
      const gt = html.indexOf('>', close);
      tagRe.lastIndex = gt === -1 ? html.length : gt + 1;
      continue;
    }
    stack.push({ tag, ignored: hasIgnore });
    if (hasIgnore) ignoreDepth++;
  }
  return urls;
}

// All href/src URLs in the document, regardless of data-proofer-ignore. Used to
// derive the "checkable" set (all minus ignored) for collision detection.
export function findAllHrefs(html) {
  return hrefsIn(html);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// A path truncated to its directory: drop the final (often volatile) segment,
// keeping the trailing `/` (e.g. `/commit/<sha>` -> `/commit/`, `/404.html` -> `/`).
function dirPrefix(pathname) {
  const cut = pathname.lastIndexOf('/');
  return cut >= 0 ? pathname.slice(0, cut + 1) : '/';
}

// Longest common prefix of the given paths, cut back to a path boundary so it
// always ends at a `/`.
function commonPathPrefix(paths) {
  if (paths.length === 0) return '/';
  let prefix = paths[0];
  for (const p of paths.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < p.length && prefix[i] === p[i]) i++;
    prefix = prefix.slice(0, i);
    if (prefix === '') break;
  }
  const cut = prefix.lastIndexOf('/');
  return cut >= 0 ? prefix.slice(0, cut + 1) : '/';
}

// Compile exclude patterns (regex strings) into RegExp objects, skipping any
// that don't compile. Accepts strings or pre-built RegExps.
function toRegexes(patterns) {
  const out = [];
  for (const p of patterns) {
    if (p instanceof RegExp) {
      out.push(p);
      continue;
    }
    try {
      out.push(new RegExp(p));
    } catch {
      // ignore patterns lychee accepts but JS can't compile
    }
  }
  return out;
}

// Extract the regex strings from a `lychee.toml` `exclude = [ … ]` array. A
// deliberately small parser: it reads the single- or double-quoted entries in
// that one array, ignoring `#` comments. Used to drop already-covered links
// (e.g. the `localhost` canonical self-links) so the scanner reports only the
// delta still needing an exclude.
export function loadExcludeRegexes(tomlText) {
  const m = /(^|\n)\s*exclude\s*=\s*\[/.exec(tomlText);
  if (!m) return [];
  let i = m.index + m[0].length;
  let depth = 1;
  let body = '';
  for (; i < tomlText.length && depth > 0; i++) {
    const c = tomlText[i];
    if (c === '[') depth++;
    else if (c === ']') depth--;
    if (depth > 0) body += c;
  }
  const patterns = [];
  const lineRe = /[^\n]*/g;
  for (const line of body.match(lineRe) ?? []) {
    const code = line.replace(/#.*$/, '');
    const sm = /'([^']*)'|"((?:[^"\\]|\\.)*)"/.exec(code);
    if (sm) patterns.push(sm[1] ?? sm[2]);
  }
  return patterns;
}

// Generalize external (http/https) URLs into a small set of prefix groups, one
// per stable link family. URLs are first grouped by origin + directory (the
// volatile leaf segment dropped), which already collapses `…/commit/<sha>` and
// `…/compare/<range>` into single prefixes. When an origin's links instead sprawl
// across many directories — as per-page canonical self-links do — that origin is
// collapsed to its longest common directory prefix (typically the whole host).
//
// Options:
//   - `exclude`: regex strings/RegExps already covering some links; matching
//     input URLs are dropped before grouping (so the output is only the delta).
//   - `checkable`: URLs NOT under data-proofer-ignore; a group whose prefix also
//     matches one of these is flagged with a `conflicts` array so a broad prefix
//     can't silently suppress a link htmltest would check.
//
// Returns `{ prefix, count, example, conflicts? }` rows sorted by prefix;
// `count` is the number of distinct URLs in the group.
export function generalize(
  urls,
  { collapseThreshold = 16, exclude = [], checkable = [] } = {},
) {
  const excludeRes = toRegexes(exclude);
  const covered = (u) => excludeRes.some((re) => re.test(u));
  const checkableUncovered = [...new Set(checkable)].filter((u) => !covered(u));

  const byOrigin = new Map(); // origin -> Map(dir -> Set(url))
  for (const u of urls) {
    if (!/^https?:\/\//i.test(u)) continue;
    if (covered(u)) continue;
    let url;
    try {
      url = new URL(u);
    } catch {
      continue;
    }
    const dirs = byOrigin.get(url.origin) ?? new Map();
    const key = dirPrefix(url.pathname);
    const set = dirs.get(key) ?? new Set();
    set.add(u);
    dirs.set(key, set);
    byOrigin.set(url.origin, dirs);
  }

  const withConflicts = (prefix) => {
    const re = new RegExp(`^${escapeRegex(prefix)}`);
    return checkableUncovered.filter((u) => re.test(u));
  };

  const rows = [];
  for (const [origin, dirs] of byOrigin) {
    if (dirs.size > collapseThreshold) {
      const all = new Set();
      for (const set of dirs.values()) for (const u of set) all.add(u);
      const prefix = origin + commonPathPrefix([...dirs.keys()]);
      rows.push({ prefix, count: all.size, example: [...all][0] });
    } else {
      for (const [dir, set] of dirs) {
        rows.push({
          prefix: origin + dir,
          count: set.size,
          example: [...set][0],
        });
      }
    }
  }
  for (const row of rows) {
    const conflicts = withConflicts(row.prefix);
    if (conflicts.length) row.conflicts = conflicts;
  }
  return rows.sort((a, b) => a.prefix.localeCompare(b.prefix));
}

// One anchored regex per safe group, ready for lychee's `exclude`. Groups that
// collide with a checkable link are omitted (inspect `generalize` for those).
export function toExcludePatterns(urls, opts = {}) {
  return generalize(urls, opts)
    .filter((g) => !g.conflicts)
    .map((g) => `^${escapeRegex(g.prefix)}`);
}

function findHtmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findHtmlFiles(full, files);
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function mainCLI() {
  const [, , root = 'public', tomlPath = 'lychee.toml'] = process.argv;
  const files = findHtmlFiles(root);
  const ignored = [];
  const checkable = [];
  for (const f of files) {
    const html = readFileSync(f, 'utf8');
    const ign = findIgnoredHrefs(html);
    const ignSet = new Set(ign);
    ignored.push(...ign);
    for (const u of findAllHrefs(html)) if (!ignSet.has(u)) checkable.push(u);
  }

  let exclude = [];
  try {
    exclude = loadExcludeRegexes(readFileSync(tomlPath, 'utf8'));
  } catch {
    // no existing config to diff against; report everything
  }

  const groups = generalize(ignored, { exclude, checkable });
  const safe = groups.filter((g) => !g.conflicts);
  const conflicts = groups.filter((g) => g.conflicts);

  for (const g of safe) console.log(`  '^${escapeRegex(g.prefix)}',`);

  console.error(
    `Scanned ${files.length} HTML file(s); ${ignored.length} link(s) under ` +
      `data-proofer-ignore. ${safe.length} new exclude group(s) ` +
      `(already covered by ${tomlPath} omitted):`,
  );
  for (const g of safe) {
    console.error(
      `  ${String(g.count).padStart(6)}  ^${escapeRegex(g.prefix)}   e.g. ${g.example}`,
    );
  }
  if (conflicts.length) {
    console.error(
      `\n${conflicts.length} group(s) WITHHELD — the prefix also matches ` +
        `checkable links (not under data-proofer-ignore); narrow these by hand:`,
    );
    for (const g of conflicts) {
      console.error(
        `  ^${escapeRegex(g.prefix)}  would also skip ${g.conflicts.length} ` +
          `checkable link(s), e.g. ${g.conflicts[0]}`,
      );
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) mainCLI();
