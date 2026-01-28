---
title: Загальні вразливості та експлойти (CVE)
weight: 100
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Це список зареєстрованих Загальних вразливостей та експлойтів (CVE) у всіх репозиторіях організації [OpenTelemetry на GitHub](https://github.com/open-telemetry/). Сирі дані зберігаються в репозиторії [sig-security](https://github.com/open-telemetry/sig-security) та оновлюються щодня.

<table id="cve-table">
  <thead>
    <tr>
      <th>ID CVE</th>
      <th>Короткий опис проблеми</th>
      <th>Серйозність</th>
      <th>Репозиторій</th>
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

      data.sort((a, b) => b.cve_id.localeCompare(a.cve_id));

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
