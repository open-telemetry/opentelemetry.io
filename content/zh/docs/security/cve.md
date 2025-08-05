---
title: 常见漏洞与暴露（CVE）
weight: 100
default_lang_commit: f35b3300574b428f94dfeeca970d93c5a6ddbf35
---

以下是 [OpenTelemetry GitHub 组织](https://github.com/open-telemetry/)中所有代码仓库已报告的
CVE 列表。原始数据存放在 [sig-security](https://github.com/open-telemetry/sig-security)
仓库中，并在每日更新。

<table id="cve-table">
  <thead>
    <tr>
      <th>CVE 编号</th>
      <th>问题摘要</th>
      <th>严重等级</th>
      <th>所属仓库</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>

<script id="main-script">
  'use strict';
  (function() {
    function fetchAndRender() {
      fetchData()
        .then(renderTable);
    }

    function fetchData() {
      var url = 'https://raw.githubusercontent.com/open-telemetry/sig-security/data-source/published_output.json';
      return fetch(url)
        .then(function(response) {
          return response.json();
        });
    }

    function renderTable(data) {
      var table = document.getElementById('cve-table').querySelector('tbody');

      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      data.forEach(item => {
        var row = table.insertRow();

        const cell1 = row.insertCell(0);
        const link = document.createElement('a');
        link.href = item['html_url'];
        link.target = '_blank';
        link.textContent = item['cve_id'];
        cell1.appendChild(link);

        const cell2 = row.insertCell(1);
        cell2.textContent = item['summary'];
        const cell3 = row.insertCell(2);
        cell3.textContent = item['severity'];

        const cell4 = row.insertCell(3);
        const link2 = document.createElement('a');
        link2.href = 'https://www.github.com/open-telemetry/' + item['repo'] + '/security/advisories';
        link2.target = '_blank';
        link2.textContent = item['repo'];
        cell4.appendChild(link2);
      });
    }

    fetchAndRender();
  })();
</script>
