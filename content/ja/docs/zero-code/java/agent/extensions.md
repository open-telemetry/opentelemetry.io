---
title: エクステンション
aliases: [/docs/instrumentation/java/extensions]
description: エクステンションは、個別のディストリビューションを作成することなくエージェントに機能を追加します。
weight: 300
default_lang_commit: cb8364effee3fd3f2dc33c15da7c47bde0432122
cSpell:ignore: Customizer Dotel myextension
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/extensions-minimal"?>

## はじめに {#introduction}

エクステンションは、個別のディストリビューション（エージェント全体のカスタムバージョン）を作成することなく、OpenTelemetry Java エージェントに新しい機能やケイパビリティを追加します。
エクステンションは、エージェントの動作をカスタマイズするプラグインと考えてください。

エクステンションを使うと、以下のことができます。

- 現在サポートされていないライブラリ向けの新しい計装を追加する
- 既存の計装の動作をカスタマイズする
- カスタム SDK コンポーネント（サンプラー、エクスポーター、プロパゲーター）を実装する
- 環境変数や宣言的設定ではカバーされないケースのために、プログラムで設定をカスタマイズする
- テレメトリーデータの収集と処理を変更する

## クイックスタート {#quick-start}

カスタムスパンプロセッサーを追加する最小限のエクステンションを紹介します。

Gradle プロジェクト（build.gradle.kts）を作成します。

<!-- prettier-ignore-start -->
<?code-excerpt "build.gradle.kts"?>
```kotlin
plugins {
    id("java")
    id("com.gradleup.shadow")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(8))
    }
}

dependencies {
    // BOM を使用して OpenTelemetry の依存バージョンを管理する
    compileOnly(platform("io.opentelemetry:opentelemetry-bom:1.61.0"))

    // OpenTelemetry SDK 自動設定 SPI（エージェントが提供する）
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi")

    // OpenTelemetry SDK（SpanProcessor およびトレース関連のクラスに必要）
    compileOnly("io.opentelemetry:opentelemetry-sdk")

    // 自動 SPI 登録のためのアノテーションプロセッサー
    compileOnly("com.google.auto.service:auto-service:1.1.1")
    annotationProcessor("com.google.auto.service:auto-service:1.1.1")

    // 外部依存関係は 'implementation' スコープで追加する
    // implementation("org.apache.commons:commons-lang3:3.19.0")
}

tasks.assemble {
    dependsOn(tasks.shadowJar)
}
```
<!-- prettier-ignore-end -->

`SpanProcessor` の実装を作成します。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MySpanProcessor.java" from="public"?>
```java
public class MySpanProcessor implements SpanProcessor {

  @Override
  public void onStart(Context parentContext, ReadWriteSpan span) {
    // スパン開始時にカスタム属性を追加する
    span.setAttribute("custom.processor", "active");
  }

  @Override
  public boolean isStartRequired() {
    return true;
  }

  @Override
  public void onEnd(ReadableSpan span) {
    // スパン終了時に処理する（オプション）
  }

  @Override
  public boolean isEndRequired() {
    return false;
  }

  @Override
  public CompletableResultCode shutdown() {
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

`AutoConfigurationCustomizerProvider` SPI を使用するエクステンションクラスを作成します。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MyExtensionProvider.java" from="@AutoService"?>
```java
@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtensionProvider implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer config) {
    config.addTracerProviderCustomizer(this::configureTracer);
  }

  private SdkTracerProviderBuilder configureTracer(
      SdkTracerProviderBuilder tracerProvider, ConfigProperties config) {
    return tracerProvider
        .setSpanLimits(SpanLimits.builder().setMaxNumberOfAttributes(1024).build())
        .addSpanProcessor(new MySpanProcessor());
  }
}
```
<!-- prettier-ignore-end -->

エクステンションをビルドします。

```bash
./gradlew shadowJar
```

エクステンションを使用します。

```bash
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=build/libs/my-extension-all.jar \
     -jar myapp.jar
