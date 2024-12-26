---
title: Розширення інструментацій за допомогою API
linkTitle: Розширення за допомогою API
description: Використовуйте OpenTelemetry API разом з Java-агентом для розширення автоматично згенерованої телеметрії власними відрізками та метриками
weight: 21
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

## Вступ {#introduction}

На додачу до інструментації, що працює з коробки, ви можете розширити Java-агент власною ручною інструментацією за допомогою OpenTelemetry API. Це дозволяє вам створювати [відрізки](/docs/concepts/signals/traces/#spans) та [метрики](/docs/concepts/signals/metrics) для вашого власного коду без внесення
значних змін до коду.

## Залежності {#dependencies}

Додайте залежність від бібліотеки `opentelemetry-api`.

### Maven {#maven}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

### Gradle {#gradle}

```groovy
dependencies {
    implementation('io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}')
}
```

## OpenTelemetry {#opentelemetry}

Java-агент є особливим випадком, де `GlobalOpenTelemetry` встановлюється агентом. Просто викличте `GlobalOpenTelemetry.getOrNoop()` для доступу до екземпляра `OpenTelemetry`.

## Відрізок {#span}

> [!NOTE]
>
> Для найпоширеніших випадків використання замість ручної інструментації використовуйте анотацію `@WithSpan`. Дивіться розділ [Анотації](../annotations) для отримання додаткової інформації.

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

Tracer tracer = GlobalOpenTelemetry.getTracer("application");
```

Використовуйте `Tracer` для створення відрізка, як пояснено в розділі [Відрізок](/docs/languages/java/api/#span).

Повний приклад можна знайти в [репозиторії з прикладами].

## Meter {#meter}

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

Meter meter = GlobalOpenTelemetry.getMeter("application");
```

Використовуйте `Meter` для створення лічильника, датчика або гістограми, як пояснено в розділі [Meter](/docs/languages/java/api/#meter).

Повний приклад можна знайти в [репозиторії з прикладами][example repository].

[example repository]: https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent
