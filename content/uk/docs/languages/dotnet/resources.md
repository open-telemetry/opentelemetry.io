---
title: Ресурси в OpenTelemetry .NET
linkTitle: Ресурси
description: Дізнайтеся про ресурси та способи їх використання в OpenTelemetry .NET
weight: 40
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: myhost pcarter uuidgen
---

{{% docs/languages/resources-intro %}}

## Що таке ресурси? {#what-are-resources}

В OpenTelemetry ресурс — це незмінне подання сутності, що продукує телеметрію. Наприклад, ресурс може представляти контейнер Kubernetes, процес Linux або Windows, або застосунок, що працює в межах процесу.

Ресурси є фундаментальною концепцією в OpenTelemetry, і вони використовуються для опису джерела телеметричних даних. Ця інформація є цінною для налагодження та аналізу телеметричних даних.

## Атрибути ресурсу {#resource-attributes}

Атрибути ресурсу — це пари ключ-значення, які надають метадані про ресурс. OpenTelemetry визначає набір [семантичних домовленостей](/docs/specs/semconv/resource/) для атрибутів ресурсу, які слід використовувати, коли це можливо.

Загальні атрибути ресурсу включають:

- `service.name`: Назва сервісу, що генерує телеметрію
- `service.version`: Версія сервісу
- `service.namespace`: Простір імен для сервісу
- `service.instance.id`: Унікальний ідентифікатор для екземпляра сервісу
- `host.name`: Назва хосту
- `deployment.environment`: Середовище розгортання (наприклад, production, staging)

## Налаштування {#setup}

Дотримуйтесь інструкцій у [Початок роботи][], щоб мати робочий .NET застосунок, який експортує дані до консолі.

## Додавання ресурсів за допомогою змінних середовища {#adding-resources-with-environment-variables}

Ви можете використовувати змінну середовища `OTEL_RESOURCE_ATTRIBUTES`, щоб додати ресурси до вашого застосунку. .NET SDK автоматично виявить ці ресурси.

Наступний приклад додає атрибути ресурсів [Service][], [Host][] та [OS][] за допомогою змінних середовища, виконуючи unix програми, такі як `uname`, для генерації даних ресурсу.

```console
$ env OTEL_RESOURCE_ATTRIBUTES="service.name=resource-tutorial-dotnet,service.namespace=tutorial,service.version=1.0,service.instance.id=`uuidgen`,host.name=`HOSTNAME`,host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" dotnet run

Activity.TraceId:          d1cbb7787440cc95b325835cb2ff8018
Activity.SpanId:           2ca007300fcb3068
Activity.TraceFlags:           Recorded
Activity.ActivitySourceName: tutorial-dotnet
Activity.DisplayName: SayHello
Activity.Kind:        Internal
Activity.StartTime:   2022-10-02T13:31:12.0175090Z
Activity.Duration:    00:00:00.0003920
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1,2,3]
Resource associated with Activity:
    service.name: resource-tutorial-dotnet
    service.namespace: tutorial
    service.version: 1.0
    service.instance.id: 93B14BAD-813D-48EE-9FB1-2ADFD07C5E78
    host.name: myhost
    host.type: arm64
    os.name: Darwin
    os.version: 21.6.0
```

## Додавання ресурсів у коді {#adding-resources-in-code}

Ви також можете додати власні ресурси у коді, приєднавши їх до `ResourceBuilder`.

Наступний приклад базується на [початковому прикладі] і додає два власні ресурси, `environment.name` та `team.name` у коді:

```csharp
using System.Diagnostics;
using System.Collections.Generic;

using OpenTelemetry;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;

var serviceName = "resource-tutorial-dotnet";
var serviceVersion = "1.0";

var resourceBuilder =
    ResourceBuilder
        .CreateDefault()
        .AddService(serviceName: serviceName, serviceVersion: serviceVersion)
        .AddAttributes(new Dictionary<string, object>
        {
            ["environment.name"] = "production",
            ["team.name"] = "backend"
        });

var sourceName = "tutorial-dotnet";

using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(sourceName)
    .SetResourceBuilder(resourceBuilder)
    .AddConsoleExporter()
    .Build();

var MyActivitySource = new ActivitySource(sourceName);

using var activity = MyActivitySource.StartActivity("SayHello");
activity?.SetTag("foo", 1);
activity?.SetTag("bar", "Hello, World!");
activity?.SetTag("baz", new int[] { 1, 2, 3 });
```

У цьому прикладі значення `service.name` та `service.version` також встановлюються у коді. Крім того, `service.instance.id` отримує стандартні значення.

Якщо ви виконаєте ту саму команду, що і в [Додавання ресурсів за допомогою змінних середовища](#adding-resources-with-environment-variables), але цього разу без `service.name`, `service.version` та `service.instance.id`, ви побачите ресурси `environment.name` та `team.name` у списку ресурсів:

```console
$ env OTEL_RESOURCE_ATTRIBUTES="service.namespace=tutorial,host.name=`HOSTNAME`,host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" dotnet run

Activity.TraceId:          d1cbb7787440cc95b325835cb2ff8018
Activity.SpanId:           2ca007300fcb3068
Activity.TraceFlags:           Recorded
Activity.ActivitySourceName: tutorial-dotnet
Activity.DisplayName: SayHello
Activity.Kind:        Internal
Activity.StartTime:   2022-10-02T13:31:12.0175090Z
Activity.Duration:    00:00:00.0003920
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1,2,3]
Resource associated with Activity:
    environment.name: production
    team.name: backend
    service.name: resource-tutorial-dotnet
    service.namespace: tutorial
    service.version: 1.0
    service.instance.id: 28976A1C-BF02-43CA-BAE0-6E0564431462
    host.name: pcarter
    host.type: arm64
    os.name: Darwin
    os.version: 21.6.0
```

**Примітка**: Якщо ви встановлюєте атрибути ресурсів як за допомогою змінних середовища, так і у коді, значення у коді мають пріоритет.

## Наступні кроки {#next-steps}

Є більше детекторів ресурсів, які ви можете додати до вашої конфігурації, наприклад, щоб отримати деталі про ваше [Cloud] середовище або [Deployment][].

[початок роботи]: /docs/languages/dotnet/getting-started/
[host]: /docs/specs/semconv/resource/host/
[cloud]: /docs/specs/semconv/resource/cloud/
[deployment]: /docs/specs/semconv/resource/deployment-environment/
[service]: /docs/specs/semconv/resource/#service
[os]: /docs/specs/semconv/resource/os/

## Дізнатись більше {#learn-more}

Для отримання додаткової інформації про ресурси в OpenTelemetry дивіться [Resources SDK specification](/docs/specs/otel/resource/sdk/).
