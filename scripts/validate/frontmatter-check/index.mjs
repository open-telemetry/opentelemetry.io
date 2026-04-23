#!/usr/bin/env node
// Frontmatter validation hook for OTel blog posts.
// Fires on Write/Edit tool calls targeting content/en/blog/**/*.md files.
// Reads TOOL_INPUT from stdin (JSON with file_path and content/new_string).

const BLOG_PATH_RE = /content\/en\/blog\/.*\.md$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const AUTHOR_LINK_RE = /^["']?\[[^\]]+\]\(https?:\/\/[^)]+\)["']?$/;
const AUTHOR_BLOCK_SCALAR_RE = /^[>|][-+]?$/;

export function validate({ filePath, content }) {
  if (!filePath || !BLOG_PATH_RE.test(filePath)) return [];
  if (!content || !content.startsWith('---')) return [];

  const lines = content.split('\n');
  if (lines[0] !== '---') return [];
  const endIdx = lines.indexOf('---', 1);
  if (endIdx === -1) return [];

  const frontmatter = lines.slice(1, endIdx);
  const body = lines.slice(endIdx + 1).join('\n');
  const errors = [];

  const find = (key) => frontmatter.find((l) => l.startsWith(`${key}:`));
  const valueOf = (key) => {
    const line = find(key);
    if (!line) return null;
    return line.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '');
  };

  for (const field of ['title', 'date', 'author']) {
    if (!find(field)) errors.push(`Missing required frontmatter field: ${field}`);
  }

  if (!find('linkTitle')) {
    errors.push('Missing required frontmatter field: linkTitle');
  } else if (!valueOf('linkTitle')) {
    errors.push('Required frontmatter field linkTitle must be non-empty');
  }

  const date = valueOf('date');
  if (date && !DATE_RE.test(date)) {
    errors.push(`Date format must be YYYY-MM-DD, got: ${date}`);
  }

  const authorLine = find('author');
  if (authorLine) {
    const raw = authorLine.slice('author:'.length).trim();
    if (raw && !AUTHOR_BLOCK_SCALAR_RE.test(raw) && !AUTHOR_LINK_RE.test(raw)) {
      errors.push(
        'Author should be a Markdown link like [First Last](https://github.com/username), optionally quoted, or use YAML block scalar form for multi-author entries',
      );
    }
  }

  if (/^# [^#]/m.test(body)) {
    errors.push('Blog posts must not use H1 (#) headings. Start with ## (H2) instead');
  }

  return errors;
}

async function readStdin() {
  if (process.stdin.isTTY) return '';
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  let input;
  try {
    input = await readStdin();
  } catch (e) {
    console.error(`frontmatter-check: failed to read stdin: ${e.message}`);
    process.exit(0);
  }
  if (!input.trim()) process.exit(0);

  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    console.error(`frontmatter-check: failed to parse TOOL_INPUT JSON: ${e.message}`);
    process.exit(0);
  }

  const filePath = data.file_path || '';
  const content = data.content ?? data.new_string ?? '';

  const errors = validate({ filePath, content });
  if (errors.length === 0) process.exit(0);

  console.log('OTel Blog Frontmatter Issues:');
  for (const err of errors) console.log(`  - ${err}`);
  process.exit(1);
}

// Run only when invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
