---
title: APIによるテレメトリーの記録
weight: 11
aliases:
  - /docs/languages/java/api-components/
logBridgeWarning: >
  `LoggerProvider` / `Logger` APIは構造的に等価なトレースとメトリクスAPIと類似していますが、
  異なる用途を提供します。現在のところ、`LoggerProvider` / `Logger` および関連クラスは
  [Log Bridge API](/docs/specs/otel/logs/api/)を表しており、これは他のログAPI/フレームワークを通じて
  記録されたログをOpenTelemetryにブリッジするためのログアペンダーを作成するために存在します。
  これらはLog4j / SLF4J / Logback / などの代替として、エンドユーザーが使用することを意図していません。
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8 # patched
drifted_from_default: true
cSpell:ignore: Dotel kotlint Logback updowncounter
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/api"?>

APIは、主要なオブザーバビリティシグナル全体にわたってテレメトリーを記録するためのクラスとインターフェースのセットです。
[SDK](../sdk/)は、テレメトリーを処理およびエクスポートするように[設定](../configuration/)されたAPIの組み込み参照実装です。
このページは、説明、関連するJavadocへのリンク、アーティファクト座標、およびサンプルAPI使用法を含むAPIの概念的な概要です。

APIは以下のトップレベルコンポーネントで構成されています。

