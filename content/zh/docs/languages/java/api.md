---
title: 通过 API 记录遥测数据
weight: 11
aliases:
  - /docs/languages/java/api-components/
default_lang_commit: 7c6d317a1ed969bd03f0aa8297f068ca29c2b459 # patched
drifted_from_default: true
logBridgeWarning: >
  虽然 `LoggerProvider` 、 `Logger` API 在结构上与对应的链路和指标 API 相似，
  但它们的使用场景不同。目前，`LoggerProvider` 、 `Logger` 及相关类代表的是[日志桥接 API](/docs/specs/otel/logs/api/)，
  其存在的目的是编写日志附加器（log appenders），以便将通过其他日志 API、框架记录的日志桥接到 OpenTelemetry 中。
  它们并非供终端用户用作 Log4j、SLF4J、Logback 等日志框架的替代品。
cSpell:ignore: Dotel kotlint Logback updowncounter
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/api"?>

API 是一组类和接口，用于跨关键可观测性信号记录遥测数据。[SDK](../sdk/) 是 API 的内置参考实现，
[配置](../configuration/)可用于处理和导出遥测数据。本页面是对该 API 的概念性概述，
包括相关描述、指向相关 Javadoc 的链接、构件（artifact）坐标以及 API 使用示例。

该 API 由以下顶级组件构成：

