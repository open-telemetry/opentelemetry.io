---
title: Запис телеметрії за допомогою API
weight: 11
aliases: [/docs/languages/java/api-components]
logBridgeWarning: >-
  Хоча API `LoggerProvider` / `Logger` структурно схожі на еквівалентні API трасування та метрик, вони служать іншій меті. На даний момент, `LoggerProvider` / `Logger` та повʼязані класи представляють [Log Bridge API](/docs/specs/otel/logs/api/), який існує для написання доповнювачів логів для перенесення логів, записаних через інші лог-API / фреймворки, в OpenTelemetry. Вони не призначені для кінцевих користувачів як заміна для Log4j / SLF4J / Logback / тощо.
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: kotlint Logback updowncounter
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/api"?>

API — це набір класів та інтерфейсів для запису телеметрії через ключові сигнали спостережуваності. [SDK](../sdk/) — це вбудована референсна реалізація API, [налаштована](../configuration/) для обробки та експорту телеметрії. Ця сторінка є концептуальним оглядом API, включаючи описи, посилання на відповідні Javadocs, координати артефактів та приклади використання API.

API складається з наступних основних компонентів:

- [Context](#context-api): Автономний API для поширення контексту через застосунок та через межі застосунків, включаючи контекст трасування та baggage.
- [TracerProvider](#tracerprovider): Точка входу API для трасування.
- [MeterProvider](#meterprovider): Точка входу API для метрик.
- [LoggerProvider](#loggerprovider): Точка входу API для логів.
- [OpenTelemetry](#opentelemetry): Тримач для основних компонентів API (тобто `TracerProvider`, `MeterProvider`, `LoggerProvider`, `ContextPropagators`), який зручно передавати для інструментування.

API розроблений для підтримки кількох реалізацій. OpenTelemetry надає дві реалізації:

- [SDK](../sdk/) референсна реалізація. Це правильний вибір для більшості користувачів.
- [No-op](#no-op-implementation) реалізація. Мінімалістична, без залежностей реалізація для стандартного використання інструментами, коли користувач не встановлює екземпляр.

API розроблено таким чином, щоб бібліотеки, фреймворки та власники застосунків сприймали його як пряму залежність від бібліотек, фреймворків та застосунків. Він має [гарантії зворотної сумісності](https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#compatibility-requirements), нульові транзитивні залежності та [підтримує Java 8+](https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#language-version-compatibility). Бібліотеки та фреймворки повинні залежати лише від API та викликати методи лише з API, а також інструктувати застосунки / кінцевих користувачів додавати залежність від SDK та встановлювати налаштований екземпляр.

> [!NOTE] Javadoc
>
> Для довідки Javadoc всіх компонентів OpenTelemetry Java дивіться [javadoc.io/doc/io.opentelemetry](https://javadoc.io/doc/io.opentelemetry).

## Компоненти API {#api-components}

Наступні розділи описують API OpenTelemetry. Кожен розділ компонентів включає:

- Короткий опис, включаючи посилання на тип довідки Javadoc.
- Посилання на відповідні ресурси для розуміння методів та аргументів API.
- Просте дослідження використання API.

## API контексту {#context-api}

Артефакт `io.opentelemetry:opentelemetry-api-context:{{% param vers.otel %}}` містить автономні API (тобто упаковані окремо від [OpenTelemetry API](#opentelemetry-api)) для поширення контексту через застосунок та через межі застосунків.

Він складається з:

- [Context](#context): Незмінний набір пар ключ-значення, який неявно або явно поширюється через застосунок.
- [ContextStorage](#contextstorage): Механізм для зберігання та отримання поточного контексту, стандартно зберігається в локальному потоці.
- [ContextPropagators](#context): Контейнер зареєстрованих поширювачів для поширення `Context` через межі застосунків.

Артефакт `io.opentelemetry:opentelemetry-extension-kotlint:{{% param vers.otel %}}` є розширенням з інструментами для поширення контексту в підпрограмах.

### Контекст {#context}

[Context](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/Context.html) є незмінним набором пар ключ-значення з утилітами для неявного поширення крізь застосунок та крізь потоки. Неявне поширення означає, що контекст може бути доступний без явної передачі його як аргументу. Контекст є повторюваною концепцією в API OpenTelemetry:

- Поточний активний [Відрізок](#span) зберігається в контексті, і стандартно батько відрізку призначається тому, який зараз знаходиться в контексті.
- Вимірювання, записані в [інструменти вимірювання](#meter), приймають аргумент контексту, який використовується для звʼязування вимірювань з відрізками через [екземпляри](/docs/specs/otel/metrics/data-model/#exemplars) і типово призначається тому, який зараз знаходиться в контексті.
- [LogRecords](#logrecordbuilder) приймають аргумент контексту, який використовується для звʼязування лог-записів з відрізками і стандартно призначається тому, який зараз знаходиться в контексті.

Наступний фрагмент коду досліджує використання API `Context`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ContextUsage.java"?>
```java
package otel;

import io.opentelemetry.context.Context;
import io.opentelemetry.context.ContextKey;
import io.opentelemetry.context.Scope;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ContextUsage {
  public static void contextUsage() throws Exception {
    // Define an example context key
    ContextKey<String> exampleContextKey = ContextKey.named("example-context-key");

    // Context doesn't contain the key until we add it
    // Context.current() accesses the current context
    // output => current context value: null
    System.out.println("current context value: " + Context.current().get(exampleContextKey));

    // Add entry to context
    Context context = Context.current().with(exampleContextKey, "value");

    // The local context var contains the added value
    // output => context value: value
    System.out.println("context value: " + context.get(exampleContextKey));
    // The current context still doesn't contain the value
    // output => current context value: null
    System.out.println("current context value: " + Context.current().get(exampleContextKey));

    // Calling context.makeCurrent() sets Context.current() to the context until the scope is
    // closed, upon which Context.current() is restored to the state prior to when
    // context.makeCurrent() was called. The resulting Scope implements AutoCloseable and is
    // normally used in a try-with-resources block. Failure to call Scope.close() is an error and
    // may cause memory leaks or other issues.
    try (Scope scope = context.makeCurrent()) {
      // The current context now contains the added value
      // output => context value: value
      System.out.println("context value: " + Context.current().get(exampleContextKey));
    }

    // The local context var still contains the added value
    // output => context value: value
    System.out.println("context value: " + context.get(exampleContextKey));
    // The current context no longer contains the value
    // output => current context value: null
    System.out.println("current context value: " + Context.current().get(exampleContextKey));

    ExecutorService executorService = Executors.newSingleThreadExecutor();
    ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);

    // Context instances can be explicitly passed around application code, but it's more convenient
    // to use implicit context, calling Context.makeCurrent() and accessing via Context.current().
    // Context provides a number of utilities for implicit context propagation. These utilities wrap
    // utility classes like Scheduler, ExecutorService, ScheduledExecutorService, Runnable,
    // Callable, Consumer, Supplier, Function, etc and modify their behavior to call
    // Context.makeCurrent() before running.
    context.wrap(ContextUsage::callable).call();
    context.wrap(ContextUsage::runnable).run();
    context.wrap(executorService).submit(ContextUsage::runnable);
    context.wrap(scheduledExecutorService).schedule(ContextUsage::runnable, 1, TimeUnit.SECONDS);
    context.wrapConsumer(ContextUsage::consumer).accept(new Object());
    context.wrapConsumer(ContextUsage::biConsumer).accept(new Object(), new Object());
    context.wrapFunction(ContextUsage::function).apply(new Object());
    context.wrapSupplier(ContextUsage::supplier).get();
  }

  /** Example {@link java.util.concurrent.Callable}. */
  private static Object callable() {
    return new Object();
  }

  /** Example {@link Runnable}. */
  private static void runnable() {}

  /** Example {@link java.util.function.Consumer}. */
  private static void consumer(Object object) {}

  /** Example {@link java.util.function.BiConsumer}. */
  private static void biConsumer(Object object1, Object object2) {}

  /** Example {@link java.util.function.Function}. */
  private static Object function(Object object) {
    return object;
  }

  /** Example {@link java.util.function.Supplier}. */
  private static Object supplier() {
    return new Object();
  }
}
```
<!-- prettier-ignore-end -->

### ContextStorage

[ContextStorage](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/ContextStorage.html) є механізмом для зберігання та отримання поточного `Context`.

Реалізація `ContextStorage` стандартно зберігає `Context` в локальному потоці.

### ContextPropagators

[ContextPropagators](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/propagation/ContextPropagators.html) є контейнером зареєстрованих поширювачів для поширення `Context` через межі застосунків. Контекст вводиться в носій при виході з застосунку (тобто вихідний HTTP-запит) і витягується з носія при вході в застосунок (тобто обслуговування HTTP-запиту).

Дивіться [SDK TextMapPropagators](../sdk/#textmappropagator) для реалізацій поширювачів.

Наступний фрагмент коду досліджує API `ContextPropagators` для інʼєкції:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/InjectContextUsage.java"?>
```java
package otel;

import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.context.propagation.TextMapSetter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class InjectContextUsage {
  private static final TextMapSetter<HttpRequest.Builder> TEXT_MAP_SETTER = new HttpRequestSetter();

  public static void injectContextUsage() throws Exception {
    // Create a ContextPropagators instance which propagates w3c trace context and w3c baggage
    ContextPropagators propagators =
        ContextPropagators.create(
            TextMapPropagator.composite(
                W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));

    // Create an HttpRequest builder
    HttpClient httpClient = HttpClient.newBuilder().build();
    HttpRequest.Builder requestBuilder =
        HttpRequest.newBuilder().uri(new URI("http://127.0.0.1:8080/resource")).GET();

    // Given a ContextPropagators instance, inject the current context into the HTTP request carrier
    propagators.getTextMapPropagator().inject(Context.current(), requestBuilder, TEXT_MAP_SETTER);

    // Send the request with the injected context
    httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.discarding());
  }

  /** {@link TextMapSetter} with a {@link HttpRequest.Builder} carrier. */
  private static class HttpRequestSetter implements TextMapSetter<HttpRequest.Builder> {
    @Override
    public void set(HttpRequest.Builder carrier, String key, String value) {
      if (carrier == null) {
        return;
      }
      carrier.setHeader(key, value);
    }
  }
}
```
<!-- prettier-ignore-end -->

Наступний фрагмент коду досліджує API `ContextPropagators` для екстракції:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ExtractContextUsage.java"?>
```java
package otel;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.Scope;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapGetter;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.context.propagation.TextMapSetter;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class ExtractContextUsage {
  private static final TextMapGetter<HttpExchange> TEXT_MAP_GETTER = new HttpRequestGetter();

  public static void extractContextUsage() throws Exception {
    // Create a ContextPropagators instance which propagates w3c trace context and w3c baggage
    ContextPropagators propagators =
        ContextPropagators.create(
            TextMapPropagator.composite(
                W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));

    // Create a server, which uses the propagators to extract context from requests
    HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
    server.createContext("/path", new Handler(propagators));
    server.setExecutor(null);
    server.start();
  }

  private static class Handler implements HttpHandler {
    private final ContextPropagators contextPropagators;

    private Handler(ContextPropagators contextPropagators) {
      this.contextPropagators = contextPropagators;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
      // Extract the context from the request and make the context current
      Context extractedContext =
          contextPropagators
              .getTextMapPropagator()
              .extract(Context.current(), exchange, TEXT_MAP_GETTER);
      try (Scope scope = extractedContext.makeCurrent()) {
        // Do work with the extracted context
      } finally {
        String response = "success";
        exchange.sendResponseHeaders(200, response.length());
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes(StandardCharsets.UTF_8));
        os.close();
      }
    }
  }

  /** {@link TextMapSetter} with a {@link HttpExchange} carrier. */
  private static class HttpRequestGetter implements TextMapGetter<HttpExchange> {
    @Override
    public Iterable<String> keys(HttpExchange carrier) {
      return carrier.getRequestHeaders().keySet();
    }

    @Override
    public String get(HttpExchange carrier, String key) {
      if (carrier == null) {
        return null;
      }
      List<String> headers = carrier.getRequestHeaders().get(key);
      if (headers == null || headers.isEmpty()) {
        return null;
      }
      return headers.get(0);
    }
  }
}
```
<!-- prettier-ignore-end -->

## OpenTelemetry API

Артефакт `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}` містить API OpenTelemetry, включаючи трасування, метрики, логи, реалізацію no-op, baggage, ключові реалізації `TextMapPropagator` та залежність від [API контексту](#context-api).

### Провайдери та області дії {#providers-and-scopes}

Провайдери та області дії є повторюваними концепціями в API OpenTelemetry. Область дії — це логічна одиниця в застосунку, з якою повʼязана телеметрія. Провайдер надає компоненти для запису телеметрії відносно певної області:

- [TracerProvider](#tracerprovider) надає обмежені [Tracers](#tracer) для запису відрізків.
- [MeterProvider](#meterprovider) надає обмежені [Meters](#meter) для запису метрик.
- [LoggerProvider](#loggerprovider) надає обмежені [Loggers](#logger) для запису логів.

> [!WARNING]
>
> {{% param logBridgeWarning %}}

Область ідентифікується трійкою (імʼя, версія, schemaUrl). Потрібно бути обережним, щоб забезпечити унікальність ідентифікації області. Типовий підхід — встановити імʼя області дії на імʼя пакунка або повністю кваліфіковане імʼя класу, а версію області — на версію бібліотеки. Якщо генерується телеметрія для кількох сигналів (тобто метрики та трасування), слід використовувати ту саму область. Дивіться [інструментування області дії](/docs/concepts/instrumentation-scope/) для деталей.

Наступний фрагмент коду досліджує використання API провайдерів та областей дії:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ProvidersAndScopes.java"?>
```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.logs.Logger;
import io.opentelemetry.api.logs.LoggerProvider;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.metrics.MeterProvider;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.trace.TracerProvider;

public class ProvidersAndScopes {

  private static final String SCOPE_NAME = "fully.qualified.name";
  private static final String SCOPE_VERSION = "1.0.0";
  private static final String SCOPE_SCHEMA_URL = "https://example";

  public static void providersUsage(OpenTelemetry openTelemetry) {
    // Access providers from an OpenTelemetry instance
    TracerProvider tracerProvider = openTelemetry.getTracerProvider();
    MeterProvider meterProvider = openTelemetry.getMeterProvider();
    // NOTE: LoggerProvider is a special case and should only be used to bridge logs from other
    // logging APIs / frameworks into OpenTelemetry.
    LoggerProvider loggerProvider = openTelemetry.getLogsBridge();

    // Access tracer, meter, logger from providers to record telemetry for a particular scope
    Tracer tracer =
        tracerProvider
            .tracerBuilder(SCOPE_NAME)
            .setInstrumentationVersion(SCOPE_VERSION)
            .setSchemaUrl(SCOPE_SCHEMA_URL)
            .build();
    Meter meter =
        meterProvider
            .meterBuilder(SCOPE_NAME)
            .setInstrumentationVersion(SCOPE_VERSION)
            .setSchemaUrl(SCOPE_SCHEMA_URL)
            .build();
    Logger logger =
        loggerProvider
            .loggerBuilder(SCOPE_NAME)
            .setInstrumentationVersion(SCOPE_VERSION)
            .setSchemaUrl(SCOPE_SCHEMA_URL)
            .build();

    // ...optionally, shorthand versions are available if scope version and schemaUrl aren't
    // available
    tracer = tracerProvider.get(SCOPE_NAME);
    meter = meterProvider.get(SCOPE_NAME);
    logger = loggerProvider.get(SCOPE_NAME);
  }
}
```
<!-- prettier-ignore-end -->

### Атрибути {#attributes}

[Attributes](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/common/Attributes.html) є набором пар ключ-значення, що представляють [визначення атрибутів](/docs/specs/otel/common/#attribute). `Attributes` є повторюваною концепцією в API OpenTelemetry:

- [Відрізки](#span), події відрізків та посилання відрізків мають атрибути.
- Вимірювання, записані в [інструменти вимірювання](#meter), мають атрибути.
- [LogRecords](#logrecordbuilder) мають атрибути.

Дивіться [семантичні атрибути](#semantic-attributes) для констант атрибутів, згенерованих з семантичних домовленостей.

Дивіться [іменування атрибутів](/docs/specs/semconv/general/naming/) для керівництва з іменування атрибутів.

Наступний фрагмент коду досліджує використання API `Attributes`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AttributesUsage.java"?>
```java
package otel;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;
import java.util.Map;

public class AttributesUsage {
  // Establish static constant for attribute keys and reuse to avoid allocations
  private static final AttributeKey<String> SHOP_ID = AttributeKey.stringKey("com.acme.shop.id");
  private static final AttributeKey<String> SHOP_NAME =
      AttributeKey.stringKey("com.acme.shop.name");
  private static final AttributeKey<Long> CUSTOMER_ID =
      AttributeKey.longKey("com.acme.customer.id");
  private static final AttributeKey<String> CUSTOMER_NAME =
      AttributeKey.stringKey("com.acme.customer.name");

  public static void attributesUsage() {
    // Use a varargs initializer and pre-allocated attribute keys. This is the most efficient way to
    // create attributes.
    Attributes attributes =
        Attributes.of(
            SHOP_ID,
            "abc123",
            SHOP_NAME,
            "opentelemetry-demo",
            CUSTOMER_ID,
            123L,
            CUSTOMER_NAME,
            "Jack");

    // ...or use a builder.
    attributes =
        Attributes.builder()
            .put(SHOP_ID, "abc123")
            .put(SHOP_NAME, "opentelemetry-demo")
            .put(CUSTOMER_ID, 123)
            .put(CUSTOMER_NAME, "Jack")
            // Optionally initialize attribute keys on the fly
            .put(AttributeKey.stringKey("com.acme.string-key"), "value")
            .put(AttributeKey.booleanKey("com.acme.bool-key"), true)
            .put(AttributeKey.longKey("com.acme.long-key"), 1L)
            .put(AttributeKey.doubleKey("com.acme.double-key"), 1.1)
            .put(AttributeKey.stringArrayKey("com.acme.string-array-key"), "value1", "value2")
            .put(AttributeKey.booleanArrayKey("come.acme.bool-array-key"), true, false)
            .put(AttributeKey.longArrayKey("come.acme.long-array-key"), 1L, 2L)
            .put(AttributeKey.doubleArrayKey("come.acme.double-array-key"), 1.1, 2.2)
            // Optionally omit initializing AttributeKey
            .put("com.acme.string-key", "value")
            .put("com.acme.bool-key", true)
            .put("come.acme.long-key", 1L)
            .put("come.acme.double-key", 1.1)
            .put("come.acme.string-array-key", "value1", "value2")
            .put("come.acme.bool-array-key", true, false)
            .put("come.acme.long-array-key", 1L, 2L)
            .put("come.acme.double-array-key", 1.1, 2.2)
            .build();

    // Attributes has a variety of methods for manipulating and reading data.
    // Read an attribute key:
    String shopIdValue = attributes.get(SHOP_ID);
    // Inspect size:
    int size = attributes.size();
    boolean isEmpty = attributes.isEmpty();
    // Convert to a map representation:
    Map<AttributeKey<?>, Object> map = attributes.asMap();
    // Iterate through entries, printing each to the template: <key> (<type>): <value>\n
    attributes.forEach(
        (attributeKey, value) ->
            System.out.printf(
                "%s (%s): %s%n", attributeKey.getKey(), attributeKey.getType(), value));
    // Convert to a builder, remove the com.acme.customer.id and any entry whose key starts with
    // com.acme.shop, and build a new instance:
    AttributesBuilder builder = attributes.toBuilder();
    builder.remove(CUSTOMER_ID);
    builder.removeIf(attributeKey -> attributeKey.getKey().startsWith("com.acme.shop"));
    Attributes trimmedAttributes = builder.build();
  }
}
```
<!-- prettier-ignore-end -->

### OpenTelemetry

> [!NOTE] Spring Boot Starter
>
> Spring Boot-стартер — це особливий випадок, коли `OpenTelemetry` доступний як Spring-bean. Просто додайте `OpenTelemetry` .до ваших компонентів Spring.
>
> Дізнайтеся більше про [розширення Spring Boot-стартера за допомогою власного ручного інструментарію](/docs/zero-code/java/spring-boot-starter/api/).

[OpenTelemetry](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/OpenTelemetry.html) є тримачем для основних компонентів API, який зручно передавати для інструментування.

`OpenTelemetry` складається з:

- [TracerProvider](#tracerprovider): Точка входу API для трасування.
- [MeterProvider](#meterprovider): Точка входу API для метрик.
- [LoggerProvider](#loggerprovider): Точка входу API для логів.
- [ContextPropagators](#contextpropagators): Точка входу API для поширення контексту.

Наступний фрагмент коду досліджує використання API `OpenTelemetry`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OpenTelemetryUsage.java"?>
```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.logs.LoggerProvider;
import io.opentelemetry.api.metrics.MeterProvider;
import io.opentelemetry.api.trace.TracerProvider;
import io.opentelemetry.context.propagation.ContextPropagators;

public class OpenTelemetryUsage {
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void openTelemetryUsage(OpenTelemetry openTelemetry) {
    // Access TracerProvider, MeterProvider, LoggerProvider, ContextPropagators
    TracerProvider tracerProvider = openTelemetry.getTracerProvider();
    MeterProvider meterProvider = openTelemetry.getMeterProvider();
    LoggerProvider loggerProvider = openTelemetry.getLogsBridge();
    ContextPropagators propagators = openTelemetry.getPropagators();
  }
}
```
<!-- prettier-ignore-end -->

### GlobalOpenTelemetry

> [!NOTE] Java agent
>
> Java-агент є особливим випадком, коли `GlobalOpenTelemetry` встановлюється агентом. Просто викличте `GlobalOpenTelemetry.getOrNoop()`, щоб отримати доступ до екземпляру `OpenTelemetry`.
>
> Дізнайтеся більше про [розширення Java-агента за допомогою власного ручного інструментарію](/docs/zero-code/java/agent/api/).

[GlobalOpenTelemetry](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/GlobalOpenTelemetry.html) містить глобальний синглтон екземпляра [OpenTelemetry](#opentelemetry) .

`GlobalOpenTelemetry` розроблено таким чином, щоб уникнути проблем із порядком ініціалізації, тому його слід використовувати з обережністю. Зокрема, `GlobalOpenTelemetry.get()` завжди повертає однаковий результат, незалежно від того, чи було викликано `GlobalOpenTelemetry.set(..)`. Внутрішньо, якщо `get()` викликається перед `set()`, реалізація внутрішньо викликає `set(..)` з [реалізацією no-op](#no-op-implementation) і повертає його. Оскільки `set(..)` викликає виняток, якщо викликається більше одного разу, виклик `set(..)` після `get()` викликає виняток, а не тихо завершується з помилкою.

Агент Java є особливим випадком: `GlobalOpenTelemetry` є єдиним
механізмом для [нативної інструментації](../instrumentation/#native-instrumentation) та [ручної інструментації](../instrumentation/#manual-instrumentation) для запису телеметрії в екземпляр `OpenTelemetry`, встановлений агентом. Використання цього екземпляра є важливим і корисним, і ми рекомендуємо отримати доступ до
`GlobalOpenTelemetry` наступним чином:

**Для нативної інструментації стандартним є `GlobalOpenTelemetry.getOrNoop()`:**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/GlobalOpenTelemetryNativeInstrumentationUsage.java"?>
```java
package otel;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.OpenTelemetry;

public class GlobalOpenTelemetryNativeInstrumentationUsage {

  public static void globalOpenTelemetryUsage(OpenTelemetry openTelemetry) {
    // Ініціалізується за допомогою OpenTelemetry з java-агента, якщо він присутній, інакше реалізація no-op.
    MyClient client1 = new MyClientBuilder().build();

    // Ініціалізовано з явним екземпляром OpenTelemetry, що замінює екземпляр агента Java.
    MyClient client2 = new MyClientBuilder().setOpenTelemetry(openTelemetry).build();
  }

  /**
   * Приклад бібліотеки з нативною інструментацією OpenTelemetry, ініціалізованою за допомогою {@link
   * MyClientBuilder}.
   */
  public static class MyClient {
    private final OpenTelemetry openTelemetry;

    private MyClient(OpenTelemetry openTelemetry) {
      this.openTelemetry = openTelemetry;
    }

    // ... методи бібліотеки пропущено
  }

  /** Конструктор для {@link MyClient}. */
  public static class MyClientBuilder {
    // OpenTelemetry використовує стандартний екземпляр GlobalOpenTelemetry, якщо він встановлений, наприклад, агентом Java або
    // застосунком, в іншому випадку використовується реалізація no-op.
    private OpenTelemetry openTelemetry = GlobalOpenTelemetry.getOrNoop();

    /** Явно встановіть екземпляр OpenTelemetry, який потрібно використовувати. */
    public MyClientBuilder setOpenTelemetry(OpenTelemetry openTelemetry) {
      this.openTelemetry = openTelemetry;
      return this;
    }

    /** Створити клієнта. */
    public MyClient build() {
      return new MyClient(openTelemetry);
    }
  }
}
```
<!-- prettier-ignore-end -->

Зверніть увагу, що `GlobalOpenTelemetry.getOrNoop()` було розроблено без побічних ефектів виклику `get()`, що викликає `set(..)`, зберігаючи можливість для коду застосунку пізніше викликати `set(..)` без спрацьовування винятку.

Як результат:

- Якщо Java-агент присутній, інструментарій ініціалізується з екземпляром `OpenTelemetry`, встановленим агентом стандартно.
- Якщо Java-агент відсутній, інструментарій ініціалізується з реалізацією no-op, стандартно.
- Користувач може явно замінити стандартне значення, викликавши `setOpenTelemetry(..)` з окремим екземпляром.

**Для ручного інструментування, стандартно використовується:**

<!-- prettier-ignore-start -->
<!-- temporarily change except path to resolve relative to configuration directory, and revert after -->
<?code-excerpt path-base="examples/java/configuration"?>
<?code-excerpt "src/main/java/otel/GlobalOpenTelemetryManualInstrumentationUsage.java"?>
```java
package otel;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;

public class GlobalOpenTelemetryManualInstrumentationUsage {

  public static void globalOpenTelemetryUsage() {
    // Якщо GlobalOpenTelemetry вже встановлено, наприклад, агентом Java, використовуйте його.
    // В іншому випадку ініціалізуйте екземпляр OpenTelemetry SDK і використовуйте його.
    OpenTelemetry openTelemetry =
        GlobalOpenTelemetry.isSet() ? GlobalOpenTelemetry.get() : initializeOpenTelemetry();

    // Встановити в ручну інструментацію. Це може передбачати налаштування як синглтон у
    // фреймворку інʼєкції залежностей застосунку.
  }

  /** Ініціалізуйте OpenTelemetry SDK за допомогою автоконфігурації. */
  public static OpenTelemetry initializeOpenTelemetry() {
    return AutoConfiguredOpenTelemetrySdk.initialize().getOpenTelemetrySdk();
  }
}
```
<?code-excerpt path-base="examples/java/api"?>
<!-- prettier-ignore-end -->

В результаті:

- Якщо Java-агент присутній, застосунок ініціалізує ручну інструментацію за допомогою екземпляра `OpenTelemetry`, встановленого агентом.
- Якщо Java-агент відсутній, застосунок ініціалізує екземпляр [OpenTelemetrySdk](../sdk/#opentelemetrysdk) і використовує його для ініціалізації ручної інструментації.

### TracerProvider

[TracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/TracerProvider.html) є точкою входу API для трасування та надає [Tracers](#tracer). Дивіться [провайдери та області дії](#providers-and-scopes) для інформації про провайдери та області.

#### Tracer

[Tracer](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/Tracer.html) використовується для [запису відрізків](#span) для інструментування області. Дивіться [провайдери та області дії](#providers-and-scopes) для інформації про провайдери та області.

#### Відрізок {#span}

[SpanBuilder](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/SpanBuilder.html) та [Span](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/Span.html) використовуються для створення та запису даних у відрізку.

`SpanBuilder` використовується для додавання даних до відрізку перед його запуском шляхом виклику `Span startSpan()`. Дані можуть бути додані / оновлені після запуску шляхом виклику різних методів оновлення `Span`. Дані, надані `SpanBuilder` перед запуском, надаються як вхідні дані для [Семплерів](../sdk/#sampler).

Наступний фрагмент коду досліджує використання API `SpanBuilder` / `Span`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanUsage.java"?>
```java
package otel;

import static io.opentelemetry.context.Context.current;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanContext;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.api.trace.Tracer;
import java.util.Arrays;

public class SpanUsage {
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void spanUsage(Tracer tracer) {
    // Get a span builder by providing the span name
    Span span =
        tracer
            .spanBuilder("span name")
            // Set span kind
            .setSpanKind(SpanKind.INTERNAL)
            // Set attributes
            .setAttribute(AttributeKey.stringKey("com.acme.string-key"), "value")
            .setAttribute(AttributeKey.booleanKey("com.acme.bool-key"), true)
            .setAttribute(AttributeKey.longKey("com.acme.long-key"), 1L)
            .setAttribute(AttributeKey.doubleKey("com.acme.double-key"), 1.1)
            .setAttribute(
                AttributeKey.stringArrayKey("com.acme.string-array-key"),
                Arrays.asList("value1", "value2"))
            .setAttribute(
                AttributeKey.booleanArrayKey("come.acme.bool-array-key"),
                Arrays.asList(true, false))
            .setAttribute(
                AttributeKey.longArrayKey("come.acme.long-array-key"), Arrays.asList(1L, 2L))
            .setAttribute(
                AttributeKey.doubleArrayKey("come.acme.double-array-key"), Arrays.asList(1.1, 2.2))
            // Optionally omit initializing AttributeKey
            .setAttribute("com.acme.string-key", "value")
            .setAttribute("com.acme.bool-key", true)
            .setAttribute("come.acme.long-key", 1L)
            .setAttribute("come.acme.double-key", 1.1)
            .setAllAttributes(WIDGET_RED_CIRCLE)
            // Uncomment to optionally explicitly set the parent span context. If omitted, the
            // span's parent will be set using Context.current().
            // .setParent(parentContext)
            // Uncomment to optionally add links.
            // .addLink(linkContext, linkAttributes)
            // Start the span
            .startSpan();

    // Check if span is recording before computing additional data
    if (span.isRecording()) {
      // Update the span name with information not available when starting
      span.updateName("new span name");

      // Add additional attributes not available when starting
      span.setAttribute("com.acme.string-key2", "value");

      // Add additional span links not available when starting
      span.addLink(exampleLinkContext());
      // optionally include attributes on the link
      span.addLink(exampleLinkContext(), WIDGET_RED_CIRCLE);

      // Add span events
      span.addEvent("my-event");
      // optionally include attributes on the event
      span.addEvent("my-event", WIDGET_RED_CIRCLE);

      // Record exception, syntactic sugar for a span event with a specific shape
      span.recordException(new RuntimeException("error"));

      // Set the span status
      span.setStatus(StatusCode.OK, "status description");
    }

    // Finally, end the span
    span.end();
  }

  /** Return a dummy link context. */
  private static SpanContext exampleLinkContext() {
    return Span.fromContext(current()).getSpanContext();
  }
}
```
<!-- prettier-ignore-end -->

Батьківство відрізків є важливим аспектом трасування. Кожен відрізок має необовʼязкового батька. Збираючи всі відрізки в трейсі та слідуючи за кожним батьком відрізку, ми можемо побудувати ієрархію. API відрізків побудовані на основі [контексту](#context), що дозволяє контексту відрізка неявно передаватися крізь застосунок та крізь потоки. Коли створюється відрізок, його батько встановлюється на той, який присутній у `Context.current()`, якщо немає відрізку або контекст явно не перевизначено.

Більшість рекомендацій щодо використання API контексту застосовуються до відрізків. Контекст відрізка поширюється крізь межі застосунків за допомогою [W3CTraceContextPropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/propagation/W3CTraceContextPropagator.html) та інших [TextMapPropagators](../sdk/#textmappropagator).

Наступний фрагмент коду досліджує API контексту поширення `Span`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanAndContextUsage.java"?>
```java
package otel;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.Scope;

public class SpanAndContextUsage {
  private final Tracer tracer;

  SpanAndContextUsage(Tracer tracer) {
    this.tracer = tracer;
  }

  public void nestedSpanUsage() {
    // Start a span. Since we don't call makeCurrent(), we must explicitly call setParent on
    // children. Wrap code in try / finally to ensure we end the span.
    Span span = tracer.spanBuilder("span").startSpan();
    try {
      // Start a child span, explicitly setting the parent.
      Span childSpan =
          tracer
              .spanBuilder("span child")
              // Explicitly set parent.
              .setParent(span.storeInContext(Context.current()))
              .startSpan();
      // Call makeCurrent(), adding childSpan to Context.current(). Spans created inside the scope
      // will have their parent set to childSpan.
      try (Scope childSpanScope = childSpan.makeCurrent()) {
        // Call another method which creates a span. The span's parent will be childSpan since it is
        // started in the childSpan scope.
        doWork();
      } finally {
        childSpan.end();
      }
    } finally {
      span.end();
    }
  }

  private int doWork() {
    Span doWorkSpan = tracer.spanBuilder("doWork").startSpan();
    try (Scope scope = doWorkSpan.makeCurrent()) {
      int result = 0;
      for (int i = 0; i < 10; i++) {
        result += i;
      }
      return result;
    } finally {
      doWorkSpan.end();
    }
  }
}
```
<!-- prettier-ignore-end -->

### MeterProvider

[MeterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/MeterProvider.html) є точкою входу API для метрик та надає [Meters](#meter). Дивіться [провайдери та області дії](#providers-and-scopes) для інформації про провайдери та області.

#### Meter

[Meter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/Meter.html) використовується для отримання інструментів для певної [області інструментування](#providers-and-scopes). Дивіться [провайдери та області дії](#providers-and-scopes) для інформації про провайдери та області дії. Існує різноманітність інструментів, кожен з різними семантиками та стандартною поведінкою в SDK. Важливо вибрати правильний інструмент для кожного конкретного випадку використання:

| Інструмент                                  | Синхронний чи асинхронний | Опис                                                                                        | Приклад                                                      | Стандартна агрегація в SDK                                                                     |
| ------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [Counter](#counter)                         | sync                      | Запис монотонних (позитивних) значень.                                                      | Запис входів користувачів                                    | [sum (monotonic=true)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                          |
| [Async Counter](#async-counter)             | async                     | Спостереження монотонних сум.                                                               | Спостереження кількості завантажених класів у JVM            | [sum (monotonic=true)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                          |
| [UpDownCounter](#updowncounter)             | sync                      | Запис немонотонних (позитивних та негативних) значень.                                      | Запис, коли елементи додаються до черги та видаляються з неї | [sum (monotonic=false)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                         |
| [Async UpDownCounter](#async-updowncounter) | async                     | Спостереження немонотонних (позитивних та негативних) сум.                                  | Спостереження використання пулу памʼяті JVM                  | [sum (monotonic=false)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                         |
| [Histogram](#histogram)                     | sync                      | Запис монотонних (позитивних) значень, де важливий розподіл.                                | Запис тривалості обробки HTTP-запитів сервером               | [ExplicitBucketHistogram](/docs/specs/otel/metrics/sdk/#explicit-bucket-histogram-aggregation) |
| [Gauge](#gauge)                             | sync                      | Запис останнього значення, де просторове повторне агрегування не має сенсу **[1]**.         | Запис температури                                            | [LastValue](/docs/specs/otel/metrics/sdk/#last-value-aggregation)                              |
| [Async Gauge](#async-gauge)                 | async                     | Спостереження останнього значення, де просторове повторне агрегування не має сенсу **[1]**. | Спостереження використання CPU                               | [LastValue](/docs/specs/otel/metrics/sdk/#last-value-aggregation)                              |

**[1]**: Просторове повторне агрегування — це процес обʼєднання потоків атрибутів шляхом відкидання атрибутів, які не потрібні. Наприклад, маючи серії з атрибутами `{"color": "red", "shape": "square"}`, `{"color": "blue", "shape": "square"}`, ви можете виконати просторове повторне агрегування, відкинувши атрибут `color`, і обʼєднати серії, де атрибути рівні після відкидання `color`. Більшість агрегатів мають корисну функцію обʼєднання просторового агрегування (тобто суми підсумовуються разом), але gauge, агреговані за допомогою агрегату `LastValue`, є помилкою. Наприклад, припустимо, що згадані раніше серії відстежують температуру віджетів. Як ви обʼєднаєте серії, коли відкидаєте атрибут `color`? Немає хорошого відповіді, крім як підкинути монету і вибрати випадкове значення.

API інструментів мають спільні різноманітні функції:

- Створені за допомогою шаблону будівельника.
- Обовʼязкове імʼя інструменту.
- Необовʼязкова одиниця та опис.
- Запис значень, які є `long` або `double`, що налаштовується за допомогою будівельника.

Дивіться [керівництво з метрик](/docs/specs/semconv/general/metrics/#general-guidelines) для деталей про іменування метрик та одиниць.

Дивіться [керівництво для авторів бібліотек інструментування](/docs/specs/otel/metrics/supplementary-guidelines/#guidelines-for-instrumentation-library-authors) для додаткових рекомендацій щодо вибору інструментів.

#### Counter

[LongCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongCounter.html) та [DoubleCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleCounter.html) використовуються для запису монотонних (позитивних) значень.

Наступний фрагмент коду досліджує використання API counter:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CounterUsage.java"?>
```java
package otel;

import static otel.Util.WIDGET_COLOR;
import static otel.Util.WIDGET_SHAPE;
import static otel.Util.computeWidgetColor;
import static otel.Util.computeWidgetShape;
import static otel.Util.customContext;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;

public class CounterUsage {
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void counterUsage(Meter meter) {
    // Construct a counter to record measurements that are always positive (monotonically
    // increasing).
    LongCounter counter =
        meter
            .counterBuilder("fully.qualified.counter")
            .setDescription("A count of produced widgets")
            .setUnit("{widget}")
            // optionally change the type to double
            // .ofDoubles()
            .build();

    // Record a measurement with no attributes or context.
    // Attributes defaults to Attributes.empty(), context to Context.current().
    counter.add(1L);

    // Record a measurement with attributes, using pre-allocated attributes whenever possible.
    counter.add(1L, WIDGET_RED_CIRCLE);
    // Sometimes, attributes must be computed using application context.
    counter.add(
        1L, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // Record a measurement with attributes, and context.
    // Most users will opt to omit the context argument, preferring the default Context.current().
    counter.add(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Async Counter

[ObservableLongCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongCounter.html) та [ObservableDoubleCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleCounter.html) використовуються для спостереження монотонних (позитивних) сум.

Наступний фрагмент коду досліджує використання API async counter:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AsyncCounterUsage.java"?>
```java
package otel;

import static otel.Util.WIDGET_COLOR;
import static otel.Util.WIDGET_SHAPE;
import static otel.Util.computeWidgetColor;
import static otel.Util.computeWidgetShape;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.metrics.ObservableLongCounter;
import java.util.concurrent.atomic.AtomicLong;

public class AsyncCounterUsage {
  // Pre-allocate attributes whenever possible
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void asyncCounterUsage(Meter meter) {
    AtomicLong widgetCount = new AtomicLong();

    // Construct an async counter to observe an existing counter in a callback
    ObservableLongCounter asyncCounter =
        meter
            .counterBuilder("fully.qualified.counter")
            .setDescription("A count of produced widgets")
            .setUnit("{widget}")
            // Uncomment to optionally change the type to double
            // .ofDoubles()
            .buildWithCallback(
                // the callback is invoked when a MetricReader reads metrics
                observableMeasurement -> {
                  long currentWidgetCount = widgetCount.get();

                  // Record a measurement with no attributes.
                  // Attributes defaults to Attributes.empty().
                  observableMeasurement.record(currentWidgetCount);

                  // Record a measurement with attributes, using pre-allocated attributes whenever
                  // possible.
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // Sometimes, attributes must be computed using application context.
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // Optionally close the counter to unregister the callback when required
    asyncCounter.close();
  }
}
```
<!-- prettier-ignore-end -->

#### UpDownCounter

[LongUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongUpDownCounter.html) та [DoubleUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleUpDownCounter.html) використовуються для запису немонотонних (позитивних та негативних) значень.

Наступний фрагмент коду досліджує використання API updowncounter:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/UpDownCounterUsage.java"?>
```java
package otel;

import static otel.Util.WIDGET_COLOR;
import static otel.Util.WIDGET_SHAPE;
import static otel.Util.computeWidgetColor;
import static otel.Util.computeWidgetShape;
import static otel.Util.customContext;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongUpDownCounter;
import io.opentelemetry.api.metrics.Meter;

public class UpDownCounterUsage {

  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void usage(Meter meter) {
    // Construct an updowncounter to record measurements that go up and down.
    LongUpDownCounter upDownCounter =
        meter
            .upDownCounterBuilder("fully.qualified.updowncounter")
            .setDescription("Current length of widget processing queue")
            .setUnit("{widget}")
            // Uncomment to optionally change the type to double
            // .ofDoubles()
            .build();

    // Record a measurement with no attributes or context.
    // Attributes defaults to Attributes.empty(), context to Context.current().
    upDownCounter.add(1L);

    // Record a measurement with attributes, using pre-allocated attributes whenever possible.
    upDownCounter.add(-1L, WIDGET_RED_CIRCLE);
    // Sometimes, attributes must be computed using application context.
    upDownCounter.add(
        -1L, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // Record a measurement with attributes, and context.
    // Most users will opt to omit the context argument, preferring the default Context.current().
    upDownCounter.add(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Async UpDownCounter

[ObservableLongUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongUpDownCounter.html) та [ObservableDoubleUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleUpDownCounter.html) використовуються для спостереження немонотонних (позитивних та негативних) сум.

Наступний фрагмент коду досліджує використання API async updowncounter:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AsyncUpDownCounterUsage.java"?>
```java
package otel;

import static otel.Util.WIDGET_COLOR;
import static otel.Util.WIDGET_SHAPE;
import static otel.Util.computeWidgetColor;
import static otel.Util.computeWidgetShape;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.metrics.ObservableLongUpDownCounter;
import java.util.concurrent.atomic.AtomicLong;

public class AsyncUpDownCounterUsage {
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void asyncUpDownCounterUsage(Meter meter) {
    AtomicLong queueLength = new AtomicLong();

    // Construct an async updowncounter to observe an existing up down counter in a callback
    ObservableLongUpDownCounter asyncUpDownCounter =
        meter
            .upDownCounterBuilder("fully.qualified.updowncounter")
            .setDescription("Current length of widget processing queue")
            .setUnit("{widget}")
            // Uncomment to optionally change the type to double
            // .ofDoubles()
            .buildWithCallback(
                // the callback is invoked when a MetricReader reads metrics
                observableMeasurement -> {
                  long currentWidgetCount = queueLength.get();

                  // Record a measurement with no attributes.
                  // Attributes defaults to Attributes.empty().
                  observableMeasurement.record(currentWidgetCount);

                  // Record a measurement with attributes, using pre-allocated attributes whenever
                  // possible.
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // Sometimes, attributes must be computed using application context.
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // Optionally close the counter to unregister the callback when required
    asyncUpDownCounter.close();
  }
}
```
<!-- prettier-ignore-end -->

#### Histogram

[DoubleHistogram](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleHistogram.html) та [LongHistogram](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongHistogram.html) використовуються для запису монотонних (позитивних) значень, де важливий розподіл.

Наступний фрагмент коду досліджує використання API histogram:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/HistogramUsage.java"?>
```java
package otel;

import static otel.Util.WIDGET_COLOR;
import static otel.Util.WIDGET_SHAPE;
import static otel.Util.computeWidgetColor;
import static otel.Util.computeWidgetShape;
import static otel.Util.customContext;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleHistogram;
import io.opentelemetry.api.metrics.Meter;

public class HistogramUsage {
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void histogramUsage(Meter meter) {
    // Construct a histogram to record measurements where the distribution is important.
    DoubleHistogram histogram =
        meter
            .histogramBuilder("fully.qualified.histogram")
            .setDescription("Length of time to process a widget")
            .setUnit("s")
            // Uncomment to optionally provide advice on useful default explicit bucket boundaries
            // .setExplicitBucketBoundariesAdvice(Arrays.asList(1.0, 2.0, 3.0))
            // Uncomment to optionally change the type to long
            // .ofLongs()
            .build();

    // Record a measurement with no attributes or context.
    // Attributes defaults to Attributes.empty(), context to Context.current().
    histogram.record(1.1);

    // Record a measurement with attributes, using pre-allocated attributes whenever possible.
    histogram.record(2.2, WIDGET_RED_CIRCLE);
    // Sometimes, attributes must be computed using application context.
    histogram.record(
        3.2, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // Record a measurement with attributes, and context.
    // Most users will opt to omit the context argument, preferring the default Context.current().
    histogram.record(4.4, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Gauge

[DoubleGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleGauge.html) та [LongGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongGauge.html) використовуються для запису останнього значення, де просторове повторне агрегування не має сенсу.

Наступний фрагмент коду досліджує використання API gauge:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/GaugeUsage.java"?>
```java
package otel;

import static otel.Util.WIDGET_COLOR;
import static otel.Util.WIDGET_SHAPE;
import static otel.Util.computeWidgetColor;
import static otel.Util.computeWidgetShape;
import static otel.Util.customContext;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleGauge;
import io.opentelemetry.api.metrics.Meter;

public class GaugeUsage {
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void gaugeUsage(Meter meter) {
    // Construct a gauge to record measurements as they occur, which cannot be spatially
    // re-aggregated.
    DoubleGauge gauge =
        meter
            .gaugeBuilder("fully.qualified.gauge")
            .setDescription("The current temperature of the widget processing line")
            .setUnit("K")
            // Uncomment to optionally change the type to long
            // .ofLongs()
            .build();

    // Record a measurement with no attributes or context.
    // Attributes defaults to Attributes.empty(), context to Context.current().
    gauge.set(273.0);

    // Record a measurement with attributes, using pre-allocated attributes whenever possible.
    gauge.set(273.0, WIDGET_RED_CIRCLE);
    // Sometimes, attributes must be computed using application context.
    gauge.set(
        273.0,
        Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // Record a measurement with attributes, and context.
    // Most users will opt to omit the context argument, preferring the default Context.current().
    gauge.set(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Async Gauge

[ObservableDoubleGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleGauge.html) та [ObservableLongGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongGauge.html) використовуються для спостереження останнього значення, де просторове повторне агрегування не має сенсу.

Наступний фрагмент коду досліджує використання API async gauge:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AsyncGaugeUsage.java"?>
```java
package otel;

import static otel.Util.WIDGET_COLOR;
import static otel.Util.WIDGET_SHAPE;
import static otel.Util.computeWidgetColor;
import static otel.Util.computeWidgetShape;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.metrics.ObservableDoubleGauge;
import java.util.concurrent.atomic.AtomicReference;

public class AsyncGaugeUsage {
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void asyncGaugeUsage(Meter meter) {
    AtomicReference<Double> processingLineTemp = new AtomicReference<>(273.0);

    // Construct an async gauge to observe an existing gauge in a callback
    ObservableDoubleGauge asyncGauge =
        meter
            .gaugeBuilder("fully.qualified.gauge")
            .setDescription("The current temperature of the widget processing line")
            .setUnit("K")
            // Uncomment to optionally change the type to long
            // .ofLongs()
            .buildWithCallback(
                // the callback is invoked when a MetricReader reads metrics
                observableMeasurement -> {
                  double currentWidgetCount = processingLineTemp.get();

                  // Record a measurement with no attributes.
                  // Attributes defaults to Attributes.empty().
                  observableMeasurement.record(currentWidgetCount);

                  // Record a measurement with attributes, using pre-allocated attributes whenever
                  // possible.
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // Sometimes, attributes must be computed using application context.
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // Optionally close the gauge to unregister the callback when required
    asyncGauge.close();
  }
}
```
<!-- prettier-ignore-end -->

### LoggerProvider

[LoggerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/LoggerProvider.html) є точкою входу API для логів та надає [Loggers](#logger). Дивіться [провайдери та області дії](#providers-and-scopes) для інформації про провайдери та області.

> [!WARNING]
>
> {{% param logBridgeWarning %}}

#### Logger

[Logger](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/Logger.html) використовується для [генерування лог-записів](#logrecordbuilder) для [області інструментування](#providers-and-scopes). Дивіться [провайдери та області дії](#providers-and-scopes) для інформації про провайдери та області.

#### LogRecordBuilder

[LogRecordBuilder](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/LogRecordBuilder.html) використовується для створення та поширення лог-записів.

Наступний фрагмент коду досліджує використання API `LogRecordBuilder`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/LogRecordUsage.java"?>
```java
package otel;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.Value;
import io.opentelemetry.api.logs.Logger;
import io.opentelemetry.api.logs.Severity;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class LogRecordUsage {
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void logRecordUsage(Logger logger) {
    logger
        .logRecordBuilder()
        // Set body. Note, setBody(..) is called multiple times for demonstration purposes but only
        // the last call is used.
        // Set the body to a string, syntactic sugar for setBody(Value.of("log message"))
        .setBody("log message")
        // Optionally set the body to a Value to record arbitrarily complex structured data
        .setBody(Value.of("log message"))
        .setBody(Value.of(1L))
        .setBody(Value.of(1.1))
        .setBody(Value.of(true))
        .setBody(Value.of(new byte[] {'a', 'b', 'c'}))
        .setBody(Value.of(Value.of("entry1"), Value.of("entry2")))
        .setBody(
            Value.of(
                Map.of(
                    "stringKey",
                    Value.of("entry1"),
                    "mapKey",
                    Value.of(Map.of("stringKey", Value.of("entry2"))))))
        // Set severity
        .setSeverity(Severity.DEBUG)
        .setSeverityText("debug")
        // Set timestamp
        .setTimestamp(System.currentTimeMillis(), TimeUnit.MILLISECONDS)
        // Optionally set the timestamp when the log was observed
        .setObservedTimestamp(System.currentTimeMillis(), TimeUnit.MILLISECONDS)
        // Set attributes
        .setAttribute(AttributeKey.stringKey("com.acme.string-key"), "value")
        .setAttribute(AttributeKey.booleanKey("com.acme.bool-key"), true)
        .setAttribute(AttributeKey.longKey("com.acme.long-key"), 1L)
        .setAttribute(AttributeKey.doubleKey("com.acme.double-key"), 1.1)
        .setAttribute(
            AttributeKey.stringArrayKey("com.acme.string-array-key"),
            Arrays.asList("value1", "value2"))
        .setAttribute(
            AttributeKey.booleanArrayKey("come.acme.bool-array-key"), Arrays.asList(true, false))
        .setAttribute(AttributeKey.longArrayKey("come.acme.long-array-key"), Arrays.asList(1L, 2L))
        .setAttribute(
            AttributeKey.doubleArrayKey("come.acme.double-array-key"), Arrays.asList(1.1, 2.2))
        .setAllAttributes(WIDGET_RED_CIRCLE)
        // Uncomment to optionally explicitly set the context used to correlate with spans. If
        // omitted, Context.current() is used.
        // .setContext(context)
        // Emit the log record
        .emit();
  }
}
```
<!-- prettier-ignore-end -->

### Реалізація No-op {#no-op-implementation}

Метод `OpenTelemetry#noop()` надає доступ до реалізації no-op [OpenTelemetry](#opentelemetry) та всіх компонентів API, до яких він надає доступ. Як випливає з назви, реалізація no-op нічого не робить і призначена для того, щоб не впливати на продуктивність. Інструментування може бачити вплив на продуктивність навіть при використанні no-op, якщо воно обчислює / виділяє значення атрибутів та інші дані, необхідні для запису телеметрії. No-op є корисним стандартним екземпляром `OpenTelemetry`, коли користувач не налаштував та не встановив конкретну реалізацію, таку як [SDK](../sdk/).

Наступний фрагмент коду досліджує використання API `OpenTelemetry#noop()`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/NoopUsage.java"?>
```java
package otel;

import static otel.Util.WIDGET_COLOR;
import static otel.Util.WIDGET_RED_CIRCLE;
import static otel.Util.WIDGET_SHAPE;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.logs.Logger;
import io.opentelemetry.api.logs.Severity;
import io.opentelemetry.api.metrics.DoubleGauge;
import io.opentelemetry.api.metrics.DoubleHistogram;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.LongUpDownCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.api.trace.Tracer;

public class NoopUsage {
  private static final String SCOPE_NAME = "fully.qualified.name";

  public static void noopUsage() {
    // Access the no-op OpenTelemetry instance
    OpenTelemetry noopOpenTelemetry = OpenTelemetry.noop();

    // No-op tracing
    Tracer noopTracer = OpenTelemetry.noop().getTracer(SCOPE_NAME);
    noopTracer
        .spanBuilder("span name")
        .startSpan()
        .setAttribute(WIDGET_SHAPE, "square")
        .setStatus(StatusCode.OK)
        .addEvent("event-name", Attributes.builder().put(WIDGET_COLOR, "red").build())
        .end();

    // No-op metrics
    Attributes attributes = WIDGET_RED_CIRCLE;
    Meter noopMeter = OpenTelemetry.noop().getMeter(SCOPE_NAME);
    DoubleHistogram histogram = noopMeter.histogramBuilder("fully.qualified.histogram").build();
    histogram.record(1.0, attributes);
    // counter
    LongCounter counter = noopMeter.counterBuilder("fully.qualified.counter").build();
    counter.add(1, attributes);
    // async counter
    noopMeter
        .counterBuilder("fully.qualified.counter")
        .buildWithCallback(observable -> observable.record(10, attributes));
    // updowncounter
    LongUpDownCounter upDownCounter =
        noopMeter.upDownCounterBuilder("fully.qualified.updowncounter").build();
    // async updowncounter
    noopMeter
        .upDownCounterBuilder("fully.qualified.updowncounter")
        .buildWithCallback(observable -> observable.record(10, attributes));
    upDownCounter.add(-1, attributes);
    // gauge
    DoubleGauge gauge = noopMeter.gaugeBuilder("fully.qualified.gauge").build();
    gauge.set(1.1, attributes);
    // async gauge
    noopMeter
        .gaugeBuilder("fully.qualified.gauge")
        .buildWithCallback(observable -> observable.record(10, attributes));

    // No-op logs
    Logger noopLogger = OpenTelemetry.noop().getLogsBridge().get(SCOPE_NAME);
    noopLogger
        .logRecordBuilder()
        .setBody("log message")
        .setAttribute(WIDGET_SHAPE, "square")
        .setSeverity(Severity.INFO)
        .emit();
  }
}
```
<!-- prettier-ignore-end -->

### Семантичні атрибути {#semantic-attributes}

[Семантичні домовленості](/docs/specs/semconv/) описують, як збирати телеметрію у стандартизований спосіб для загальних операцій. Це включає [реєстр атрибутів](/docs/specs/semconv/registry/attributes/), який перераховує визначення для всіх атрибутів, згаданих у конвенціях, організованих за доменом. Проєкт [semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java) генерує константи з семантичних домовленостей, які можуть бути використані для допомоги інструментуванню відповідати:

| Опис                                                      | Артефакт                                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Згенерований код для стабільних семантичних домовленостей | `io.opentelemetry.semconv:opentelemetry-semconv:{{% param vers.semconv %}}-alpha`            |
| Згенерований код для інкубуючих семантичних домовленостей | `io.opentelemetry.semconv:opentelemetry-semconv-incubating:{{% param vers.semconv %}}-alpha` |

> [!NOTE]
>
> Хоча і `opentelemetry-semconv`, і `opentelemetry-semconv-incubating` включають суфікс `-alpha` і підлягають змінам API, мета полягає в стабілізації `opentelemetry-semconv` і залишенні суфіксу `-alpha` на `opentelemetry-semconv-incubating` постійно. Бібліотеки можуть використовувати `opentelemetry-semconv-incubating` для тестування, але не повинні включати його як залежність: оскільки атрибути можуть приходити і йти з версії у версію, включення його як залежності може піддавати кінцевих користувачів помилкам виконання при виникненні конфліктів версій.

Константи атрибутів, згенеровані з семантичних конвенцій, є екземплярами `AttributeKey<T>` і можуть бути використані скрізь, де API OpenTelemetry приймає атрибути.

Наступний фрагмент коду досліджує використання API семантичних конвенцій атрибутів:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SemanticAttributesUsage.java"?>
```java
package otel;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.semconv.HttpAttributes;
import io.opentelemetry.semconv.ServerAttributes;
import io.opentelemetry.semconv.incubating.HttpIncubatingAttributes;

public class SemanticAttributesUsage {
  public static void semanticAttributesUsage() {
    // Semantic attributes are organized by top-level domain and whether they are stable or
    // incubating.
    // For example:
    // - stable attributes starting with http.* are in the HttpAttributes class.
    // - stable attributes starting with server.* are in the ServerAttributes class.
    // - incubating attributes starting with http.* are in the HttpIncubatingAttributes class.
    // Attribute keys which define an enumeration of values are accessible in an inner
    // {AttributeKey}Values class.
    // For example, the enumeration of http.request.method values is available in the
    // HttpAttributes.HttpRequestMethodValues class.
    Attributes attributes =
        Attributes.builder()
            .put(HttpAttributes.HTTP_REQUEST_METHOD, HttpAttributes.HttpRequestMethodValues.GET)
            .put(HttpAttributes.HTTP_ROUTE, "/users/:id")
            .put(ServerAttributes.SERVER_ADDRESS, "example")
            .put(ServerAttributes.SERVER_PORT, 8080L)
            .put(HttpIncubatingAttributes.HTTP_RESPONSE_BODY_SIZE, 1024)
            .build();
  }
}
```
<!-- prettier-ignore-end -->

### Baggage

[Baggage](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/baggage/Baggage.html) є набором ключ-значення, визначених застосунком, повʼязаних з розподіленим запитом або виконанням робочого процесу. Ключі та значення багажу є рядками, а значення мають необовʼязкові метадані рядка. Телеметрія може бути збагачена даними з багажу шляхом налаштування [SDK](../sdk/) для додавання записів як атрибутів до відрізків, метрик та лог-записів. API baggage побудований на основі [контексту](#context), що дозволяє контексту відрізка неявно передаватися крізь застосунок та через потоки. Більшість рекомендацій щодо використання API контексту застосовуються до багажу.

Багаж поширюється через межі застосунків за допомогою [W3CBaggagePropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/baggage/propagation/W3CBaggagePropagator.html) (див. [TextMapPropagator](../sdk/#textmappropagator) для деталей).

Наступний фрагмент коду досліджує використання API `Baggage`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/BaggageUsage.java"?>
```java
package otel;

import static io.opentelemetry.context.Context.current;

import io.opentelemetry.api.baggage.Baggage;
import io.opentelemetry.api.baggage.BaggageEntry;
import io.opentelemetry.api.baggage.BaggageEntryMetadata;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.context.Scope;
import java.util.Map;
import java.util.stream.Collectors;

public class BaggageUsage {
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void baggageUsage() {
    // Access current baggage with Baggage.current()
    // output => context baggage: {}
    Baggage currentBaggage = Baggage.current();
    System.out.println("current baggage: " + asString(currentBaggage));
    // ...or from a Context
    currentBaggage = Baggage.fromContext(current());

    // Baggage has a variety of methods for manipulating and reading data.
    // Convert to builder and add entries:
    Baggage newBaggage =
        Baggage.current().toBuilder()
            .put("shopId", "abc123")
            .put("shopName", "opentelemetry-demo", BaggageEntryMetadata.create("metadata"))
            .build();
    // ...or uncomment to start from empty
    // newBaggage = Baggage.empty().toBuilder().put("shopId", "abc123").build();
    // output => new baggage: {shopId=abc123(), shopName=opentelemetry-demo(metadata)}
    System.out.println("new baggage: " + asString(newBaggage));
    // Read an entry:
    String shopIdValue = newBaggage.getEntryValue("shopId");
    // Inspect size:
    int size = newBaggage.size();
    boolean isEmpty = newBaggage.isEmpty();
    // Convert to map representation:
    Map<String, BaggageEntry> map = newBaggage.asMap();
    // Iterate through entries:
    newBaggage.forEach((s, baggageEntry) -> {});

    // The current baggage still doesn't contain the new entries
    // output => context baggage: {}
    System.out.println("current baggage: " + asString(Baggage.current()));

    // Calling Baggage.makeCurrent() sets Baggage.current() to the baggage until the scope is
    // closed, upon which Baggage.current() is restored to the state prior to when
    // Baggage.makeCurrent() was called.
    try (Scope scope = newBaggage.makeCurrent()) {
      // The current baggage now contains the added value
      // output => context baggage: {shopId=abc123(), shopName=opentelemetry-demo(metadata)}
      System.out.println("current baggage: " + asString(Baggage.current()));
    }

    // The current baggage no longer contains the new entries:
    // output => context baggage: {}
    System.out.println("current baggage: " + asString(Baggage.current()));
  }

  private static String asString(Baggage baggage) {
    return baggage.asMap().entrySet().stream()
        .map(
            entry ->
                String.format(
                    "%s=%s(%s)",
                    entry.getKey(),
                    entry.getValue().getValue(),
                    entry.getValue().getMetadata().getValue()))
        .collect(Collectors.joining(", ", "{", "}"));
  }
}
```
<!-- prettier-ignore-end -->

## Інкубуючий API {#incubating-api}

Артефакт `io.opentelemetry:opentelemetry-api-incubator:{{% param vers.otel %}}-alpha` містить експериментальні API трасування, метрик, логів та контексту. Інкубуючі API можуть мати зміни API в мінорних релізах. Часто вони представляють експериментальні функції специфікації або дизайни API, які ми хочемо перевірити за допомогою відгуків користувачів перед тим, як зобовʼязатися їх підтримувати в подальшому. Ми заохочуємо користувачів спробувати ці API та відкривати тікети з будь-якими відгуками (позитивними чи негативними). Бібліотеки не повинні залежати від інкубуючих API, оскільки користувачі можуть піддаватися помилкам виконання при виникненні конфліктів версій.

Дивіться [README інкубатора](https://github.com/open-telemetry/opentelemetry-java/tree/main/api/incubator) для доступних API та прикладів використання.
