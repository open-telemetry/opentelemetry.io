---
title: Розширення інструментації за допомогою API
linkTitle: Розширення за допомогою API
description: Використовуйте OpenTelemetry API разом зі Spring Boot starter для розширення автоматично згенерованої телеметрії власними відрізками та метриками
weight: 21
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

## Вступ {#introduction}

На додачу до вбудованої інструментації, ви можете розширити Spring starter власною ручною інструментацією за допомогою OpenTelemetry API. Це дозволяє створювати [відрізки](/docs/concepts/signals/traces/#spans) та [метрики](/docs/concepts/signals/metrics) для вашого власного коду без внесення значних змін до коду.

Необхідні залежності вже включені до Spring Boot starter.

## OpenTelemetry {#opentelemetry}

Spring Boot starter є особливим випадком, де `OpenTelemetry` доступний як Spring bean. Просто додайте `OpenTelemetry` у ваші Spring компоненти.

## Відрізок {#span}

> [!NOTE]
>
> Для найпоширеніших випадків використовуйте анотацію `@WithSpan` замість ручної інструментації. Дивіться [Анотації](../annotations) для отримання додаткової інформації.

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

@Controller
public class MyController {
  private final Tracer tracer;

  public MyController(OpenTelemetry openTelemetry) {
    this.tracer = openTelemetry.getTracer("application");
  }
}
```

Використовуйте `Tracer` для створення відрізка, як пояснено в розділі [Span](/docs/languages/java/api/#span).

Повний приклад можна знайти в [репозиторії з прикладами].

## Meter {#meter}

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

@Controller
public class MyController {
  private final Meter meter;

  public MyController(OpenTelemetry openTelemetry) {
    this.meter = openTelemetry.getMeter("application");
  }
}
```

Використовуйте `Meter` для створення лічильника, датчика або гістограми, як пояснено в розділі
[Meter](/docs/languages/java/api/#meter).

Повний приклад можна знайти в [репозиторії з прикладами][example repository].

[example repository]: https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native
