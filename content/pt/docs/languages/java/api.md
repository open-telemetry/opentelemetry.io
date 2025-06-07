---
title: Registrar telemetria com a API
weight: 11
default_lang_commit: 5b82e8f9c057d4d4961d41091a4bc75fc9b5b37c
aliases:
  - /docs/languages/java/api-components/
logBridgeWarning: >
  Embora as APIs `LoggerProvider` / `Logger` sejam estruturalmente semelhantes
  as APIs equivalentes de traços e métricas, elas servem a um caso de uso
  diferente. Até o momento, `LoggerProvider` / `Logger` e as classes associadas
  representam a [API de Ponte de registros](/docs/specs/otel/logs/api/), que
  existe para criar anexadores de registros que conectam registros / frameworks
  no OpenTelemetry. Elas não são destinadas ao uso final como substitutas do
  Log4j / SLF4J / Logback / etc.
cSpell:ignore: Dotel kotlint Logback updowncounter
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/api"?>

A API é um conjunto de classes e interfaces para registar telemetria através dos
sinais chaves de observabilidade. O [SDK](../sdk/) é uma referência integrada da
implementação da API, [configuração](../configuration/) para processar e
exportar telemetria. Essa página é uma visão geral de conceitos da API,
incluindo descrições, links para documentações relevantes (Javadocs),
coordenadas de artefato, e exemplos de uso da API.

A API consiste nos seguintes componentes principais:

- [Contexto](#contexto-da-api): Um padrão de API para propagação de contexto
  através de uma aplicação e entre limites de aplicações, incluindo contexto de
  rastros e bagagem.
- [TracerProvider](#tracerprovider): O ponto de entrada para a API de traços.
- [MeterProvider](#medidorprovider): O ponto de entrada para a API de métricas.
- [LoggerProvider](#loggerprovider): O ponto de entrada para a API de logs.
- [OpenTelemetry](#opentelemetry): Uma estrutura para componentes principais da
  API (ou seja, `TracerProvider`, `MeterProvider`, `LoggerProvider`,
  `ContextPropagators`) que é conveniente passar para a instrumentação.

A API é desenvolvida para suportar múltiplos ambientes. Duas implementações são
providenciadas pelo OpenTelemetry:

- [SDK](../sdk/) é uma referência integrada de implementação da API. É a escolha
  correta para a maioria dos usuários.
- [Noop](#noop-implementation) implementação. Uma implementação minimalista, sem
  dependências para instrumentações usarem por padrão quando o usuário não
  instala uma instância.

A API é desenvolvida ser adotado como dependência direta por bibliotecas,
frameworks, e responsáveis pela aplicação. Isto inicializa com
[fortes garantias de compatibilidade retroativa](https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#compatibility-requirements),
sem dependências transitivas, e
[suporta Java 8+](https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#language-version-compatibility).
Bibliotecas e frameworks devem depender somente da API e somente chamar métodos
da API, e orientar aplicações / usuários finais para adicionar uma dependência
do SDK e instalarem uma instância configurada.

{{% alert title=Javadoc %}} Para referências de componentes OpenTelemetry Java
na documentação (Javadoc), veja
[javadoc.io/doc/io.opentelemetry](https://javadoc.io/doc/io.opentelemetry).
{{% /alert %}}

## Componentes da API

A seção a seguir descreve a API do OpenTelemetry. Cada seção de componente
inclue:

- Uma breve descrição, incluindo um link para a referência do tipo na Javadoc.
- Links para recursos relevantes para compreender os métodos e argumentos da
  API.
- Uma exploração simples do uso da API.

## Contexto da API

O artefato `io.opentelemetry:opentelemetry-api-context:{{% param vers.otel %}}`
contém um padrão de APIs (ou seja, distribuído separadamente da
[API do OpenTelemetry](#opentelemetry-api)) para propagação de contexto através
de uma aplicação e entre limites de aplicações.

Isso consiste em:

- [Contexto](#contexto): é um conjunto imutável de pares chave-valor, com
  utilitários para propagação implícita ou explícita através da aplicação.
- [Armazenamento de Contexto](#armazenamento-de-contexto): Um mecanismo para
  armazenar e receber o contexto atual, assumindo por padrão o contexto local da
  thread.
- [ContextPropagators](#contexto): Uma estrutura com os propagadores registrados
  para propagar o `Contexto` entre os limites da aplicação.

A extensão
`io.opentelemetry:opentelemetry-extension-kotlint:{{% param vers.otel %}}` é um
conjunto de ferramentas para propagação de contexto em programações assíncronas
e concorrentes (coroutines).

### Contexto

[Contexto](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/Context.html)
é um conjunto imutável de pares chave-valor, com utilitários para propagação
implícita dentro de uma aplicação e entre limites da aplicação (threads).
Propagação implícita significa que o contexto pode ser acessado sem precisar
passá-lo explicitamente como um argumento. Contexto é um conceito recorrente na
API do OpenTelemetry:

- Os [trechos](#trechos) ativos atualmente são armazenados no contexto, e por
  padrão um trecho pai é atribuído para qualquer trecho ativo no contexto atual.
- As medições registradas em [instrumentos de métricas](#medidor) aceitam um
  argumento de contexto, usado para vincular as medições a trechos por meio de
  [exemplos](/docs/specs/otel/metrics/data-model/#exemplars) e por padrão
  utilizam o trecho que estiver ativo no contexto atual.
- [LogRecords](#logrecordbuilder) aceitam um argumento de contexto, usado para
  vincular registros de log a trechos, e por padrão, utilizam qualquer trecho
  ativo no contexto atual.

O trecho de código a seguir explora o uso da API `Context`:

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

  /** Exemplo {@link java.util.concurrent.Callable}. */
  private static Object callable() {
    return new Object();
  }

  /** Exemplo {@link Runnable}. */
  private static void runnable() {}

  /** Exemplo {@link java.util.function.Consumer}. */
  private static void consumer(Object object) {}

  /** Exemplo {@link java.util.function.BiConsumer}. */
  private static void biConsumer(Object object1, Object object2) {}

  /** Exemplo {@link java.util.function.Function}. */
  private static Object function(Object object) {
    return object;
  }

  /** Exemplo {@link java.util.function.Supplier}. */
  private static Object supplier() {
    return new Object();
  }
}
```
<!-- prettier-ignore-end -->

### Armazenamento de contexto

[ContextStorage](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/ContextStorage.html)
is a mechanism for storing and retrieving the current `Context`.

The default `ContextStorage` implementation stores `Context` in thread local.

### Propagação de Contexto

[Propagação de contexto](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/propagation/ContextPropagators.html)
é uma estrutura de propagadores registrados para propagar `Context` através dos
limites da aplicação. O contexto é injetado em um portador _carrier_ ao sair da
aplicação (ou seja, em uma requisição HTTP de saída), e extraído de um portador
_carrier_ ao entrar em uma aplicação (ou seja, ao atender uma requisição HTTP).

Veja [SDK TextMapPropagators](../sdk/#textmappropagator) para implementação de
propagadores.

O trecho de código a seguir explora a injeção da API `ContextPropagators`:

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

O trecho de código a seguir explora o uso da extração da API
`ContextPropagators`:

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

O artefato `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}` contém a
API do OpenTelemetry, incluindo traços, métricas, registros, implementação noop,
bagagem, implementação da chave `TextMapPropagator`, e uma dependência do
[Contexto da API](#contexto-da-api).

### Provedores e Escopos

Provedores e escopos são conceitos recorrentes na API do OpenTelemetry. Um
escopo é uma unidade lógica dentro da aplicação que contém telemetrias
associadas. Um provedor provê componentes para gravação de telemetria relativo a
um escopo particular:

- [TracerProvider](#tracerprovider) fornece escopo para [Traços](#traços) para
  registrar trechos.
- [MeterProvider](#medidorprovider) fornece escopo para [Meters](#medidor) para
  registrar métricas.
- [LoggerProvider](#loggerprovider) fornece escopo para [Loggers](#logger) para
  registrar logs.

{{% alert %}} {{% param logBridgeWarning %}} {{% /alert %}}

Um escopo é identificado pelo triplo (nome, versão, schemaUrl). Deve-se ter
cuidado para garantir que a identidade do escopo é único. Uma abordagem típica é
definir o nome do escopo como o nome do pacote ou o nome completo da classe, e
definir a versão do escopo como a versão da biblioteca. Se estiver emitindo
telemetria para múltiplos sinais (ou seja, métricas e traços), o mesmo escopo
deve ser usado. Veja
[instrumentation scope](/docs/concepts/instrumentation-scope/) para detalhes.

O trecho de código a seguir explora o uso da API `provider and scope`:

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
            .setInstrumentaçãoVersion(SCOPE_VERSION)
            .setSchemaUrl(SCOPE_SCHEMA_URL)
            .build();
    Meter meter =
        meterProvider
            .meterBuilder(SCOPE_NAME)
            .setInstrumentaçãoVersion(SCOPE_VERSION)
            .setSchemaUrl(SCOPE_SCHEMA_URL)
            .build();
    Logger logger =
        loggerProvider
            .loggerBuilder(SCOPE_NAME)
            .setInstrumentaçãoVersion(SCOPE_VERSION)
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

### Atributos

[Atributos](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/common/Attributes.html)
is a bundle of key value pairs representing the
[standard attribute definition](/docs/specs/otel/common/#standard-attribute).
`Attributes` are a recurring concept in the OpenTelemetry API:

- [Spans](#trechos), span events, and span links have attributes.
- The measurements recorded to [metric instruments](#medidor) have attributes.
- [LogRecords](#logrecordbuilder) have attributes.

Veja [atributos de semântica](#atributos-de-semântica) for attribute constants
generated from the semantic conventions.

Veja [attribute naming](/docs/specs/semconv/general/naming/) for guidance on
attribute naming.

O trecho de código a seguir explora o uso da API `Attributes`:

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

{{% alert title="Spring Boot Starter" %}} The Spring Boot starter is a special
case where `OpenTelemetry` is available as a Spring bean. Simply inject
`OpenTelemetry` into your Spring components.

Read more about
[extending the Spring Boot starter with custom manual instrumentation](/docs/zero-code/java/spring-boot-starter/api/).
{{% /alert %}}

[OpenTelemetry](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/OpenTelemetry.html)
is a holder for top-level API components which is convenient to pass to
instrumentation.

`OpenTelemetry` consiste em:

- [TracerProvider](#tracerprovider): O ponto de entrada para a API de traces.
- [MeterProvider](#medidorprovider): O ponto de entrada para a API de métricas.
- [LoggerProvider](#loggerprovider): O ponto de entrada para a API de logs.
- [Propagação de Contexto](#propagação-de-contexto): O ponto de entrada para a
  API de context propagation.

O trecho de código a seguir explora o uso da API do `OpenTelemetry`:

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

{{% alert title="Java agent" %}} The Java agent is a special case where
`GlobalOpenTelemetry` is set by the agent. Simply call
`GlobalOpenTelemetry.get()` to access the `OpenTelemetry` instance.

Read more about
[extending the Java agent with custom manual instrumentation](/docs/zero-code/java/agent/api/).
{{% /alert %}}

[GlobalOpenTelemetry](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/GlobalOpenTelemetry.html)
holds a global singleton [OpenTelemetry](#opentelemetry) instance.

Instrumentação should avoid using `GlobalOpenTelemetry`. Instead, accept
`OpenTelemetry` as an initialization argument and default to the
[Noop implementation](#noop-implementation) if not set. There is an exception to
this rule: the `OpenTelemetry` instance installed by the
[Java agent](/docs/zero-code/java/agent/) is available via
`GlobalOpenTelemetry`. Users with additional manual instrumentation are
encouraged to access it via `GlobalOpenTelemetry.get()`.

`GlobalOpenTelemetry.get()` is guaranteed to always return the same result. If
`GlobalOpenTelemetry.get()` is called before `GlobalOpenTelemetry.set(..)`,
`GlobalOpenTelemetry` is set to the noop implementation and future calls to
`GlobalOpenTelemetry.set(..)` throw an exception. Therefore, it's critical to
call `GlobalOpenTelemetry.set(..)` as early in the application lifecycle as
possible, and before `GlobalOpenTelemetry.get()` is called by any
instrumentation. This guarantee surfaces initialization ordering issues: calling
`GlobalOpenTelemetry.set()` too late (ou seja, after instrumentation has called
`GlobalOpenTelemetry.get()`) triggers an exception rather than silently failing.

If [autoconfigure](../configuration/#auto-configuração-sem-código) is present,
`GlobalOpenTelemetry` can be automatically initialized by setting
`-Dotel.java.global-autoconfigure.enabled=true` (or via env var
`export OTEL_JAVA_GLOBAL_AUTOCONFIGURE_ENABLED=true`). When enabled, the first
call to `GlobalOpenTelemetry.get()` triggers autoconfiguration and calls
`GlobalOpenTelemetry.set(..)` with the resulting `OpenTelemetry` instance.

O trecho de código a seguir explora o uso da propagação da API
`GlobalOpenTelemetry`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/GlobalOpenTelemetryUsage.java"?>
```java
package otel;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.OpenTelemetry;

public class GlobalOpenTelemetryUsage {

  public static void openTelemetryUsage(OpenTelemetry openTelemetry) {
    // Set the GlobalOpenTelemetry instance as early in the application lifecycle as possible
    // Set must only be called once. Calling multiple times raises an exception.
    GlobalOpenTelemetry.set(openTelemetry);

    // Get the GlobalOpenTelemetry instance.
    openTelemetry = GlobalOpenTelemetry.get();
  }
}
```
<!-- prettier-ignore-end -->

### TracerProvider

[TracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/TracerProvider.html)
is the API entry point for traces and provides [Traços](#traços). See
[provedores e escopos](#provedores-e-escopos) para informação on providers and
scopes.

#### Traços

[Traços](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/Tracer.html)
is used to [registros de trechos](#trechos) for an instrumentation scope. See
[provedores e escopos](#provedores-e-escopos) para informação on providers and
scopes.

#### Trechos

[SpanBuilder](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/SpanBuilder.html)
and
[Trechos](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/Span.html)
are used to construct and record data to spans.

`SpanBuilder` is used to add data to a span before starting it by calling
`Span startSpan()`. Data can be added / updated after starting by calling
various `Span` update methods. The data provided to `SpanBuilder` before
starting is provided as an input to [Samplers](../sdk/#amostrador).

O trecho de código a seguir explora o uso da API `SpanBuilder`:

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

Span parenting is an important aspect of tracing. Each span has an optional
parent. By collecting all the spans in a trace and following each span's parent,
we can construct a hierarchy. The span APIs are built on top of
[context](#contexto), which allows span context to be implicitly passed around
an application and across threads. When a span is created, its parent is set to
the whatever span is present in `Context.current()` unless there is no span or
the context is explicitly overridden.

Most of the context API usage guidance applies to spans. Span context is
propagated across application boundaries with the
[W3CTraceContextPropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/propagation/W3CTraceContextPropagator.html)
and other [TextMapPropagators](../sdk/#textmappropagator).

O trecho de código a seguir explora o uso da propagação da API `Span`:

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

[MeterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/MeterProvider.html)
é um ponto de entrada da API para métricas e provedores [Medidores](#medidor).
Veja [provedores e escopos](#provedores-e-escopos) para informação de provedores
e escopos.

#### Medidor

[Medidor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/Meter.html)
é usado para obter instrumentação de um
[escopo de instrumentação](#provedores-e-escopos) particular. Veja
[provedores e escopos](#provedores-e-escopos) para informação de provedores e
escopos. Existem uma variedade de instrumentações, cada uma com uma semântica
diferente e com comportamentos padrões no SDK. É importante escolher a
instrumentação correta para cada particular caso de Uso:

| Instrumento                                 | Sync or Async | Descrição                                                                          | Exemplo                                                 | Default SDK Aggregation                                                                        |
| ------------------------------------------- | ------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Contador](#contador)                       | sync          | Record monotonic (positive) values.                                                | Record user logins                                      | [sum (monotonic=true)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                          |
| [Contador Assíncrono](#contador-assíncrono) | async         | Observe monotonic sums.                                                            | Observe number of classes loaded in the JVM             | [sum (monotonic=true)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                          |
| [UpDownCounter](#updowncounter)             | sync          | Record non-monotonic (positive and negative) values.                               | Record when items are added to and removed from a queue | [sum (monotonic=false)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                         |
| [Async UpDownCounter](#async-updowncounter) | async         | Observe non-monotonic (positive and negative) sums.                                | Observe JVM memory pool usage                           | [sum (monotonic=false)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                         |
| [Histograma](#histograma)                   | sync          | Record monotonic (positive) values where the distribution is important.            | Record duration of HTTP requests processed by server    | [ExplicitBucketHistogram](/docs/specs/otel/metrics/sdk/#explicit-bucket-histogram-aggregation) |
| [Medidor](#medidor)                         | sync          | Record the latest value where spatial re-aggregation does not make sense **[1]**.  | Record temperature                                      | [LastValue](/docs/specs/otel/metrics/sdk/#last-value-aggregation)                              |
| [Medidor Assíncrono](#contador-assíncrono)  | async         | Observe the latest value where spatial re-aggregation does not make sense **[1]**. | Observe CPU utilization                                 | [LastValue](/docs/specs/otel/metrics/sdk/#last-value-aggregation)                              |

**[1]**: Spatial re-aggregation is the process of merging attribute streams by
dropping attributes which are not needed. For example, given series with
attributes `{"color": "red", "shape": "square"}`,
`{"color": "blue", "shape": "square"}`, you can perform spatial re-aggregation
by dropping the `color` attribute, and merging the series where the attributes
are equal after dropping `color`. Most aggregations have a useful spatial
aggregation merge function (ou seja, sums are summed together), but gauges
aggregated by the `LastValue` aggregation are the exception. For example,
suppose the series mentioned previously are tracking the temperature of widgets.
How do you merge the series when you drop the `color` attribute? There is no
good answer besides flipping a coin and selecting a random value.

The instrument APIs have share a variety of features:

- Created using the builder pattern.
- Required instrument name.
- Optional unit and description.
- Record values which are `long` or `double`, which is configured via the
  builder.

Veja
[metric guidelines](/docs/specs/semconv/general/metrics/#general-guidelines) for
details on metric naming and units.

See
[guidelines for instrumentation library authors](/docs/specs/otel/metrics/supplementary-guidelines/#guidelines-for-instrumentation-library-authors)
for additional guidance on instrument selection.

#### Contador

[LongCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongCounter.html)
and
[DoubleCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleCounter.html)
are used to record monotonic (positive) values.

O trecho de código a seguir explora o uso da API `counter`:

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
            .setDescrição("A count of produced widgets")
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

#### Contador assíncrono

[ObservableLongCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongCounter.html)
and
[ObservableDoubleCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleCounter.html)
are used to observe monotonic (positive) sums.

O trecho de código a seguir explora o uso da API `async counter`:

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
            .setDescrição("A count of produced widgets")
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

[LongUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongUpDownCounter.html)
and
[DoubleUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleUpDownCounter.html)
are used to record non-monotonic (positive and negative) values.

O trecho de código a seguir explora o uso da API updowncounter :

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
            .setDescrição("Current length of widget processing queue")
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

[ObservableLongUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongUpDownCounter.html)
and
[ObservableDoubleUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleUpDownCounter.html)
are used to observe non-monotonic (positive and negative) sums.

O trecho de código a seguir explora o uso da API async usage:

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
            .setDescrição("Current length of widget processing queue")
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

#### Histograma

[DoubleHistogram](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleHistogram.html)
and
[LongHistogram](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongHistogram.html)
are used to record monotonic (positive) values where the distribution is
important.

O trecho de código a seguir explora o uso da API histogram :

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
            .setDescrição("Length of time to process a widget")
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

[DoubleGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleGauge.html)
and
[LongGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongGauge.html)
are used to record the latest value where spatial re-aggregation does not make
sense.

O trecho de código a seguir explora o uso da API gauge :

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
            .setDescrição("The current temperature of the widget processing line")
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

[ObservableDoubleGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleGauge.html)
and
[ObservableLongGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongGauge.html)
are used to observe the latest value where spatial re-aggregation does not make
sense.

O trecho de código a seguir explora o uso da API async usage:

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

    // Construct an async counter to observe an existing counter in a callback
    ObservableDoubleGauge asyncGauge =
        meter
            .gaugeBuilder("fully.qualified.gauge")
            .setDescrição("The current temperature of the widget processing line")
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

[LoggerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/LoggerProvider.html)
is the API entry point for logs and provides [Loggers](#logger). See
[provedores e escopos](#provedores-e-escopos) para informação on providers and
scopes.

{{% alert %}} {{% param logBridgeWarning %}} {{% /alert %}}

#### Logger

[Logger](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/Logger.html)
é usado para [emit log records](#logrecordbuilder) for an
[instrumentation scope](#provedores-e-escopos). Veja
[provedores e escopos](#provedores-e-escopos) para informação on providers and
scopes.

#### LogRecordBuilder

[LogRecordBuilder](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/LogRecordBuilder.html)
é usado para construct and emit log records.

O trecho de código a seguir explora o uso da API `LogRecordBuilder`:

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

### Noop implementation

The `OpenTelemetry#noop()` method provides access to a noop implementation of
[OpenTelemetry](#opentelemetry) and all API components it provides access to. As
the name suggests, the noop implementation does nothing and is designed to have
no impact on performance. Instrumentação may see impact on performance even when
the noop is used if it is computing / allocating attribute values and other data
required to record the telemetry. The noop is a useful default instance of
`OpenTelemetry` when a user has not configured and installed a concrete
implementation such as the [SDK](../sdk/).

O trecho de código a seguir explora o uso da API `OpenTelemetry#noop()`:

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
    // Access the noop OpenTelemetry instance
    OpenTelemetry noopOpenTelemetry = OpenTelemetry.noop();

    // Noop tracing
    Tracer noopTracer = OpenTelemetry.noop().getTracer(SCOPE_NAME);
    noopTracer
        .spanBuilder("span name")
        .startSpan()
        .setAttribute(WIDGET_SHAPE, "square")
        .setStatus(StatusCode.OK)
        .addEvent("event-name", Attributes.builder().put(WIDGET_COLOR, "red").build())
        .end();

    // Noop metrics
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

    // Noop logs
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

### Atributos de Semântica

A [convenção semântica](/docs/specs/semconv/) descreve como coletar telemetria
em uma forma padronizada de operações comuns. Isso inclui um
[registro de atributos](/docs/specs/semconv/registry/attributes/), com
definições enumeradas para todos os atributos referenciados nas convenções,
organizado pelo domínio. O projeto de
[convenção semântica do Java](https://github.com/open-telemetry/semantic-conventions-java)
gera constantes de convenção semântica, onde podem ser utilizadas para ajudar a
instrumentação conforme:

| Descrição                                          | Artefato                                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Código gerado para convenções semânticas estáveis  | `io.opentelemetry.semconv:opentelemetry-semconv:{{% param vers.semconv %}}-alpha`            |
| Código gerado para convenções semânticas incubadas | `io.opentelemetry.semconv:opentelemetry-semconv-incubating:{{% param vers.semconv %}}-alpha` |

{{% alert %}} Enquanto `opentelemetry-semconv` e
`opentelemetry-semconv-incubating` incluem o sufixo `-alpha` e estão sujeitos a
mudanças incompatíveis, a intenção é estabilizar a `opentelemetry-semconv` e
remover o sufixo `-alpha` em `opentelemetry-semconv-incubating` permanentemente.
Bibliotecas podem utilizar `opentelemetry-semconv-incubating` para testes, but
should not include it as a dependency: since attributes may come and go from
version to version, including it as a dependency may expose end users to runtime
errors when transitive version conflicts occur. {{% /alert %}}

The attribute constants generated from semantic conventions are instances of
`AttributeKey<T>`, and can be used anywhere the OpenTelemetry API accepts
attributes.

O trecho de código a seguir explora o uso da API de
`semantic convention attribute`:

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

### Bagagem

[Bagagem](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/baggage/Baggage.html)
is a bundle of application defined key-value pairs associated with a distributed
request or workflow execution. Bagagem keys and values are strings, and values
have optional string metadata. Telemetry can be enriched with data from baggage
by configuring the [SDK](../sdk/) to add entries as attributes to spans,
metrics, and log records. The baggage API is built on top of
[context](#contexto), which allows span context to be implicitly passed around
an application and across threads. Most of the context API usage guidance
applies to baggage.

Bagagem é propagada através dos limites da aplicação com o
[W3CBaggagePropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/baggage/propagation/W3CBaggagePropagator.html)
(veja [TextMapPropagator](../sdk/#textmappropagator) para detalhes).

O trecho de código a seguir explora o uso da API `Baggage`:

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

## API em incubação

O Artefato
`io.opentelemetry:opentelemetry-api-incubator:{{% param vers.otel %}}-alpha`
contém traços, métricas, registros e contextos de APIs experimentais. APIs em
incubação estão sujeitos a mudanças incompatíveis em versões menores.
Frequentemente, essas APIs representam funcionalidades experimentais de
especificação ou designs de API que queremos avaliar com o feedback dos usuários
antes de nos comprometer com elas. Encorajamos os usuários a testarem essas APIs
e abrir problemas _issues_ com qualquer feedback (positivo ou negativo).
Bibliotecas não devem depender dessas APIs em incubação, pois os usuários podem
estar sujeitos a erros em tempo de execução quando ocorrem conflitos de versão
transitivos.

Veja
[incubator README](https://github.com/open-telemetry/opentelemetry-java/tree/main/api/incubator)
Para APIs disponíveis e exemplos de uso.