```

## エクステンションの使用 {#using-extensions}

Java エージェントでエクステンションを使用するには、2 つの方法があります。

- **個別の JAR ファイルとしてロードする** - 開発やテストに柔軟
- **エージェントに埋め込む** - 本番環境向けの単一 JAR デプロイ

| アプローチ           | メリット                                       | デメリット                                   | 適しているケース                 |
| -------------------- | ---------------------------------------------- | -------------------------------------------- | -------------------------------- |
| **ランタイムロード** | エクステンションの入れ替えが簡単、再ビルド不要 | コマンドラインフラグの追加が必要             | 開発、テスト                     |
| **埋め込み**         | 単一 JAR、デプロイがシンプル、ロード忘れがない | エクステンションを変更するには再ビルドが必要 | 本番環境、ディストリビューション |

### ランタイムでのエクステンションのロード {#loading-extensions-at-runtime}

エクステンションは、`otel.javaagent.extensions` システムプロパティまたは `OTEL_JAVAAGENT_EXTENSIONS` 環境変数を使用してランタイムでロードできます。
この設定オプションは、エクステンション JAR ファイルまたはエクステンション JAR を含むディレクトリへのカンマ区切りのパスを受け付けます。

#### 単一のエクステンション {#single-extension}

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/my-extension.jar \
     -jar myapp.jar
```

#### 複数のエクステンション {#multiple-extensions}

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extension1.jar,/path/to/extension2.jar \
     -jar myapp.jar
```

#### エクステンションディレクトリ {#extension-directory}

複数のエクステンション JAR を含むディレクトリを指定でき、そのディレクトリ内のすべての JAR がロードされます。

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extensions-directory \
     -jar myapp.jar
```

#### 混合パス {#mixed-paths}

個別の JAR ファイルとディレクトリを組み合わせることができます。

```bash
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.extensions=/path/to/extension1.jar,/opt/extensions,/tmp/custom.jar \
     -jar myapp.jar
```

#### エクステンションのロードの仕組み {#how-extension-loading-works}

ランタイムでエクステンションをロードすると、エージェントは以下を行います。

1. エクステンション JAR にパッケージする必要なく、OpenTelemetry API をエクステンションで利用可能にする
2. Java の [ServiceLoader](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/ServiceLoader.html) メカニズムを使用して、エクステンションのコンポーネントを検出する（たとえば、コード内の `@AutoService` アノテーションを介して）

### エージェントへのエクステンションの埋め込み {#embedding-extensions-in-the-agent}

もう 1 つのデプロイ方法は、OpenTelemetry Java エージェントとエクステンションの両方を含む単一の JAR ファイルを作成することです。
このアプローチはデプロイを簡素化し（管理する JAR ファイルが 1 つだけ）、`-Dotel.javaagent.extensions` コマンドラインオプションが不要になるため、エクステンションのロードを忘れにくくなります。

#### 仕組み {#how-it-works}

エージェントは JAR ファイル内部の特別な `extensions/` ディレクトリにあるエクステンションを自動的に探します。
そのため、Gradle ビルドタスクを使って以下を行えます。

1. OpenTelemetry Java エージェント JAR をダウンロードする
2. その内容を展開する
3. エクステンション JAR を `extensions/` ディレクトリに追加する
4. すべてを 1 つの JAR にリパッケージする

#### `extendedAgent` Gradle タスク {#the-extendedagent-gradle-task}

エクステンションプロジェクトの `build.gradle.kts` ファイルに以下を追加します。

```kotlin
plugins {
    id("java")

    // Shadow プラグイン: エクステンションのすべてのコードと依存関係を 1 つの JAR に結合する
    // エクステンションは単一の JAR ファイルとしてパッケージする必要があるため、これは必須
    id("com.gradleup.shadow") version "9.2.2"
}

group = "com.example"
version = "1.0"

configurations {
    // エージェント JAR をダウンロードするための一時的な設定を作成する
    // これはエクステンションの依存関係とは別の「ダウンロードスロット」と考える
    create("otel")
}

dependencies {
    // 公式 OpenTelemetry Java エージェントを 'otel' 設定にダウンロードする
    "otel"("io.opentelemetry.javaagent:opentelemetry-javaagent:{{% param vers.instrumentation %}}")

    /*
      実装するインターフェースと SPI。ランタイムでは必要なすべてのクラスが
      javaagent 自体によって提供されるため、`compileOnly` 依存関係を使用する。
     */
    compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}")
    compileOnly("io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}")
    compileOnly("io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}")

    // カスタム計装に必要
    compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api:{{% param vers.instrumentation %}}-alpha")
    compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator:{{% param vers.instrumentation %}}-alpha")
    compileOnly("net.bytebuddy:byte-buddy:1.15.10")

    // SPI 実装の登録をはるかに簡単にする @AutoService アノテーションを提供する
    compileOnly("com.google.auto.service:auto-service:1.1.1")
    annotationProcessor("com.google.auto.service:auto-service:1.1.1")
}

// タスク: 拡張エージェント JAR を作成する（エージェント + エクステンション）
val extendedAgent by tasks.registering(Jar::class) {
    dependsOn(configurations["otel"])
    archiveFileName.set("opentelemetry-javaagent.jar")

    // ステップ 1: 公式エージェント JAR を展開する
    from(zipTree(configurations["otel"].singleFile))

    // ステップ 2: エクステンション JAR を "extensions/" ディレクトリに追加する
    from(tasks.shadowJar.get().archiveFile) {
        into("extensions")
    }

    // ステップ 3: エージェントの起動設定（MANIFEST.MF）を保持する
    doFirst {
        manifest.from(
            zipTree(configurations["otel"].singleFile).matching {
                include("META-INF/MANIFEST.MF")
            }.singleFile
        )
    }
}

tasks {
    // 通常のビルドプロセスで Shadow JAR がビルドされるようにする
    assemble {
        dependsOn(shadowJar)
    }
}
```

完全な例は、[エクステンションの例](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/examples/extension/build.gradle.kts)の Gradle ファイルを参照してください。

#### 拡張エージェントのビルドと使用 {#building-and-using-the-extended-agent}

`build.gradle.kts` に `extendedAgent` タスクを追加したら、以下を実行します。

```bash
# 1. エクステンションをビルドして拡張エージェントを作成する
./gradlew extendedAgent

# 2. build/libs/ に出力を確認する
ls build/libs/opentelemetry-javaagent.jar

# 3. アプリケーションで使用する（-Dotel.javaagent.extensions は不要）
java -javaagent:build/libs/opentelemetry-javaagent.jar -jar myapp.jar
```

#### 複数のエクステンションの埋め込み {#embedding-multiple-extensions}

複数のエクステンションを埋め込むには、`extendedAgent` タスクを変更して複数のエクステンション JAR を含めます。

```kotlin
val extendedAgent by tasks.registering(Jar::class) {
  dependsOn(configurations["otel"])
  archiveFileName.set("opentelemetry-javaagent.jar")

  from(zipTree(configurations["otel"].singleFile))

  // 複数のエクステンションを追加する
  from(tasks.shadowJar.get().archiveFile) {
    into("extensions")
  }
  from(file("../other-extension/build/libs/other-extension-all.jar")) {
    into("extensions")
  }

  doFirst {
    manifest.from(
      zipTree(configurations["otel"].singleFile).matching {
        include("META-INF/MANIFEST.MF")
      }.singleFile
    )
  }
}
```

## エクステンションの作成 {#writing-extensions}

