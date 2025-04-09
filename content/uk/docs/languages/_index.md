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
---

[Інструментування][instrumentation] коду OpenTelemetry підтримується для мов, зазначених у таблиці [Статуси та випуски](#status-and-releases) нижче. Неофіційні реалізації для [інших мов](/docs/languages/other) також доступні. Ви можете знайти їх у [реєстрі](/ecosystem/registry/).

Для Go, .NET, PHP, Python, Java та JavaScript ви можете використовувати [рішення без коду](/docs/zero-code) для додавання інструментування до вашого застосунку без змін у коді.

Якщо ви використовуєте Kubernetes, ви можете використовувати [OpenTelemetry Operator для Kubernetes][otel-op] для [інʼєкції цих рішень без коду][zero-code] у ваш застосунок.

## Статуси та випуски {#status-and-releases}

Поточний статус основних функціональних компонентів OpenTelemetry наступний:

{{% alert title="Важливо" color="warning" %}}

Незалежно від статусу API/SDK, якщо ваше інструментування залежить від [семантичних домовленостей][семантичні конвенції], які позначені як [Експериментальні] у [специфікації семантичних домовленостей][специфікація семантичних конвенцій], ваш потік даних може підлягати **змінам, що порушують сумісність**.

[семантичні конвенції]: /docs/concepts/semantic-conventions/
[Експериментальні]: /docs/specs/otel/document-status/
[специфікація семантичних конвенцій]: /docs/specs/semconv/

{{% /alert %}}

{{% uk/telemetry-support-table " " %}}

## API довідники {#api-reference}

Спеціальні інтерес-групи (SIG), що реалізують API та SDK OpenTelemetry для конкретної мови, також публікують API довідники для розробників. Доступні наступні довідники:

{{% apidocs %}}

{{% alert title="Примітка" color="info" %}}

Вищезазначений список має псевдонім [`/api`](/api).

{{% /alert %}}

[zero-code]: /docs/platforms/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/platforms/kubernetes/operator/
