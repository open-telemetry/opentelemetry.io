// Chart renderer of the `benchmarks` shortcode, docs:
// https://opentelemetry.io/site/implementation/plugins-and-scripts/#benchmarks
//
// Assumes these globals, loaded before this runs:
//
// - `Chart`: Chart.js 4 (the plugin's companion)
// - `window.BENCHMARK_DATA`: a github-action-benchmark data.js (the companion)
// - `bootstrap`: Bootstrap's bundle, for the commit popover (Docsy's main
//   bundle)
//
// Class names are the stock renderer's; ours carry the `otel-` prefix.

'use strict';

// Widest a right-hand legend may grow; the plot keeps the rest.
const LEGEND_MAX_WIDTH = 260;

// Labels past this length wrap at their ` - ` separator: the cap above would
// clip them (`Trace10kSPSJaegerGRPC - Dropped Span Count`).
const LEGEND_WRAP_LENGTH = 28;
const legendLines = (label) =>
  label.length > LEGEND_WRAP_LENGTH ? label.split(' - ') : [label];

// A chart's height at its narrowest: a row per legend line plus the axes'
// room, never shallower than the stock 2:1 shape.
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
const shortId = (commit) => commit.id.slice(0, 7);
const parseUrl = (text) => {
  try {
    return new URL(text);
  } catch {
    return null;
  }
};

// One commit popover at a time: clicking a point opens it, a click anywhere
// else, Escape, or a chart resize closes it. Its content is built as DOM, the
// commit being remote data.
let openPopover = null;

function closePopover() {
  if (!openPopover) return;
  const { popover, anchor, chart } = openPopover;
  openPopover = null;
  popover.dispose();
  anchor.remove();
  chart.options.plugins.tooltip.enabled = true;
  chart.update('none');
}

function openCommitPopover(chart, wrapper, point, commit) {
  closePopover();
  if (!window.bootstrap?.Popover) return;

  const anchor = document.createElement('span');
  anchor.className = 'otel-point-anchor';
  anchor.style.left = `${point.x}px`;
  anchor.style.top = `${point.y}px`;
  wrapper.appendChild(anchor);

  // No words of ours in the popover (the page has no i18n keys): the commit's
  // subject as the link, its short id, its date and author.
  const content = document.createElement('div');
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
  content.append(subject, ` - ${shortId(commit)}`);
  const meta = document.createElement('div');
  meta.className = 'small text-body-secondary';
  meta.textContent = `${commit.timestamp.slice(0, 10)} · @${
    commit.author.username ?? commit.author.name
  }`;
  content.appendChild(meta);

  const popover = new bootstrap.Popover(anchor, {
    html: true,
    trigger: 'manual',
    placement: 'top',
    content,
  });
  popover.show();
  openPopover = { popover, anchor, chart };
  // The canvas tooltip would sit under the popover (a tap leaves it up).
  chart.options.plugins.tooltip.enabled = false;
  chart.update('none');
}

document.addEventListener(
  'click',
  (event) => {
    if (!openPopover) return;
    const tip = document.getElementById(
      openPopover.anchor.getAttribute('aria-describedby') ?? '',
    );
    if (!tip?.contains(event.target)) closePopover();
  },
  true,
);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePopover();
});

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

function init() {
  function collectBenchesPerTestCase(entries) {
    const byGroup = new Map();
    const commitIds = [];
    for (const entry of entries) {
      const { commit, date, tool, benches } = entry;
      const commitId = commit.id.slice(0, 7);
      commitIds.push(commitId);
      for (const bench of benches) {
        const result = { commit, date, tool, bench };
        if (
          !bench.extra.includes('10kDPS') &&
          !bench.extra.includes('10kSPS')
        ) {
          continue;
        }
        const extraParts = bench.extra.split('/');
        let benchmarkName = extraParts[0] + ' - ' + bench.name;
        let byName = byGroup.get(benchmarkName);
        if (byName === undefined) {
          byName = new Map();
          byGroup.set(benchmarkName, byName);
        }
        let extraName = bench.extra;
        if (extraParts.length > 1) {
          extraName = extraParts[1].split(' - ')[0];
        }
        let byCommitId = byName.get(extraName);
        if (byCommitId === undefined) {
          byCommitId = new Map();
          byCommitId.set(commitId, result);
          byName.set(extraName, byCommitId);
        } else {
          byCommitId.set(commitId, result);
        }
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
  function renderGraph(parent, name, commitIds, byName) {
    const chartTitle = document.createElement('h3');
    chartTitle.textContent = name;
    parent.append(chartTitle);

    // Chart.js fills its parent, so the box owns the size: the minimum width
    // and the aspect ratio sit on an inner box, and the outer one scrolls.
    const scroller = document.createElement('div');
    scroller.className = 'otel-chart-scroller';
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
      // A point opens its commit's popover; the cursor says so.
      onHover: (event, elements) => {
        event.native.target.style.cursor = elements.length ? 'pointer' : '';
      },
      onClick: (event, elements, chart) => {
        if (!elements.length) return;
        const { datasetIndex, index } = elements[0];
        openCommitPopover(
          chart,
          wrapper,
          chart.getDatasetMeta(datasetIndex).data[index],
          datasets[datasetIndex].data[index].result.commit,
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
          footerMarginTop: 10,
          callbacks: {
            title: () => '',
            // The commit's subject and short id; its body is PR-body length.
            footer: (items) => {
              const { commit } = items[0].raw.result;
              return [
                ...wrapLine(`${subjectOf(commit)} - ${shortId(commit)}`),
                'Click the point for the commit link',
              ];
            },
            label: (item) => {
              const { range, unit } = item.raw.result.bench;
              let label = `${item.dataset.label}: ${item.formattedValue}`;
              label += unit;
              if (range) {
                label += ' (' + range + ')';
              }
              return label;
            },
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

  const main = document.querySelector('[data-otel-benchmarks]');
  for (const { name, dataSet } of dataSets) {
    renderBenchSet(name, dataSet, main);
  }
}

renderAllCharts(init());