エクステンションの作成では、1 つ以上の Service Provider Interface（SPI）クラスを実装し、それらを JAR ファイルにパッケージして、アプリケーションの実行時にエージェントにその JAR を指定します（[エクステンションの使用](#using-extensions)を参照）。

> [!TIP]
>
> 以下で説明する各 SPI をカバーする完全で実行可能なリファレンスについては、Java 計装リポジトリの[エクステンションの例プロジェクト](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension)を参照してください。

### プロジェクトのセットアップと依存関係 {#project-setup-and-dependencies}

エクステンションは、エージェントやアプリケーションとの競合を避けるために、依存関係を慎重に管理する必要があります。
エージェントがクラスローダー間でエクステンションを分離する仕組みの背景については、[Java エージェントの構造](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/contributing/javaagent-structure.md)を参照してください。

#### エージェントが提供する依存関係（`compileOnly` を使用） {#dependencies-provided-by-agent-use-compileonly}

これらの API はエージェントからランタイムで利用可能です。

```kotlin
compileOnly("io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi")
compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api")
compileOnly("io.opentelemetry.instrumentation:opentelemetry-instrumentation-api-incubator")
compileOnly("io.opentelemetry.javaagent:opentelemetry-javaagent-extension-api")
```

#### アプリケーションクラスパスからの依存関係（`compileOnly` を使用） {#dependencies-from-application-classpath-use-compileonly}

計装を作成する際には、ターゲットアプリケーションのクラスを参照する必要があります。
これらも `compileOnly` にします。

```kotlin
// 計装中に Advice クラスでのみアクセス可能
compileOnly("javax.servlet:javax.servlet-api:3.0.1")
```

#### 外部ランタイム依存関係（`implementation` を使用） {#external-runtime-dependencies-use-implementation}

エクステンションがランタイムで必要とする外部ライブラリは `implementation` スコープを使用し、Shadow JAR にパッケージされます。

```kotlin
implementation("org.apache.commons:commons-lang3:3.19.0")
implementation("com.google.guava:guava:33.0.0-jre")
```

> [!IMPORTANT]
>
> エクステンションは個別の JAR ファイルから依存関係をロードできません。
> すべての依存関係を単一の Shadow JAR にマージする必要があります。

### エクステンションポイントの概要 {#extension-points-overview}

OpenTelemetry Java エージェントは、SPI インターフェイスを通じて複数のエクステンションポイントを提供します。
以下は最も一般的に使用されるものです。

> [!NOTE]
>
> 以下の設定関連の SPI（`AutoConfigurationCustomizerProvider` など）は、SDK が環境変数またはシステムプロパティで設定されている場合に適用されます。
> [宣言的設定](../declarative-configuration)が使用されている場合、動作が異なるか、適用されません。
> 各エクステンションポイントの詳細は以下のリファレンスを参照してください。

| エクステンションポイント              | パッケージ                                                    | 目的                                     |
| ------------------------------------- | ------------------------------------------------------------- | ---------------------------------------- |
| `AutoConfigurationCustomizerProvider` | `io.opentelemetry.sdk.autoconfigure.spi`                      | SDK カスタマイズのメインエントリポイント |
| `ConfigurablePropagatorProvider`      | `io.opentelemetry.sdk.autoconfigure.spi`                      | カスタムプロパゲーターの登録             |
| `ConfigurableSamplerProvider`         | `io.opentelemetry.sdk.autoconfigure.spi.traces`               | カスタムサンプラーの登録                 |
| `ResourceProvider`                    | `io.opentelemetry.sdk.autoconfigure.spi`                      | カスタムリソース属性の追加               |
| `InstrumenterCustomizerProvider`      | `io.opentelemetry.instrumentation.api.incubator.instrumenter` | 既存の計装のカスタマイズ                 |
| `InstrumentationModule`               | `io.opentelemetry.javaagent.extension.instrumentation`        | 新しい計装の作成                         |

自動設定 SPI の完全なリファレンス（組み込みおよびコミュニティ実装を含む）については、[SPI（Service Provider Interface）](/docs/languages/java/configuration/#spi-service-provider-interface)を参照してください。

### エクステンションでの設定 {#configuration-in-extensions}

エクステンションは設定を読み取って提供し、動作をカスタマイズできます。

#### エクステンションでの設定へのアクセス {#accessing-configuration-in-extensions}

多くの SPI メソッドは `ConfigProperties` パラメーターを受け取り、設定を読み取ることができます。

```java
@Override
public Sampler createSampler(ConfigProperties config) {
  // デフォルト値付きで設定を読み取る
  String endpoint = config.getString("otel.exporter.otlp.endpoint", "http://localhost:4317");
  int threshold = config.getInt("otel.instrumentation.myext.threshold", 100);
  boolean enabled = config.getBoolean("otel.instrumentation.myext.enabled", true);
  return new MySampler(endpoint, threshold, enabled);
}
```

#### デフォルト設定の提供 {#providing-default-configuration}

エクステンションは、オーバーライドされない場合に使用されるデフォルト設定値を提供できます。

```java
@Override
public void customize(AutoConfigurationCustomizer config) {
  config.addPropertiesSupplier(() -> {
    Map<String, String> props = new HashMap<>();
    props.put("otel.exporter.otlp.endpoint", "http://my-backend:8080");
    props.put("otel.service.name", "my-service");
    props.put("otel.instrumentation.myext.enabled", "true");
    return props;
  });
}
```

#### 設定の命名規約 {#configuration-naming-conventions}

設定パラメーター名には以下の規約に従います。

標準の OpenTelemetry プロパティは `otel.*` 接頭辞を使用します。

- `otel.service.name`
- `otel.traces.sampler`
- `otel.exporter.otlp.endpoint`

計装固有のプロパティは `otel.instrumentation.<name>.*` を使用します。

- `otel.instrumentation.cassandra.enabled`
- `otel.instrumentation.jdbc.statement-sanitizer.enabled`

エクステンション固有のプロパティも同じパターンに従います。

- `otel.instrumentation.myextension.enabled`
- `otel.instrumentation.myextension.threshold`
- `otel.instrumentation.myextension.custom-value`

### @AutoService の使用 {#using-autoservice}

`@AutoService` アノテーションは、SPI 登録に必要な `META-INF/services/` ファイルを自動生成します。
使用するには以下のようにします。

依存関係を追加します。

```kotlin
compileOnly("com.google.auto.service:auto-service:1.1.1")
annotationProcessor("com.google.auto.service:auto-service:1.1.1")
```

SPI 実装に以下のようにアノテーションを付けます。

```java
import com.google.auto.service.AutoService;

@AutoService(AutoConfigurationCustomizerProvider.class)
public class MyExtension implements AutoConfigurationCustomizerProvider {
  // 実装
}
```

これは、クラス名を含む `META-INF/services/io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider` を手動で作成することと同等です。

## エクステンションポイントのリファレンス {#extension-point-reference}

### AutoConfigurationCustomizerProvider {#autoconfigurationcustomizerprovider}

> [!NOTE]
>
> これは[宣言的設定](../declarative-configuration)が使用されている状況では機能しません。

これは SDK 設定をカスタマイズするためのメインエントリポイントです。
以下を行えます。

- トレーサープロバイダーのカスタマイズ
- スパンプロセッサーとエクスポーターの追加
- デフォルト設定プロパティの提供
- その他の SDK コンポーネントのカスタマイズ

**例:**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoAutoConfigurationCustomizerProvider.java" from="@AutoService"?>
```java
@AutoService(AutoConfigurationCustomizerProvider.class)
public class DemoAutoConfigurationCustomizerProvider
    implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer autoConfiguration) {
    autoConfiguration
        .addTracerProviderCustomizer(this::configureSdkTracerProvider)
        .addPropertiesSupplier(this::getDefaultProperties);
  }

  private SdkTracerProviderBuilder configureSdkTracerProvider(
      SdkTracerProviderBuilder tracerProvider, ConfigProperties config) {

    return tracerProvider
        .setIdGenerator(new DemoIdGenerator())
        .setSpanLimits(SpanLimits.builder().setMaxNumberOfAttributes(1024).build())
        .addSpanProcessor(new DemoSpanProcessor())
        .addSpanProcessor(SimpleSpanProcessor.create(new DemoSpanExporter()));
  }

  private Map<String, String> getDefaultProperties() {
    Map<String, String> properties = new HashMap<>();
    properties.put("otel.exporter.otlp.endpoint", "http://backend:8080");
    properties.put("otel.exporter.otlp.insecure", "true");
    properties.put("otel.config.max.attrs", "16");
    properties.put("otel.traces.sampler", "demo");
    return properties;
  }
}
```
<!-- prettier-ignore-end -->

### InstrumenterCustomizerProvider {#instrumentercustomizerprovider}

コードを変更せずに既存の計装をカスタマイズします。
これは、組み込みの計装に属性やメトリクスを追加したり、動作を変更したりするための推奨される方法です。

**例:**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoInstrumenterCustomizerProvider.java" from="/**"?>
```java
/**
 * This example demonstrates how to use the InstrumenterCustomizerProvider SPI to customize
 * instrumentation behavior without modifying the core instrumentation code.
 *
 * <p>This customizer adds:
 *
 * <ul>
 *   <li>Custom attributes to HTTP server spans (based on instrumentation name)
 *   <li>Custom attributes to HTTP client spans (based on instrumentation type)
 *   <li>Custom metrics for HTTP operations
 *   <li>Request correlation IDs via context customization
 *   <li>Custom span name transformation
 * </ul>
 *
 * <p>The customizer will be automatically applied to instrumenters that match the specified
 * instrumentation name or type.
 *
 * @see InstrumenterCustomizerProvider
 * @see InstrumenterCustomizer
 */
@AutoService(InstrumenterCustomizerProvider.class)
public class DemoInstrumenterCustomizerProvider implements InstrumenterCustomizerProvider {

  @Override
  public void customize(InstrumenterCustomizer customizer) {
    String instrumentationName = customizer.getInstrumentationName();
    if (isHttpServerInstrumentation(instrumentationName)) {
      customizeHttpServer(customizer);
    }

    if (customizer.hasType(InstrumenterCustomizer.InstrumentationType.HTTP_CLIENT)) {
      customizeHttpClient(customizer);
    }
  }

  private boolean isHttpServerInstrumentation(String instrumentationName) {
    return instrumentationName.contains("servlet")
        || instrumentationName.contains("jetty")
        || instrumentationName.contains("tomcat")
        || instrumentationName.contains("undertow")
        || instrumentationName.contains("spring-webmvc");
  }

  private void customizeHttpServer(InstrumenterCustomizer customizer) {
    customizer.addAttributesExtractor(new DemoAttributesExtractor());
    customizer.addOperationMetrics(new DemoMetrics());
    customizer.addContextCustomizer(new DemoContextCustomizer());
    customizer.setSpanNameExtractorCustomizer(
        unused -> (SpanNameExtractor<Object>) object -> "CustomHTTP/" + object.toString());
  }

  private void customizeHttpClient(InstrumenterCustomizer customizer) {
    // HTTP クライアント計装のシンプルなカスタマイズ
    customizer.addAttributesExtractor(new DemoHttpClientAttributesExtractor());
  }

  /** HTTP クライアント計装用のカスタム属性エクストラクター */
  private static class DemoHttpClientAttributesExtractor
      implements AttributesExtractor<Object, Object> {
    private static final AttributeKey<String> CLIENT_ATTR =
        AttributeKey.stringKey("demo.client.type");

    @Override
    public void onStart(AttributesBuilder attributes, Context context, Object request) {
      attributes.put(CLIENT_ATTR, "demo-http-client");
    }

    @Override
    public void onEnd(
        AttributesBuilder attributes,
        Context context,
        Object request,
        Object response,
        Throwable error) {}
  }

  /** デモ固有の属性を追加するカスタム属性エクストラクター */
  private static class DemoAttributesExtractor implements AttributesExtractor<Object, Object> {
    private static final AttributeKey<String> CUSTOM_ATTR = AttributeKey.stringKey("demo.custom");
    private static final AttributeKey<String> ERROR_ATTR = AttributeKey.stringKey("demo.error");

    @Override
    public void onStart(AttributesBuilder attributes, Context context, Object request) {
      attributes.put(CUSTOM_ATTR, "demo-extension");
    }

    @Override
    public void onEnd(
        AttributesBuilder attributes,
        Context context,
        Object request,
        Object response,
        Throwable error) {
      if (error != null) {
        attributes.put(ERROR_ATTR, error.getClass().getSimpleName());
      }
    }
  }

  /** リクエスト数を追跡するカスタムメトリクス */
  private static class DemoMetrics implements OperationMetrics {
    @Override
    public OperationListener create(Meter meter) {
      LongCounter requestCounter =
          meter
              .counterBuilder("demo.requests")
              .setDescription("Number of requests")
              .setUnit("requests")
              .build();

      return new OperationListener() {
        @Override
        public Context onStart(Context context, Attributes attributes, long startNanos) {
          requestCounter.add(1, attributes);
          return context;
        }

        @Override
        public void onEnd(Context context, Attributes attributes, long endNanos) {
          // 必要に応じてここに持続時間メトリクスを追加できる
        }
      };
    }
  }

  /** リクエスト相関 ID とカスタムコンテキストデータを追加するコンテキストカスタマイザー */
  private static class DemoContextCustomizer implements ContextCustomizer<Object> {
    private static final AtomicLong requestIdCounter = new AtomicLong(1);
    private static final ContextKey<String> REQUEST_ID_KEY = ContextKey.named("demo.request.id");

    @Override
    public Context onStart(Context context, Object request, Attributes startAttributes) {
      // 相関のための一意のリクエスト ID を生成する
      String requestId = "req-" + requestIdCounter.getAndIncrement();

      // リクエストライフサイクル全体でアクセスできるカスタムコンテキストデータを追加する
      context = context.with(REQUEST_ID_KEY, requestId);
      return context;
    }
  }
}
```
<!-- prettier-ignore-end -->

### ConfigurablePropagatorProvider {#configurablepropagatorprovider}

`otel.propagators` 設定で名前によって参照できるカスタムプロパゲーターを登録します。

**例:**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoPropagatorProvider.java" from="@AutoService"?>
```java
@AutoService(ConfigurablePropagatorProvider.class)
public class DemoPropagatorProvider implements ConfigurablePropagatorProvider {
  @Override
  public TextMapPropagator getPropagator(ConfigProperties config) {
    return new DemoPropagator();
  }

  @Override
  public String getName() {
    return "demo";
  }
}
```
<!-- prettier-ignore-end -->

### ConfigurableSamplerProvider {#configurablesamplerprovider}

`otel.traces.sampler` 設定で参照できるカスタムサンプラーを登録します。

**例（`otel.traces.sampler=demo`）:**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoConfigurableSamplerProvider.java" from="@AutoService"?>
```java
@AutoService(ConfigurableSamplerProvider.class)
public class DemoConfigurableSamplerProvider implements ConfigurableSamplerProvider {

  @Override
  public Sampler createSampler(ConfigProperties config) {
    return new DemoSampler();
  }

  @Override
  public String getName() {
    return "demo";
  }
}
```
<!-- prettier-ignore-end -->

### ResourceProvider {#resourceprovider}

他のリソースプロバイダーと自動的にマージされるカスタムリソース属性を追加します。

**例:**

<!-- prettier-ignore-start -->
<?code-excerpt path-base="examples/java-instrumentation/extension"?>
<?code-excerpt "src/main/java/com/example/javaagent/DemoResourceProvider.java" from="@AutoService"?>
```java
@AutoService(ResourceProvider.class)
public class DemoResourceProvider implements ResourceProvider {
  @Override
  public Resource createResource(ConfigProperties config) {
    Attributes attributes = Attributes.builder().put("custom.resource", "demo").build();
    return Resource.create(attributes);
  }
}
```
<!-- prettier-ignore-end -->

## エクステンションの例 {#extension-examples}

エクステンションのその他の例については、Java 計装リポジトリ内の[エクステンションプロジェクト](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension)を参照してください。
