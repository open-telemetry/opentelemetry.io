---
title: Сигнали
description: Дізнайтеся про категорії телеметрії, які підтримує OpenTelemetry
aliases: [data-sources, otel-concepts]
weight: 11
default_lang_commit: b7589cf40b05480bc7a2022cf2dd36cc299904fa
---

Метою OpenTelemetry є збір, обробка та експорт [сигналів][signals]. Сигнали — це системний вивід, що описує основну активність операційної системи та Застосунків, що працюють на платформі. Сигнал може бути чимось, що ви хочете виміряти в конкретний момент часу, наприклад, температуру або використання памʼяті, або подією, яка проходить через компоненти вашої розподіленої системи, яку ви хочете відстежити. Ви можете групувати різні сигнали разом, щоб спостерігати за внутрішньою роботою тієї ж технології під різними кутами.

OpenTelemetry наразі підтримує:

- [Трейси](traces)
- [Метрики](metrics)
- [Логи](logs)
- [Baggage](baggage)

Також в процесі розробки або в стадії [розгляду пропозицій][proposal]:

- [Події][Events], є специфічним типом
  [логування](logs)
- [Профілі](profiles)

[Events]: /docs/specs/otel/logs/data-model/#events
[proposal]: https://github.com/open-telemetry/opentelemetry-specification/tree/main/oteps/#readme
[signals]: /docs/specs/otel/glossary/#signals
