---
title: Common Vulnerabilities and Exposures
weight: 100
---

This is a list of reported Common Vulnerabilities and Exposures (CVEs) across
all repositories in the
[OpenTelemetry organization on GitHub](https://github.com/open-telemetry/). The
raw data is stored in the
[sig-security](https://github.com/open-telemetry/sig-security) repository, and
it is refreshed daily.

<table id="cve-table">
  <thead>
    <tr>
      <th>CVE ID</th>
      <th>Issue Summary</th>
      <th>Severity</th>
      <th>Repository</th>
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
