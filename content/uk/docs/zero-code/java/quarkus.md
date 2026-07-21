---
title: Інструментування Quarkus
linkTitle: Quarkus
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

[Quarkus](https://quarkus.io/) — це фреймворк з відкритим кодом, розроблений для допомоги розробникам програмного забезпечення у створенні ефективних хмарних застосунків як для JVM, так і для Quarkus native image застосунків.

Quarkus використовує розширення для забезпечення оптимізованої підтримки широкого спектра бібліотек. [Розширення Quarkus OpenTelemetry](https://quarkus.io/guides/opentelemetry) забезпечує:

- Інструментування "з коробки"
- Автоконфігурацію OpenTelemetry SDK, що підтримує майже всі системні властивості, визначені для [OpenTelemetry SDK](/docs/languages/java/configuration/)
- Експортер OTLP на основі [Vert.x](https://vertx.io/)
- Ті самі інструменти можна використовувати з native image застосунками, які не підтримуються агентом OpenTelemetry Java.

> [!NOTE]
>
> Інструментування Quarkus OpenTelemetry підтримується спільнотою Quarkus. Для деталей дивіться [підтримку спільноти Quarkus](https://quarkus.io/support/).

Quarkus також можна інструментувати за допомогою [агента OpenTelemetry Java](../agent/), якщо ви не використовуєте застосунок з native image.

## Початок роботи {#getting-started}

Щоб увімкнути OpenTelemetry у вашому застосунку Quarkus, додайте залежність розширення `quarkus-opentelemetry` до вашого проєкту.

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-opentelemetry</artifactId>
</dependency>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
implementation("io.quarkus:quarkus-opentelemetry")
```

{{% /tab %}} {{< /tabpane>}}

Стандартно увімкнено лише сигнал **tracing**. Щоб увімкнути **metrics** та **logs**, додайте наступну конфігурацію до вашого файлу `application.properties`:

```properties
quarkus.otel.metrics.enabled=true
quarkus.otel.logs.enabled=true
```

Логування OpenTelemetry підтримується Quarkus 3.16.0+.

Для деталей щодо цих та інших параметрів конфігурації дивіться [довідник з конфігурації OpenTelemetry](https://quarkus.io/guides/opentelemetry#configuration-reference).

## Дізнатися більше {#learn-more}

- [Використання OpenTelemetry](https://quarkus.io/guides/opentelemetry), загальний довідник, що охоплює всі [параметри конфігурації](https://quarkus.io/guides/opentelemetry#configuration-reference)
- Посібники, специфічні для сигналів:
  - [Tracing](https://quarkus.io/guides/opentelemetry-tracing)
  - [Metrics](https://quarkus.io/guides/opentelemetry-metrics)
  - [Logs](https://quarkus.io/guides/opentelemetry-logging)
