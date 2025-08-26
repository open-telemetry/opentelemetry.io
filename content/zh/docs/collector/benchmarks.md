---
title: 基准测试
weight: 99
default_lang_commit: 179f03bf118e1e8a3cc195ab56fc09d85c476394
---

<link rel="stylesheet" href="/css/benchmarks.css">

OpenTelemetry Collector 会在每次提交到
[opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/)
仓库时运行负载测试。这些负载测试会使用不同的配置选项运行 Collector 的可执行文件，并通过 Collector
发送流量。有关测试环境的更多信息，请参阅该[仓库](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/testbed#opentelemetry-collector-testbed)。

下文展示了部分测试结果。若要查看所有测试结果，请访问
[Collector Benchmarks](https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/)。

<!-- markdownlint-disable -->

<div class="container">
  <main id="main"></main>
</div>

<footer>
  <button id="dl-button">下载数据为 JSON</button>
  <div class="spacer"></div>
  <div class="small">由 <a rel="noopener" href="https://github.com/marketplace/actions/continuous-benchmark">github-action-benchmark</a> 提供支持</div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.2/dist/Chart.min.js"></script>
<script src="https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/data.js"></script>
<script id="main-script">
  'use strict';
  (function () {
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
        const byGroup = new Map();
        const commitIds = [];
        for (const entry of entries) {
          const { commit, date, tool, benches } = entry;
          const commitId = commit.id.slice(0, 7);
          commitIds.push(commitId);
          for (const bench of benches) {
            const result = { commit, date, tool, bench };
            if (!bench.extra.includes("10kDPS") && !bench.extra.includes("10kSPS")){
              continue
            }
            const extraParts = bench.extra.split("/");
            let benchmarkName = extraParts[0] + " - " + bench.name;
            let byName = byGroup.get(benchmarkName);
            if (byName === undefined) {
              byName = new Map();
              byGroup.set(benchmarkName, byName);
            }
            let extraName = bench.extra
            if (extraParts.length > 1) {
              extraName = extraParts[1].split(" - ")[0]
            }
            let byCommitId = byName.get(extraName);
            if (byCommitId === undefined) {
              byCommitId = new Map();
              byCommitId.set(commitId, result)
              byName.set(extraName, byCommitId);
            } else {
              byCommitId.set(commitId, result);
            }
          }
        }
        return {
          commitIds,
          byGroup
        };
      }

      const data = window.BENCHMARK_DATA;

      // 渲染页脚
      document.getElementById('dl-button').onclick = () => {
        const dataUrl = 'data:,' + JSON.stringify(data, null, 2);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'benchmark_data.json';
        a.click();
      };

      // 为图表准备数据点
      return Object.keys(data.entries).map(name => ({
        name,
        dataSet: collectBenchesPerTestCase(data.entries[name]),
      }));
    }

    function renderAllChars(dataSets) {

      function renderGraph(parent, name, commitIds, byName) {
        const chartTitle = document.createElement('h3');
        chartTitle.textContent = name;
        parent.append(chartTitle);

        const canvas = document.createElement('canvas');
        canvas.className = 'benchmark-chart';
        parent.appendChild(canvas);

        const results = [];
        for (const [name, byCommitId] of byName.entries()) {
          results.push({
            name,
            dataset: commitIds.map(commitId => byCommitId.get(commitId) ?? null)
          });
        }
        results.sort((a, b) => a.name.localeCompare(b.name));

        const data = {
          labels: commitIds,
          datasets: results.map(({ name, dataset }, index) => {
            const color = COLORS[index % COLORS.length];

            return {
              label: name,
              data: dataset.map(d => d?.bench.value ?? null),
              fill: false,
              borderColor: color,
              backgroundColor: color,
            };
          }),
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
                  labelString: results?.[0]?.dataset.find(d => d !== null)?.bench.unit ?? '',
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
                const { datasetIndex, index } = items[0];
                const data = results[datasetIndex].dataset[index];
                return '\n' + data.commit.message + '\n\n' + data.commit.timestamp + ' committed by @' + data.commit.author.username + '\n';
              },
              label: item => {
                const { datasetIndex, index, value } = item;
                const { name, dataset } = results[datasetIndex];
                const { range, unit } = dataset[index].bench;
                let label = `${name}: ${value}`;
                label += unit;
                if (range) {
                  label += '（' + range + '）';
                }
                return label;
              },
            }
          },
          legend: {
            display: true,
            position: "right"
          }
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

      const main = document.getElementById('main');
      for (const { name, dataSet } of dataSets) {
        renderBenchSet(name, dataSet, main);
      }
    }

    renderAllChars(init()); // 启动渲染
  })();
</script>