- [Context](#context-api)：一个独立的 API，用于在整个应用程序内以及跨应用程序边界传播上下文，包括链路上下文和 Baggage（行李）。
- [TracerProvider](#tracerprovider)：链路功能的 API 入口点。
- [MeterProvider](#meterprovider)：指标功能的 API 入口点。
- [LoggerProvider](#loggerprovider)：日志功能的 API 入口点。
- [OpenTelemetry](#opentelemetry)：顶级 API 组件（即 `TracerProvider`、`MeterProvider`、`LoggerProvider`、`ContextPropagators`）的持有者，便于将这些组件传递给插桩（instrumentation）。

该 API 在设计上支持多种实现方式。OpenTelemetry 官方提供了以下两种实现：

- [SDK](../sdk/) 参考实现：这是大多数用户的理想选择。
- [Noop](#noop-implementation) 实现：一种极简的零依赖实现，当用户未安装实例时，插桩工具（instrumentations）会默认使用该实现。

该 API 被设计为可供库、框架及应用所有者直接依赖使用。它具备 [强大的向后兼容性保证](https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#compatibility-requirements)，零传递依赖，且 [支持 Java 8 及更高版本](https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#language-version-compatibility)。库和框架应仅依赖于该 API 并仅调用 API 中的方法，同时指导应用程序、终端用户添加对 SDK 的依赖并安装一个已配置的实例。

{{% alert title=Javadoc %}}
关于所有 OpenTelemetry Java 组件的 Javadoc 参考文档，
请参见 [javadoc.io/doc/io.opentelemetry](https://javadoc.io/doc/io.opentelemetry)。
{{% /alert %}}

## API 组件 {#api-components}

以下章节将对 OpenTelemetry API 进行介绍。每个组件章节均包含以下内容：

- 简要说明,包含该 Javadoc 类型参考文档的链接；
- 用于理解 API 方法及参数的相关资源链接；
- API 使用方式的简单示例演示。

## Context API {#context-api}

`io.opentelemetry:opentelemetry-api-context:{{% param vers.otel %}}` 构件包含独立的 API
（即与 [OpenTelemetry API](#opentelemetry-api) 分开打包），用于在整个应用程序内以及跨应用程序边界传播 Context。

它的构成包括：

- [Context](#context)：一个不可变的键值对集合，可在应用程序内通过隐式或显式方式传播。
- [ContextStorage](#contextstorage)：用于存储和获取当前 Context 的机制，默认基于线程本地实现。
- [ContextPropagators](#contextpropagators)：已注册传播器的容器，用于跨应用程序边界传播 `Context`。

`io.opentelemetry:opentelemetry-extension-kotlint:{{% param vers.otel %}}` 是一个扩展组件，
提供了在协程（coroutines）中传播 Context 的工具。

### Context {#context}

[Context](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/Context.html)
是一个不可变的键值对集合，附带在应用程序内及跨线程间进行隐式传播的工具。
隐式传播意味着无需将 Context 作为参数显式传递即可对其进行访问。Context 是 OpenTelemetry API 中一个反复出现的概念：

- 当前活跃的 [Span](#span) 存储在上下文中，默认情况下，一个 Span 的父级会被指定为当前上下文中的任意 Span。
- 记录到[指标插桩](#meter)的测量值会接收一个上下文参数，该参数用于通过[示例](/docs/specs/otel/metrics/data-model/#exemplars)将测量值与 Span 关联，
  且默认值为当前上下文中的任意 Span。
- [日志记录](#logrecordbuilder)接收一个上下文参数，用于将日志记录与 Span 关联，默认值为当前上下文中的任意 Span。

以下代码片段展示了 `Context` API 的使用方法：

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
    // 定义一个示例上下文 Key
    ContextKey<String> exampleContextKey = ContextKey.named("example-context-key");

    // 在添加 Key 之前，上下文中不包含该 Key
    // Context.current() 用于获取当前上下文
    // 输出 => current context value:: null
    System.out.println("current context value: " + Context.current().get(exampleContextKey));

    // 向 context 添加条目
    Context context = Context.current().with(exampleContextKey, "value");

    // 本地 context 变量包含已添加的值
    // 输出 => context value: 值
    System.out.println("context value: " + context.get(exampleContextKey));
    // 当前 context 仍然不包含该值
    // 输出 => current context value: null
    System.out.println("current context value: " + Context.current().get(exampleContextKey));

    // 调用 context.makeCurrent () 会将 Context.current () 设置为该 context，直到 scope 被关闭；
    // 关闭后, Context.current () 会恢复到调用 context.makeCurrent () 之前的状态。
    // 生成的 Scope 实现了 AutoCloseable 接口，通常在 try-with-resources 代码块中使用。
    // 未调用 Scope.close () 属于错误操作，可能会导致内存泄漏或其他问题。
    try (Scope scope = context.makeCurrent()) {
      // 当前 context 现在包含已添加的值
      // 输出 => context value: 值
      System.out.println("context value: " + Context.current().get(exampleContextKey));
    }

    // 本地 context 变量仍然包含已添加的值
    // 输出 => context value: 值
    System.out.println("context value: " + context.get(exampleContextKey));
    // 当前 context 不再包含该值
    // 输出 => current context value: null
    System.out.println("current context value: " + Context.current().get(exampleContextKey));

    ExecutorService executorService = Executors.newSingleThreadExecutor();
    ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);

    // context 实例可以在应用程序代码中显式传递，但使用隐式上下文更为为便捷,
    // 比如调用 Context.makeCurrent () 并通过 Context.current () 进行访问。
    // context 提供了许多用于隐式上下文传播的工具方法。这些工具方法包装了诸如 Scheduler、ExecutorService、
    // ScheduledExecutorService、Runnable、Callable、Consumer、Supplier、Function 等工具类，
    // 并修改了它们的行为，使其在运行前调用 Context.makeCurrent ()。
    context.wrap(ContextUsage::callable).call();
    context.wrap(ContextUsage::runnable).run();
    context.wrap(executorService).submit(ContextUsage::runnable);
    context.wrap(scheduledExecutorService).schedule(ContextUsage::runnable, 1, TimeUnit.SECONDS);
    context.wrapConsumer(ContextUsage::consumer).accept(new Object());
    context.wrapConsumer(ContextUsage::biConsumer).accept(new Object(), new Object());
    context.wrapFunction(ContextUsage::function).apply(new Object());
    context.wrapSupplier(ContextUsage::supplier).get();
  }

  /** 示例 {@link java.util.concurrent.Callable}. */
  private static Object callable() {
    return new Object();
  }

  /** 示例 {@link Runnable}. */
  private static void runnable() {}

  /** 示例 {@link java.util.function.Consumer}. */
  private static void consumer(Object object) {}

  /** 示例 {@link java.util.function.BiConsumer}. */
  private static void biConsumer(Object object1, Object object2) {}

  /** 示例 {@link java.util.function.Function}. */
  private static Object function(Object object) {
    return object;
  }

  /** 示例 {@link java.util.function.Supplier}. */
  private static Object supplier() {
    return new Object();
  }
}
```
<!-- prettier-ignore-end -->

### ContextStorage {#contextstorage}

[ContextStorage](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/ContextStorage.html)
是一种用于存储和检索当前 `Context` 的机制。

默认的 `ContextStorage` 实现将 `Context` 存储在线程本地中。

### ContextPropagators {#contextpropagators}

[ContextPropagators](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/propagation/ContextPropagators.html)
是一个已注册传播器的容器，用于跨应用程序边界传播 `Context`。当离开应用程序时（例如，发出一个出站 HTTP 请求），上下文会被注入到一个载体中, 且当进入应用程序时
（例如，处理一个传入的 HTTP 请求），会从载体中提取上下文。

有关传播器的实现，请参见 [SDK TextMapPropagators](../sdk/#textmappropagator)。

以下代码片段展示了用于注入操作的 `ContextPropagators` API：

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
    // 创建一个 ContextPropagators 实例，使其能传播 W3C 链路上下文和 W3C Baggage 数据
    ContextPropagators propagators =
        ContextPropagators.create(
            TextMapPropagator.composite(
                W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));

    // 创建一个 HttpRequest 构建器
    HttpClient httpClient = HttpClient.newBuilder().build();
    HttpRequest.Builder requestBuilder =
        HttpRequest.newBuilder().uri(new URI("http://127.0.0.1:8080/resource")).GET();

    // 给一个 ContextPropagators 实例，将当前 context 注入到 HTTP 请求载体中
    propagators.getTextMapPropagator().inject(Context.current(), requestBuilder, TEXT_MAP_SETTER);

    // 发送带有已注入上下文的请求
    httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.discarding());
  }

  /** 带有一个 {@link TextMapSetter} 载体的 {@link HttpRequest.Builder}。 */
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

以下代码片段展示了用于提取操作的 `ContextPropagators` API：

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
    // 创建一个 ContextPropagators 实例，使其能传播 W3C 链路上下文和 W3C Baggage 数据
    ContextPropagators propagators =
        ContextPropagators.create(
            TextMapPropagator.composite(
                W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));

    // 创建一个服务器，其使用传播器（propagators）从请求中提取上下文
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
      // 从请求中提取上下文并将其设为当前 context
      Context extractedContext =
          contextPropagators
              .getTextMapPropagator()
              .extract(Context.current(), exchange, TEXT_MAP_GETTER);
      try (Scope scope = extractedContext.makeCurrent()) {
        // 使用提取到的 context 进行工作
      } finally {
        String response = "success";
        exchange.sendResponseHeaders(200, response.length());
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes(StandardCharsets.UTF_8));
        os.close();
      }
    }
  }

  /** 带有一个 {@link HttpExchange} 载体的 {@link TextMapSetter} */
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

## OpenTelemetry API {#opentelemetry-api}

`io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}` 构件包含 OpenTelemetry API，包括链路、
指标、日志、空操作（noop）实现、 Baggage 数据、关键的 `TextMapPropagator` 实现，

以及对[上下文 API 的依赖](#context-api)。

### Provider 和 Scope {#providers-and-scopes}

在 OpenTelemetry API 中，提供器（Provider）与作用域（Scope）是反复出现的概念。
作用域是应用程序内的一个逻辑单元，遥测数据与之关联。
提供器用于提供与特定作用域相关的遥测记录组件：

- [TracerProvider](#tracerprovider) 提供带作用域的追踪器 [Tracer](#tracer)，用于记录 Span 数据。
- [MeterProvider](#meterprovider) 提供带作用域的 [Meter](#meter)，用于记录指标数据。
- [LoggerProvider](#loggerprovider) 提供带作用域的 [Logger](#logger)，用于记录日志数据。

{{% alert %}} {{% param logBridgeWarning %}} {{% /alert %}}

作用域（Scope）由三元组（name, version, schemaUrl）进行标识。
需注意确保作用域标识的唯一性，避免不同逻辑单元的遥测数据产生混淆。
一种典型方法是将作用域名称（scope name）设置为包名或完全限定的类名，并将作用域版本设置为库版本。
如果为多个信号（即指标和链路）生成遥测数据，应使用相同的作用域。
详情请参见 [instrumentation scope](/docs/concepts/instrumentation-scope/)。

以下是关于 Provider 和 Scope API 使用的代码示例：

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
    // 从 OpenTelemetry 实例中访问提供器（Provider）
    TracerProvider tracerProvider = openTelemetry.getTracerProvider();
    MeterProvider meterProvider = openTelemetry.getMeterProvider();
    // 注意：LoggerProvider属于特殊情况，仅应用于桥接来自其他（日志系统）的日志。
    // 将日志 API、框架桥接进 OpenTelemetry.
    LoggerProvider loggerProvider = openTelemetry.getLogsBridge();

    // 从提供器（Provider）中访问追踪器（Tracer）、指标器（Meter）、日志器（Logger），为特定作用域记录遥测数据
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

    // …… 此外，若作用域版本（scope version）和模式 URL（schemaUrl）不可用，也可使用简化版本。
    tracer = tracerProvider.get(SCOPE_NAME);
    meter = meterProvider.get(SCOPE_NAME);
    logger = loggerProvider.get(SCOPE_NAME);
  }
}
```
<!-- prettier-ignore-end -->

### Attributes {#attributes}

[Attributes](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/common/Attributes.html)
是一组键值对，代表[标准属性定义](/docs/specs/otel/common/#attribute)。

`Attributes` 是 OpenTelemetry API 中一个反复出现的概念：

- [Span](#span)， Span 事件，以及 Span 链接包含属性。
- 记录到[指标插桩](#meter)的测量数据包含属性。
- [日志记录](#logrecordbuilder) 包含属性。

有关从语义约定生成的属性常量，请参见[语义属性](#semantic-attributes)。

有关属性命名的指导，请参见[属性命名](/docs/specs/semconv/general/naming/)。

以下是 `Attributes` API 的使用示例代码：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AttributesUsage.java"?>
```javamingm
package otel;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;
import java.util.Map;

public class AttributesUsage {
  // 为属性键（attribute keys）建立静态常量并重复使用，以避免重新分配。
  private static final AttributeKey<String> SHOP_ID = AttributeKey.stringKey("com.acme.shop.id");
  private static final AttributeKey<String> SHOP_NAME =
      AttributeKey.stringKey("com.acme.shop.name");
  private static final AttributeKey<Long> CUSTOMER_ID =
      AttributeKey.longKey("com.acme.customer.id");
  private static final AttributeKey<String> CUSTOMER_NAME =
      AttributeKey.stringKey("com.acme.customer.name");

  public static void attributesUsage() {
    // 使用可变参数初始化器和预分配的属性键。这是创建属性最高效的方式。
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

    // ...或者使用一个构建器。
    attributes =
        Attributes.builder()
            .put(SHOP_ID, "abc123")
            .put(SHOP_NAME, "opentelemetry-demo")
            .put(CUSTOMER_ID, 123)
            .put(CUSTOMER_NAME, "Jack")
            // 也可按需动态初始化属性键（attribute keys）。
            .put(AttributeKey.stringKey("com.acme.string-key"), "value")
            .put(AttributeKey.booleanKey("com.acme.bool-key"), true)
            .put(AttributeKey.longKey("com.acme.long-key"), 1L)
            .put(AttributeKey.doubleKey("com.acme.double-key"), 1.1)
            .put(AttributeKey.stringArrayKey("com.acme.string-array-key"), "value1", "value2")
            .put(AttributeKey.booleanArrayKey("come.acme.bool-array-key"), true, false)
            .put(AttributeKey.longArrayKey("come.acme.long-array-key"), 1L, 2L)
            .put(AttributeKey.doubleArrayKey("come.acme.double-array-key"), 1.1, 2.2)
            // 也可选择省略初始化 AttributeKey
            .put("com.acme.string-key", "value")
            .put("com.acme.bool-key", true)
            .put("come.acme.long-key", 1L)
            .put("come.acme.double-key", 1.1)
            .put("come.acme.string-array-key", "value1", "value2")
            .put("come.acme.bool-array-key", true, false)
            .put("come.acme.long-array-key", 1L, 2L)
            .put("come.acme.double-array-key", 1.1, 2.2)
            .build();

    // Attributes 具有多种用于操作和读取数据的方法。
    // 读取一个 attribute key:
    String shopIdValue = attributes.get(SHOP_ID);
    // 检查 size：
    int size = attributes.size();
    boolean isEmpty = attributes.isEmpty();
    // 转换为 map 表示形式：
    Map<AttributeKey<?>, Object> map = attributes.asMap();
    // 遍历条目，将每个条目打印到模板中： <key> (<type>): <value>\n
    attributes.forEach(
        (attributeKey, value) ->
            System.out.printf(
                "%s (%s): %s%n", attributeKey.getKey(), attributeKey.getType(), value));
    // 转换为构建器，移除 com.acme.customer.id 以及任何 key 以 com.acme.shop 开头的条目，然后构建一个新实例：
    AttributesBuilder builder = attributes.toBuilder();
    builder.remove(CUSTOMER_ID);
    builder.removeIf(attributeKey -> attributeKey.getKey().startsWith("com.acme.shop"));
    Attributes trimmedAttributes = builder.build();
  }
}
```
<!-- prettier-ignore-end -->

### OpenTelemetry {##opentelemetry}

{{% alert title="Spring Boot 启动器" %}}
Spring Boot 启动器是一种特殊情况，其中 `OpenTelemetry` 可作为 Spring bean 使用。
只需将 `OpenTelemetry` 注入到你的 Spring 组件中即可。

了解更多关于 [使用自定义手动插桩扩展 Spring Boot 启动器](/docs/zero-code/java/spring-boot-starter/api/) 的信息
{{% /alert %}}

[OpenTelemetry](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/OpenTelemetry.html)
是顶级 API 组件的持有者，便于将其传递给插桩（instrumentation）。

`OpenTelemetry` 包含:

- [TracerProvider](#tracerprovider): 链路的 API 入口点。
- [MeterProvider](#meterprovider): 指标的 API 入口点。
- [LoggerProvider](#loggerprovider): 日志的 API 入口点。
- [ContextPropagators](#contextpropagators): 上下文传播器的 API 入口点。

以下代码片段展示了 OpenTelemetry API 的用法：

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
    // 访问 TracerProvider, MeterProvider, LoggerProvider, ContextPropagators
    TracerProvider tracerProvider = openTelemetry.getTracerProvider();
    MeterProvider meterProvider = openTelemetry.getMeterProvider();
    LoggerProvider loggerProvider = openTelemetry.getLogsBridge();
    ContextPropagators propagators = openTelemetry.getPropagators();
  }
}
```
<!-- prettier-ignore-end -->

### GlobalOpenTelemetry {#globalopentelemetry}

{{% alert title="Java agent" %}} Java agent 是一种特殊情况，其中 `GlobalOpenTelemetry` 由 agent 进行设置。
只需调用 `GlobalOpenTelemetry.get()` 即可访问 `OpenTelemetry` 实例。

了解更多关于[使用自定义手动插桩扩展 Java agent] 的信息(/docs/zero-code/Java/agent/api/)。
{{% /alert %}}

[GlobalOpenTelemetry](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/GlobalOpenTelemetry.html)
持有一个全局单例的 [OpenTelemetry](#opentelemetry) 实例。

插桩（instrumentation）应该避免使用`GlobalOpenTelemetry`.
相反，应将 `OpenTelemetry` 作为初始化参数接收，如果未设置，则默认使用 [Noop 实现](#noop-implementation)。
此规则有一个例外情况：由 [Java agent](/docs/zero-code/java/agent/) 安装的 `OpenTelemetry` 实例可通过 `GlobalOpenTelemetry` 获取。
建议需要额外手动插桩（instrumentation）的用户通过 `GlobalOpenTelemetry.get()` 来访问它。

`GlobalOpenTelemetry.get()` 能确保始终返回相同的结果。
如果在调用 `GlobalOpenTelemetry.set(..)` 之前调用 `GlobalOpenTelemetry.get()`，则 `GlobalOpenTelemetry` 会被设置为 noop 实现，
且后续对 `GlobalOpenTelemetry.set(..)` 的调用会抛出异常。
因此，务必在应用程序生命周期中尽早调用 `GlobalOpenTelemetry.set(..)`，并且要在任何插桩（instrumentation）调用 `GlobalOpenTelemetry.get()` 之前执行。
这种保证会暴露初始化顺序问题：过晚调用 `GlobalOpenTelemetry.set()`（即，在插桩（instrumentation）已经调用 `GlobalOpenTelemetry.get()` 之后）会触发异常，而非静默失败。

如果存在[自动配置](../configuration/#zero-code-sdk-autoconfigure)，则可以通过设置 `-Dotel.java.global-autoconfigure.enabled=true`
（或通过环境变量 `export OTEL_JAVA_GLOBAL_AUTOCONFIGURE_ENABLED=true`）来自动初始化 `GlobalOpenTelemetry`。
启用后，首次调用 `GlobalOpenTelemetry.get()` 会触发自动配置，并使用生成的 `OpenTelemetry` 实例调用 `GlobalOpenTelemetry.set(..)`。

以下代码片段展示了 `GlobalOpenTelemetry` API 的上下文传播用法：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/GlobalOpenTelemetryUsage.java"?>
```java
package otel;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.OpenTelemetry;

public class GlobalOpenTelemetryUsage {

  public static void openTelemetryUsage(OpenTelemetry openTelemetry) {
    // 应在应用程序生命周期中尽早设置 GlobalOpenTelemetry 实例。
    // set 方法只能被调用一次，多次调用会抛出异常。
    GlobalOpenTelemetry.set(openTelemetry);

    // 获取 GlobalOpenTelemetry 实例。
    openTelemetry = GlobalOpenTelemetry.get();
  }
}
```
<!-- prettier-ignore-end -->

### TracerProvider {#tracerprovider}

[TracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/TracerProvider.html)
是链路的 API 入口点，用于提供 [Tracer](#tracer)。有关提供器（providers）和作用域（scopes）的信息，请参见[提供器与作用域](#providers-and-scopes)。

#### Tracer {#tracer}

[Tracer](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/Tracer.html)
用于为插桩（instrumentation）作用域[记录 Span](#span)。有关提供器（providers）和作用域（scopes）的信息，请参见[提供器与作用域](#providers-and-scopes)。

#### Span {#span}

[SpanBuilder](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/SpanBuilder.html)
和
[Span](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/Span.html)
用于构建和记录数据到 Span

`SpanBuilder` 用于在通过调用 `Span startSpan()` 启动 Span 之前，向其添加数据。
启动后，可以通过调用 `Span` 的各种更新方法来添加、更新数据。
启动前提供给 `SpanBuilder` 的数据会作为[采样器（Samplers）](../sdk/#sampler)的输入。

以下是 `SpanBuilder`、`Span` API 的使用示例代码：

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
    // 通过提供 span name 获取一个 Span 构建器
    Span span =
        tracer
            .spanBuilder("span name")
            // 设置 Span 类型
            .setSpanKind(SpanKind.INTERNAL)
            // 设置属性
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
            // 可以选择省略 AttributeKey 的初始化。
            .setAttribute("com.acme.string-key", "value")
            .setAttribute("com.acme.bool-key", true)
            .setAttribute("come.acme.long-key", 1L)
            .setAttribute("come.acme.double-key", 1.1)
            .setAllAttributes(WIDGET_RED_CIRCLE)
            // 取消注释可选择性地显式设置父 Span 上下文。如果省略，则会使用 Context.current () 来设置 span 的父级。
            // .setParent(parentContext)
            // 取消注释可选择性地添加链接。
            // .addLink(linkContext, linkAttributes)
            // 启动 span
            .startSpan();

    // 在计算额外数据之前，先检查 span 是否处于记录状态。
    if (span.isRecording()) {
      // 使用启动时无法获取的信息更新 span 名称。
      span.updateName("new span name");

      // 添加启动时无法获取的额外属性。
      span.setAttribute("com.acme.string-key2", "value");

      // 添加启动时无法获取的额外链接。
      span.addLink(exampleLinkContext());
      // 可以选择在链接上包含属性。
      span.addLink(exampleLinkContext(), WIDGET_RED_CIRCLE);

      // 添加跨度事件
      span.addEvent("my-event");
      // 可以选择在事件上包含属性。
      span.addEvent("my-event", WIDGET_RED_CIRCLE);

      // 记录异常，这是一种用于生成具有特定格式的跨度事件的语法糖
      span.recordException(new RuntimeException("error"));

      // 设置 span 的状态。
      span.setStatus(StatusCode.OK, "status description");
    }

    // 最后，结束 span
    span.end();
  }

  /** 返回一个伪链接上下文。*/
  private static SpanContext exampleLinkContext() {
    return Span.fromContext(current()).getSpanContext();
  }
}
```
<!-- prettier-ignore-end -->

Span 父子关系是链路追踪中的一个重要方面。每个 Span 都可以有一个可选的父级。
通过收集一个链路中的所有 Span 并追踪每个 Span 的父级，我们可以构建出一个层级结构。
Span API 构建在 [Context](#context) 之上，这使得 Span 上下文能够在应用程序内部以及跨线程间被隐式传递。
当创建一个 Span 时，其父级会被设置为 `Context.current()` 中存在的任何 Span，除非没有 Span 或者上下文被显式覆盖。

大多数 Context API 的使用指南也适用于 Span。
Span 上下文通过 [W3CTraceContextPropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/propagation/W3CTraceContextPropagator.html)
和其他 [TextMapPropagators](../sdk/#textmappropagator)
在应用程序边界之间进行传播。

以下代码片段展示了 `Span` API 的上下文传播用法：

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
    // 启动一个 Span。由于我们没有调用 makeCurrent()，因此必须在子级上显式调用 setParent 方法。
    // 将代码包裹在 try/finally 块中，以确保 Span 能够被结束。
    Span span = tracer.spanBuilder("span").startSpan();
    try {
      // 启动一个 childSpan，并显式设置其父级。
      Span childSpan =
          tracer
              .spanBuilder("span child")
              // 显式设置父级。
              .setParent(span.storeInContext(Context.current()))
              .startSpan();
      // 调用 makeCurrent() 方法，将 childSpan 添加到 Context.current() 中。在该作用域内创建的 Span，其父级会自动设置为 childSpan。
      try (Scope childSpanScope = childSpan.makeCurrent()) {
        // 调用另一个会创建 Span 的方法。由于该 Span 是在 childSpan 的作用域内启动的，因此它的父级会是 childSpan。
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

### MeterProvider {#meterprovider}

[MeterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/MeterProvider.html)
是指标的 API 入口点，并提供 [Meter](#meter)。有关提供器（providers）和作用域（scopes）的信息，请参见[提供器与作用域](#providers-and-scopes)。

#### Meter {#meter}

[Meter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/Meter.html)
用于为特定的 [插桩作用域](#providers-and-scopes) 获取插桩。有关提供器（providers）和作用域（scopes）的信息，请参见[提供器与作用域](#providers-and-scopes)。
插桩包含多种类型，每种类型在 SDK 中都具有不同的语义和默认行为。
针对每个特定的使用场景选择合适的插桩，这一点至关重要。

| 插桩                                        | 同步或异步 | 描述                                             | 示例                           | 默认 SDK 集合                                                                                  |
| ------------------------------------------- | ---------- | ------------------------------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| [Counter](#counter)                         | 同步       | 记录单调递增（正值）的数值。                     | 记录用户登录次数               | [sum (monotonic=true)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                          |
| [Async Counter](#async-counter)             | 异步       | 观测单调递增的总和。                             | 观测 JVM 中已加载的类数量      | [sum (monotonic=true)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                          |
| [UpDownCounter](#updowncounter)             | 同步       | 记录非单调递增（正值和负值）的数值。             | 记录队列中元素的添加与移除事件 | [sum (monotonic=false)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                         |
| [Async UpDownCounter](#async-updowncounter) | 异步       | 观测非单调递增（正值和负值）的总和。             | 观测 JVM 内存池使用情况        | [sum (monotonic=false)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                         |
| [Histogram](#histogram)                     | 同步       | 当分布很重要的场景，记录单调递增（正值）的数值。 | 记录服务器处理 HTTP 请求的耗时 | [ExplicitBucketHistogram](/docs/specs/otel/metrics/sdk/#explicit-bucket-histogram-aggregation) |
| [Gauge](#gauge)                             | 同步       | 当空间再聚合 **[1]**无意义的场景，记录最新值.    | 记录温度                       | [LastValue](/docs/specs/otel/metrics/sdk/#last-value-aggregation)                              |
| [Async Gauge](#async-gauge)                 | 异步       | 当空间再聚合 **[1]**无意义的场景，观测最新值.    | 观测 CPU 使用情况              | [LastValue](/docs/specs/otel/metrics/sdk/#last-value-aggregation)                              |

**[1]**: 空间再聚合是指通过剔除不需要的属性，从而合并属性流的过程。
例如，现有两组带有属性的序列：`{"color": "red", "shape": "square"}` 和 `{"color": "blue", "shape": "square"}`，
你可以通过剔除 `color` 属性来执行空间再聚合，当剔除 `color` 后的剩余属性完全一致后，将这两组序列合并。
大多数聚合操作都具备实用的空间聚合合并功能（例如，求和操作会将数值进行累加），但通过 `LastValue` 聚合方式得到的计量指标（Gauge）是个例外。
例如，假设前文提及的指标序列正在追踪装置（widget）的温度。
当去掉 `color` 属性时，该如何合并这些指标序列呢？
除了抛硬币随机选值之外，没有更好的解决办法。

插桩 API 共通的多种功能特性：

- 通过构建者模式（builder pattern）创建。
- 指标名称（instrument name）为必填项。
- 单位（unit）和描述（description）为可选项。
- 记录的值（value）类型为 `long` 或 `double`，可通过构建器（builder）配置。

#### Counter {#counter}

[LongCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongCounter.html)
和
[DoubleCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleCounter.html)
用于记录单调递增（正值）的数值。

以下代码片段展示了 Counter API 的使用方法：

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
    // 构建一个 counter，用于记录始终为正值（单调递增）的度量值。
    LongCounter counter =
        meter
            .counterBuilder("fully.qualified.counter")
            .setDescription("A count of produced widgets")
            .setUnit("{widget}")
            // 可选择将类型改为 double
            // .ofDoubles()
            .build();

    // 记录一个无属性或上下文的度量值。
    // 属性默认为 Attributes.empty ()，上下文默认为 Context.current ()。
    counter.add(1L);

    // 记录带有属性的度量值，尽可能使用预分配的属性。
    counter.add(1L, WIDGET_RED_CIRCLE);
    // 有时，属性必须根据应用上下文进行计算。
    counter.add(
        1L, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // 记录带有属性和上下文的度量值。
    // 大多数用户会选择省略上下文参数，更倾向于使用默认的 Context.current()。
    counter.add(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Async Counter {#async-counter}

[ObservableLongCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongCounter.html)
和
[ObservableDoubleCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleCounter.html)
用于观察单调递增（正值）的数值。

以下代码片段展示了异步计数器（async counter） API 的使用方法：

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
  // 尽可能预分配属性。
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void asyncCounterUsage(Meter meter) {
    AtomicLong widgetCount = new AtomicLong();

    // 构建一个异步计数器，用于在回调函数中观测已有的计数器。
    ObservableLongCounter asyncCounter =
        meter
            .counterBuilder("fully.qualified.counter")
            .setDescription("A count of produced widgets")
            .setUnit("{widget}")
            // 取消注释，即可选择将类型改为 double。
            // .ofDoubles()
            .buildWithCallback(
                // 当指标读取器（MetricReader）读取指标时，会调用该回调函数。
                observableMeasurement -> {
                  long currentWidgetCount = widgetCount.get();

                  // 记录一个无属性的度量值。
                  // 属性默认为 Attributes.empty ()。

                  observableMeasurement.record(currentWidgetCount);

                  // 记录一个带有属性的度量值，尽可能使用预分配的属性。
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // 有时，属性必须根据应用上下文进行计算。
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // 可以选择在需要时关闭计数器，以注销回调函数。
    asyncCounter.close();
  }
}
```
<!-- prettier-ignore-end -->

#### UpDownCounter {#updowncounter}

[LongUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongUpDownCounter.html)
和
[DoubleUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleUpDownCounter.html)
用于记录非单调（正值和负值）的数值。

以下代码片段展示了上下计数器 API（UpDownCounter API）的使用方法：

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
    // 构建一个上下计数器，用于记录可增可减的度量值。
    LongUpDownCounter upDownCounter =
        meter
            .upDownCounterBuilder("fully.qualified.updowncounter")
            .setDescription("Current length of widget processing queue")
            .setUnit("{widget}")
            // 取消注释，即可选择将类型改为 double。
            // .ofDoubles()
            .build();

    // 记录一个无属性或上下文的度量值。
    // 属性默认为 Attributes.empty ()，上下文默认为 Context.current ()。
    upDownCounter.add(1L);

    // 记录一个带有属性的度量值，尽可能使用预分配的属性。
    upDownCounter.add(-1L, WIDGET_RED_CIRCLE);
    // 有时，属性必须根据应用上下文进行计算。
    upDownCounter.add(
        -1L, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // 记录一个带有属性和上下文的度量值。
    // 大多数用户会选择省略上下文参数，更倾向于使用默认的 Context.current()。
    upDownCounter.add(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Async UpDownCounter {#async-updowncounter}

[ObservableLongUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongUpDownCounter.html)
和
[ObservableDoubleUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleUpDownCounter.html)
用于观察非单调（正值和负值）的总和。

以下代码片段展示了异步上下计数器 API（async updowncounter API）的使用方法：

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

    // 构建一个异步上下计数器，用于在回调函数中观测已有的上下计数器。
    ObservableLongUpDownCounter asyncUpDownCounter =
        meter
            .upDownCounterBuilder("fully.qualified.updowncounter")
            .setDescription("Current length of widget processing queue")
            .setUnit("{widget}")
            // 取消注释，即可选择将类型改为 double。
            // .ofDoubles()
            .buildWithCallback(
                // 当指标读取器（MetricReader）读取指标时，会调用该回调函数。
                observableMeasurement -> {
                  long currentWidgetCount = queueLength.get();

                  // 记录一个无属性的度量值。
                  // 属性默认为 Attributes.empty().
                  observableMeasurement.record(currentWidgetCount);

                  // 记录一个带有属性的度量值，尽可能使用预分配的属性。
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // 有时，属性必须根据应用上下文进行计算。
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // 可以选择在需要时关闭计数器，以注销回调函数。
    asyncUpDownCounter.close();
  }
}
```
<!-- prettier-ignore-end -->

#### Histogram {#histogram}

[DoubleHistogram](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleHistogram.html)
和
[LongHistogram](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongHistogram.html)
用于记录单调（正值）值，其中分布很重要。

以下代码片段展示了直方图 API 的使用方法：

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
    // 构建一个直方图（histogram），用于记录分布情况很重要的度量值。
    DoubleHistogram histogram =
        meter
            .histogramBuilder("fully.qualified.histogram")
            .setDescription("Length of time to process a widget")
            .setUnit("s")
            // 取消注释，即可选择提供建议，用于设置有用的默认显式分桶边界。
            // .setExplicitBucketBoundariesAdvice(Arrays.asList(1.0, 2.0, 3.0))
            // 取消注释，即可选择将类型改为 long。
            // .ofLongs()
            .build();

    // 记录一个无属性或上下文的度量值。
    // 属性默认为 Attributes.empty ()，上下文默认为 Context.current ()。
    histogram.record(1.1);

    // 记录一个带有属性的度量值，尽可能使用预分配的属性。
    histogram.record(2.2, WIDGET_RED_CIRCLE);
    // 有时，属性必须根据应用上下文进行计算。
    histogram.record(
        3.2, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // 记录一个带有属性和上下文的度量值。
    // 大多数用户会选择省略上下文参数，更倾向于使用默认的 Context.current()。
    histogram.record(4.4, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Gauge {#gauge}

[DoubleGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleGauge.html)
和
[LongGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongGauge.html)
用于记录最新值，其中空间重新聚合没有意义。

以下代码片段展示了仪表 API 的使用方法：

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
    // 构建一个仪表（gauge），用于记录测量值，这些测量值不能进行空间重新聚合。
    DoubleGauge gauge =
        meter
            .gaugeBuilder("fully.qualified.gauge")
            .setDescription("The current temperature of the widget processing line")
            .setUnit("K")
            // 取消注释，即可选择将类型改为 long。
            // .ofLongs()
            .build();

    // 记录一个无属性或上下文的度量值。
    // 属性默认为 Attributes.empty(), 上下文默认为 Context.current().
    gauge.set(273.0);

    // 记录一个带有属性的度量值，尽可能使用预分配的属性。
    gauge.set(273.0, WIDGET_RED_CIRCLE);
    // 有时，属性必须根据应用上下文进行计算。
    gauge.set(
        273.0,
        Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // 记录一个带有属性和上下文的度量值。
    // 大多数用户会选择省略上下文参数，更倾向于使用默认的 Context.current().
    gauge.set(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Async Gauge {#async-gauge}

[ObservableDoubleGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleGauge.html)
和
[ObservableLongGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongGauge.html)
当空间重新聚合没有意义时，用于观察最新值。

以下代码片段展示了异步仪表 API 的使用方法：

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

    // 构建一个异步计量器（async gauge），用于在回调函数中观测已有的计量器。
    ObservableDoubleGauge asyncGauge =
        meter
            .gaugeBuilder("fully.qualified.gauge")
            .setDescription("The current temperature of the widget processing line")
            .setUnit("K")
            // 取消注释，即可选择将类型改为 long。
            // .ofLongs()
            .buildWithCallback(
                // the callback is invoked when a MetricReader reads metrics.
                observableMeasurement -> {
                  double currentWidgetCount = processingLineTemp.get();

                  // 记录一个无属性或上下文的度量值。
                  // 属性默认为 Attributes.empty().
                  observableMeasurement.record(currentWidgetCount);

                  // 记录一个带有属性的度量值，尽可能使用预分配的属性。
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // 有时，属性必须根据应用上下文进行计算。
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // 必要时，可选择关闭 gauge 计量器以注销回调函数。
    asyncGauge.close();
  }
}
```
<!-- prettier-ignore-end -->

### LoggerProvider {#loggerprovider}

[LoggerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/LoggerProvider.html)
这是日志的 API 入口点，并提供了[日志记录器（Loggers）](#logger)。
有关提供器（providers）和作用域（scopes）的信息，请参见[提供器与作用域](#providers-and-scopes)。

{{% alert %}} {{% param logBridgeWarning %}} {{% /alert %}}

#### Logger {#logger}

[Logger](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/Logger.html)
用于为[插桩作用域](#providers-and-scopes) [输出日志记录](#logrecordbuilder)。
有关提供器（providers）和作用域（scopes）的信息，请参见[提供器与作用域](#providers-and-scopes)。

#### LogRecordBuilder {#logrecordbuilder}

[LogRecordBuilder](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/LogRecordBuilder.html)
用于构建并输出日志记录。

以下代码片段展示了 `LogRecordBuilder` API 的使用方法：

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
        // 设置消息体。注意，为演示目的，setBody (..) 方法被多次调用，但只有最后一次调用生效。
        // 将消息体设置为字符串，这是 setBody (Value.of ("log message")) 的语法糖。
        .setBody("log message")
        // 可选择将消息体设置为 Value 类型，以记录任意复杂的结构化数据。
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
        // 设置日志级别。
        .setSeverity(Severity.DEBUG)
        .setSeverityText("debug")
        // 设置时间戳。
        .setTimestamp(System.currentTimeMillis(), TimeUnit.MILLISECONDS)
        // 可选择设置日志记录的观察时间戳。
        .setObservedTimestamp(System.currentTimeMillis(), TimeUnit.MILLISECONDS)
        // 设置属性。
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
        // 取消注释，即可选择显式设置用于与 Span 关联的上下文。若省略，则使用 Context.current ()。
        // .setContext(context)
        // 输出日志记录。
        .emit();
  }
}
```
<!-- prettier-ignore-end -->

### Noop 实现 {#noop-implementation}

`OpenTelemetry#noop()` 方法可用于获取 [OpenTelemetry](#opentelemetry) 及其所提供的所有 API 组件的空操作（noop）实现。
顾名思义，该空操作实现不会执行任何实际功能，其设计目标是不对性能产生任何影响。
即使使用了空操作（noop）实现，若插桩代码（Instrumentation）仍在计算 / 分配属性值，或为记录可观测数据（telemetry）准备其他必要数据，仍可能对性能造成影响。
当用户尚未配置并安装具体的实现，如 [SDK](../sdk/) 时，此空操作可作为 OpenTelemetry 的一个实用默认实例。

以下代码片段展示了 `OpenTelemetry#noop()` API 的使用方法：

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
    // 获取 OpenTelemetry 空操作实例。
    OpenTelemetry noopOpenTelemetry = OpenTelemetry.noop();

    // Noop 链路追踪
    Tracer noopTracer = OpenTelemetry.noop().getTracer(SCOPE_NAME);
    noopTracer
        .spanBuilder("span name")
        .startSpan()
        .setAttribute(WIDGET_SHAPE, "square")
        .setStatus(StatusCode.OK)
        .addEvent("event-name", Attributes.builder().put(WIDGET_COLOR, "red").build())
        .end();

    // Noop 指标
    Attributes attributes = WIDGET_RED_CIRCLE;
    Meter noopMeter = OpenTelemetry.noop().getMeter(SCOPE_NAME);
    DoubleHistogram histogram = noopMeter.histogramBuilder("fully.qualified.histogram").build();
    histogram.record(1.0, attributes);
    // counter
    LongCounter counter = noopMeter.counterBuilder("fully.qualified.counter").build();
    counter.add(1, attributes);
    // 异步 counter
    noopMeter
        .counterBuilder("fully.qualified.counter")
        .buildWithCallback(observable -> observable.record(10, attributes));
    // updowncounter
    LongUpDownCounter upDownCounter =
        noopMeter.upDownCounterBuilder("fully.qualified.updowncounter").build();
    // 异步 updowncounter
    noopMeter
        .upDownCounterBuilder("fully.qualified.updowncounter")
        .buildWithCallback(observable -> observable.record(10, attributes));
    upDownCounter.add(-1, attributes);
    // gauge
    DoubleGauge gauge = noopMeter.gaugeBuilder("fully.qualified.gauge").build();
    gauge.set(1.1, attributes);
    // 异步 gauge
    noopMeter
        .gaugeBuilder("fully.qualified.gauge")
        .buildWithCallback(observable -> observable.record(10, attributes));

    // Noop 日志
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

### 语义属性 {#semantic-attributes}

[语义约定](/docs/specs/semconv/) 规定了如何以标准化的方式收集常见操作的观测数据。
这其中包含一个[属性注册表](/docs/specs/semconv/registry/attributes/)，该注册表按领域（domain）分类，列出了所有在语义约定中引用的属性定义。
[semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)
项目根据语义约定生成常量，这些常量可用于帮助插桩（instrumentation）遵循：

| 描述                   | Artifact                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| 生成的稳定语义约定代码 | `io.opentelemetry.semconv:opentelemetry-semconv:{{% param vers.semconv %}}-alpha`            |
| 生成的孵化语义约定代码 | `io.opentelemetry.semconv:opentelemetry-semconv-incubating:{{% param vers.semconv %}}-alpha` |

{{% alert %}} 尽管 `opentelemetry-semconv` 和 `opentelemetry-semconv-incubating` 都包含 `-alpha` 后缀，
且可能会有不兼容的变更，但目的是让 `opentelemetry-semconv` 逐步稳定下来，而 `opentelemetry-semconv-incubating` 则会永久保留 `-alpha` 后缀。
库可以使用 `opentelemetry-semconv-incubating` 进行测试，但不应将其作为依赖项引入：
由于版本和版本间的属性可能会来回变化，将其作为依赖项可能会在出现传递性版本冲突时，导致最终用户遭遇运行时错误。{{% /alert %}}

从语义约定生成的属性常量是 `AttributeKey<T>` 的实例，可在任何 OpenTelemetry API 接受属性的地方使用。

以下代码片段展示了语义约定属性 API 的使用方法：

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
    // 语义属性（Semantic Attributes）按顶级领域（domain）以及稳定状态（stable）或孵化状态（incubating） 进行分类组织。
    // 例如:
    // - 以 http.* 开头的稳定状态属性，归类在 HttpAttributes 类中。
    // - 以 server.* 开头的稳定状态属性，归类在 ServerAttributes 类中。
    // - 以 http.* 开头的孵化状态属性，归类在 HttpIncubatingAttributes 类中。
    // 定义了值枚举的属性键可在内部的 {AttributeKey}Values 类中获取。
    // 例如，http.request.method 的值枚举可在 HttpAttributes.HttpRequestMethodValues 类中获取。
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

### Baggage {#baggage}

[Baggage](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/baggage/Baggage.html)
是与分布式请求或工作流执行相关联的一组应用程序定义的键值对。
Baggage 的键和值均为字符串类型，且值可以附带可选的字符串元数据。
通过配置 [SDK](../sdk/) ，将其条目作为属性添加到 Span、指标和日志记录中，可丰富观测数据的信息。
Baggage API 构建在 [Context](#context) 之上，这使得 Span 上下文能够在应用程序内部以及跨线程间进行隐式传递。
大部分 Context API 的使用指南适用于 Baggage。

Baggage 会通过 [W3CBaggagePropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/baggage/propagation/W3CBaggagePropagator.html)
在应用程序边界之间进行传播。
（详情请参见[TextMapPropagator](../sdk/#textmappropagator)。）

以下代码片段展示了 `Baggage` API 的使用方法：

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
    // 访问当前 Baggage 与 Baggage.current()
    // 输出 => context baggage: {}
    Baggage currentBaggage = Baggage.current();
    System.out.println("current baggage: " + asString(currentBaggage));
    // ...... 或从 Context 中获取
    currentBaggage = Baggage.fromContext(current());

    // Baggage 有多种方法用于操作和读取数据。
    // 转换为构建器并添加条目：
    Baggage newBaggage =
        Baggage.current().toBuilder()
            .put("shopId", "abc123")
            .put("shopName", "opentelemetry-demo", BaggageEntryMetadata.create("metadata"))
            .build();
    // ...... 或从空 Baggage 开始
    // newBaggage = Baggage.empty().toBuilder().put("shopId", "abc123").build();
    // 输出 => new baggage: {shopId=abc123(), shopName=opentelemetry-demo(metadata)}
    System.out.println("new baggage: " + asString(newBaggage));
    // 读取条目：
    String shopIdValue = newBaggage.getEntryValue("shopId");
    // 检查大小：
    int size = newBaggage.size();
    boolean isEmpty = newBaggage.isEmpty();
    // 转换为映射表示：
    Map<String, BaggageEntry> map = newBaggage.asMap();
    // 遍历条目：
    newBaggage.forEach((s, baggageEntry) -> {});

    // 当前 Baggage 仍然不包含新条目
    // 输出 => context baggage: {}
    System.out.println("current baggage: " + asString(Baggage.current()));

    // 调用 Baggage.makeCurrent() 将 Baggage.current() 设置为当前 baggage，
    // 直到作用域关闭，此时 Baggage.current() 会恢复到调用 Baggage.makeCurrent() 之前的状态。
    try (Scope scope = newBaggage.makeCurrent()) {
      // 当前 Baggage 现在包含新添加的条目：
      // 输出 => context baggage: {shopId=abc123(), shopName=opentelemetry-demo(metadata)}
      System.out.println("current baggage: " + asString(Baggage.current()));
    }

    // 当前 Baggage 不再包含新添加的条目：
    // 输出 => context baggage: {}
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

## 孵化中的 API {#incubating-apis}

`io.opentelemetry:opentelemetry-api-incubator:{{% param vers.otel %}}-alpha`
这个构件包含了实验性的链路、指标、日志和上下文 API。
孵化中 API 在次版本（minor releases）更新中可能会出现破坏性 API 变更。
通常，这些代表着实验性的规范功能或 API 设计，我们希望在正式确定前通过用户反馈来验证其合理性。
我们鼓励用户试用这些 API，并就任何反馈（正面的或负面的）提出问题。
但库不应依赖于孵化中 API，因为当出现传递性版本冲突时，用户可能会遇到运行时错误。

有关可用的 API 及使用示例，请参见 [incubator README](https://github.com/open-telemetry/opentelemetry-java/tree/main/api/incubator)。
