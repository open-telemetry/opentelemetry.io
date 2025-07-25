---
title: 共通脆弱性識別子 - CVEs
weight: 100
default_lang_commit: 179f03bf118e1e8a3cc195ab56fc09d85c476394
---

このページは[GitHubのOpenTelemetry Organization](https://github.com/open-telemetry/)上の全リポジトリで報告されたCVEsの一覧です。
元のデータは、[sig-security](https://github.com/open-telemetry/sig-security) リポジトリで管理され、日次で更新されます。

<table id="cve-table">
  <thead>
    <tr>
      <th>CVE ID</th>
      <th>概要</th>
      <th>重大度</th>
      <th>リポジトリ</th>
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
        // cell4.textContent = item['repo'];
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
