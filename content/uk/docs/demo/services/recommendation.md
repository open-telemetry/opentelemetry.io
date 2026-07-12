---
title: Сервіс рекомендацій
linkTitle: Рекомендації
aliases: [recommendationservice]
default_lang_commit: 02a20a6d2d0d94867d910d1753daf8b644baa6b1
cSpell:ignore: самоспостережуваності
---

Цей сервіс відповідає за отримання списку рекомендованих продуктів для користувача на основі наявних ідентифікаторів продуктів, які переглядає користувач.

[Сирці сервісу рекомендацій](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/recommendation/)

## Інструментування {#instrumentation}

Цей сервіс — застосунок Spring Boot 4, який використовує Spring gRPC для звʼязку. Він використовує [стартер OpenTelemetry для Spring Boot](/docs/zero-code/java/spring-boot-starter/), який налаштовує SDK OpenTelemetry та робить його доступним як bean `OpenTelemetry`, щоб показати альтернативу агенту Java. Експортні точки доступу, атрибути ресурсів та імʼя сервісу надходять зі стандартних змінних середовища `OTEL_*`.

Агент Java залишається стандартним вибором для застосунків Spring Boot, і [сервіс ad](../ad/) використовує його. Сторінка стартера пояснює, коли стартер підходить краще.

```groovy
implementation platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:${opentelemetryInstrumentationVersion}")
implementation "io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter"
```

## Трейси {#traces}

### Відрізки gRPC {#grpc-spans}

Стартер не інструментує gRPC, тому сервіс додає [бібліотеку інструментування gRPC](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/grpc-1.6/library/README.md) і реєструє свої перехоплювачі як глобальні перехоплювачі Spring gRPC. Це створює серверний відрізок `ListRecommendations` і клієнтський відрізок `ListProducts`, а також поширює контекст трасування до сервісу каталогу товарів.

```java
@Bean
GrpcTelemetry grpcTelemetry(OpenTelemetry openTelemetry) {
  return GrpcTelemetry.create(openTelemetry);
}

@Bean
@GlobalServerInterceptor
ServerInterceptor grpcTelemetryServerInterceptor(GrpcTelemetry grpcTelemetry) {
  return grpcTelemetry.createServerInterceptor();
}

@Bean
@GlobalClientInterceptor
ClientInterceptor grpcTelemetryClientInterceptor(GrpcTelemetry grpcTelemetry) {
  return grpcTelemetry.createClientInterceptor();
}
```

### Додавання атрибутів до поточного відрізка {#add-attributes-to-the-current-span}

Усередині обробника gRPC поточний відрізок — це серверний відрізок, створений перехоплювачем. У `listRecommendations` до нього додається атрибут.

```java
Span.current().setAttribute("demo.product.recommended.count", productIds.size());
```

### Створення нових відрізків {#create-new-spans}

Сервіс отримує `Tracer` з bean `OpenTelemetry`. Метод `getProductList` створює відрізок `get_product_list` за допомогою `spanBuilder`, поміщає його в контекст через `makeCurrent` і завершує його в блоці `finally`. Виняток записується у відрізок і встановлює його статус як помилку. Рекомендовані продукти записуються як атрибут масиву рядків `demo.product.filtered.list`.

```java
Tracer tracer = openTelemetry.getTracer("recommendation");

Span span = tracer.spanBuilder("get_product_list").startSpan();
try (Scope ignored = span.makeCurrent()) {
  ...
  span.setAttribute(FILTERED_LIST, recommended);
} catch (RuntimeException e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

## Метрики {#metrics}

### Ініціалізація метрик {#initializing-metrics}

Сервіс отримує `Meter` з того самого bean `OpenTelemetry` і будує свій лічильник.

```java
LongCounter recommendations =
    openTelemetry
        .getMeter("recommendation")
        .counterBuilder("demo.recommendation.requests")
        .setDescription("Counts the total number of given recommendations")
        .setUnit("{recommendation}")
        .build();
```

Кожен запит додає кількість продуктів, які він рекомендував.

```java
recommendations.add(productIds.size(), CATALOG_RECOMMENDATION);
```

### Поточні створювані метрики {#current-metrics-produced}

Зауважте, що всі наведені нижче назви метрик зʼявляються в Prometheus/Grafana з символами `.`, перетвореними на `_`.

#### Власні метрики {#custom-metrics}

- `demo.recommendation.requests`: Лічильник рекомендованих продуктів, з атрибутом `recommendation.type`, встановленим у `catalog`.

#### Автоінструментовані метрики {#auto-instrumented-metrics}

- [Метрики середовища виконання для JVM](/docs/specs/semconv/runtime/jvm-metrics/) від стартера. Вони показують зростання памʼяті, коли увімкнено прапорець функції `recommendationCacheFailure`.
- [Метрики затримки для RPC](/docs/specs/semconv/rpc/rpc-metrics/) від бібліотеки інструментування gRPC, як для серверних, так і для клієнтських викликів.
- [Метрики самоспостережуваності SDK](/docs/specs/semconv/otel/sdk-metrics/), оскільки сервіс встановлює `OTEL_EXPERIMENTAL_SDK_TELEMETRY_VERSION=latest`. Дивіться [Інфопанель самоспостережуваності](/docs/demo/self-observability-dashboard/).

## Логи {#logs}

Сервіс веде логи через SLF4J і Logback, стандартні для Spring Boot. Стартер сам встановлює доповнювач Logback для OpenTelemetry, тому сервісу не потрібна конфігурація логування. Записи логів експортуються через OTLP з ідентифікаторами трасування та відрізка активного відрізка.

```java
logger.info("Receive ListRecommendations for product ids:{}", productIds);
```
