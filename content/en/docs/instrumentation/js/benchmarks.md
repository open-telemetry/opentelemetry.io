---
title: Benchmarks
weight: 99
---

 <style>

    main {
      margin: 8px;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    button {
      color: #fff;
      background-color: #3298dc;
      border-color: transparent;
      cursor: pointer;
      text-align: center;
    }

    button:hover {
      background-color: #2793da;
      flex: none;
    }

    .spacer {
      flex: auto;
    }

    .small {
      font-size: 0.75rem;
    }

    footer {
      margin-top: 16px;
      display: flex;
      align-items: center;
    }

    .benchmark-set {
      margin: 8px 0;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .benchmark-title {
      font-size: 3rem;
      font-weight: 600;
      word-break: break-word;
      text-align: center;
    }

    .benchmark-graphs {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      flex-wrap: wrap;
      width: 100%;
    }

    .benchmark-chart {
      max-width: 1000px;
    }

    div.container {
      max-width: 1012px;
      margin-right: auto;
      margin-left: auto;
    }
  </style>

The OpenTelemetry JavaScript SDK runs benchmark tests on every commit to the
[opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js/)
repository. The intent of these tests is to track performance trend of critical
operations over time. These test are not a replacement for end-to-end
performance testing.

  <div class="container">
    <main id="main"></main>
  </div>

  <footer>
    <button id="dl-button">Download data as JSON</button>
    <div class="spacer"></div>
    <div class="small">Powered by <a rel="noopener"
        href="https://github.com/marketplace/actions/continuous-benchmark">github-action-benchmark</a></div>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.2/dist/Chart.min.js"></script>
  <script src="https://open-telemetry.github.io/opentelemetry-js/benchmarks/data.js"></script>
  <script id="main-script">
    'use strict';
    (function() {
      const COLORS = [
        "#48aaf9",
        "#8a3ef2",
        "#78eeda",
        "#d78000",
        "#1248b3",
        "#97dbfc",
        "#006174",
        "#00b6b6",
        "#854200",
        "#f3c8ad",
        "#410472",
      ];

      function init() {
        function collectBenchesPerTestCase(entries) {
          const map = new Map();
          for (const entry of entries) {
            const {commit, date, tool, benches} = entry;
            for (const bench of benches) {
              const result = { commit, date, tool, bench };
              const arr = map.get(bench.name);
              if (arr === undefined) {
                map.set(bench.name, [result]);
              } else {
                arr.push(result);
              }
            }
          }
          return map;
        }

        const data = window.BENCHMARK_DATA;

        // Render footer
        document.getElementById('dl-button').onclick = () => {
          const dataUrl = 'data:,' + JSON.stringify(data, null, 2);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'benchmark_data.json';
          a.click();
        };

        // Prepare data points for charts
        return Object.keys(data.entries).map(name => ({
          name,
          dataSet: collectBenchesPerTestCase(data.entries[name]),
        }));
      }

      function renderAllChars(dataSets) {

        function renderGraph(parent, name, dataset) {
          const chartTitle = document.createElement('h3');
          chartTitle.textContent = name;
          parent.append(chartTitle);

          const canvas = document.createElement('canvas');
          canvas.className = 'benchmark-chart';
          parent.appendChild(canvas);

          const color = COLORS[0];
          const data = {
            labels: dataset.map(d => d.commit.id.slice(0, 7)),
            datasets: [
              {
                label: name,
                data: dataset.map(d => d.bench.value),
                borderColor: color,
                backgroundColor: color + '60', // Add alpha for #rrggbbaa,
                fill: false
              }
            ],
          };
          const options = {
            scales: {
              xAxes: [
                {
                  scaleLabel: {
                    display: true,
                    labelString: 'commit',
                  },
                }
              ],
              yAxes: [
                {
                  scaleLabel: {
                    display: true,
                    labelString: dataset.length > 0 ? dataset[0].bench.unit : '',
                  },
                  ticks: {
                    beginAtZero: true,
                  }
                }
              ],
            },
            tooltips: {
              callbacks: {
                afterTitle: items => {
                  const {index} = items[0];
                  const data = dataset[index];
                  return '\n' + data.commit.message + '\n\n' + data.commit.timestamp + ' committed by @' + data.commit.committer.username + '\n';
                },
                label: item => {
                  let label = item.value;
                  const { range, unit } = dataset[item.index].bench;
                  label += ' ' + unit;
                  if (range) {
                    label += ' (' + range + ')';
                  }
                  return label;
                },
                afterLabel: item => {
                  const { extra } = dataset[item.index].bench;
                  return extra ? '\n' + extra : '';
                }
              }
            },
            onClick: (_mouseEvent, activeElems) => {
              if (activeElems.length === 0) {
                return;
              }
              // XXX: Undocumented. How can we know the index?
              const index = activeElems[0]._index;
              const url = dataset[index].commit.url;
              window.open(url, '_blank');
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

          for (const [benchName, benches] of benchSet.entries()) {
            renderGraph(graphsElem, benchName, benches)
          }
        }

        const main = document.getElementById('main');
        for (const {name, dataSet} of dataSets) {
          renderBenchSet(name, dataSet, main);
        }
      }

      renderAllChars(init()); // Start
    })();
  </script>
