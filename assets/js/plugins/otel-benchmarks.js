// Chart renderer of the `benchmarks` shortcode, docs:
// https://opentelemetry.io/site/implementation/plugins-and-scripts/#benchmarks
//
// Assumes these globals, loaded by the plugin's companion before this runs:
//
// - `Chart`: Chart.js 4
// - `window.BENCHMARK_DATA`: a github-action-benchmark data.js
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
            // The commit's message runs to PR-body length, so it follows the
            // value rather than pushing it off the canvas.
            footer: (items) => {
              const { commit } = items[0].raw.result;
              return (
                '\n' +
                commit.message +
                '\n\n' +
                commit.timestamp +
                ' committed by @' +
                commit.author.username
              );
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
