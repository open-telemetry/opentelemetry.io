// What a commit looks like in the charts: its subject line in the tooltip,
// and the popover's content (the point's value line, the subject as a link,
// date and author). No words of ours: the plugin defines no i18n keys. Design:
// https://opentelemetry.io/site/implementation/plugins-and-scripts/#benchmarks

export const subjectOf = (commit) => commit.message.split('\n')[0];

// The value line, Chart.js's number formatting (three decimals), the unit,
// and the range when the data has one.
export const valueLabel = (series, point, formatted) => {
  const { unit, range } = point.result.bench;
  return `${series}: ${formatted}${unit}${range ? ` (${range})` : ''}`;
};

// Canvas tooltips don't wrap text, and commit subjects run to 130 characters.
const TOOLTIP_LINE_LENGTH = 60;
export const wrapLine = (text) => {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && line.length + 1 + word.length > TOOLTIP_LINE_LENGTH) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  return [...lines, line];
};

const parseUrl = (text) => {
  try {
    return new URL(text);
  } catch {
    return null;
  }
};

export function commitContent(commit, valueLabelText) {
  const content = document.createElement('div');
  const value = document.createElement('div');
  value.textContent = valueLabelText;
  content.appendChild(value);
  const url = parseUrl(commit.url);
  const subject = document.createElement(
    url?.protocol === 'https:' ? 'a' : 'span',
  );
  if (subject.tagName === 'A') {
    subject.href = url;
    subject.target = '_blank';
    subject.rel = 'noopener';
  }
  subject.textContent = subjectOf(commit);
  content.append(subject);
  // The action's data types make the timestamp and the author's names optional.
  const who = commit.author.username
    ? `@${commit.author.username}`
    : commit.author.name;
  const meta = document.createElement('div');
  meta.className = 'small text-body-secondary';
  meta.textContent = [commit.timestamp?.slice(0, 10), who]
    .filter(Boolean)
    .join(' · ');
  content.appendChild(meta);
  return content;
}
