// Pure logic for the "Announce blog post" workflow: find English blog posts
// that were published by a push and render announcement files for
// open-telemetry/opentelemetry-announcements. Side effects (git, filesystem)
// are injected so everything here is unit-testable.

import { dump, load } from 'js-yaml';

export const SITE = 'https://opentelemetry.io';
const POST_RE =
  /^content\/en\/blog\/(\d{4})\/([a-z0-9][a-z0-9._-]*)(\/index)?\.md$/;
const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

/** Returns `{ year, slug }` for an English blog post path, else null. */
export function parsePostPath(path) {
  const m = POST_RE.exec(path);
  return m ? { year: m[1], slug: m[2] } : null;
}

/** Parses YAML front matter; returns `{}` when there is none. */
export function parseFrontMatter(text) {
  const m = FRONT_MATTER_RE.exec(text);
  return (m && load(m[1])) || {};
}

/**
 * True if the post is missing or a draft. `readAt(path)` returns the file
 * content at the baseline revision, or null if the file didn't exist.
 */
function wasUnpublished(readAt, path) {
  const content = readAt(path);
  return content === null || parseFrontMatter(content).draft === true;
}

/** Normalizes a front matter `date` (Date or string) to `YYYY-MM-DD`. */
function dayOf(date) {
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  return typeof date === 'string' ? date.slice(0, 10) : '';
}

/**
 * Builds the announcement for one post.
 *
 * @returns {{ skip: string } | { slug, title, line, file, content }}
 */
export function buildAnnouncement({ path, frontMatter, today }) {
  const { year, slug } = parsePostPath(path);
  const { title, announcement, date } = frontMatter;

  if (announcement === false) return { skip: 'announcement: false' };
  if (announcement != null && typeof announcement !== 'string') {
    throw new Error(`${path}: announcement must be a string or false`);
  }
  if (typeof title !== 'string' || !title) {
    throw new Error(`${path}: missing title`);
  }

  const url = `${SITE}/blog/${year}/${slug}/`;
  const text = `${announcement || title}\n\n${url}`;
  const body = dump(
    { subject: `New on the OpenTelemetry blog: ${title}`, text },
    { lineWidth: -1 },
  );
  const goLive = dayOf(date);
  return {
    slug,
    title,
    line:
      goLive > today
        ? `- [${title}](${url}): goes live on ${goLive}, merge on or after that day`
        : `- [${title}](${url})`,
    file: `announcements/${today.slice(0, 4)}/${today.slice(5)}-blog-${slug}.yaml`,
    content:
      '# yaml-language-server: $schema=../../schema/announcement.schema.json\n' +
      body,
  };
}

/**
 * Finds the announcements for a push.
 *
 * @param {object} o
 * @param {string[]} o.posts Candidate file paths (changed files or explicit).
 * @param {boolean} o.explicit Announce `posts` regardless of their history.
 * @param {string} o.today `YYYY-MM-DD` (UTC).
 * @param {(path: string) => string | null} o.readCurrent Current content.
 * @param {(path: string) => string | null} o.readBefore Content before the
 *   push, or null if the file didn't exist.
 * @param {(msg: string) => void} [o.log]
 */
export function collectAnnouncements({
  posts,
  explicit,
  today,
  readCurrent,
  readBefore,
  log = () => {},
}) {
  const results = [];
  for (const path of posts) {
    const info = parsePostPath(path);
    if (!info) continue;
    const content = readCurrent(path);
    if (content === null) continue;

    const frontMatter = parseFrontMatter(content);
    if (frontMatter.draft === true) {
      log(`Skipping draft: ${path}`);
      continue;
    }
    if (!explicit) {
      // A page bundle and a single-file post are the same post.
      const { year, slug } = info;
      const siblings = [
        `content/en/blog/${year}/${slug}.md`,
        `content/en/blog/${year}/${slug}/index.md`,
      ];
      if (!siblings.every((p) => wasUnpublished(readBefore, p))) {
        log(`Already published before this push: ${path}`);
        continue;
      }
    }

    const result = buildAnnouncement({ path, frontMatter, today });
    if ('skip' in result) {
      log(`Skipping, ${result.skip}: ${path}`);
      continue;
    }
    results.push(result);
  }
  return results;
}

/** PR branch, title and body lines for a non-empty list of announcements. */
export function describePullRequest(announcements) {
  const [first] = announcements;
  return {
    branch: `otelbot/announce-blog-${first.slug}`,
    title:
      announcements.length === 1
        ? `Announce blog post: ${first.title}`
        : `Announce ${announcements.length} blog posts`,
    body: announcements.map((a) => a.line).join('\n'),
  };
}
