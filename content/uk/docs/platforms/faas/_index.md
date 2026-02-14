---
title: Функції як Сервіс
linkTitle: FaaS
description: >-
  OpenTelemetry підтримує різні методи моніторингу Функцій як Сервіс, що надаються різними хмарними постачальниками
redirects: [{ from: /docs/faas/*, to: ':splat' }] # cSpell:disable-line
default_lang_commit: edc67aafea1ead97b94ed4054d2c3248a34b0389
---

Функції як Сервіс (Functions as a Service, FaaS) є важливою безсерверною обчислювальною платформою для [хмарних нативних застосунків][cloud native apps]. Однак, особливості платформи зазвичай означають, що ці Застосунки мають трохи інші рекомендації та вимоги до моніторингу, ніж застосунки, що працюють на Kubernetes або віртуальних машинах.

Початковий обсяг документації FaaS охоплює Microsoft Azure, Google Cloud Platform (GCP) та Amazon Web Services (AWS). Функції AWS також відомі як Lambda.

## Ресурси спільноти {#community-resources}

Спільнота OpenTelemetry наразі надає попередньо зібрані шари Lambda, здатні автоматично інструментувати ваш застосунок, а також опцію окремого шару Collector Lambda, який можна використовувати при інструментуванні застосунків вручну або автоматично.

Статус випуску можна відстежувати в [репозиторії OpenTelemetry-Lambda](https://github.com/open-telemetry/opentelemetry-lambda).

[cloud native apps]: https://glossary.cncf.io/cloud-native-apps/
