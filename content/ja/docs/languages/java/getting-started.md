---
title: サンプルによる入門
description: 5分以内にアプリのテレメトリーを取得しましょう！
weight: 10
default_lang_commit: 8eda3ad35e6fbeea601a033023f694c8750fd1b9
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/getting-started"?>

このページでは、JavaでOpenTelemetryを始める方法を紹介します。

シンプルなJavaアプリケーションを自動的に計装する方法を学び、[トレース][trace]、[メトリクス][metrics]、および[ログ][logs]がコンソールに出力されるようにします。

## 前提条件 {#prerequisites}

以下がローカルにインストールされていることを確認してください。

- Java JDK 17以降（Spring Boot 3を使用するため。[それ以外の場合はJava 8以降][java-vers]）
- [Gradle](https://gradle.org/)

## サンプルアプリケーション {#example-application}

次の例では、基本的な[Spring Boot]アプリケーションを使用します。
Apache WicketやPlayなどの他のWebフレームワークを使用することもできます。
ライブラリとサポートされているフレームワークの完全なリストについては、[レジストリ](/ecosystem/registry/?component=instrumentation&language=java)を参照してください。

より詳細な例については、[例](../examples/)を参照してください。

### 依存関係 {#dependencies}

開始するには、`java-simple`という新しいディレクトリに環境を設定します。
そのディレクトリ内に、次の内容で`build.gradle.kts`というファイルを作成します。

```kotlin
plugins {
  id("java")
  id("org.springframework.boot") version "3.0.6"
  id("io.spring.dependency-management") version "1.1.0"
}

sourceSets {
  main {
    java.setSrcDirs(setOf("."))
  }
}

repositories {
  mavenCentral()
}

dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web")
}
```

### HTTPサーバーの作成と起動 {#create-and-launch-an-http-server}

同じフォルダに、`DiceApplication.java`というファイルを作成し、次のコードをファイルに追加します。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/DiceApplication.java"?>
```java
package otel;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DiceApplication {
  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(DiceApplication.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.run(args);
  }
}
```
<!-- prettier-ignore-end -->

`RollController.java`という別のファイルを作成し、次のコードをファイルに追加します。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/RollController.java"?>
```java
package otel;

import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RollController {
  private static final Logger logger = LoggerFactory.getLogger(RollController.class);

  @GetMapping("/rolldice")
  public String index(@RequestParam("player") Optional<String> player) {
    int result = this.getRandomNumber(1, 6);
    if (player.isPresent()) {
      logger.info("{} is rolling the dice: {}", player.get(), result);
    } else {
      logger.info("Anonymous player is rolling the dice: {}", result);
    }
    return Integer.toString(result);
  }

  public int getRandomNumber(int min, int max) {
    return ThreadLocalRandom.current().nextInt(min, max + 1);
  }
}
```
<!-- prettier-ignore-end -->

次のコマンドでアプリケーションをビルドして実行し、Webブラウザで<http://localhost:8080/rolldice>を開いて動作していることを確認します。

```sh
gradle assemble
java -jar ./build/libs/java-simple.jar
```

## 計装 {#instrumentation}

次に、[Javaエージェント](/docs/zero-code/java/agent/)を使用して、起動時にアプリケーションを自動的に計装します。
[Javaエージェントの設定][configure the java agent]にはいくつかの方法がありますが、以下の手順では環境変数を使用します。

1. `opentelemetry-java-instrumentation`リポジトリの[リリース][releases]から[opentelemetry-javaagent.jar][]をダウンロードします。JARファイルには、エージェントとすべての自動計装パッケージが含まれています。

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
   ```

   {{% alert %}}

   <i class="fas fa-edit"></i> JARファイルへのパスをメモしてください。

   {{% /alert %}}

2. JavaエージェントJARと[コンソールエクスポーター][console exporter]を指定する変数を設定してエクスポートします。シェル/ターミナル環境に適した記法を使用してください。ここではbashライクなシェルの記法を示します。

   ```sh
   export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
     OTEL_TRACES_EXPORTER=logging \
     OTEL_METRICS_EXPORTER=logging \
     OTEL_LOGS_EXPORTER=logging \
     OTEL_METRIC_EXPORT_INTERVAL=15000
   ```

   {{% alert title="重要" color="warning" %}}
   - 上記の`PATH/TO`を、JARへのパスに置き換えてください。
   - メトリクスが適切に生成されることを迅速に確認するために、**テスト中のみ**、上記のように`OTEL_METRIC_EXPORT_INTERVAL`をデフォルトよりもはるかに低い値に設定してください。

   {{% /alert %}}

3. **アプリケーション**をもう一度実行します。

   ```console
   $ java -jar ./build/libs/java-simple.jar
   ...
   ```

   `otel.javaagent`からの出力に注意してください。

4. *別の*ターミナルから、`curl`を使用してリクエストを送信します。

   ```sh
   curl localhost:8080/rolldice
   ```

5. サーバープロセスを停止します。

ステップ4で、サーバーとクライアントからのトレースとログの出力が次のように表示されるはずです（トレース出力は便宜上改行されています）。

```sh
[otel.javaagent 2023-04-24 17:33:54:567 +0200] [http-nio-8080-exec-1] INFO
io.opentelemetry.exporter.logging.LoggingSpanExporter - 'RollController.index' :
 70c2f04ec863a956e9af975ba0d983ee 7fd145f5cda13625 INTERNAL [tracer:
 io.opentelemetry.spring-webmvc-6.0:1.25.0-alpha] AttributesMap{data=
 {thread.id=39, thread.name=http-nio-8080-exec-1}, capacity=128,
 totalAddedValues=2}
[otel.javaagent 2023-04-24 17:33:54:568 +0200] [http-nio-8080-exec-1] INFO
io.opentelemetry.exporter.logging.LoggingSpanExporter - 'GET /rolldice' :
70c2f04ec863a956e9af975ba0d983ee 647ad186ad53eccf SERVER [tracer:
io.opentelemetry.tomcat-10.0:1.25.0-alpha] AttributesMap{
  data={user_agent.original=curl/7.87.0, net.host.name=localhost,
  net.transport=ip_tcp, http.target=/rolldice, net.sock.peer.addr=127.0.0.1,
  thread.name=http-nio-8080-exec-1, net.sock.peer.port=53422,
  http.route=/rolldice, net.sock.host.addr=127.0.0.1, thread.id=39,
  net.protocol.name=http, http.status_code=200, http.scheme=http,
  net.protocol.version=1.1, http.response_content_length=1,
  net.host.port=8080, http.method=GET}, capacity=128, totalAddedValues=17}
```

ステップ5で、サーバーを停止するときに、収集されたすべてのメトリクスの出力が表示されるはずです（メトリクス出力は便宜上改行および短縮されています）。

```sh
[otel.javaagent 2023-04-24 17:34:25:347 +0200] [PeriodicMetricReader-1] INFO
io.opentelemetry.exporter.logging.LoggingMetricExporter - Received a collection
 of 19 metrics for export.
[otel.javaagent 2023-04-24 17:34:25:347 +0200] [PeriodicMetricReader-1] INFO
io.opentelemetry.exporter.logging.LoggingMetricExporter - metric:
ImmutableMetricData{resource=Resource{schemaUrl=
https://opentelemetry.io/schemas/1.19.0, attributes={host.arch="aarch64",
host.name="OPENTELEMETRY", os.description="Mac OS X 13.3.1", os.type="darwin",
process.command_args=[/bin/java, -jar, java-simple.jar],
process.executable.path="/bin/java", process.pid=64497,
process.runtime.description="Homebrew OpenJDK 64-Bit Server VM 20",
process.runtime.name="OpenJDK Runtime Environment",
process.runtime.version="20", service.name="java-simple",
telemetry.auto.version="1.25.0", telemetry.sdk.language="java",
telemetry.sdk.name="opentelemetry", telemetry.sdk.version="1.25.0"}},
instrumentationScopeInfo=InstrumentationScopeInfo{name=io.opentelemetry.runtime-metrics,
version=1.25.0, schemaUrl=null, attributes={}},
name=process.runtime.jvm.buffer.limit, description=Total capacity of the buffers
in this pool, unit=By, type=LONG_SUM, data=ImmutableSumData{points=
[ImmutableLongPointData{startEpochNanos=1682350405319221000,
epochNanos=1682350465326752000, attributes=
{pool="mapped - 'non-volatile memory'"}, value=0, exemplars=[]},
ImmutableLongPointData{startEpochNanos=1682350405319221000,
epochNanos=1682350465326752000, attributes={pool="mapped"},
value=0, exemplars=[]},
ImmutableLongPointData{startEpochNanos=1682350405319221000,
epochNanos=1682350465326752000, attributes={pool="direct"},
value=8192, exemplars=[]}], monotonic=false, aggregationTemporality=CUMULATIVE}}
...
```

## 次のステップ {#what-next}

詳細については。

- この例を別の[エクスポーター][exporter]でテレメトリーデータ用に実行してください。
- 自分のアプリの1つで[ゼロコード計装](/docs/zero-code/java/agent/)を試してください。
- 軽量なカスタマイズされたテレメトリーについては、[アノテーション][annotations]を試してください。
- [手動計装][manual instrumentation]について学び、さらに多くの[例](../examples/)を試してください。
- Javaベースの[広告サービス](/docs/demo/services/ad/)とKotlinベースの[不正検出サービス](/docs/demo/services/fraud-detection/)を含む[OpenTelemetryデモ](/docs/demo/)をご覧ください。

[trace]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[annotations]: /docs/zero-code/java/agent/annotations/
[configure the java agent]: /docs/zero-code/java/agent/configuration/
[console exporter]: /docs/languages/java/configuration/#properties-exporters
[exporter]: /docs/languages/java/configuration/#properties-exporters
[java-vers]: https://github.com/open-telemetry/opentelemetry-java/blob/main/VERSIONING.md#language-version-compatibility
[manual instrumentation]: ../instrumentation
[opentelemetry-javaagent.jar]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[Spring Boot]: https://spring.io/guides/gs/spring-boot/
