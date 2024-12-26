---
title: JavaScript
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/JS_SDK.svg"
  alt="JavaScript"> Специфічна для мови реалізація OpenTelemetry на JavaScript (для Node.js та вебоглядачів).
aliases: [/js/metrics, /js/tracing, nodejs]
redirects:
  - { from: /js/*, to: ':splat' }
  - { from: /docs/js/*, to: ':splat' }
weight: 20
default_lang_commit: 89736e60c4973fddc295285eadb78af471366dc6
---

{{% docs/languages/index-intro js /%}}

{{% include browser-instrumentation-warning %}}

## Підтримка версій {#version-support}

OpenTelemetry JavaScript підтримує всі активні або підтримувані LTS версії Node.js. Попередні версії Node.js можуть працювати, але не тестуються OpenTelemetry.

OpenTelemetry JavaScript не має офіційного списку підтримуваних вебоглядачів. Він орієнтований на роботу з поточними підтримуваними версіями основних браузерів.

OpenTelemetry JavaScript слідує політиці підтримки DefinitelyType для TypeScript, яка встановлює вікно підтримки у 2 роки. Підтримка версій TypeScript, старших за 2 роки, буде припинена у мінорних релізах OpenTelemetry JavaScript.

Для отримання додаткової інформації про підтримку середовища виконання дивіться [цей огляд](https://github.com/open-telemetry/opentelemetry-js#supported-runtimes).

## Репозиторії {#repositories}

OpenTelemetry JavaScript складається з наступних репозиторіїв:

- [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js), основний репозиторій, що містить основний API та SDK.
- [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib), внески, які не є частиною основного розповсюдження API та SDK.

## Допомога або зворотній звʼязок {#help-or-feedback}

Якщо у вас є питання щодо OpenTelemetry JavaScript, будь ласка, звертайтеся через [GitHub Discussions](https://github.com/open-telemetry/opentelemetry-js/discussions) або канал [#otel-js] у [CNCF Slack](https://slack.cncf.io/).

Якщо ви хочете зробити внесок в OpenTelemetry JavaScript, дивіться [інструкції для внесків](https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md)
