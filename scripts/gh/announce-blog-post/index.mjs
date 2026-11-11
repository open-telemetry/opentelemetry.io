// Logic for the "Announce blog post" workflow: find the English blog post that
// a push published, and render its announcement file for
// open-telemetry/opentelemetry-announcements.

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

const isPublished = (content) =>
  content != null && parseFrontMatter(content).draft !== true;

/**
 * Returns the blog posts among `paths` that the push published: posts that
 * aren't drafts now, and were missing or drafts before the push. Edits of
 * published posts are ignored, so each post is announced once.
 *
 * @param {string[]} paths Files changed by the push.
 * @param {(path: string) => string | null} readBefore Content before the push.
 * @param {(path: string) => string | null} readAfter Content after the push.
 */
export function findPublishedPosts(paths, readBefore, readAfter) {
  return paths.filter(
    (path) =>
      parsePostPath(path) &&
      isPublished(readAfter(path)) &&
      !isPublished(readBefore(path)),
  );
}

/** Normalizes a front matter `date` (Date or string) to `YYYY-MM-DD`. */
function dayOf(date) {
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  return typeof date === 'string' ? date.slice(0, 10) : '';
}

/**
 * Builds the announcement file and pull request for a post, or returns null
 * if the post has `announcement: false`.
 *
 * @param {string} path Blog post path.
 * @param {object} frontMatter Parsed front matter of the post.
 * @param {string} today `YYYY-MM-DD` (UTC).
 */
export function buildAnnouncement(path, frontMatter, today) {
  const { year, slug } = parsePostPath(path);
  const { title, announcement, date } = frontMatter;

  if (announcement === false) return null;
  if (announcement != null && typeof announcement !== 'string') {
    throw new Error(`${path}: announcement must be a string or false`);
  }
  if (typeof title !== 'string' || !title) {
    throw new Error(`${path}: missing title`);
  }
  const day = dayOf(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error(`${path}: missing or invalid date`);
  }

  const url = `${SITE}/blog/${year}/${slug}/`;
  const link = `[${title}](${url})`;
  return {
    // Named after the post date, so re-runs produce the same file.
    file: `announcements/${day.slice(0, 4)}/${day.slice(5)}-blog-${slug}.yaml`,
    content:
      '# yaml-language-server: $schema=../../schema/announcement.schema.json\n' +
      dump(
        {
          subject: `New on the OpenTelemetry blog: ${title}`,
          text: `${announcement || title}\n\n${url}`,
        },
        { lineWidth: -1 },
      ),
    branch: `otelbot/announce-blog-${slug}`,
    title: `Announce blog post: ${title}`,
    body:
      day > today
        ? `${link} goes live on ${day}. Merge this PR on or after that day.`
        : link,
  };
}
