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

import { commitContent, subjectOf, valueLabel, wrapLine } from './commit.js';
import { aspectRatioFor, legendOptions } from './legend.js';
import { pointPopover } from './point-popover.js';

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

// The popover's body: the value as the y axis formats it, then the commit.
const popoverContent = (point, dataset, chart) =>
  commitContent(
    point.result.commit,
    valueLabel(dataset.label, point, chart.scales.y.getLabelForValue(point.y)),
  );

function renderAllCharts(dataSets) {
  const main = document.querySelector('[data-otel-benchmarks]');

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

    // Sized for the chart at its narrowest, the stylesheet's minimum width.
    const minWidth =
      parseFloat(getComputedStyle(wrapper).minWidth) || wrapper.clientWidth;
    wrapper.style.aspectRatio = String(
      aspectRatioFor(
        datasets.map((d) => d.label),
        minWidth,
      ),
    );

    const options = {
      maintainAspectRatio: false,
      ...pointPopover(wrapper, scroller, popoverContent),
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
        legend: legendOptions,
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
