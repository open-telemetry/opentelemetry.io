// Chart renderer of the `benchmarks` shortcode, docs:
// https://opentelemetry.io/site/implementation/plugins-and-scripts/#benchmarks
//
// Assumes these globals, loaded by the plugin's companion before this runs:
//
// - `Chart`: Chart.js
// - `window.BENCHMARK_DATA`: a github-action-benchmark data.js
//
// Class names are the stock renderer's; ours carry the `otel-` prefix.

'use strict';

import { closePopover, openPopover } from './otel-benchmarks/point-popover.js';

// Widest a right-hand legend may grow; the plot keeps the rest.
const LEGEND_MAX_WIDTH = 260;

// Labels past this length wrap at their ` - ` separator: the cap above would
// clip them (`Trace10kSPSJaegerGRPC - Dropped Span Count`).
const LEGEND_WRAP_LENGTH = 28;
const legendLines = (label) =>
  label.length > LEGEND_WRAP_LENGTH ? label.split(' - ') : [label];

const LEGEND_LINE_HEIGHT = 24;
const AXES_HEIGHT = 60;
const MAX_ASPECT_RATIO = 2;

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

const subjectOf = (commit) => commit.message.split('\n')[0];
// The value line, Chart.js's number formatting (three decimals), the unit,
// and the range when the data has one.
const valueLabel = (series, point, formatted) => {
  const { unit, range } = point.result.bench;
  return `${series}: ${formatted}${unit}${range ? ` (${range})` : ''}`;
};
const parseUrl = (text) => {
  try {
    return new URL(text);
  } catch {
    return null;
  }
};

// The popover's content: the value line, the commit's subject as the link,
// its date and author. No words of ours: the plugin defines no i18n keys.
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

const COLORS = [
  '#48aaf9',
  '#8a3ef2',
  '#78eeda',
  '#d78000',
  '#1248b3',
  '#97dbfc',
  '#006174',
  '#00b6b6',
  '#854200',
  '#f3c8ad',
  '#410472',
];

// How the page reads its data (the shortcode's `data-reading`): which benches
// to chart, and how `extra` names a chart's group and its series. Without a
// reading, each bench name is its own chart with one series, on the shared
// commit axis.
function init(reading) {
  const {
    filter,
    group_separator: groupSep,
    series_separator: seriesSep,
  } = reading;
  const charted = (bench) =>
    !filter || filter.some((token) => (bench.extra ?? '').includes(token));
  // `extra` as `GROUP<groupSep>SERIES<seriesSep>noise`; an `extra` without the
  // group separator is both group and series.
  const groupAndSeries = (bench) => {
    const extra = bench.extra ?? '';
    const at = extra.indexOf(groupSep);
    if (at < 0) return [extra, extra];
    const rest = extra.slice(at + groupSep.length);
    const end = seriesSep ? rest.indexOf(seriesSep) : -1;
    return [extra.slice(0, at), end < 0 ? rest : rest.slice(0, end)];
  };

  function collectBenchesPerTestCase(entries) {
    const byGroup = new Map();
    const commitIds = [];
    for (const entry of entries) {
      const { commit, date, tool, benches } = entry;
      const commitId = commit.id.slice(0, 7);
      commitIds.push(commitId);
      for (const bench of benches) {
        if (!charted(bench)) continue;
        const result = { commit, date, tool, bench };
        const [group, series] = groupSep
          ? groupAndSeries(bench)
          : ['', bench.name];
        const chartName = groupSep ? `${group} - ${bench.name}` : bench.name;
        let byName = byGroup.get(chartName);
        if (byName === undefined) {
          byName = new Map();
          byGroup.set(chartName, byName);
        }
        let byCommitId = byName.get(series);
        if (byCommitId === undefined) {
          byCommitId = new Map();
          byName.set(series, byCommitId);
        }
        byCommitId.set(commitId, result);
      }
    }
    return {
      commitIds,
      byGroup,
    };
  }

  const data = window.BENCHMARK_DATA;

  return Object.keys(data.entries).map((name) => ({
    name,
    dataSet: collectBenchesPerTestCase(data.entries[name]),
  }));
}

