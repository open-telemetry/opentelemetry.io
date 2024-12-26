---
title: Сигнали
description: Дізнайтеся про категорії телеметрії, які підтримує OpenTelemetry
aliases:
  - /docs/concepts/data-sources
  - /docs/concepts/otel-concepts
weight: 11
---

Метою OpenTelemetry є збір, обробка та експорт **[сигналів][signals]**. Сигнали — це системний вивід, що описує основну активність операційної системи та Застосунків, що працюють на платформі. Сигнал може бути чимось, що ви хочете виміряти в конкретний момент часу, наприклад, температуру або використання памʼяті, або подією, яка проходить через компоненти вашої розподіленої системи, яку ви хочете відстежити. Ви можете групувати різні сигнали разом, щоб спостерігати за внутрішньою роботою тієї ж технології під різними кутами.

OpenTelemetry наразі підтримує [трейси](/docs/concepts/signals/traces), [метрики](/docs/concepts/signals/metrics), [логи](/docs/concepts/signals/logs) та [baggage](/docs/concepts/signals/baggage). _Події_ є специфічним типом
логування, а [_профілі_ наразі розробляються](https://github.com/open-telemetry/oteps/blob/main/text/profiles/0212-profiling-vision.md) Робочою групою з профілювання.

[signals]: /docs/specs/otel/glossary/#signals
