// A commit as the charts show it: the tooltip's and the popover's content. No
// words of ours: the plugin defines no i18n keys. Design:
// https://opentelemetry.io/site/implementation/plugins-and-scripts/#benchmarks

const subjectOf = (commit) => commit.message.split('\n')[0];

// `formatted` is Chart.js's own rendering of the value, so the popover shows
// the tooltip's number.
const valueLabel = (series, point, formatted) => {
  const { unit, range } = point.result.bench;
  return `${series}: ${formatted}${unit}${range ? ` (${range})` : ''}`;
};

// Canvas tooltips don't wrap text, and commit subjects run to 130 characters.
const TOOLTIP_LINE_LENGTH = 60;
const wrapLine = (text) => {
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

function commitContent(commit, valueLabelText) {
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

// Chart.js `plugins.tooltip` options: the value line and the commit's subject.
export const tooltipOptions = {
  callbacks: {
    title: () => '',
    // The commit's body is PR-body length; only its subject fits.
    afterBody: (items) => wrapLine(subjectOf(items[0].raw.result.commit)),
    label: (item) =>
      valueLabel(item.dataset.label, item.raw, item.formattedValue),
  },
};

// The popover's body: the value as the y axis formats it, then the commit.
export const popoverContent = (point, dataset, chart) =>
  commitContent(
    point.result.commit,
    valueLabel(dataset.label, point, chart.scales.y.getLabelForValue(point.y)),
  );
