---
title: Ресурси
weight: 70
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

## Вступ {#introduction}

{{% docs/languages/resources-intro %}}

Якщо ви використовуєте [Jaeger](https://www.jaegertracing.io/) як вашу систему спостереження, атрибути ресурсів групуються у вкладці **Process**:

![Скріншот з Jaeger, що показує приклад виводу атрибутів ресурсів, повʼязаних з трасуванням](screenshot-jaeger-resources.png)

Ресурс додається до `TraceProvider` або `MetricProvider`, коли вони створюються під час ініціалізації. Цю асоціацію не можна змінити пізніше. Після додавання ресурсу всі відрізки та метрики, створені з `Tracer` або `Meter` від провайдера, будуть мати асоційований з ними ресурс.

## Семантичні атрибути зі стандартними значенням, наданим SDK {#semantic-attributes-with-sdk-provided-defaults}

Існують атрибути, надані OpenTelemetry SDK. Один з них — це `service.name`, який представляє логічну назву сервісу.Стандартно, SDK призначить значення `unknown_service` для цього атрибуту, тому рекомендується встановити його явно, або в коді, або через встановлення змінної середовища `OTEL_SERVICE_NAME`.

Крім того, SDK також надає наступні атрибути ресурсів для самоідентифікації: `telemetry.sdk.name`, `telemetry.sdk.language` та `telemetry.sdk.version`.

## Детектори ресурсів {#resource-detectors}

Більшість SDK, специфічних для певних мов, надають набір детекторів ресурсів, які можна використовувати для автоматичного виявлення інформації про ресурси з середовища. Загальні детектори ресурсів включають:

- [Операційна система](/docs/specs/semconv/resource/os/)
- [Хост](/docs/specs/semconv/resource/host/)
- [Процес та середовище виконання процесу](/docs/specs/semconv/resource/process/)
- [Контейнер](/docs/specs/semconv/resource/container/)
- [Kubernetes](/docs/specs/semconv/resource/k8s/)
- [Атрибути, специфічні для хмарних провайдерів](/docs/specs/semconv/resource/#cloud-provider-specific-attributes)
- [та інші](/docs/specs/semconv/resource/)

## Власні ресурси {#custom-resources}

Ви також можете надати власні атрибути ресурсів. Ви можете надати їх або в коді, або через заповнення змінної середовища `OTEL_RESOURCE_ATTRIBUTES`. Якщо це можливо, використовуйте [семантичні домовленості для ваших атрибутів ресурсів](/docs/specs/semconv/resource). Наприклад, ви можете надати назву вашого [середовища розгортання](/docs/specs/semconv/resource/deployment-environment/) використовуючи `deployment.environment.name`:

```shell
env OTEL_RESOURCE_ATTRIBUTES=deployment.environment.name=production yourApp
```
