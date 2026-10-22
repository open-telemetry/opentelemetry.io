// Chart renderer of the `benchmarks` shortcode, docs:
// https://opentelemetry.io/site/implementation/plugins-and-scripts/#benchmarks
//
// Assumes these globals, loaded by the plugin's companion before this runs:
//
// - `Chart`: Chart.js
// - `window.BENCHMARK_DATA`: a github-action-benchmark data.js
//
// Class names are the stock renderer's; ours carry the `otel-` prefix.

import { popoverContent, tooltipOptions } from './commit.js';
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

// The shortcode's options, from the chart container's `data-otel-benchmarks`
// JSON: which benches to chart, and how `extra` names a chart's group and its
// series; without `group_separator`, each bench is its own chart with one
// series.
function init(options) {
  const {
    filter,
    group_separator: groupSep,
    series_separator: seriesSep,
  } = options;
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
      const { commit, benches } = entry;
      const commitId = commit.id.slice(0, 7);
      commitIds.push(commitId);
      for (const bench of benches) {
        if (!charted(bench)) continue;
        const result = { commit, bench };
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
    dataSet: collectBenchesPerTestCase(data.entries[name]),
    hasGroups: Boolean(groupSep),
  }));
}

function chartedCommitIds(commitIds, byName) {
  const charted = new Set();
  for (const byCommitId of byName.values()) {
    for (const commitId of byCommitId.keys()) charted.add(commitId);
  }
  return commitIds.filter((commitId) => charted.has(commitId));
}

function renderAllCharts(dataSets, main) {
  function renderGraph(parent, name, commitIds, byName, hasGroups) {
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
      aspectRatioFor(hasGroups ? datasets.map((d) => d.label) : [], minWidth),
    );

    const options = {
      maintainAspectRatio: false,
      ...pointPopover(wrapper, scroller, popoverContent(hasGroups)),
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
        // Options per chart: the popover toggles `enabled` on the chart's own
        // tooltip options, and Chart.js writes that through to this object.
        tooltip: tooltipOptions(hasGroups),
        // A lone bench's chart is titled by its name; a legend would only repeat it.
        legend: { ...legendOptions, display: hasGroups },
      },
    };

    new Chart(canvas, {
      type: 'line',
      data,
      options,
    });
  }

  function renderBenchSet(benchSet, hasGroups, main) {
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

    // A bench that joined the history late would draw mostly empty on the data
    // set's axis; grouped charts keep that axis so their series line up.
    for (const { name, byName } of groups) {
      renderGraph(
        graphsElem,
        name,
        hasGroups ? commitIds : chartedCommitIds(commitIds, byName),
        byName,
        hasGroups,
      );
    }
  }

  for (const { dataSet, hasGroups } of dataSets) {
    renderBenchSet(dataSet, hasGroups, main);
  }
}

for (const container of document.querySelectorAll('[data-otel-benchmarks]')) {
  renderAllCharts(
    init(JSON.parse(container.dataset.otelBenchmarks)),
    container,
  );
}
