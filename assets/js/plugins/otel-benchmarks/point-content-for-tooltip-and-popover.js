// This module builds what a point shows when hovered or clicked, through two
// factories the renderer calls per chart:
//
// - `tooltipOptions(hasGroups)`: Chart.js `plugins.tooltip` options whose
//   lines are the point's value line and its commit's subject.
// - `popoverContent(hasGroups)`: the body of the click popover, the value line
//   then the commit's subject (linked), author and date.
//
// The value line is the number as Chart.js formats it, the unit, the range when
// the data has one and, with groups, the series name. Everything shown is the
// data's own text: the plugin adds no words, so it needs no i18n keys. Design:
// https://opentelemetry.io/site/implementation/plugins-and-scripts/#benchmarks

const subjectOf = (commit) => commit.message.split('\n')[0];

// `formatted` is Chart.js's own rendering of the value, so the popover shows
// the tooltip's number. A unit that starts with a letter or digit is spaced; a
// symbol such as `%` stays attached.
const valueLabel = (series, point, formatted) => {
  const { unit, range } = point.result.bench;
  const spaced = /^[\p{L}\p{N}]/u.test(unit ?? '') ? ` ${unit}` : (unit ?? '');
  const value = `${formatted}${spaced}${range ? ` (${range})` : ''}`;
  return series ? `${series}: ${value}` : value;
};

// Canvas tooltips don't wrap text, and commit subjects run well past one line.
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

// Chart.js `plugins.tooltip` options for one chart: the value line and the
// commit's subject. Without groups, a chart's one series is its title, so the
// value line names none.
export const tooltipOptions = (hasGroups) => ({
  callbacks: {
    title: () => '',
    // The commit's body is PR-body length; only its subject fits.
    afterBody: (items) => wrapLine(subjectOf(items[0].raw.result.commit)),
    label: (item) =>
      valueLabel(
        hasGroups ? item.dataset.label : '',
        item.raw,
        item.formattedValue,
      ),
  },
});

// The popover's body: the value as the y axis formats it, then the commit.
export const popoverContent = (hasGroups) => (point, dataset, chart) =>
  commitContent(
    point.result.commit,
    valueLabel(
      hasGroups ? dataset.label : '',
      point,
      chart.scales.y.getLabelForValue(point.y),
    ),
  );