- [Context](#context-api)：アプリケーション全体およびアプリケーション境界を越えてコンテキストを伝搬するためのスタンドアロンAPI（トレースコンテキストとバゲージを含む）
- [TracerProvider](#tracerprovider)：トレースのAPIエントリポイント
- [MeterProvider](#meterprovider)：メトリクスのAPIエントリポイント
- [LoggerProvider](#loggerprovider)：ログのAPIエントリポイント
- [OpenTelemetry](#opentelemetry)：トップレベルAPIコンポーネント（`TracerProvider`、`MeterProvider`、`LoggerProvider`、`ContextPropagators`）のホルダーで、計装に渡すのに便利です

APIは複数の実装をサポートするように設計されています。
OpenTelemetryによって2つの実装が提供されています。

- [SDK](../sdk/)参照実装：これはほとんどのユーザーにとって適切な選択です
- [Noop](#noop-implementation)実装：ユーザーがインスタンスをインストールしないときに計装がデフォルトで使用する、最小限でゼロ依存の実装です

APIは、ライブラリ、フレームワーク、およびアプリケーション所有者が直接的な依存関係として取得するように設計されています。
APIには[強力な後方互換性保証](https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#compatibility-requirements)し、推移的依存関係がなく、[Java 8+をサポート](https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#language-version-compatibility)しています。
ライブラリとフレームワークはAPIのみに依存し、APIのメソッドのみを呼び出すべきであり、アプリケーション/エンドユーザーにSDKへの依存関係を追加し、設定されたインスタンスをインストールするよう指示する必要があります。

{{% alert title=Javadoc %}}

すべてのOpenTelemetry Javaコンポーネントのjavadocリファレンスについては、[javadoc.io/doc/io.opentelemetry](https://javadoc.io/doc/io.opentelemetry)を参照してください。

{{% /alert %}}

## APIコンポーネント {#api-components}

以下のセクションでは、OpenTelemetry APIについて説明します。各コンポーネントセクションには以下が含まれます。

- Javadoc型リファレンスへのリンクを含む簡潔な説明
- APIメソッドと引数を理解するための関連リソースへのリンク
- API使用法の簡単な探求

## Context API {#context-api}

`io.opentelemetry:opentelemetry-api-context:{{% param vers.otel %}}` アーティファクトには、アプリケーション全体およびアプリケーション境界を越えてコンテキストを伝搬するためのスタンドアロンAPI（たとえば、[OpenTelemetry API](#opentelemetry-api)から別々にパッケージ化）が含まれています。

これは以下で構成されています。

- [Context](#context)：アプリケーション全体で暗黙的または明示的に伝搬される不変のキー値ペアのバンドル
- [ContextStorage](#contextstorage)：現在のコンテキストを保存および取得するメカニズム（デフォルトはスレッドローカル）
- [ContextPropagators](#context)：アプリケーション境界を越えて`Context`を伝搬するための登録されたプロパゲーターのコンテナ

`io.opentelemetry:opentelemetry-extension-kotlint:{{% param vers.otel %}}` は、コルーチンにコンテキストを伝搬するためのツールを含む拡張機能です。

### Context {#context}

[Context](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/Context.html)は不変のキー値ペアのバンドルで、アプリケーション全体およびスレッド間で暗黙的に伝搬するためのユーティリティを備えています。
暗黙的伝搬とは、引数として明示的に渡すことなく、コンテキストにアクセスできることを意味します。
ContextはOpenTelemetry APIにおける繰り返し出現する概念です。

- 現在アクティブな[スパン](#span)はコンテキストに保存され、デフォルトでスパンの親は現在コンテキストにあるスパンに割り当てられます
- [メーター計装](#meter)に記録される測定値は、[エグザンプラー](/docs/specs/otel/metrics/data-model/#exemplars)を介してスパンに測定値をリンクするために使用されるコンテキスト引数を受け入れ、デフォルトでは現在コンテキストにあるスパンになります
- [LogRecords](#logrecordbuilder)は、ログレコードスパンをリンクするために使用され、デフォルトでは現在コンテキストにあるスパンになるコンテキスト引数を受け入れます

以下のコードスニペットは`Context` API使用法を調査します。

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
    // 例のコンテキストキーを定義
    ContextKey<String> exampleContextKey = ContextKey.named("example-context-key");

    // コンテキストは追加するまでキーを含まない
    // Context.current() は現在のコンテキストにアクセス
    // 出力 => current context value: null
    System.out.println("current context value: " + Context.current().get(exampleContextKey));

    // コンテキストにエントリを追加
    Context context = Context.current().with(exampleContextKey, "value");

    // ローカルコンテキスト変数には追加された値が含まれる
    // 出力 => context value: value
    System.out.println("context value: " + context.get(exampleContextKey));
    // 現在のコンテキストはまだ値を含まない
    // 出力 => current context value: null
    System.out.println("current context value: " + Context.current().get(exampleContextKey));

    // context.makeCurrent() を呼び出すと、スコープが閉じられるまで
    // Context.current() がコンテキストに設定され、その後 Context.current() は
    // context.makeCurrent() が呼び出される前の状態に復元される。
    // 結果として得られる Scope は AutoCloseable を実装し、通常は
    // try-with-resources ブロックで使用される。Scope.close() の呼び出しに失敗すると
    // エラーとなり、メモリリークやその他の問題を引き起こす可能性がある。
    try (Scope scope = context.makeCurrent()) {
      // 現在のコンテキストに追加された値が含まれる
      // 出力 => context value: value
      System.out.println("context value: " + Context.current().get(exampleContextKey));
    }

    // ローカルコンテキスト変数には追加された値がまだ含まれる
    // 出力 => context value: value
    System.out.println("context value: " + context.get(exampleContextKey));
    // 現在のコンテキストにはもう値が含まれない
    // 出力 => current context value: null
    System.out.println("current context value: " + Context.current().get(exampleContextKey));

    ExecutorService executorService = Executors.newSingleThreadExecutor();
    ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);

    // コンテキストインスタンスはアプリケーションコード内で明示的に渡すことができるが、
    // Context.makeCurrent() を呼び出し、Context.current() を介してアクセスする
    // 暗黙のコンテキストを使用する方が便利である。
    // コンテキストは暗黙のコンテキスト伝播のための多数のユーティリティを提供する。
    // これらのユーティリティは Scheduler、ExecutorService、ScheduledExecutorService、
    // Runnable、Callable、Consumer、Supplier、Function などのユーティリティクラスを
    // ラップし、実行前に Context.makeCurrent() を呼び出すように動作を変更する。
    context.wrap(ContextUsage::callable).call();
    context.wrap(ContextUsage::runnable).run();
    context.wrap(executorService).submit(ContextUsage::runnable);
    context.wrap(scheduledExecutorService).schedule(ContextUsage::runnable, 1, TimeUnit.SECONDS);
    context.wrapConsumer(ContextUsage::consumer).accept(new Object());
    context.wrapConsumer(ContextUsage::biConsumer).accept(new Object(), new Object());
    context.wrapFunction(ContextUsage::function).apply(new Object());
    context.wrapSupplier(ContextUsage::supplier).get();
  }

  /** 例の {@link java.util.concurrent.Callable}。 */
  private static Object callable() {
    return new Object();
  }

  /** 例の {@link Runnable}。 */
  private static void runnable() {}

  /** 例の {@link java.util.function.Consumer}。 */
  private static void consumer(Object object) {}

  /** 例の {@link java.util.function.BiConsumer}。 */
  private static void biConsumer(Object object1, Object object2) {}

  /** 例の {@link java.util.function.Function}。 */
  private static Object function(Object object) {
    return object;
  }

  /** 例の {@link java.util.function.Supplier}。 */
  private static Object supplier() {
    return new Object();
  }
}
```
<!-- prettier-ignore-end -->

### ContextStorage {#contextstorage}

[ContextStorage](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/ContextStorage.html)は現在の`Context`を保存および取得するメカニズムです。

デフォルトの`ContextStorage`実装は`Context`をスレッドローカルに保存します。

### ContextPropagators {#contextpropagators}

[ContextPropagators](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/propagation/ContextPropagators.html)は、アプリケーション境界を越えて`Context`を伝搬するための登録されたプロパゲーターのコンテナです。
コンテキストは、アプリケーションを離れる際（アウトバウンドHTTPリクエストなど）にキャリアに注入され、アプリケーションに入る際（HTTPリクエストの処理など）にキャリアから抽出されます。

プロパゲーター実装については、[SDK TextMapPropagators](../sdk/#textmappropagator)を参照してください。

以下のコードスニペットは、注入のための`ContextPropagators` APIを調査します。

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
    // w3cトレースコンテキストとw3cバゲージを伝播するContextPropagatorsインスタンスを作成
    ContextPropagators propagators =
        ContextPropagators.create(
            TextMapPropagator.composite(
                W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));

    // HttpRequestビルダーを作成
    HttpClient httpClient = HttpClient.newBuilder().build();
    HttpRequest.Builder requestBuilder =
        HttpRequest.newBuilder().uri(new URI("http://127.0.0.1:8080/resource")).GET();

    // ContextPropagatorsインスタンスがあるとき、現在のコンテキストをHTTPリクエストキャリアに注入
    propagators.getTextMapPropagator().inject(Context.current(), requestBuilder, TEXT_MAP_SETTER);

    // 注入されたコンテキストでリクエストを送信
    httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.discarding());
  }

  /** {@link HttpRequest.Builder}キャリアを持つ{@link TextMapSetter}。 */
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

以下のコードスニペットは、抽出のための`ContextPropagators` APIを調査します。

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
    // w3cトレースコンテキストとw3cバゲージを伝播するContextPropagatorsインスタンスを作成
    ContextPropagators propagators =
        ContextPropagators.create(
            TextMapPropagator.composite(
                W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));

    // プロパゲーターを使用してリクエストからコンテキストを抽出するサーバーを作成
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
      // リクエストからコンテキストを抽出し、コンテキストを現在にする
      Context extractedContext =
          contextPropagators
              .getTextMapPropagator()
              .extract(Context.current(), exchange, TEXT_MAP_GETTER);
      try (Scope scope = extractedContext.makeCurrent()) {
        // 抽出されたコンテキストで作業を行う
      } finally {
        String response = "success";
        exchange.sendResponseHeaders(200, response.length());
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes(StandardCharsets.UTF_8));
        os.close();
      }
    }
  }

  /** {@link HttpExchange}キャリアを持つ{@link TextMapSetter}。 */
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

`io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}` アーティファクトには、トレース、メトリクス、ログ、noop実装、バゲージ、主要な`TextMapPropagator`実装、および[context API](#context-api)への依存関係を含むOpenTelemetry APIが含まれています。

### プロバイダーとスコープ {#providers-and-scopes}

プロバイダーとスコープは、OpenTelemetry APIにおける繰り返し出現する概念です。
スコープは、テレメトリーが関連付けられるアプリケーション内の論理単位です。
プロバイダーは、特定のスコープに関連するテレメトリーを記録するためのコンポーネントを提供します。

- [TracerProvider](#tracerprovider)は、スパンを記録するためのスコープ付き[Tracers](#tracer)を提供します
- [MeterProvider](#meterprovider)は、メトリクスを記録するためのスコープ付き[Meters](#meter)を提供します
- [LoggerProvider](#loggerprovider)は、ログを記録するためのスコープ付き[Loggers](#logger)を提供します

{{% alert %}} {{% param logBridgeWarning %}} {{% /alert %}}

スコープは三要素（name、version、schemaUrl）によって識別されます。スコープの識別が一意であることを確実にするよう注意する必要があります。
典型的なアプローチは、スコープ名をパッケージ名または完全修飾クラス名に設定し、スコープバージョンをライブラリバージョンに設定することです。
複数のシグナル（メトリクスとトレースなど）のテレメトリーを発行する場合、同じスコープを使用すべきです。
詳細については[計装スコープ](/docs/concepts/instrumentation-scope/)を参照してください。

以下のコードスニペットは、プロバイダーとスコープのAPI使用法を調査します。

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
    // OpenTelemetryインスタンスからプロバイダーにアクセス
    TracerProvider tracerProvider = openTelemetry.getTracerProvider();
    MeterProvider meterProvider = openTelemetry.getMeterProvider();
    // 注意: LoggerProviderは特別なケースで、他のログAPI/フレームワークから
    // OpenTelemetryにログをブリッジするためにのみ使用されるべきです。
    LoggerProvider loggerProvider = openTelemetry.getLogsBridge();

    // 特定のスコープのテレメトリーを記録するためにプロバイダーからtracer、meter、loggerにアクセス
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

    // ...オプションで、スコープバージョンとschemaUrlが利用できない場合の短縮版も利用可能
    tracer = tracerProvider.get(SCOPE_NAME);
    meter = meterProvider.get(SCOPE_NAME);
    logger = loggerProvider.get(SCOPE_NAME);
  }
}
```
<!-- prettier-ignore-end -->

### Attributes {#attributes}

[Attributes](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/common/Attributes.html)は[標準属性定義](/docs/specs/otel/common/#attribute)を表すキー値ペアのバンドルです。
`Attributes`は、OpenTelemetry APIにおける繰り返し出現する概念です。

- [スパン](#span)、スパンイベント、スパンリンクには属性があります
- [メーター計装](#meter)に記録される測定値には属性があります
- [LogRecords](#logrecordbuilder)には属性があります

セマンティック規約から生成された属性定数については、[セマンティック属性](#semantic-attributes)を参照してください。

属性命名のガイダンスについては、[属性命名](/docs/specs/semconv/general/naming/)を参照してください。

以下のコードスニペットは`Attributes` API使用法を調査します。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AttributesUsage.java"?>
```java
package otel;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;
import java.util.Map;

public class AttributesUsage {
  // 属性キーの静的定数を確立し、アロケーションを避けるために再利用
  private static final AttributeKey<String> SHOP_ID = AttributeKey.stringKey("com.acme.shop.id");
  private static final AttributeKey<String> SHOP_NAME =
      AttributeKey.stringKey("com.acme.shop.name");
  private static final AttributeKey<Long> CUSTOMER_ID =
      AttributeKey.longKey("com.acme.customer.id");
  private static final AttributeKey<String> CUSTOMER_NAME =
      AttributeKey.stringKey("com.acme.customer.name");

  public static void attributesUsage() {
    // 可変引数初期化子と事前に割り当てられた属性キーを使用。これが属性を作成する最も効率的な方法です。
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

    // ...またはビルダーを使用。
    attributes =
        Attributes.builder()
            .put(SHOP_ID, "abc123")
            .put(SHOP_NAME, "opentelemetry-demo")
            .put(CUSTOMER_ID, 123)
            .put(CUSTOMER_NAME, "Jack")
            // オプションで属性キーをその場で初期化
            .put(AttributeKey.stringKey("com.acme.string-key"), "value")
            .put(AttributeKey.booleanKey("com.acme.bool-key"), true)
            .put(AttributeKey.longKey("com.acme.long-key"), 1L)
            .put(AttributeKey.doubleKey("com.acme.double-key"), 1.1)
            .put(AttributeKey.stringArrayKey("com.acme.string-array-key"), "value1", "value2")
            .put(AttributeKey.booleanArrayKey("come.acme.bool-array-key"), true, false)
            .put(AttributeKey.longArrayKey("come.acme.long-array-key"), 1L, 2L)
            .put(AttributeKey.doubleArrayKey("come.acme.double-array-key"), 1.1, 2.2)
            // オプションでAttributeKeyの初期化を省略
            .put("com.acme.string-key", "value")
            .put("com.acme.bool-key", true)
            .put("come.acme.long-key", 1L)
            .put("come.acme.double-key", 1.1)
            .put("come.acme.string-array-key", "value1", "value2")
            .put("come.acme.bool-array-key", true, false)
            .put("come.acme.long-array-key", 1L, 2L)
            .put("come.acme.double-array-key", 1.1, 2.2)
            .build();

    // Attributesには、データの操作と読み取りのためのさまざまなメソッドがあります。
    // 属性キーを読み取る:
    String shopIdValue = attributes.get(SHOP_ID);
    // サイズを検査:
    int size = attributes.size();
    boolean isEmpty = attributes.isEmpty();
    // マップ表現に変換:
    Map<AttributeKey<?>, Object> map = attributes.asMap();
    // エントリを反復し、それぞれを次のテンプレートに印刷: <key> (<type>): <value>\n
    attributes.forEach(
        (attributeKey, value) ->
            System.out.printf(
                "%s (%s): %s%n", attributeKey.getKey(), attributeKey.getType(), value));
    // ビルダーに変換し、com.acme.customer.idを削除し、キーがcom.acme.shopで始まるエントリを削除し、
    // 新しいインスタンスを構築:
    AttributesBuilder builder = attributes.toBuilder();
    builder.remove(CUSTOMER_ID);
    builder.removeIf(attributeKey -> attributeKey.getKey().startsWith("com.acme.shop"));
    Attributes trimmedAttributes = builder.build();
  }
}
```
<!-- prettier-ignore-end -->

### OpenTelemetry {##opentelemetry}

{{% alert title="Spring Boot Starter" %}}

Spring Boot starterは特別なケースで、`OpenTelemetry`がSpring Beanとして利用可能です。単純にSpringコンポーネントに`OpenTelemetry`を注入してください。

[カスタム手動計装によるSpring Boot starterの拡張](/docs/zero-code/java/spring-boot-starter/api/)についてもっと読む。

{{% /alert %}}

[OpenTelemetry](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/OpenTelemetry.html)は、計装に渡すのに便利なトップレベルAPIコンポーネントのホルダーです。

`OpenTelemetry`は以下で構成されています。

- [TracerProvider](#tracerprovider)：トレースのAPIエントリポイント
- [MeterProvider](#meterprovider)：メトリクスのAPIエントリポイント
- [LoggerProvider](#loggerprovider)：ログのAPIエントリポイント
- [ContextPropagators](#contextpropagators)：コンテキスト伝搬のAPIエントリポイント

以下のコードスニペットは`OpenTelemetry` API使用法を調査します。

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
    // TracerProvider、MeterProvider、LoggerProvider、ContextPropagatorsにアクセス
    TracerProvider tracerProvider = openTelemetry.getTracerProvider();
    MeterProvider meterProvider = openTelemetry.getMeterProvider();
    LoggerProvider loggerProvider = openTelemetry.getLogsBridge();
    ContextPropagators propagators = openTelemetry.getPropagators();
  }
}
```
<!-- prettier-ignore-end -->

### GlobalOpenTelemetry {#globalopentelemetry}

{{% alert title="Java agent" %}}

Javaエージェントは特別なケースで、`GlobalOpenTelemetry`はエージェントによって設定されます。
単純に`GlobalOpenTelemetry.get()`を呼び出して`OpenTelemetry`インスタンスにアクセスしてください。

[カスタム手動計装によるJavaエージェントの拡張](/docs/zero-code/java/agent/api/)についてもっと読む。

{{% /alert %}}

[GlobalOpenTelemetry](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/GlobalOpenTelemetry.html)は、グローバルシングルトンの[OpenTelemetry](#opentelemetry)インスタンスを保持します。

計装は、`GlobalOpenTelemetry`の使用を避けるべきです。
かわりに、初期化引数として`OpenTelemetry`を受け入れ、設定されていない場合は[Noop実装](#noop-implementation)にデフォルトするべきです。
この規則には例外があります。
[Javaエージェント](/docs/zero-code/java/agent/)によってインストールされた`OpenTelemetry`インスタンスは`GlobalOpenTelemetry`を介して利用可能です。
追加の手動計装を持つユーザーは、`GlobalOpenTelemetry.get()`を介してアクセスすることが推奨されます。

`GlobalOpenTelemetry.get()`は常に同じ結果を返すことが保証されています。`GlobalOpenTelemetry.set(..)`より前に`GlobalOpenTelemetry.get()`が呼び出された場合、`GlobalOpenTelemetry`はnoop実装に設定され、`GlobalOpenTelemetry.set(..)`への将来の呼び出しは例外をスローします。したがって、アプリケーションライフサイクルの可能な限り早期に、計装によって`GlobalOpenTelemetry.get()`が呼び出される前に`GlobalOpenTelemetry.set(..)`を呼び出すことが重要です。この保証により初期化順序の問題が表面化します。`GlobalOpenTelemetry.set()`の呼び出しが遅すぎる場合（計装が`GlobalOpenTelemetry.get()`を呼び出した後）、サイレントに失敗するのではなく例外をトリガーします。

[autoconfigure](../configuration/#zero-code-sdk-autoconfigure)が存在する場合、`GlobalOpenTelemetry`は`-Dotel.java.global-autoconfigure.enabled=true`を設定することで自動的に初期化できます（または環境変数`export OTEL_JAVA_GLOBAL_AUTOCONFIGURE_ENABLED=true`を介して）。有効にされると、`GlobalOpenTelemetry.get()`への最初の呼び出しが自動設定をトリガーし、結果の`OpenTelemetry`インスタンスで`GlobalOpenTelemetry.set(..)`を呼び出します。

以下のコードスニペットは`GlobalOpenTelemetry` APIコンテキスト伝搬を調査します。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/GlobalOpenTelemetryUsage.java"?>
```java
package otel;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.OpenTelemetry;

public class GlobalOpenTelemetryUsage {

  public static void openTelemetryUsage(OpenTelemetry openTelemetry) {
    // アプリケーションライフサイクルの可能な限り早期にGlobalOpenTelemetryインスタンスを設定
    // setは一度だけ呼び出される必要があります。複数回呼び出すと例外が発生します。
    GlobalOpenTelemetry.set(openTelemetry);

    // GlobalOpenTelemetryインスタンスを取得。
    openTelemetry = GlobalOpenTelemetry.get();
  }
}
```
<!-- prettier-ignore-end -->

### TracerProvider {#tracerprovider}

[TracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/TracerProvider.html)は、トレースのAPIエントリポイントで、[Tracers](#tracer)を提供します。
プロバイダーとスコープの情報については、[プロバイダーとスコープ](#providers-and-scopes)を参照してください。

#### Tracer {#tracer}

[Tracer](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/Tracer.html)は、計装スコープに対して[スパンを記録](#span)するために使用されます。
プロバイダーとスコープの情報については、[プロバイダーとスコープ](#providers-and-scopes)を参照してください。

#### Span {#span}

[SpanBuilder](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/SpanBuilder.html)と[Span](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/Span.html)は、スパンにデータを構築し記録するために使用されます。

`SpanBuilder`は、`Span startSpan()`を呼び出してスパンを開始する前にスパンにデータを追加するために使用されます。
開始後、さまざまな`Span`更新メソッドを呼び出すことでデータを追加/更新できます。開始前に`SpanBuilder`に提供されるデータは、[Sampler](../sdk/#sampler)への入力として提供されます。

以下のコードスニペットは`SpanBuilder` / `Span` API使用法を調査します。

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
    // スパン名を提供してスパンビルダーを取得
    Span span =
        tracer
            .spanBuilder("span name")
            // スパン種別を設定
            .setSpanKind(SpanKind.INTERNAL)
            // 属性を設定
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
            // オプションでAttributeKeyの初期化を省略
            .setAttribute("com.acme.string-key", "value")
            .setAttribute("com.acme.bool-key", true)
            .setAttribute("come.acme.long-key", 1L)
            .setAttribute("come.acme.double-key", 1.1)
            .setAllAttributes(WIDGET_RED_CIRCLE)
            // オプションで親スパンコンテキストを明示的に設定するコメントアウト解除。省略すると、
            // スパンの親はContext.current()を使用して設定されます。
            // .setParent(parentContext)
            // オプションでリンクを追加するコメントアウト解除。
            // .addLink(linkContext, linkAttributes)
            // スパンを開始
            .startSpan();

    // 追加データを計算する前にスパンが記録中かどうかをチェック
    if (span.isRecording()) {
      // 開始時に利用できなかった情報でスパン名を更新
      span.updateName("new span name");

      // 開始時に利用できなかった追加属性を追加
      span.setAttribute("com.acme.string-key2", "value");

      // 開始時に利用できなかった追加スパンリンクを追加
      span.addLink(exampleLinkContext());
      // オプションでリンクに属性を含める
      span.addLink(exampleLinkContext(), WIDGET_RED_CIRCLE);

      // スパンイベントを追加
      span.addEvent("my-event");
      // オプションでイベントに属性を含める
      span.addEvent("my-event", WIDGET_RED_CIRCLE);

      // 例外を記録、特定の形状を持つスパンイベントの構文糖衣
      span.recordException(new RuntimeException("error"));

      // スパンステータスを設定
      span.setStatus(StatusCode.OK, "status description");
    }

    // 最後に、スパンを終了
    span.end();
  }

  /** ダミーリンクコンテキストを返す。 */
  private static SpanContext exampleLinkContext() {
    return Span.fromContext(current()).getSpanContext();
  }
}
```
<!-- prettier-ignore-end -->

スパンの親子関係は、トレーシングの重要な側面です。各スパンには、オプションの親があります。トレース内のすべてのスパンを収集し、各スパンの親を辿ることで、階層を構築できます。スパンAPIは[context](#context)の上に構築されており、スパンコンテキストがアプリケーション全体およびスレッド間で暗黙的に渡されることを可能にします。スパンが作成されるとき、その親は、スパンが存在しないかコンテキストが明示的にオーバーライドされない限り、`Context.current()`に存在するスパンに設定されます。

コンテキストAPIの使用ガイダンスのほとんどはスパンに適用されます。スパンコンテキストは、[W3CTraceContextPropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/propagation/W3CTraceContextPropagator.html)および他の[TextMapPropagators](../sdk/#textmappropagator)でアプリケーション境界を越えて伝搬されます。

以下のコードスニペットは`Span` APIコンテキスト伝搬を調査します。

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
    // スパンを開始。makeCurrent()を呼び出さないため、子で明示的にsetParentを呼び出す必要があります。
    // スパンを確実に終了するため、try / finallyでコードをラップします。
    Span span = tracer.spanBuilder("span").startSpan();
    try {
      // 子スパンを開始し、親を明示的に設定。
      Span childSpan =
          tracer
              .spanBuilder("span child")
              // 親を明示的に設定。
              .setParent(span.storeInContext(Context.current()))
              .startSpan();
      // makeCurrent()を呼び出し、childSpanをContext.current()に追加。スコープ内で作成されるスパンは
      // 親がchildSpanに設定されます。
      try (Scope childSpanScope = childSpan.makeCurrent()) {
        // スパンを作成する別のメソッドを呼び出す。スパンの親は、childSpanスコープ内で開始されるため、
        // childSpanになります。
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

[MeterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/MeterProvider.html)は、メトリクスのAPIエントリポイントで、[Meter](#meter)を提供します。
プロバイダーとスコープの情報については、[プロバイダーとスコープ](#providers-and-scopes)を参照してください。

#### Meter {#meter}

[Meter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/Meter.html)は、特定の[計装スコープ](#providers-and-scopes)の計装を取得するために使用されます。
プロバイダーとスコープの情報については、[プロバイダーとスコープ](#providers-and-scopes)を参照してください。さまざまな計装があり、それぞれ異なるセマンティクスとSDKでのデフォルト動作を持ちます。各特定の使用例に適切な計装を選択することが重要です。

| 計装                                        | 同期または非同期 | 説明                                               | 例                                           | デフォルトSDK集約                                                                              |
| ------------------------------------------- | ---------------- | -------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Counter](#counter)                         | 同期             | 単調（正の）値を記録。                             | ユーザーログインを記録                       | [sum (monotonic=true)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                          |
| [Async Counter](#async-counter)             | 非同期           | 単調な合計を観測。                                 | JVMにロードされたクラス数を観測              | [sum (monotonic=true)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                          |
| [UpDownCounter](#updowncounter)             | 同期             | 非単調（正と負の）値を記録。                       | アイテムがキューに追加/削除されるときを記録  | [sum (monotonic=false)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                         |
| [Async UpDownCounter](#async-updowncounter) | 非同期           | 非単調（正と負の）合計を観測。                     | JVMメモリプール使用量を観測                  | [sum (monotonic=false)](/docs/specs/otel/metrics/sdk/#sum-aggregation)                         |
| [Histogram](#histogram)                     | 同期             | 分散が重要な単調（正の）値を記録。                 | サーバーが処理するHTTPリクエストの期間を記録 | [ExplicitBucketHistogram](/docs/specs/otel/metrics/sdk/#explicit-bucket-histogram-aggregation) |
| [Gauge](#gauge)                             | 同期             | 空間的再集約が意味をなさない最新値を記録 **[1]**。 | 温度を記録                                   | [LastValue](/docs/specs/otel/metrics/sdk/#last-value-aggregation)                              |
| [Async Gauge](#async-gauge)                 | 非同期           | 空間的再集約が意味をなさない最新値を観測 **[1]**。 | CPU使用率を観測                              | [LastValue](/docs/specs/otel/metrics/sdk/#last-value-aggregation)                              |

**[1]**: 空間的再集約は、必要のない属性を削除することで属性ストリームをマージするプロセスです。たとえば、属性`{"color": "red", "shape": "square"}`、`{"color": "blue", "shape": "square"}`を持つ系列があるとき、`color`属性を削除し、`color`削除後に属性が等しい系列をマージすることで空間的再集約を実行できます。ほとんどの集約には有用な空間集約マージ機能があります（つまり、合計は一緒に合計される）が、`LastValue`集約によって集約されるゲージは例外です。たとえば、前述の系列がウィジェットの温度を追跡しているとします。`color`属性を削除するとき、系列をどのようにマージしますか？コインを投げてランダムな値を選択する以外に良い答えはありません。

計装APIは、さまざまな機能を共有します。

- ビルダーパターンを使用して作成される
- 必須の計装名
- オプションの単位と説明
- ビルダーを介して設定される`long`または`double`の値を記録する

メトリクス命名と単位の詳細については、[メトリクスガイドライン](/docs/specs/semconv/general/metrics/#general-guidelines)を参照してください。

計装選択に関する追加ガイダンスについては、[計装ライブラリ作成者のためのガイドライン](/docs/specs/otel/metrics/supplementary-guidelines/#guidelines-for-instrumentation-library-authors)を参照してください。

#### Counter {#counter}

[LongCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongCounter.html)と[DoubleCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleCounter.html)は、単調（正の）値を記録するために使用されます。

以下のコードスニペットは、カウンターAPI使用法を調査します。

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
    // 常に正（単調に増加）の測定値を記録するカウンターを構築。
    LongCounter counter =
        meter
            .counterBuilder("fully.qualified.counter")
            .setDescription("A count of produced widgets")
            .setUnit("{widget}")
            // オプションで型をdoubleに変更
            // .ofDoubles()
            .build();

    // 属性やコンテキストなしで測定値を記録。
    // 属性はAttributes.empty()、コンテキストはContext.current()がデフォルト。
    counter.add(1L);

    // 属性を持つ測定値を記録、可能な限り事前に割り当てられた属性を使用。
    counter.add(1L, WIDGET_RED_CIRCLE);
    // 時には、アプリケーションコンテキストを使用して属性を計算する必要があります。
    counter.add(
        1L, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // 属性とコンテキストを持つ測定値を記録。
    // ほとんどのユーザーは、デフォルトのContext.current()を好んで、コンテキスト引数を省略することを選択します。
    counter.add(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Async Counter {#async-counter}

[ObservableLongCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongCounter.html)と[ObservableDoubleCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleCounter.html)は、単調（正の）合計を観測するために使用されます。

以下のコードスニペットは、非同期カウンターAPI使用法を調査します。

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
  // 可能な限り属性を事前に割り当て
  private static final Attributes WIDGET_RED_CIRCLE = Util.WIDGET_RED_CIRCLE;

  public static void asyncCounterUsage(Meter meter) {
    AtomicLong widgetCount = new AtomicLong();

    // コールバックで既存のカウンターを観測する非同期カウンターを構築
    ObservableLongCounter asyncCounter =
        meter
            .counterBuilder("fully.qualified.counter")
            .setDescription("A count of produced widgets")
            .setUnit("{widget}")
            // オプションで型をdoubleに変更するコメントアウト解除
            // .ofDoubles()
            .buildWithCallback(
                // コールバックはMetricReaderがメトリクスを読み取るときに呼び出される
                observableMeasurement -> {
                  long currentWidgetCount = widgetCount.get();

                  // 属性なしで測定値を記録。
                  // 属性はAttributes.empty()がデフォルト。
                  observableMeasurement.record(currentWidgetCount);

                  // 属性を持つ測定値を記録、可能な限り事前に割り当てられた属性を使用。
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // 時には、アプリケーションコンテキストを使用して属性を計算する必要があります。
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // 必要に応じてカウンターを閉じてコールバックの登録を解除
    asyncCounter.close();
  }
}
```
<!-- prettier-ignore-end -->

#### UpDownCounter {#updowncounter}

[LongUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongUpDownCounter.html)と[DoubleUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleUpDownCounter.html)は、非単調（正と負の）値を記録するために使用されます。

以下のコードスニペットは、アップダウンカウンターAPI使用法を調査します。

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
    // 上下する測定値を記録するアップダウンカウンターを構築。
    LongUpDownCounter upDownCounter =
        meter
            .upDownCounterBuilder("fully.qualified.updowncounter")
            .setDescription("Current length of widget processing queue")
            .setUnit("{widget}")
            // オプションで型をdoubleに変更するコメントアウト解除
            // .ofDoubles()
            .build();

    // 属性やコンテキストなしで測定値を記録。
    // 属性はAttributes.empty()、コンテキストはContext.current()がデフォルト。
    upDownCounter.add(1L);

    // 属性を持つ測定値を記録、可能な限り事前に割り当てられた属性を使用。
    upDownCounter.add(-1L, WIDGET_RED_CIRCLE);
    // 時には、アプリケーションコンテキストを使用して属性を計算する必要があります。
    upDownCounter.add(
        -1L, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // 属性とコンテキストを持つ測定値を記録。
    // ほとんどのユーザーは、デフォルトのContext.current()を好んで、コンテキスト引数を省略することを選択します。
    upDownCounter.add(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Async UpDownCounter {#async-updowncounter}

[ObservableLongUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongUpDownCounter.html)と[ObservableDoubleUpDownCounter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleUpDownCounter.html)は、非単調（正と負の）合計を観測するために使用されます。

以下のコードスニペットは、非同期アップダウンカウンターAPI使用法を調査します。

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

    // コールバックで既存のアップダウンカウンターを観測する非同期アップダウンカウンターを構築
    ObservableLongUpDownCounter asyncUpDownCounter =
        meter
            .upDownCounterBuilder("fully.qualified.updowncounter")
            .setDescription("Current length of widget processing queue")
            .setUnit("{widget}")
            // オプションで型をdoubleに変更するコメントアウト解除
            // .ofDoubles()
            .buildWithCallback(
                // コールバックはMetricReaderがメトリクスを読み取るときに呼び出される
                observableMeasurement -> {
                  long currentWidgetCount = queueLength.get();

                  // 属性なしで測定値を記録。
                  // 属性はAttributes.empty()がデフォルト。
                  observableMeasurement.record(currentWidgetCount);

                  // 属性を持つ測定値を記録、可能な限り事前に割り当てられた属性を使用。
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // 時には、アプリケーションコンテキストを使用して属性を計算する必要があります。
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // 必要に応じてカウンターを閉じてコールバックの登録を解除
    asyncUpDownCounter.close();
  }
}
```
<!-- prettier-ignore-end -->

#### Histogram {#histogram}

[DoubleHistogram](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleHistogram.html)と[LongHistogram](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongHistogram.html)は、分散が重要な単調（正の）値を記録するために使用されます。

以下のコードスニペットは、ヒストグラムAPI使用法を調査します。

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
    // 分散が重要な測定値を記録するヒストグラムを構築。
    DoubleHistogram histogram =
        meter
            .histogramBuilder("fully.qualified.histogram")
            .setDescription("Length of time to process a widget")
            .setUnit("s")
            // 有用なデフォルト明示的バケット境界のアドバイスをオプション提供するコメントアウト解除
            // .setExplicitBucketBoundariesAdvice(Arrays.asList(1.0, 2.0, 3.0))
            // オプションで型をlongに変更するコメントアウト解除
            // .ofLongs()
            .build();

    // 属性やコンテキストなしで測定値を記録。
    // 属性はAttributes.empty()、コンテキストはContext.current()がデフォルト。
    histogram.record(1.1);

    // 属性を持つ測定値を記録、可能な限り事前に割り当てられた属性を使用。
    histogram.record(2.2, WIDGET_RED_CIRCLE);
    // 時には、アプリケーションコンテキストを使用して属性を計算する必要があります。
    histogram.record(
        3.2, Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // 属性とコンテキストを持つ測定値を記録。
    // ほとんどのユーザーは、デフォルトのContext.current()を好んで、コンテキスト引数を省略することを選択します。
    histogram.record(4.4, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Gauge {#gauge}

[DoubleGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/DoubleGauge.html)と[LongGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/LongGauge.html)は、空間的再集約が意味をなさない最新値を記録するために使用されます。

以下のコードスニペットは、ゲージAPI使用法を調査します。

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
    // 発生時に測定値を記録し、空間的に再集約できないゲージを構築。
    DoubleGauge gauge =
        meter
            .gaugeBuilder("fully.qualified.gauge")
            .setDescription("The current temperature of the widget processing line")
            .setUnit("K")
            // オプションで型をlongに変更するコメントアウト解除
            // .ofLongs()
            .build();

    // 属性やコンテキストなしで測定値を記録。
    // 属性はAttributes.empty()、コンテキストはContext.current()がデフォルト。
    gauge.set(273.0);

    // 属性を持つ測定値を記録、可能な限り事前に割り当てられた属性を使用。
    gauge.set(273.0, WIDGET_RED_CIRCLE);
    // 時には、アプリケーションコンテキストを使用して属性を計算する必要があります。
    gauge.set(
        273.0,
        Attributes.of(WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));

    // 属性とコンテキストを持つ測定値を記録。
    // ほとんどのユーザーは、デフォルトのContext.current()を好んで、コンテキスト引数を省略することを選択します。
    gauge.set(1L, WIDGET_RED_CIRCLE, customContext());
  }
}
```
<!-- prettier-ignore-end -->

#### Async Gauge {#async-gauge}

[ObservableDoubleGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableDoubleGauge.html)と[ObservableLongGauge](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/metrics/ObservableLongGauge.html)は、空間的再集約が意味をなさない最新値を観測するために使用されます。

以下のコードスニペットは、非同期ゲージAPI使用法を調査します。

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

    // コールバックで既存のゲージを観測する非同期ゲージを構築
    ObservableDoubleGauge asyncGauge =
        meter
            .gaugeBuilder("fully.qualified.gauge")
            .setDescription("The current temperature of the widget processing line")
            .setUnit("K")
            // オプションで型をlongに変更するコメントアウト解除
            // .ofLongs()
            .buildWithCallback(
                // コールバックはMetricReaderがメトリクスを読み取るときに呼び出される
                observableMeasurement -> {
                  double currentWidgetCount = processingLineTemp.get();

                  // 属性なしで測定値を記録。
                  // 属性はAttributes.empty()がデフォルト。
                  observableMeasurement.record(currentWidgetCount);

                  // 属性を持つ測定値を記録、可能な限り事前に割り当てられた属性を使用。
                  observableMeasurement.record(currentWidgetCount, WIDGET_RED_CIRCLE);
                  // 時には、アプリケーションコンテキストを使用して属性を計算する必要があります。
                  observableMeasurement.record(
                      currentWidgetCount,
                      Attributes.of(
                          WIDGET_SHAPE, computeWidgetShape(), WIDGET_COLOR, computeWidgetColor()));
                });

    // 必要に応じてゲージを閉じてコールバックの登録を解除
    asyncGauge.close();
  }
}
```
<!-- prettier-ignore-end -->

### LoggerProvider {#loggerprovider}

[LoggerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/LoggerProvider.html)は、ログのAPIエントリポイントで、[Loggers](#logger)を提供します。
プロバイダーとスコープの情報については、[プロバイダーとスコープ](#providers-and-scopes)を参照してください。

{{% alert %}} {{% param logBridgeWarning %}} {{% /alert %}}

#### Logger {#logger}

[Logger](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/Logger.html)は、[計装スコープ](#providers-and-scopes)に対して[ログレコードを発行](#logrecordbuilder)するために使用されます。
プロバイダーとスコープの情報については、[プロバイダーとスコープ](#providers-and-scopes)を参照してください。

#### LogRecordBuilder {#logrecordbuilder}

[LogRecordBuilder](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/logs/LogRecordBuilder.html)は、ログレコードを構築し発行するために使用されます。

以下のコードスニペットは`LogRecordBuilder` API使用法を調査します。

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
        // ボディを設定。注意、setBody(..)は実演目的で複数回呼び出されていますが、
        // 最後の呼び出しのみが使用されます。
        // ボディを文字列に設定、setBody(Value.of("log message"))の構文糖衣
        .setBody("log message")
        // オプションでボディをValueに設定して任意に複雑な構造化データを記録
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
        // severity設定
        .setSeverity(Severity.DEBUG)
        .setSeverityText("debug")
        // タイムスタンプ設定
        .setTimestamp(System.currentTimeMillis(), TimeUnit.MILLISECONDS)
        // オプションでログが観測されたときのタイムスタンプを設定
        .setObservedTimestamp(System.currentTimeMillis(), TimeUnit.MILLISECONDS)
        // 属性設定
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
        // スパンと関連付けるために使用されるコンテキストを明示的に設定するためにオプションでコメントアウト解除。
        // 省略された場合、Context.current()が使用されます。
        // .setContext(context)
        // ログレコードを発行
        .emit();
  }
}
```
<!-- prettier-ignore-end -->

### Noop実装 {#noop-implementation}

`OpenTelemetry#noop()`メソッドは、[OpenTelemetry](#opentelemetry)および提供するすべてのAPIコンポーネントのnoop実装へのアクセスを提供します。名前が示すように、noop実装は何もせず、パフォーマンスに影響を与えないように設計されています。計装は、noop が使用されている場合でも、テレメトリーを記録するために必要な属性値やその他のデータを計算/割り当てしている場合、パフォーマンスに影響を与える可能性があります。noopは、ユーザーが[SDK](../sdk/)などの具体的な実装を設定およびインストールしていないときの有用なデフォルトの`OpenTelemetry`インスタンスです。

以下のコードスニペットは`OpenTelemetry#noop()` API使用法を調査します。

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
    // noop OpenTelemetryインスタンスにアクセス
    OpenTelemetry noopOpenTelemetry = OpenTelemetry.noop();

    // noop トレーシング
    Tracer noopTracer = OpenTelemetry.noop().getTracer(SCOPE_NAME);
    noopTracer
        .spanBuilder("span name")
        .startSpan()
        .setAttribute(WIDGET_SHAPE, "square")
        .setStatus(StatusCode.OK)
        .addEvent("event-name", Attributes.builder().put(WIDGET_COLOR, "red").build())
        .end();

    // noop メトリクス
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

    // noop ログ
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

### セマンティック属性 {#semantic-attributes}

[セマンティック規約](/docs/specs/semconv/)では、一般的な操作について標準化された方法でテレメトリーを収集する方法について説明します。
これには、規約で参照されるすべての属性の定義をドメイン別に整理して列挙する[属性レジストリ](/docs/specs/semconv/registry/attributes/)が含まれます。
[semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)プロジェクトは、セマンティック規約から定数を生成し、計装が適合するのに使用できます。

| 説明                                                       | アーティファクト                                                                             |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 安定したセマンティック規約用に生成されたコード             | `io.opentelemetry.semconv:opentelemetry-semconv:{{% param vers.semconv %}}-alpha`            |
| インキュベーティングセマンティック規約用に生成されたコード | `io.opentelemetry.semconv:opentelemetry-semconv-incubating:{{% param vers.semconv %}}-alpha` |

{{% alert %}}

`opentelemetry-semconv`と`opentelemetry-semconv-incubating`の両方に`-alpha`接尾辞が含まれ、破壊的変更の対象となりますが、意図は`opentelemetry-semconv`を安定化し、`opentelemetry-semconv-incubating`には永続的に`-alpha`接尾辞を残すことです。
ライブラリはテスト用に`opentelemetry-semconv-incubating`を使用できますが、依存関係として含めるべきではありません。
属性はバージョンから別のバージョンに来たり行ったりする可能性があるため、依存関係として含めると、推移的バージョンの競合が発生したときにエンドユーザーがランタイムエラーにさらされる可能性があります。

{{% /alert %}}

セマンティック規約から生成された属性定数は`AttributeKey<T>`のインスタンスで、OpenTelemetry APIが属性を受け入れるどこでも使用できます。

以下のコードスニペットは、セマンティック規約属性API使用法を調査します。

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
    // セマンティック属性は、トップレベルドメインと安定またはインキュベーティングかによって整理されます。
    // 例:
    // - http.*で始まる安定属性はHttpAttributesクラスにあります。
    // - server.*で始まる安定属性はServerAttributesクラスにあります。
    // - http.*で始まるインキュベーティング属性はHttpIncubatingAttributesクラスにあります。
    // 値の列挙を定義する属性キーは、内部の{AttributeKey}Valuesクラスでアクセス可能です。
    // 例えば、http.request.method値の列挙は、HttpAttributes.HttpRequestMethodValuesクラスで利用可能です。
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

[Baggage](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/baggage/Baggage.html)は、分散リクエストまたはワークフロー実行に関連付けられたアプリケーション定義のキー値ペアのバンドルです。
バゲージキーと値は文字列で、値にはオプションの文字列メタデータがあります。テレメトリーは、スパン、メトリクス、ログレコードに属性としてエントリを追加するよう[SDK](../sdk/)を設定することにより、バゲージからのデータで強化できます。
バゲージAPIは[context](#context)の上に構築されており、スパンコンテキストがアプリケーション全体およびスレッド間で暗黙的に渡されることを可能にします。
コンテキストAPIの使用ガイダンスのほとんどはバゲージに適用されます。

バゲージは、[W3CBaggagePropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/baggage/propagation/W3CBaggagePropagator.html)でアプリケーション境界を越えて伝搬されます（詳細については[TextMapPropagator](../sdk/#textmappropagator)を参照）。

以下のコードスニペットは`Baggage` API使用法を調査します。

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
    // Baggage.current()で現在のバゲージにアクセス
    // 出力 => context baggage: {}
    Baggage currentBaggage = Baggage.current();
    System.out.println("current baggage: " + asString(currentBaggage));
    // ...またはContextから
    currentBaggage = Baggage.fromContext(current());

    // バゲージには、データの操作と読み取りのためのさまざまなメソッドがあります。
    // ビルダーに変換してエントリを追加:
    Baggage newBaggage =
        Baggage.current().toBuilder()
            .put("shopId", "abc123")
            .put("shopName", "opentelemetry-demo", BaggageEntryMetadata.create("metadata"))
            .build();
    // ...または空から開始するコメントアウト解除
    // newBaggage = Baggage.empty().toBuilder().put("shopId", "abc123").build();
    // 出力 => new baggage: {shopId=abc123(), shopName=opentelemetry-demo(metadata)}
    System.out.println("new baggage: " + asString(newBaggage));
    // エントリを読み取る:
    String shopIdValue = newBaggage.getEntryValue("shopId");
    // サイズを検査:
    int size = newBaggage.size();
    boolean isEmpty = newBaggage.isEmpty();
    // マップ表現に変換:
    Map<String, BaggageEntry> map = newBaggage.asMap();
    // エントリを反復:
    newBaggage.forEach((s, baggageEntry) -> {});

    // 現在のバゲージはまだ新しいエントリを含まない
    // 出力 => context baggage: {}
    System.out.println("current baggage: " + asString(Baggage.current()));

    // Baggage.makeCurrent()を呼び出すと、スコープが閉じられるまでBaggage.current()がバゲージに設定され、
    // その後Baggage.current()はBaggage.makeCurrent()が呼び出される前の状態に復元されます。
    try (Scope scope = newBaggage.makeCurrent()) {
      // 現在のバゲージに追加された値が含まれる
      // 出力 => context baggage: {shopId=abc123(), shopName=opentelemetry-demo(metadata)}
      System.out.println("current baggage: " + asString(Baggage.current()));
    }

    // 現在のバゲージにもう新しいエントリが含まれない:
    // 出力 => context baggage: {}
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

## インキュベーティングAPI

`io.opentelemetry:opentelemetry-api-incubator:{{% param vers.otel %}}-alpha` アーティファクトには、実験的なトレース、メトリクス、ログ、コンテキストAPIが含まれています。
インキュベーティングAPIは、マイナーリリースで破壊的なAPI変更がある可能性があります。多くの場合、これらは実験的な仕様機能やユーザーフィードバックを通じて評価したいAPI設計を表します。
ユーザーがこれらのAPIを試して、フィードバック（ポジティブまたはネガティブ）と共に課題を開くことを奨励します。
ライブラリは、推移的バージョンの競合が発生したときにユーザーがランタイムエラーにさらされる可能性があるため、インキュベーティングAPIに依存すべきではありません。

利用可能なAPIとサンプル使用法については、[incubator README](https://github.com/open-telemetry/opentelemetry-java/tree/main/api/incubator)を参照してください。
