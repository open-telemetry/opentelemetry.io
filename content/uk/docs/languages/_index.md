---
title: API та SDK мов програмування
description:
  Інструментування коду OpenTelemetry підтримується для багатьох популярних мов
  програмування
weight: 250
aliases: [/docs/instrumentation]
redirects:
  - { from: /docs/instrumentation/*, to: ':splat' } # Only for `en`
  - { from: 'net/*', to: 'dotnet/:splat' }
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

[Інструментування][instrumentation] коду OpenTelemetry підтримується для мов, зазначених у таблиці [Статуси та випуски](#status-and-releases) нижче. Неофіційні реалізації для [інших мов](/docs/languages/other) також доступні. Ви можете знайти їх у [реєстрі](/ecosystem/registry/).

Для Go, .NET, PHP, Python, Java та JavaScript ви можете використовувати [рішення без коду](/docs/zero-code) для додавання інструментування до вашого застосунку без змін у коді.

Якщо ви використовуєте Kubernetes, ви можете використовувати [OpenTelemetry Operator для Kubernetes][otel-op] для [інʼєкції цих рішень без коду][zero-code] у ваш застосунок.

## Статуси та випуски {#status-and-releases}

Поточний статус основних функціональних компонентів OpenTelemetry наступний:

> [!WARNING]
>
> Незалежно від статусу API/SDK, якщо ваше інструментування залежить від [семантичних домовленостей][semconv], які позначені як [Експериментальні][Experimental] у [специфікація семантичних конвенцій][semconv-spec], ваш потік даних може підлягати **змінам, що порушують сумісність**.

[semconv]: /docs/concepts/semantic-conventions/
[Experimental]: /docs/specs/otel/document-status/
[semconv-spec]: /docs/specs/semconv/

{{% uk/telemetry-support-table " " %}}

## API довідники {#api-reference}

Спеціальні інтерес-групи (SIG), що реалізують API та SDK OpenTelemetry для конкретної мови, також публікують API довідники для розробників. Доступні наступні довідники:

{{% apidocs %}}

> [!NOTE]
>
> Вищезазначений список має псевдонім [`/api`](/api).

[zero-code]: /docs/platforms/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/platforms/kubernetes/operator/
