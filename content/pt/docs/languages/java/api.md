---
title: Registrar Telemetria com a API
weight: 11
default_lang_commit: 7c6d317a1ed969bd03f0aa8297f068ca29c2b459 # patched
aliases:
  - /docs/languages/java/api-components/
logBridgeWarning: >
  Embora as APIs `LoggerProvider` / `Logger` sejam estruturalmente semelhantes
  às APIs equivalentes de rastros e métricas, elas atendem a um caso de uso
  diferente. Até o momento, `LoggerProvider` / `Logger` e classes associadas
  representam a [Log Bridge API](/docs/specs/otel/logs/api/), que existe para
  escrever anexadores de log _(log appenders)_ a fim de _ integrar logs
  registrados por meio de outras APIs / _frameworks_ de log no OpenTelemetry.
  Elas não são destinadas ao uso do usuário final como alternativas para Log4j /
  SLF4J / Logback / etc.
cSpell:ignore: Dotel kotlint Logback updowncounter
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/api"?>

A API é um conjunto de classes e interfaces para registrar telemetria em sinais
de observabilidade chave. O [SDK](../sdk/) é a implementação de referência
integrada da API, [configurada](../configuration/) para processar e exportar
telemetria. Esta página fornece uma visão conceitual da API, incluindo
descrições, links para Javadocs relevantes, coordenadas dos artefatos e exemplos
de uso da API.

A API consiste nos seguintes componentes de alto nível:

- [Context](#context-api): Uma API autônoma para propagação de contexto em toda
  uma aplicação além de seus limites, incluindo contexto de rastros e bagagem.
- [TracerProvider](#tracerprovider): O ponto de entrada da API para rastros.
- [MeterProvider](#meterprovider): O ponto de entrada da API para métricas.
- [LoggerProvider](#loggerprovider): O ponto de entrada da API para logs.
- [OpenTelemetry](#opentelemetry): Um agregador dos principais componentes da
  API em alto nível (`TracerProvider`, `MeterProvider`, `LoggerProvider`,
  `ContextPropagators`), útil para ser repassado às instrumentações.

A API é projetada para suportar múltiplas implementações. Duas implementações
são fornecidas pelo OpenTelemetry:

- Implementação de referência [SDK](../sdk/). É a escolha certa para a maioria
  dos usuários.
- Implementação [Noop](#noop-implementation). Uma implementação minimalista, sem
  dependências, usada por padrão pelas instrumentações quando o usuário não
  instala uma instância configurada.

A API é projetada para ser tomada como uma dependência direta por bibliotecas,
_frameworks_ e aplicações. Oferecendo
[fortes garantias de compatibilidade retroativa](https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#compatibility-requirements),
não possui dependências transitivas e
[suporta Java 8+](https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#language-version-compatibility).
Bibliotecas e _frameworks_ devem depender apenas da API, invocar somente seus
métodos e instruir aplicações e usuários finais a adicionar uma dependência no
SDK e configurar uma instância adequada.

{{% alert title=Javadoc %}} Para a referência Javadoc de todos os componentes
Java do OpenTelemetry, consulte
[javadoc.io/doc/io.opentelemetry](https://javadoc.io/doc/io.opentelemetry).
{{% /alert %}}

## Componentes da API {#api-components}

As seções a seguir descrevem a API OpenTelemetry. Cada seção inclui:

- Uma breve descrição, incluindo um _link_ para a referência no Javadoc.
- _Links_ para recursos relevantes que ajudam a entender os métodos e argumentos
  da API.
- Exemplos simples de uso da API.

## Context API

O artefato `io.opentelemetry:opentelemetry-api-context:{{% param vers.otel %}}`
contém APIs independentes (ou seja, empacotadas separadamente da
[OpenTelemetry API](#opentelemetry-api)) para propagação de contexto em toda a
aplicação e entre seus limites.

Consiste em:

- [Context](#context): Um conjunto imutável de pares chave-valor que é propagado
  implícita ou explicitamente por uma aplicação.
- [ContextStorage](#contextstorage): Um mecanismo para armazenar e recuperar o
  contexto atual, com padrão em _thread_ local.
- [ContextPropagators](#context): Um contêiner de propagadores registrados para
  propagar `Context` entre limites de aplicação.

O artefato
`io.opentelemetry:opentelemetry-extension-kotlint:{{% param vers.otel %}}` é uma
extensão que fornece ferramentas para propagar contexto em corrotinas
_(coroutines)_.

### Context

[Context](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/Context.html)
é um conjunto imutável de pares chave-valor, com utilitários para propagação
implícita em uma aplicação e entre _threads_. Propagação implícita significa que
o contexto pode ser acessado sem ser explicitamente passado como argumento.
Context é um conceito recorrente na API do OpenTelemetry:

- O [Trecho](#span) ativo atual é armazenado no contexto, e por padrão o trecho
  pai é atribuído ao trecho que está no contexto no momento.
- As medições registradas em [instrumentos de métricas](#meter) aceitam um
  argumento de contexto, utilizado para vincular medições a trechos via
  [exemplares](/docs/specs/otel/metrics/data-model/#exemplars) e assumindo como
  padrão o trecho presente no contexto.
- [LogRecords](#logrecordbuilder) aceitam um argumento de contexto, usado para
  vincular registros de log a trechos, assumindo como padrão o trecho presente
  no contexto.

O exemplo de código a seguir explora o uso da API `Context`:

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
    // Defina uma chave de contexto de exemplo
    ContextKey<String> exampleContextKey = ContextKey.named("example-context-key");

    // O Context não contém a chave até que a adicionemos
    // Context.current() acessa o contexto atual
    // saída => valor do contexto atual: null
    System.out.println("valor do contexto atual: " + Context.current().get(exampleContextKey));

    // Adicione uma entrada ao contexto
    Context context = Context.current().with(exampleContextKey, "valor");

    // A variável local 'context' contém o valor adicionado
    // saída => valor do contexto: valor
    System.out.println("valor do contexto: " + context.get(exampleContextKey));
    // O contexto atual ainda não possui o valor
    // saída => valor do contexto atual: null
    System.out.println("valor do contexto atual: " + Context.current().get(exampleContextKey));

    // Chamar context.makeCurrent() define Context.current() para este contexto até que o escopo seja
    // fechado; então Context.current() é restaurado ao estado anterior ao momento em que
    // context.makeCurrent() foi chamado. O Scope resultante implementa AutoCloseable e é normalmente
    // usado em um bloco 'try-with-resources'. Deixar de chamar Scope.close() é um erro e pode
    // causar vazamentos de memória (memory leak) ou outros problemas.
    try (Scope scope = context.makeCurrent()) {
      // O contexto atual agora contém o valor adicionado
      // saída => valor do contexto atual: valor
      System.out.println("context value: " + Context.current().get(exampleContextKey));
    }

    // A variável local 'context' ainda contém o valor adicionado
    // saída => valor do contexto: valor
    System.out.println("context value: " + context.get(exampleContextKey));
    // O contexto atual não contém mais o valor
    // saída => valor do contexto atual: null
    System.out.println("current context value: " + Context.current().get(exampleContextKey));

    ExecutorService executorService = Executors.newSingleThreadExecutor();
    ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);

    // As instâncias de Context podem ser passadas explicitamente pelo código da aplicação, mas é mais
    // conveniente usar o contexto implícito, chamando Context.makeCurrent() e acessando via
    // Context.current().
    // Context fornece uma variedade de utilitários para a propagação de contexto implícita.
    // Estes utilitários encapsulam classes utilitárias como Scheduler, ExecutorService,
    // ScheduledExecutorService, Runnable, Callable, Consumer, Supplier, Function, etc., e modificam
    // seu comportamento para chamar Context.makeCurrent() antes de executar.
    context.wrap(ContextUsage::callable).call();
    context.wrap(ContextUsage::runnable).run();
    context.wrap(executorService).submit(ContextUsage::runnable);
    context.wrap(scheduledExecutorService).schedule(ContextUsage::runnable, 1, TimeUnit.SECONDS);
    context.wrapConsumer(ContextUsage::consumer).accept(new Object());
    context.wrapConsumer(ContextUsage::biConsumer).accept(new Object(), new Object());
    context.wrapFunction(ContextUsage::function).apply(new Object());
    context.wrapSupplier(ContextUsage::supplier).get();
  }

  /** Exemplo de {@link java.util.concurrent.Callable}. */
  private static Object callable() {
    return new Object();
  }

  /** Exemplo de {@link Runnable}. */
  private static void runnable() {}

  /** Exemplo de {@link java.util.function.Consumer}. */
  private static void consumer(Object object) {}

  /** Exemplo de {@link java.util.function.BiConsumer}. */
  private static void biConsumer(Object object1, Object object2) {}

  /** Exemplo de {@link java.util.function.Function}. */
  private static Object function(Object object) {
    return object;
  }

  /** Exemplo de {@link java.util.function.Supplier}. */
  private static Object supplier() {
    return new Object();
  }
}
```

<!-- prettier-ignore-end -->

### ContextStorage

[ContextStorage](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/ContextStorage.html)
é um mecanismo para armazenar e recuperar o `Context` atual.

A implementação padrão de `ContextStorage` armazena `Context` em _thread_ local.

### ContextPropagators

[ContextPropagators](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/propagation/ContextPropagators.html)
é um contêiner de propagadores registrados para propagar `Context` através dos
limites entre aplicações. O contexto é injetado em um _carrier_ ao sair de uma
aplicação (ou seja, uma requisição HTTP de saída), e extraído de um _carrier_ ao
entrar em uma aplicação (ou seja, ao atender a uma requisição HTTP).

Consulte [SDK TextMapPropagators](../sdk/#textmappropagator) para implementações
de propagadores.

O trecho de código a seguir explora a API `ContextPropagators` para injeção:

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
    // Crie uma instância de ContextPropagators que propaga o contexto de rastros e o contexto de bagagem w3c
    ContextPropagators propagators =
        ContextPropagators.create(
            TextMapPropagator.composite(
                W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));

    // Crie um construtor para HttpRequest
    HttpClient httpClient = HttpClient.newBuilder().build();
    HttpRequest.Builder requestBuilder =
        HttpRequest.newBuilder().uri(new URI("http://127.0.0.1:8080/resource")).GET();

    // Dada uma instância de ContextPropagators, injete o contexto atual no carrier da requisição HTTP
    propagators.getTextMapPropagator().inject(Context.current(), requestBuilder, TEXT_MAP_SETTER);

    // Envie a requisição com o contexto injetado
    httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.discarding());
  }

  /** {@link TextMapSetter} com um carrier {@link HttpRequest.Builder}. */
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

O trecho de código a seguir explora a API `ContextPropagators` para extração:

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
    // Crie uma instância de ContextPropagators que propaga o contexto de rastros e o contexto de bagagem w3c
    ContextPropagators propagators =
        ContextPropagators.create(
            TextMapPropagator.composite(
                W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));

    // Crie um servidor que usa os propagadores para extrair o contexto das requisições
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
      // Extraia o contexto da requisição e torne-o o contexto atual
      Context extractedContext =
          contextPropagators
              .getTextMapPropagator()
              .extract(Context.current(), exchange, TEXT_MAP_GETTER);
      try (Scope scope = extractedContext.makeCurrent()) {
        // Execute o código usando o contexto extraído
      } finally {
        String response = "success";
        exchange.sendResponseHeaders(200, response.length());
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes(StandardCharsets.UTF_8));
        os.close();
      }
    }
  }

  /** {@link TextMapSetter} com um carrier {@link HttpExchange}. */
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
API do OpenTelemetry, incluindo rastros, métricas, logs, implementação _noop_,
bagagem, implementações-chave de `TextMapPropagator`, e uma dependência da
[Context API](#context-api).

### Provedores e Escopos {#providers-and-scopes}

Provedores e escopos são conceitos recorrentes na API do OpenTelemetry. Um
escopo _(scope)_ é uma unidade lógica dentro da aplicação com a qual a
telemetria é associada. Um provedor _(provider)_ fornece componentes para
registrar telemetria relativa a um determinado escopo:

- [TracerProvider](#tracerprovider) fornece [Tracers](#tracer) com escopo para
  registrar trechos.
- [MeterProvider](#meterprovider) fornece [Meters](#meter) com escopo para
  registrar métricas.
- [LoggerProvider](#loggerprovider) fornece [Loggers](#logger) com escopo para
  registrar logs.

{{% alert %}} {{% param logBridgeWarning %}} {{% /alert %}}

Um escopo é identificado pelo triplo (nome, versão, schemaUrl). É importante
garantir que a identidade do escopo seja única. Uma prática comum é definir o
nome do escopo como o nome do pacote ou nome de classe totalmente qualificado, e
definir a versão do escopo como a versão da biblioteca. Se for emitir telemetria
para múltiplos sinais (ou seja, métricas e rastros), o mesmo escopo deve ser
utilizado. Consulte
[escopo de instrumentação](/docs/concepts/instrumentation-scope/) para mais
detalhes.

O trecho de código a seguir explora o uso da API de provedor e escopo:

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

  private static final String SCOPE_NAME = "nome.totalmente.qualificado";
  private static final String SCOPE_VERSION = "1.0.0";
  private static final String SCOPE_SCHEMA_URL = "https://exemplo";

  public static void providersUsage(OpenTelemetry openTelemetry) {
    // Acesse os provedores a partir de uma instância do OpenTelemetry
    TracerProvider tracerProvider = openTelemetry.getTracerProvider();
    MeterProvider meterProvider = openTelemetry.getMeterProvider();
    // NOTE: LoggerProvider é um caso especial e deve ser usado apenas para fazer ponte de logs de
    // outras APIs / frameworks de logging para o OpenTelemetry.
    LoggerProvider loggerProvider = openTelemetry.getLogsBridge();

    // Acesse o tracer, meter e logger a partir dos provedores para registrar telemetria de um
    // escopo específico
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

    // ...opcionalmente, versões simplificadas estão disponíveis se a versão do escopo e schemaUrl não estiverem disponíveis
    tracer = tracerProvider.get(SCOPE_NAME);
    meter = meterProvider.get(SCOPE_NAME);
    logger = loggerProvider.get(SCOPE_NAME);
  }
}
```

<!-- prettier-ignore-end -->

### Attributes

[Attributes](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/common/Attributes.html)
é um conjunto de pares chave-valor representando a
[definição padrão de atributos](/docs/specs/otel/common/#attribute).

`Attributes` é um conceito recorrente na API do OpenTelemetry:

- [Trechos](#span), eventos de trechos e links de trechos possuem atributos.
- As medições registradas em [instrumentos de métrica](#meter) possuem
  atributos.
- [LogRecords](#logrecordbuilder) possuem atributos.

Consulte [atributos semânticos](#semantic-attributes) para constantes de
atributo geradas a partir das convenções semânticas.

Consulte [nomenclatura de atributos](/docs/specs/semconv/general/naming/) para
orientação sobre nomes de atributos.

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
  // Defina constantes estáticas para as chaves de atributos e reutilize para evitar alocações
  private static final AttributeKey<String> SHOP_ID = AttributeKey.stringKey("com.acme.shop.id");
  private static final AttributeKey<String> SHOP_NAME =
      AttributeKey.stringKey("com.acme.shop.name");
  private static final AttributeKey<Long> CUSTOMER_ID =
      AttributeKey.longKey("com.acme.customer.id");
  private static final AttributeKey<String> CUSTOMER_NAME =
      AttributeKey.stringKey("com.acme.customer.name");

  public static void attributesUsage() {
    // Utilize um inicializador varargs e chaves de atributo previamente alocadas. Esta é a forma mais eficiente
    // de criar atributos.
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

    // ...ou utilize um construtor.
    attributes =
        Attributes.builder()
            .put(SHOP_ID, "abc123")
            .put(SHOP_NAME, "opentelemetry-demo")
            .put(CUSTOMER_ID, 123)
            .put(CUSTOMER_NAME, "Jack")
            // Opcionalmente, inicialize chaves de atributos dinamicamente
            .put(AttributeKey.stringKey("com.acme.string-key"), "value")
            .put(AttributeKey.booleanKey("com.acme.bool-key"), true)
            .put(AttributeKey.longKey("com.acme.long-key"), 1L)
            .put(AttributeKey.doubleKey("com.acme.double-key"), 1.1)
            .put(AttributeKey.stringArrayKey("com.acme.string-array-key"), "value1", "value2")
            .put(AttributeKey.booleanArrayKey("come.acme.bool-array-key"), true, false)
            .put(AttributeKey.longArrayKey("come.acme.long-array-key"), 1L, 2L)
            .put(AttributeKey.doubleArrayKey("come.acme.double-array-key"), 1.1, 2.2)
            // Opcionalmente, omita a inicialização de AttributeKey
            .put("com.acme.string-key", "value")
            .put("com.acme.bool-key", true)
            .put("come.acme.long-key", 1L)
            .put("come.acme.double-key", 1.1)
            .put("come.acme.string-array-key", "value1", "value2")
            .put("come.acme.bool-array-key", true, false)
            .put("come.acme.long-array-key", 1L, 2L)
            .put("come.acme.double-array-key", 1.1, 2.2)
            .build();

    // Attributes possui uma variedade de métodos para manipular e ler dados.
    // Leia uma chave de atributo:
    String shopIdValue = attributes.get(SHOP_ID);
    // Verifique o tamanho:
    int size = attributes.size();
    boolean isEmpty = attributes.isEmpty();
    // Converta para uma representação em mapa:
    Map<AttributeKey<?>, Object> map = attributes.asMap();
    // Itere sobre as entradas, imprimindo cada uma no formato: <chave> (<tipo>): <valor>\n
    attributes.forEach(
        (attributeKey, value) ->
            System.out.printf(
                "%s (%s): %s%n", attributeKey.getKey(), attributeKey.getType(), value));
    // Converta para um construtor, remova o com.acme.customer.id e qualquer entrada cuja chave comece com
    // com.acme.shop, e crie uma nova instância:
    AttributesBuilder builder = attributes.toBuilder();
    builder.remove(CUSTOMER_ID);
    builder.removeIf(attributeKey -> attributeKey.getKey().startsWith("com.acme.shop"));
    Attributes trimmedAttributes = builder.build();
  }
}
```
<!-- prettier-ignore-end -->

### OpenTelemetry

{{% alert title="Spring Boot Starter" %}} O _Spring Boot starter_ é um caso
especial em que `OpenTelemetry` está disponível como um _Spring bean_. Basta
injetar `OpenTelemetry` em seus componentes Spring.

Saiba mais sobre
[como estender o Spring Boot starter com instrumentação manual personalizada](/docs/zero-code/java/spring-boot-starter/api/).
{{% /alert %}}

[OpenTelemetry](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/OpenTelemetry.html)
é um agregador dos componentes principais da API de alto nível, conveniente para
ser repassado às instrumentações.

`OpenTelemetry` consiste em:

- [TracerProvider](#tracerprovider): O ponto de entrada da API para rastros.
- [MeterProvider](#meterprovider): O ponto de entrada da API para métricas.
- [LoggerProvider](#loggerprovider): O ponto de entrada da API para logs.
- [ContextPropagators](#contextpropagators): O ponto de entrada da API para
  propagação de contexto.

O trecho de código a seguir explora o uso da API `OpenTelemetry`:

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
    // Acesse TracerProvider, MeterProvider, LoggerProvider, ContextPropagators
    TracerProvider tracerProvider = openTelemetry.getTracerProvider();
    MeterProvider meterProvider = openTelemetry.getMeterProvider();
    LoggerProvider loggerProvider = openTelemetry.getLogsBridge();
    ContextPropagators propagators = openTelemetry.getPropagators();
  }
}
```

<!-- prettier-ignore-end -->

### GlobalOpenTelemetry

{{% alert title="Java agent" %}} O Java agent é um caso especial em que
`GlobalOpenTelemetry` é configurado pelo agente. Basta chamar
`GlobalOpenTelemetry.get()` para acessar a instância de `OpenTelemetry`.

Saiba mais sobre
[como estender o Java agent com instrumentação manual personalizada](/docs/zero-code/java/agent/api/).
{{% /alert %}}

[GlobalOpenTelemetry](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/GlobalOpenTelemetry.html)
mantém uma instância global única _(singleton)_ de
[OpenTelemetry](#opentelemetry).

Instrumentações devem evitar utilizar `GlobalOpenTelemetry`. Em vez disso, devem
aceitar `OpenTelemetry` como argumento de inicialização e padronizar para a
[implementação Noop](#noop-implementation) caso não seja configurado. Há uma
exceção a esta regra: a instância `OpenTelemetry` instalada pelo
[Java agent](/docs/zero-code/java/agent/) está disponível via
`GlobalOpenTelemetry`. Usuários que possuem instrumentação manual adicional são
encorajados a acessá-la via `GlobalOpenTelemetry.get()`.

`GlobalOpenTelemetry.get()` é garantido para sempre retornar o mesmo resultado.
Se `GlobalOpenTelemetry.get()` for chamado antes de
`GlobalOpenTelemetry.set(..)`, `GlobalOpenTelemetry` será configurado para a
implementação _noop_, e chamadas posteriores a `GlobalOpenTelemetry.set(..)`
lançarão uma exceção. Portanto, é crítico chamar `GlobalOpenTelemetry.set(..)` o
mais cedo possível no ciclo de vida da aplicação, e antes que
`GlobalOpenTelemetry.get()` seja chamado por qualquer instrumentação. Essa
garantia ajuda a identificar problemas de ordem de inicialização: chamar
`GlobalOpenTelemetry.set()` tarde demais (ou seja, depois que a instrumentação
chamou `GlobalOpenTelemetry.get()`) dispara uma exceção em vez de falhar
silenciosamente.

Se a [autoconfiguração](../configuration/#zero-code-sdk-autoconfigure) estiver
presente, `GlobalOpenTelemetry` pode ser inicializado automaticamente definindo
`-Dotel.java.global-autoconfigure.enabled=true` (ou via variável de ambiente
`export OTEL_JAVA_GLOBAL_AUTOCONFIGURE_ENABLED=true`). Quando habilitado, a
primeira chamada para `GlobalOpenTelemetry.get()` dispara a configuração
automática e chama `GlobalOpenTelemetry.set(..)` com a instância resultante de
`OpenTelemetry`.

O trecho de código a seguir explora o uso de `GlobalOpenTelemetry` para
propagação de contexto:

<!-- prettier-ignore-start -->

<?code-excerpt "src/main/java/otel/GlobalOpenTelemetryUsage.java"?>

```java
package otel;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.OpenTelemetry;

public class GlobalOpenTelemetryUsage {

  public static void openTelemetryUsage(OpenTelemetry openTelemetry) {
    // Configure a instância GlobalOpenTelemetry o mais cedo possível no ciclo de vida da aplicação
    // O método set deve ser chamado apenas uma vez. Chamadas múltiplas disparam uma exceção.
    GlobalOpenTelemetry.set(openTelemetry);

    // Obtenha a instância GlobalOpenTelemetry.
    openTelemetry = GlobalOpenTelemetry.get();
  }
}
```

<!-- prettier-ignore-end -->

### TracerProvider

[TracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/TracerProvider.html)
é o ponto de entrada da API para rastros e fornece [Tracers](#tracer). Consulte
[provedores e escopos](#providers-and-scopes) para mais informações sobre
provedores e escopos.

#### Tracer

[Tracer](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/Tracer.html)
é usado para [registrar trecos](#span) para um escopo de instrumentação.
Consulte [provedores e escopos](#providers-and-scopes) para mais informações
sobre provedores e escopos.

#### Trecho (Span) {#span}

[SpanBuilder](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/SpanBuilder.html)
e
[Span](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/Span.html)
são usados para construir e registrar dados em trechos.

`SpanBuilder` é usado para adicionar dados a um trecho antes de iniciá-lo
chamando `Span startSpan()`. É possível adicionar / atualizar dados após o
início chamando métodos de atualização variados de `Span`. Os dados fornecidos
ao `SpanBuilder` antes do início são utilizados como entrada para os
[Samplers](../sdk/#sampler).

O trecho de código a seguir explora o uso da API `SpanBuilder` / `Span`:

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
    // Obtenha um construtor de trecho (span builder) informando o nome do trecho
    Span span =
        tracer
            .spanBuilder("span name")
            // Defina o tipo (kind) do trecho
            .setSpanKind(SpanKind.INTERNAL)
            // Defina atributos
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
            // Opicionalmente, omita a inicialização explícita de AttributeKey
            .setAttribute("com.acme.string-key", "value")
            .setAttribute("com.acme.bool-key", true)
            .setAttribute("come.acme.long-key", 1L)
            .setAttribute("come.acme.double-key", 1.1)
            .setAllAttributes(WIDGET_RED_CIRCLE)
            // Descomente para, opcionalmente, definir o contexto do trecho pai.
            // Se omitido, o pai será definido usando Context.current()
            // .setParent(parentContext)
            // Descomente para, opcionalmente, adicionar links de trecho.
            // .addLink(linkContext, linkAttributes)
            // Inicie o trecho
            .startSpan();

    // Verifique se o trecho está registrando antes de computar dados adicionais
    if (span.isRecording()) {
      // Atualize o nome do trecho com informações não disponíveis no início
      span.updateName("new span name");

      // Adicione atributos adicionais que não estavam disponíveis no início
      span.setAttribute("com.acme.string-key2", "value");

      // Adicione links de trecho adicionais que não estavam disponíveis no início
      span.addLink(exampleLinkContext());
      // opcionalmente, inclua atributos no link
      span.addLink(exampleLinkContext(), WIDGET_RED_CIRCLE);

      // Adicione eventos ao trecho
      span.addEvent("my-event");
      // opcionalmente, inclua atributos no evento
      span.addEvent("my-event", WIDGET_RED_CIRCLE);

      // Registre exceção; é um atalho (syntactic sugar) para um evento de trecho com formato específico
      span.recordException(new RuntimeException("error"));

      // Defina o status do trecho
      span.setStatus(StatusCode.OK, "status description");
    }

    // Finalmente, finalize o trecho
    span.end();
  }

  /** Retorna um contexto de link fictício (dummy). */
  private static SpanContext exampleLinkContext() {
    return Span.fromContext(current()).getSpanContext();
  }
}
```

<!-- prettier-ignore-end -->

A relação de parentesco entre trechos _(span parenting_) é um aspecto importante
do rastreamento. Cada trecho tem um pai opcional. Ao coletar todos os trechos de
um rastro e seguir o pai de cada trecho, podemos construir uma hierarquia. As
APIs de trecho são construídas sobre o [contexto](#context), o que permite que o
contexto do trecho seja passado implicitamente por uma aplicação e entre
_threads_. Quando um trecho é criado, seu pai é definido como o trecho que
estiver presente em `Context.current()`, a menos que não exista trecho ou que o
contexto seja substituído explicitamente.

A maior parte das orientações de uso da API de contexto se aplica aos trechos. O
contexto do trecho é propagado através de limites entre aplicações com o
[W3CTraceContextPropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/propagation/W3CTraceContextPropagator.html)
e outros [TextMapPropagators](../sdk/#textmappropagator).

O trecho de código a seguir explora a propagação de contexto com a API de
`Span`:

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
    // Inicie um trecho. Como não chamamos makeCurrent(), devemos definir explicitamente o pai
    // nos trechos filhos. Envolva o código em try/finally para garantir que o trecho será finalizado.
    Span span = tracer.spanBuilder("span").startSpan();
    try {
      // Inicie um trecho filho, definindo explicitamente o pai.
      Span childSpan =
          tracer
              .spanBuilder("span child")
              // Defina explicitamente o pai.
              .setParent(span.storeInContext(Context.current()))
              .startSpan();
      // Chame makeCurrent(), adicionando childSpan ao Context.current(). Trechos criados dentro do escopo
      // terão seu pai definido como childSpan.
      try (Scope childSpanScope = childSpan.makeCurrent()) {
        // Chame outro método que cria um trecho. O pai do trecho será childSpan, já que ele foi iniciado
        // no escopo do childSpan.
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
é o ponto de entrada da API para métricas e fornece [Meters](#meter). Consulte
[provedores e escopos](#providers-and-scopes) para informações sobre provedores
e escopos.

#### Meter

[Meter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/Meter.html)
é usado para obter instrumentos para um
[escopo de instrumentação](#providers-and-scopes) particular. Consulte
[provedores e escopos](#providers-and-scopes) para informações sobre provedores
e escopos. Há uma variedade de instrumentos, cada um com diferentes semânticas e
comportamento padrão distinto no SDK. É importante escolher o instrumento
adequado para cada caso de uso:

| Instrumento                                                              | Síncrono ou Assíncrono | Descrição                                                                          | Exemplo                                                         | Agregação padrão do SDK                                                                        |
| ------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Contador (Counter)](#counter)                                           | síncrono               | Registra valores monotônicos (positivos).                                          | Registrar logins de usuários                                    | [sum (monotonic=true)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                          |
| [Contador Assíncrono (Async Counter)](#async-counter)                    | assíncrono             | Observa somas monotônicas.                                                         | Observar número de classes carregadas na JVM                    | [sum (monotonic=true)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                          |
| [Contador UpDown (UpDownCounter)](#updowncounter)                        | síncrono               | Registra valores não monotônicos (positivos e negativos).                          | Registrar quando itens são adicionados e removidos de uma fila  | [sum (monotonic=false)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                         |
| [Contador UpDown Assíncrono (Async UpDownCounter)](#async-updowncounter) | assíncrono             | Observa somas não monotônicas (positivas e negativas).                             | Observar uso de _pool_ de memória da JVM                        | [sum (monotonic=false)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                         |
| [Histograma (Histogram)](#histogram)                                     | síncrono               | Registra valores monotônicos (positivos) onde a distribuição é importante.         | Registrar duração de requisições HTTP processadas pelo servidor | [ExplicitBucketHistogram](/docs/specs/otel/metrics/sdk/#explicit-bucket-histogram-aggregation) |
| [Medidor (Gauge)](#gauge)                                                | síncrono               | Registra o valor mais recente onde a reagregação espacial não faz sentido **[1]**. | Registrar temperatura                                           | [LastValue](/docs/specs/otel/metrics/sdk/#last-value-aggregation)                              |
| [Medidor Assíncrono (Async Gauge)](#async-gauge)                         | assíncrono             | Observa o valor mais recente onde a reagregação espacial não faz sentido **[1]**.  | Observar utilização de CPU                                      | [LastValue](/docs/specs/otel/metrics/sdk/#last-value-aggregation)                              |

**[1]**: Reagregação espacial é o processo de mesclar fluxos de atributos
descartando atributos que não são necessários. Por exemplo, dadas séries com
atributos `{"cor": "vermelha", "forma": "quadrada"}`,
`{"cor": "azul", "forma": "quadrada"}`, você pode realizar reagregação espacial
descartando o atributo `cor` e mesclando as séries cujos os atributos são iguais
após descartar `cor`. A maioria das agregações possui uma função útil de mescla
espacial (ou seja, somas são somadas), mas medidores _(gauges)_ agregados por
`LastValue` são a exceção. Por exemplo, suponha que as séries mencionadas
anteriormente estejam rastreando a temperatura de _widgets_. Como você mescla as
séries quando descarta o atributo `color`? Não há uma boa resposta além de
selecionar um valor aleatório.

As APIs dos instrumentos compartilham diversas características:

- Criadas usando o padrão _builder_.
- Nome de instrumento obrigatório.
- Unidade e descrição são opcionais.
- Registram valores `long` ou `double`, configurados via _builder_.

Consulte as
[diretrizes de métricas](/docs/specs/semconv/general/metrics/#general-guidelines)
para mais detalhes sobre nomenclatura e unidades de métrica.

Consulta também as
[diretrizes para autores de bibliotecas de instrumentação](/docs/specs/otel/metrics/supplementary-guidelines/#guidelines-for-instrumentation-library-authors)
para orientação adicional sobre seleção de instrumento.

#### Contador (Counter) {#counter}

[LongCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongCounter.html)
e
[DoubleCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleCounter.html)
são usados para registrar valores monotônicos (positivos).

O trecho de código a seguir explora o uso da API de contador:

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
    // Constrói um contador para registrar medições que são sempre positivas (monotonicamente crescentes).
    LongCounter counter =
        meter
            .counterBuilder("fully.qualified.counter")
            .setDescription("A count of produced widgets")
            .setUnit("{widget}")
            // opcionalmente, altere o tipo para double
            // .ofDoubles()
            .build();

    // Registra uma medição sem atributos ou contexto.
    // Attributes defaults to Attributes.empty(), context to Context.current().
    counter.add(1L);

    // Registra uma medição com atributos, usando atributos pré-alocados sempre que possível.
    counter.add(1L, WIDGET_RED_CIRCLE);
    // Às vezes, os atributos devem ser calculados usando o contexto da aplicação.
    counter.add(
        1L, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // Registra uma medição com atributos e contexto.
    // A maioria dos usuários optará por omitir o argumento de contexto, preferindo o Context.current() padrão.
    counter.add(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```

<!-- prettier-ignore-end -->

#### Contador Assíncrono (Async Counter) {#async-counter}

[ObservableLongCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongCounter.html)
e
[ObservableDoubleCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleCounter.html)
são usados para observar somas monotônicas (positivas).

O trecho de código a seguir explora o uso da API de contador assíncrono:

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
  // Pré-alocar atributos sempre que possível
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void asyncCounterUsage(Meter meter) {
    AtomicLong widgetCount = new AtomicLong();

    // Constrói um contador assíncrono para observar um contador existente em um callback
    ObservableLongCounter asyncCounter =
        meter
            .counterBuilder("fully.qualified.counter")
            .setDescription("A count of produced widgets")
            .setUnit("{widget}")
            // opcionalmente, altere o tipo para double
            // .ofDoubles()
            .buildWithCallback(
                // o callback é invocado quando um MetricReader lê métricas
                observableMeasurement -> {
                  long currentWidgetCount = widgetCount.get();

                  // Registra uma medição sem atributos.
                  // Atributos possuem como padrão Attributes.empty().
                  observableMeasurement.record(currentWidgetCount);

                  // Registra uma medição com atributos, usando atributos pré-alocados sempre que possível.
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // Às vezes, os atributos devem ser calculados usando o contexto da aplicação.
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // opcionalmente, feche o contador para desregistrar o callback quando necessário
    asyncCounter.close();
  }
}
```

<!-- prettier-ignore-end -->

#### Contador UpDown (UpDownCounter) {#updowncounter}

[LongUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongUpDownCounter.html)
e
[DoubleUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleUpDownCounter.html)
são usados para registrar valores não monotônicos (positivos e negativos).

O trecho de código a seguir explora o uso da API contador UpDown:

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
    // Constrói um updowncounter para registrar medições positivas e negativas.
    LongUpDownCounter upDownCounter =
        meter
            .upDownCounterBuilder("fully.qualified.updowncounter")
            .setDescription("Current length of widget processing queue")
            .setUnit("{widget}")
            // opcionalmente, altere o tipo para double
            // .ofDoubles()
            .build();

    // Registra uma medição sem atributos ou contexto.
    // Atributos têm como padrão Attributes.empty(), e contexto Context.current().
    upDownCounter.add(1L);

    // Registra uma medição com atributos, usando atributos pré-alocados sempre que possível.
    upDownCounter.add(-1L, WIDGET_RED_CIRCLE);
    // Às vezes, os atributos devem ser calculados usando o contexto da aplicação.
    upDownCounter.add(
        -1L, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // Registra uma medição com atributos e contexto.
    // A maioria dos usuários optará por omitir o argumento de contexto, preferindo o Context.current() padrão.
    upDownCounter.add(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```

<!-- prettier-ignore-end -->

#### Contador UpDown Assíncrono (Async UpDownCounter) {#async-updowncounter}

[ObservableLongUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongUpDownCounter.html)
e
[ObservableDoubleUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleUpDownCounter.html)
são usados para observar somas não monotônicas (positivas e negativas).

O trecho de código a seguir explora o uso da API de contador UpDown assíncrono:

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

    // Constrói um contador UpDown assíncrono para observar um contador UpDown existente em um callback
    ObservableLongUpDownCounter asyncUpDownCounter =
        meter
            .upDownCounterBuilder("fully.qualified.updowncounter")
            .setDescription("Current length of widget processing queue")
            .setUnit("{widget}")
            // opcionalmente, altere o tipo para double
            // .ofDoubles()
            .buildWithCallback(
                // o callback é invocado quando um MetricReader lê métricas
                observableMeasurement -> {
                  long currentWidgetCount = queueLength.get();

                  // Registra uma medição sem atributos.
                  // Atributos têm como padrão Attributes.empty().
                  observableMeasurement.record(currentWidgetCount);

                  // Registra uma medição com atributos, usando atributos pré-alocados sempre que possível.
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // Às vezes, os atributos devem ser calculados usando o contexto da aplicação.
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // opcionalmente, feche o contador para desregistrar o callback quando necessário
    asyncUpDownCounter.close();
  }
}
```

<!-- prettier-ignore-end -->

#### Histograma (Histogram) {#histogram}

[DoubleHistogram](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleHistogram.html)
e
[LongHistogram](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongHistogram.html)
são usados para registrar valores monotônicos (positivos) onde a distribuição é
importante.

O trecho de código a seguir explora o uso da API de histograma:

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
    // Constrói um histograma para registrar medições onde a distribuição é importante.
    DoubleHistogram histogram =
        meter
            .histogramBuilder("fully.qualified.histogram")
            .setDescription("Length of time to process a widget")
            .setUnit("s")
            // Descomente para fornecer, opcionalmente, sugestões úteis de limites explícitos em buckets padrão
            // .setExplicitBucketBoundariesAdvice(Arrays.asList(1.0, 2.0, 3.0))
            // Descomente para, opcionalmente, alterar o tipo para long
            // .ofLongs()
            .build();

    // Registra uma medição sem atributos ou contexto.
    // Os atributos têm como padrão Attributes.empty(), e o contexto, Context.current().
    histogram.record(1.1);

    // Registra uma medição com atributos, usando atributos pré-alocados sempre que possível.
    histogram.record(2.2, WIDGET_RED_CIRCLE);
    // Às vezes, os atributos devem ser calculados utilizando o contexto da aplicação.
    histogram.record(
        3.2, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // Registra uma medição com atributos e contexto.
    // A maioria dos usuários optará por omitir o argumento de contexto, preferindo o Context.current() padrão.
    histogram.record(4.4, WIDGET_RED_CIRCLE, customContext());
  }
}
```

<!-- prettier-ignore-end -->

#### Medidor (Gauge) {#gauge}

[DoubleGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleGauge.html)
e
[LongGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongGauge.html)
são usados para registrar o último valor onde reagregação espacial não faz
sentido.

O trecho de código a seguir explora o uso da API de medidor:

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
    // Constrói um medidor para registrar medições conforme elas ocorrem, que não podem ser reagregadas espacialmente.
    DoubleGauge gauge =
        meter
            .gaugeBuilder("fully.qualified.gauge")
            .setDescription("The current temperature of the widget processing line")
            .setUnit("K")
            // Descomente para, opcionalmente, alterar o tipo para long
            // .ofLongs()
            .build();

    // Registra uma medição sem atributos ou contexto.
    // Os atributos têm como padrão Attributes.empty(), e o contexto, Context.current().
    gauge.set(273.0);

    // Registra uma medição com atributos, usando atributos pré-alocados sempre que possível.
    gauge.set(273.0, WIDGET_RED_CIRCLE);
    // Às vezes, os atributos devem ser calculados utilizando o contexto da aplicação.
    gauge.set(
        273.0,
        Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // Registra uma medição com atributos e contexto.
    // A maioria dos usuários optará por omitir o argumento de contexto, preferindo o Context.current() padrão.
    gauge.set(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```

<!-- prettier-ignore-end -->

#### Medidor Assíncrono (Async Gauge) {#async-gauge}

[ObservableDoubleGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleGauge.html)
e
[ObservableLongGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongGauge.html)
são usados para observar o último valor onde reagregação espacial não faz
sentido.

O trecho de código a seguir explora o uso da API de medidor assíncrono:

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

    // Constrói um medidor assíncrono para observar um medidor existente em um callback
    ObservableDoubleGauge asyncGauge =
        meter
            .gaugeBuilder("fully.qualified.gauge")
            .setDescription("The current temperature of the widget processing line")
            .setUnit("K")
            // Descomente para, opcionalmente, alterar o tipo para long
            // .ofLongs()
            .buildWithCallback(
                // o callback é invocado quando um MetricReader lê métricas
                observableMeasurement -> {
                  double currentWidgetCount = processingLineTemp.get();

                  // Registra uma medição sem atributos.
                  // Os atributos têm como padrão Attributes.empty().
                  observableMeasurement.record(currentWidgetCount);

                  // Registra uma medição com atributos, usando atributos pré-alocados sempre que possível.
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // Às vezes, os atributos devem ser calculados utilizando o contexto da aplicação.
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // Opcionalmente, feche o gauge para desregistrar o callback quando necessário.
    asyncGauge.close();
  }
}
```

<!-- prettier-ignore-end -->

### LoggerProvider

[LoggerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/LoggerProvider.html)
é o ponto de entrada da API para logs e fornece [Loggers](#logger). Consulte
[provedores e escopos](#providers-and-scopes) para informações sobre provedores
e escopos.

{{% alert %}} {{% param logBridgeWarning %}} {{% /alert %}}

#### Logger

[Logger](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/Logger.html)
é utilizado para [emitir registros de log](#logrecordbuilder) para um
[escopo de instrumentação](#providers-and-scopes). Consulte
[provedores e escopos](#providers-and-scopes) para informações sobre provedores
e escopos.

#### LogRecordBuilder

[LogRecordBuilder](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/LogRecordBuilder.html)
é utilizado para construir e emitir registros de log.

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
        // Define o corpo. Observação: setBody(..) é chamado várias vezes apenas para fins de demonstração,
        // mas apenas a última chamada é utilizada.
        // Define o corpo como uma string - atalho para setBody(Value.of("mensagem de log"))
        .setBody("mensagem de log")
        // Opcionalmente, define o corpo como um Value para registrar dados estruturados complexos
        .setBody(Value.of("mensagem de log"))
        .setBody(Value.of(1L))
        .setBody(Value.of(1.1))
        .setBody(Value.of(true))
        .setBody(Value.of(new byte[] {'a', 'b', 'c'}))
        .setBody(Value.of(Value.of("entrada1"), Value.of("entrada2")))
        .setBody(
            Value.of(
                Map.of(
                    "stringKey",
                    Value.of("entrada1"),
                    "mapKey",
                    Value.of(Map.of("stringKey", Value.of("entrada2"))))))
        // Define a severidade
        .setSeverity(Severity.DEBUG)
        .setSeverityText("debug")
        // Define o timestamp
        .setTimestamp(System.currentTimeMillis(), TimeUnit.MILLISECONDS)
        // Define o timestamp quando o log foi observado
        .setObservedTimestamp(System.currentTimeMillis(), TimeUnit.MILLISECONDS)
        // Define atributos
        .setAttribute(AttributeKey.stringKey("com.acme.string-key"), "valor")
        .setAttribute(AttributeKey.booleanKey("com.acme.bool-key"), true)
        .setAttribute(AttributeKey.longKey("com.acme.long-key"), 1L)
        .setAttribute(AttributeKey.doubleKey("com.acme.double-key"), 1.1)
        .setAttribute(
            AttributeKey.stringArrayKey("com.acme.string-array-key"),
            Arrays.asList("valor1", "valor2"))
        .setAttribute(
            AttributeKey.booleanArrayKey("come.acme.bool-array-key"), Arrays.asList(true, false))
        .setAttribute(AttributeKey.longArrayKey("come.acme.long-array-key"), Arrays.asList(1L, 2L))
        .setAttribute(
            AttributeKey.doubleArrayKey("come.acme.double-array-key"), Arrays.asList(1.1, 2.2))
        .setAllAttributes(WIDGET_RED_CIRCLE)
        // Descomente para, opcionalmente, explicitamente definir o contexto usado para correlacionar spans.
        // Se omitido, Context.current() é usado.
        // .setContext(context)
        // Emite o registro de log
        .emit();
  }
}
```
<!-- prettier-ignore-end -->

### Implementação Noop {#noop-implementation}

O método `OpenTelemetry#noop()` fornece acesso a uma implementação _noop_ de
[OpenTelemetry](#opentelemetry) e todos os componentes da API que ela
disponibiliza. Como o nome sugere, a implementação _noop_ não executa nenhuma
ação e é projetada para não ter impacto no desempenho. Ainda assim, a
instrumentação pode impactar a performance mesmo quando o _noop_ é usado, se ela
realizar computações ou alocações de valores de atributos e outros dados
necessários para registrar a telemetria. A implementação _noop_ é uma instância
padrão útil de `OpenTelemetry` quando o usuário ainda não configurou e instalou
uma implementação concreta, como o [SDK](../sdk/).

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
  private static final String SCOPE_NAME = "nome.qualificado";

  public static void noopUsage() {
    // Acessa a instância noop de OpenTelemetry
    OpenTelemetry noopOpenTelemetry = OpenTelemetry.noop();

    // Rastros noop
    Tracer noopTracer = OpenTelemetry.noop().getTracer(SCOPE_NAME);
    noopTracer
        .spanBuilder("nome do span")
        .startSpan()
        .setAttribute(WIDGET_SHAPE, "quadrado")
        .setStatus(StatusCode.OK)
        .addEvent("nome-do-evento", Attributes.builder().put(WIDGET_COLOR, "vermelho").build())
        .end();

    // Métricas noop
    Attributes attributes = WIDGET_RED_CIRCLE;
    Meter noopMeter = OpenTelemetry.noop().getMeter(SCOPE_NAME);
    DoubleHistogram histogram = noopMeter.histogramBuilder("nome.do.histograma").build();
    histogram.record(1.0, attributes);
    // contador (counter)
    LongCounter counter = noopMeter.counterBuilder("nome.do.contador").build();
    counter.add(1, attributes);
    // contador assíncrono (async counter)
    noopMeter
        .counterBuilder("nome.do.contador")
        .buildWithCallback(observable -> observable.record(10, attributes));
    // contador updown (updowncounter)
    LongUpDownCounter upDownCounter =
        noopMeter.upDownCounterBuilder("nome.do.contador.updown").build();
    // contador updown assíncrono (async updowncounter)
    noopMeter
        .upDownCounterBuilder("nome.do.contador.updown.assincrono")
        .buildWithCallback(observable -> observable.record(10, attributes));
    upDownCounter.add(-1, attributes);
    // medidor (gauge)
    DoubleGauge gauge = noopMeter.gaugeBuilder("nome.do.medidor").build();
    gauge.set(1.1, attributes);
    // medidor assíncrono (async gauge)
    noopMeter
        .gaugeBuilder("nome.do.medidor")
        .buildWithCallback(observable -> observable.record(10, attributes));

    // Logs noop
    Logger noopLogger = OpenTelemetry.noop().getLogsBridge().get(SCOPE_NAME);
    noopLogger
        .logRecordBuilder()
        .setBody("mensagem de log")
        .setAttribute(WIDGET_SHAPE, "quadrado")
        .setSeverity(Severity.INFO)
        .emit();
  }
}
```
<!-- prettier-ignore-end -->

### Atributos Semânticos {#semantic-attributes}

As [convenções semânticas](/docs/specs/semconv/) descrevem como coletar
telemetria de forma padronizada para operações comuns. Isso inclui um
[registro de atributos](/docs/specs/semconv/registry/attributes/), que lista as
definições de todos os atributos referenciados nas convenções, organizados por
domínio. O projeto
[semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)
gera constantes a partir das convenções semânticas, que podem ser utilizadas
para ajudar as instrumentações a manterem conformidade:

| Descrição                                         | Artefato                                                                                     |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Código gerado para convenções semânticas estáveis | `io.opentelemetry.semconv:opentelemetry-semconv:{{% param vers.semconv %}}-alpha`            |
| Código gerado para convenções semânticas em teste | `io.opentelemetry.semconv:opentelemetry-semconv-incubating:{{% param vers.semconv %}}-alpha` |

{{% alert %}} Embora ambos `opentelemetry-semconv` e
`opentelemetry-semconv-incubating` incluam o sufixo `-alpha` e possam sofrer
alterações incompatíveis, a intenção é estabilizar `opentelemetry-semconv` e
manter o sufixo `-alpha` permanentemente em `opentelemetry-semconv-incubating`.
Bibliotecas podem usar `opentelemetry-semconv-incubating` para testes, mas não
devem incluí-lo como dependência, pois os atributos podem mudar entre versões,
causando erros em tempo de execução devido a conflitos de versões transitivas.
{{% /alert %}}

As constantes de atributos geradas a partir de convenções semânticas são
instâncias de `AttributeKey<T>` e podem ser usadas em qualquer lugar onde a API
OpenTelemetry aceite atributos.

O trecho de código a seguir explora o uso da API de atributos semânticos:

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
    // Os atributos semânticos são organizados por domínio de nível superior e
    // classificados como estáveis ou experimentais.
    // Por exemplo:
    // - atributos estáveis iniciando com http.* estão na classe HttpAttributes.
    // - atributos estáveis iniciando com server.* estão na classe ServerAttributes.
    // - atributos experimentais iniciando com http.* estão na classe HttpIncubatingAttributes.
    // As chaves de atributo que definem uma enumeração de valores estão acessíveis em uma classe
    // interna {AttributeKey}Values.
    // Por exemplo, a enumeração de http.request.method valores está disponível na
    // classe HttpAttributes.HttpRequestMethodValues.
    Attributes attributes =
        Attributes.builder()
            .put(HttpAttributes.HTTP_REQUEST_METHOD, HttpAttributes.HttpRequestMethodValues.GET)
            .put(HttpAttributes.HTTP_ROUTE, "/users/:id")
            .put(ServerAttributes.SERVER_ADDRESS, "exemplo")
            .put(ServerAttributes.SERVER_PORT, 8080L)
            .put(HttpIncubatingAttributes.HTTP_RESPONSE_BODY_SIZE, 1024)
            .build();
  }
}
```
<!-- prettier-ignore-end -->

### Bagagem {#baggage}

[Baggage](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/baggage/Baggage.html)
é um conjunto de pares chave-valor definidos pela aplicação e associados a uma
requisição distribuída ou execução de fluxo de trabalho. As chaves e valores de
bagagem são _strings_, e os valores podem conter metadados opcionais (também em
_string_). A telemetria pode ser enriquecida com dados da bagagem configurando o
[SDK](../sdk/) para adicionar entradas como atributos em trechos, métricas e
registros de log. A API de bagagem é construída sobre a API do
[contexto](#context), que permite que o contexto de um trecho seja
implicitamente passado por toda a aplicação e entre _threads_. Grande parte das
orientações de uso da API de contexto também se aplicam à bagagem.

A Bagagem é propagada através dos limites da aplicação por meio do
[W3CBaggagePropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/baggage/propagation/W3CBaggagePropagator.html)
(consulte [TextMapPropagator](../sdk/#textmappropagator) para mais detalhes).

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
    // Acessa a bagagem atual com Baggage.current()
    // saída => bagagem atual: {}
    Baggage currentBaggage = Baggage.current();
    System.out.println("bagagem atual: " + asString(currentBaggage));
    // ...ou a partir de um Context
    currentBaggage = Baggage.fromContext(current());

    // Baggage possui uma variedade de métodos para manipular e ler dados.
    // Converter para builder e adicionar entradas:
    Baggage newBaggage =
        Baggage.current().toBuilder()
            .put("shopId", "abc123")
            .put("shopName", "opentelemetry-demo", BaggageEntryMetadata.create("metadata"))
            .build();
    // ...ou descomente para começar do zero
    // newBaggage = Baggage.empty().toBuilder().put("shopId", "abc123").build();
    // saída => nova bagagem: {shopId=abc123(), shopName=opentelemetry-demo(metadata)}
    System.out.println("nova bagagem: " + asString(newBaggage));
    // Lê de uma entrada:
    String shopIdValue = newBaggage.getEntryValue("shopId");
    // Verifica o tamanho:
    int size = newBaggage.size();
    boolean isEmpty = newBaggage.isEmpty();
    // Convert para uma representação de mapa:
    Map<String, BaggageEntry> map = newBaggage.asMap();
    // Itera sobre as entradas:
    newBaggage.forEach((s, baggageEntry) -> {});

    // A bagagem atual ainda não contém as novas entradas
    // saída => bagagem atual: {}
    System.out.println("bagagem atual: " + asString(Baggage.current()));

    // Chamar Baggage.makeCurrent() define Baggage.current() como bagagem atual até o fechamento do escopo,
    // momento em que Baggage.current() é restaurado ao estado anterior.
    try (Scope scope = newBaggage.makeCurrent()) {
      // A bagagem atual agora contém os novos valores
      // saída => bagagem atual: {shopId=abc123(), shopName=opentelemetry-demo(metadata)}
      System.out.println("bagagem atual: " + asString(Baggage.current()));
    }

    // A bagagem atual volta ao estado anterior:
    // saída => bagagem atual: {}
    System.out.println("bagagem atual: " + asString(Baggage.current()));
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

## APIs em Incubação {#incubating-api}

O artefato
`io.opentelemetry:opentelemetry-api-incubator:{{% param vers.otel %}}-alpha`
contém APIs experimentais de rastros, métrica, logs e contexto. Essas APIs estão
sujeitas a mudanças incompatíveis em versões secundárias _(minor releases)_.
Frequentemente, estas representam recursos experimentais da especificação ou
propostas de design que a comunidade deseja validar com o _feedback_ dos
usuários antes de torná-las definitivas. Os usuários são encorajados a
experimentar essas APIs e abrir _issues_ com qualquer tipo de _feedback_,
positivo ou negativo. Bibliotecas não devem depender das APIs em incubação, já
que os usuários podem ser expostos a erros em tempo de execução devido a
conflitos de versões transitivas.

Consulte o
[README do incubator](https://github.com/open-telemetry/opentelemetry-java/tree/main/api/incubator)
para ver as APIs disponíveis e exemplos de uso.