function renderAllCharts(dataSets) {
  const main = document.querySelector('[data-otel-benchmarks]');
  const bodyColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--bs-body-color')
    .trim();

  function renderGraph(parent, name, commitIds, byName) {
    const chartTitle = document.createElement('h3');
    chartTitle.textContent = name;
    parent.append(chartTitle);

    // Chart.js fills its parent, so the box owns the size: the minimum width
    // and the aspect ratio sit on an inner box, and the outer one scrolls. CSS
    // owns the ratio because Chart.js's own doesn't grow a chart back after a
    // shrink (chartjs/Chart.js#11005).
    const scroller = document.createElement('div');
    scroller.className = 'otel-chart-scroller';
    // The popover hangs off a point; panning the chart would leave it behind.
    scroller.addEventListener('scroll', closePopover);
    parent.appendChild(scroller);
    const wrapper = document.createElement('div');
    wrapper.className = 'otel-chart-wrapper';
    scroller.appendChild(wrapper);

    const canvas = document.createElement('canvas');
    canvas.className = 'benchmark-chart';
    wrapper.appendChild(canvas);

    // A point carries its result, which the tooltip reads back as `raw`.
    const datasets = [...byName.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, byCommitId], index) => {
        const color = COLORS[index % COLORS.length];

        return {
          label: name,
          data: commitIds.map((commitId) => {
            const result = byCommitId.get(commitId);
            return { x: commitId, y: result?.bench.value ?? null, result };
          }),
          borderColor: color,
          backgroundColor: color,
        };
      });

    const data = { labels: commitIds, datasets };

    // The chart at its narrowest (the stylesheet's minimum width) still fits
    // the legend's lines in one column: the stock 2:1 shape squeezes a long
    // legend into the plot on narrow screens.
    const minWidth =
      parseFloat(getComputedStyle(wrapper).minWidth) || wrapper.clientWidth;
    const legendLineCount = datasets.reduce(
      (n, { label }) => n + legendLines(label).length,
      0,
    );
    wrapper.style.aspectRatio = String(
      Math.min(
        MAX_ASPECT_RATIO,
        minWidth / (legendLineCount * LEGEND_LINE_HEIGHT + AXES_HEIGHT),
      ),
    );

    const options = {
      maintainAspectRatio: false,
      // The cursor and a hover ring mark points as clickable.
      onHover: (event, elements) => {
        event.native.target.style.cursor = elements.length ? 'pointer' : '';
      },
      elements: {
        point: {
          hoverRadius: 6,
          hoverBorderWidth: 2,
          hoverBorderColor: bodyColor,
        },
      },
      onClick: (event, elements, chart) => {
        if (!elements.length) return;
        const { datasetIndex, index } = elements[0];
        const point = datasets[datasetIndex].data[index];
        openPopover(
          chart,
          wrapper,
          chart.getDatasetMeta(datasetIndex).data[index],
          commitContent(
            point.result.commit,
            valueLabel(
              datasets[datasetIndex].label,
              point,
              chart.scales.y.getLabelForValue(point.y),
            ),
          ),
        );
      },
      onResize: closePopover,
      scales: {
        x: {
          title: {
            display: true,
            text: 'commit',
          },
        },
        y: {
          title: {
            display: true,
            text:
              datasets[0]?.data.find((p) => p.result)?.result.bench.unit ?? '',
          },
          beginAtZero: true,
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: () => '',
            // The commit's body is PR-body length; only its subject fits.
            afterBody: (items) =>
              wrapLine(subjectOf(items[0].raw.result.commit)),
            label: (item) =>
              valueLabel(item.dataset.label, item.raw, item.formattedValue),
          },
        },
        legend: {
          display: true,
          position: 'right',
          maxWidth: LEGEND_MAX_WIDTH,
          labels: {
            generateLabels: (chart) =>
              Chart.defaults.plugins.legend.labels
                .generateLabels(chart)
                .map((item) => {
                  const lines = legendLines(item.text);
                  return lines.length > 1 ? { ...item, text: lines } : item;
                }),
          },
        },
      },
    };

    new Chart(canvas, {
      type: 'line',
      data,
      options,
    });
  }

  function renderBenchSet(name, benchSet, main) {
    const setElem = document.createElement('div');
    setElem.className = 'benchmark-set';
    main.appendChild(setElem);

    const graphsElem = document.createElement('div');
    graphsElem.className = 'benchmark-graphs';
    setElem.appendChild(graphsElem);

    const { commitIds, byGroup } = benchSet;
    const groups = [];
    for (const [name, byName] of byGroup.entries()) {
      groups.push({ name, byName });
    }
    groups.sort((a, b) => a.name.localeCompare(b.name));

    for (const { name, byName } of groups) {
      renderGraph(graphsElem, name, commitIds, byName);
    }
  }

  for (const { name, dataSet } of dataSets) {
    renderBenchSet(name, dataSet, main);
  }
}

const container = document.querySelector('[data-otel-benchmarks]');
renderAllCharts(init(JSON.parse(container.dataset.reading)));
