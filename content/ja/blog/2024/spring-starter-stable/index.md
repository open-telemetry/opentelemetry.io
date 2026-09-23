---
title: OpenTelemetry Spring Boot スターターが安定版になりました
linkTitle: Spring スターターが安定版に
date: 2024-09-30
author: >
  [Gregor Zeitlinger](https://github.com/zeitlinger) (Grafana Labs), [Jean
  Bisutti](https://github.com/jeanbisutti) (Microsoft)
issue: https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/11581
sig: Java
default_lang_commit: 89d9733bc5fd044dbd8ffd6b449f9d48cbf4b1f2
cSpell:ignore: Bisutti Customizer Gregor petclinic Zeitlinger
---

OpenTelemetry Spring Boot スターターが安定版になったことをお知らせします。

[Spring Boot](https://spring.io/projects/spring-boot) スターターは、Spring Boot アプリケーションを OpenTelemetry で計装するプロセスを簡素化する強力なツールです。
OpenTelemetry Java エージェントに対する軽量で柔軟な代替手段を提供し、Spring Boot アプリケーションのオブザーバビリティをこれまで以上に簡単に実現できるようにします。

このブログ記事では、Spring スターターをいつ使用すべきか、安定版であるとはどういう意味か、主な機能は何か、そしてどのような課題に直面したかを説明します。
最後のパートでは、[GraalVM ネイティブイメージ](https://www.graalvm.org/latest/reference-manual/native-image/)アプリケーションを使用して、スターターの機能の一部をデモンストレーションします。

すぐに始めたい場合は、[Spring スターターのドキュメント](/docs/zero-code/java/spring-boot-starter)をご覧ください。

## Spring スターターを使用するタイミング {#when-to-use-the-spring-starter}

Spring スターターを使用したいシナリオをいくつか紹介します。

- OpenTelemetry Java エージェントが動作しない **Spring Boot ネイティブイメージ**アプリケーション
- OpenTelemetry Java エージェントの**起動オーバーヘッド**が要件を超える場合
- 別の監視用 Java エージェントがすでに使用されており、OpenTelemetry Java エージェントとの互換性の問題が発生している場合
- **Spring Boot 設定ファイル**（`application.properties`、`application.yml`）を使用して OpenTelemetry Spring Boot スターターを設定する場合（OpenTelemetry Java エージェントでは動作しません）
- Spring Bean を使用した OpenTelemetry Spring Boot スターターの**プログラムによる設定**、たとえば[動的な認証ヘッダー](/docs/zero-code/java/spring-boot-starter/programmatic-configuration/#configure-the-exporter-programmatically)など（OpenTelemetry Java エージェントではこのために[エクステンション](/docs/zero-code/java/agent/extensions/)が必要です）
- **コード依存関係を使用**: JVM オプション（たとえば Docker ファイル内）を追加する必要がなく、`pom.xml` または `build.gradle` ファイルに依存関係と BOM を追加するだけです

少し意外かもしれませんが、Spring ネイティブイメージアプリケーションをビルドしない場合、デフォルトの推奨は、バイトコード計装を備えた [**OpenTelemetry Java エージェント**](/docs/zero-code/java/agent)を使用することです。
後で説明するように、Spring スターターの計装よりも多くのすぐに使える計装を提供するためです。

## 安定版であるとはどういう意味か {#what-does-it-mean-to-be-stable}

Spring スターターは安定版となり、本番環境での使用に対応しています。

- **安定した API**: API は安定しており、ユーザーに影響を与える形で変更されることはありません。
- **安定した設定**: 設定オプションは安定しており、ユーザーに影響を与える形で変更されることはありません。
- **成熟したドキュメント**: [ドキュメント](/docs/zero-code/java/spring-boot-starter/)は成熟しており、Spring スターターのすべての側面をカバーしています。
- **コミュニティサポート**: Spring スターターには、問題が発生した場合に助けてくれるユーザーの[コミュニティ](/community/)（`otel-java` Slack チャンネル）があります。
- **定期的な更新**: Spring スターターは積極的にメンテナンスされており、新機能やバグ修正で更新されています。

Spring スターターは安定していないセマンティック規約を一部使用しており、それらはまだ進化中で将来変更される可能性があることに注意してください。
[HTTP セマンティック規約](/docs/specs/semconv/http/http-metrics/)は安定しており、変更されません。
[データベースセマンティック規約](https://github.com/open-telemetry/semantic-conventions/blob/v1.38.0/docs/database/database-metrics.md)はまだ実験段階であり、変更される可能性があります。
ただし、2024年末までに安定版になることが期待されています。

## Spring スターター安定版リリースの主な機能 {#main-features-of-the-spring-starter-stable-release}

2024年2月に Spring Boot スターター安定化プロジェクトを開始したとき、達成したい主な機能を定義しました。
以下のセクションでそれらを説明します。

### すぐに使える計装 {#out-of-the-box-instrumentation}

OpenTelemetry スターターは、[最も一般的な使用方法に対するすぐに使える計装](/docs/zero-code/java/spring-boot-starter/out-of-the-box-instrumentation/)を提供します。
OpenTelemetry Java エージェントにはさらに多くの[すぐに使える計装](/docs/zero-code/java/agent/disable/#suppressing-specific-agent-instrumentation)が含まれていますが、[少しの設定を追加する](/docs/zero-code/java/spring-boot-starter/additional-instrumentations/)ことで、Spring スターターで追加の計装をオプトインできます。

大幅に改善した例の1つが Logback の計装です。

当初は、OpenTelemetry Bean が最初のログ行が出力された時点ではまだ利用できなかったため、すべてのログ行を OpenTelemetry Collector に送信することができませんでした。
そのため、ログをキャッシュし、OpenTelemetry Bean が作成された後に OpenTelemetry Collector に送信する必要がありました。

以前は、OpenTelemetry Logback アペンダーを `logback-spring.xml` ファイルに追加する必要がありました。
現在は、Logback ファイルでアペンダーを定義していない場合、Spring Boot が[ロギングシステムを初期化した](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/a3f8b1082d8835a81dffd834ec28decca066a3f2/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/instrumentation/logging/LogbackAppenderApplicationListener.java#L64)後に、Spring Boot スターターが自動的にアペンダーを追加します。

### 宣言的 SDK 自動設定のセットアップ {#declarative-sdk-autoconfiguration-setup}

Spring Boot スターターでは、OpenTelemetry Java エージェントと同様に、すべての [SDK 自動設定](/docs/languages/java/configuration/)プロパティを設定できます。

しかし当初は、Spring Boot スターターは Spring Boot 設定ファイルの一部の設定プロパティしかサポートしていませんでした。
一部のプロパティは OpenTelemetry Java エージェントと互換性がありましたが、そうでないものもありました。
その他のプロパティはまったくサポートされていなかったため、OpenTelemetry Java エージェントと Spring Boot スターターの切り替えが非常に困難でした。

最初のステップとして、Spring Boot スターターが OpenTelemetry Java エージェントと同じ [SDK 自動設定](/docs/languages/java/configuration/)を使用するようにし、同じプロパティを両方で使用できるようにしました。

しかし、SDK 自動設定は Spring Boot 設定ファイルをサポートしていなかったため、Spring の [Environment](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/env/Environment.html) から Spring 設定値を検索するロジックで [ConfigProperties](https://github.com/open-telemetry/opentelemetry-java/blob/78a917da2e8f4bc3645f4fb10361e3e844aab9fb/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/ConfigProperties.java?from_branch=main) インターフェイスを実装する必要がありました。

リストとマップには特別な考慮が必要でした。
Spring Boot の Environment はリストとマップを直接処理できないため、[リスト](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/release/v2.6.x/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/properties/SpringConfigProperties.java#L104-L106)と[マップ](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/release/v2.6.x/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/properties/SpringConfigProperties.java#L126-L140)用の `@ConfigurationProperties` クラスを記述する必要がありました。
幸い、Spring Boot には文字列をリストや[マップ](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/release/v2.6.x/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/MapConverter.java)に変換する方法があるため、リソース属性を単一の環境変数（[仕様](/docs/languages/sdk-configuration/general/#otel_resource_attributes)に従って）または [Spring Boot 設定ファイル](/docs/zero-code/java/spring-boot-starter/sdk-configuration/#general-configuration)で渡すことができます。

### プログラムによる SDK 自動設定のセットアップ {#programmatic-sdk-autoconfiguration-setup}

Spring Boot ユーザーは、高度な設定に Spring Bean を使用できることも期待しています。
SDK 自動設定は Spring Bean を認識しなかったため、新しいインターフェイス [ComponentLoader](https://github.com/open-telemetry/opentelemetry-java/blob/release/v1.40.x/sdk-extensions/autoconfigure/src/main/java/io/opentelemetry/sdk/autoconfigure/internal/ComponentLoader.java) を考案しました。
これにより、OpenTelemetry SDK 自動設定によってロードされる Spring Bean を登録できます。

[ComponentLoader インターフェースの Spring スターター実装](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/f7cba3b86167946b3783fb8e575f1c169aec6972/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/OpenTelemetryAutoConfiguration.java?from_branch=main#L162-L181)は、Spring の `ApplicationContext` を使用して、特定の型のすべての Bean を検索します。

これにより、独自のカスタマイザーやその他の SDK コンポーネントを Spring Bean として登録できます。
Spring Bean として実装可能な SPI インターフェイスは、[OpenTelemetry SDK 自動設定 SPI のドキュメント](/docs/languages/java/configuration/#spi-service-provider-interface)で確認できます。

[`AutoConfigurationCustomizerProvider`](/docs/languages/java/configuration/#autoconfigurationcustomizerprovider) インスタンスを返す Bean を実装することで、OpenTelemetry SDK のほとんどの側面をカスタマイズできるはずです。
これは Spring Boot のカスタマイズに対するイディオマティックなアプローチです。

この例では、`/actuator` で始まるパスのスパンをドロップするようにサンプラーをカスタマイズする Bean の作成方法を示します。

<!-- prettier-ignore-start -->
```java
package otel;

import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.contrib.sampler.RuleBasedRoutingSampler;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import io.opentelemetry.semconv.UrlAttributes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterPaths {

  @Bean
  public AutoConfigurationCustomizerProvider otelCustomizer() {
    return p ->
        p.addSamplerCustomizer(
            (fallback, config) ->
                RuleBasedRoutingSampler.builder(SpanKind.SERVER, fallback)
                    .drop(UrlAttributes.URL_PATH, "^/actuator")
                    .build());
  }
}
```
<!-- prettier-ignore-end -->

## OpenTelemetry Spring Boot スターターの実演 {#the-opentelemetry-spring-boot-starter-in-action}

人気のある Spring PetClinic アプリケーションを使用して、OpenTelemetry Spring Boot スターターの機能の一部をデモンストレーションします。

まず、GitHub から Spring PetClinic アプリケーションをクローンします。

```bash
git clone https://github.com/spring-projects/spring-petclinic.git
```

`pom.xml` ファイルに、OpenTelemetry 計装 BOM を追加しましょう。

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-instrumentation-bom</artifactId>
            <version>2.8.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

次に、OpenTelemetry Spring Boot スターターの依存関係を Spring PetClinic アプリケーションに追加します。

```xml
<dependency>
  <groupId>io.opentelemetry.instrumentation</groupId>
  <artifactId>opentelemetry-spring-boot-starter</artifactId>
</dependency>
```

プロジェクトディレクトリに移動し、Spring Boot ネイティブイメージアプリケーションをビルドします。

```bash
cd spring-petclinic
mvn -Pnative spring-boot:build-image -Dspring-boot.build-image.imageName=spring-petclinic-native
```

このコマンドラインを動作させるには、`PostgresIntegrationTests` テストクラスを無効にする必要があるかもしれません（[参照](https://github.com/spring-projects/spring-petclinic/issues/1522)）。

```java
@Disabled
public class PostgresIntegrationTests
```

OpenTelemetry Spring Boot スターターは、[OpenTelemetry Protocol](/docs/specs/otlp/)（OTLP）でテレメトリーデータを送信します。
デフォルトでは、HTTP 経由でデータを送信します。
[gRPC に切り替える](/docs/languages/java/configuration/#properties-exporters)こともできます。

[OpenTelemetry Collector](/docs/collector/) を追加し、Collector のログにテレメトリーデータを表示します。

お好みの OTLP 互換バックエンドを使用することもできます。
ここでは簡単のために Collector のログを使用します。

そのために、`spring-petclinic` ディレクトリに以下の `docker-compose-otel.yml` ファイルを追加することから始めましょう。

```yaml
version: '3.8'
services:
  app:
    image: spring-petclinic-native
    environment:
      OTEL_SERVICE_NAME: 'graal-native-example-app'
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://collector:4318'
    ports:
      - '8080:8080'
    depends_on:
      - collector
  collector:
    image: otel/opentelemetry-collector-contrib:0.109.0
    volumes:
      - ./collector-spring-native-config.yaml:/collector-spring-native-config.yaml
    command: ['--config=/collector-spring-native-config.yaml']
    expose:
      - '4317'
    ports:
      - '4317:4317'
```

次に、`collector-spring-native-config.yaml` というファイルも追加します。

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: '0.0.0.0:4318'
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    metrics:
      receivers: [otlp]
      exporters: [debug]
    traces:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

これで、Spring PetClinic アプリケーションと OpenTelemetry Collector を実行できます。

```bash
docker-compose -f docker-compose-otel.yml up
```

Collector のログを確認して、テレメトリーデータを見てみましょう。

Spring PetClinic アプリケーションの起動に関するログレコードが1つ見つかります。

```ignorelang
2024-09-16 14:19:11 collector-1  | LogRecord #2
2024-09-16 14:19:11 collector-1  | ObservedTimestamp: 2024-09-16 12:19:10.38137 +0000 UTC
2024-09-16 14:19:11 collector-1  | Timestamp: 2024-09-16 12:19:10.379 +0000 UTC
2024-09-16 14:19:11 collector-1  | SeverityText: INFO
2024-09-16 14:19:11 collector-1  | SeverityNumber: Info(9)
2024-09-16 14:19:11 collector-1  | Body: Str(Started PetClinicApplication in 0.489 seconds (process running for 0.493))
```

OpenTelemetry Spring Boot スターターは Logback を計装し、'Started PetClinicApplication in 0.489 seconds (process running for 0.493)' というテレメトリーログレコードを OpenTelemetry Collector に送信しました。

ウェブブラウザーで <http://localhost:8080/vets.html> を開くか、以下の curl コマンドを実行してみましょう。

```shell
curl http://localhost:8080/vets.html
```

Collector のログを見ると、トレース ID `16a0a5be5127309858c7c63a76b3f471` で HTTP リクエストに対してスパンが1つ作成されたことがわかります（お使いの環境では異なるトレース ID になります）。

```ignorelang
collector-1  | InstrumentationScope io.opentelemetry.spring-webmvc-6.0 2.8.0-alpha
collector-1  | Span #0
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      :
collector-1  |     ID             : 280f551fe70df80b
collector-1  |     Name           : GET /vets.html
collector-1  |     Kind           : Server
collector-1  |     Start time     : 2024-09-16 12:39:41.590128 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.62597148 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> url.path: Str(/vets.html)
collector-1  |      -> http.response.status_code: Int(200)
collector-1  |      -> network.peer.address: Str(172.19.0.1)
collector-1  |      -> server.address: Str(localhost)
collector-1  |      -> client.address: Str(172.19.0.1)
collector-1  |      -> user_agent.original: Str(curl/8.0.1)
collector-1  |      -> server.port: Int(8080)
collector-1  |      -> network.peer.port: Int(58886)
collector-1  |      -> http.route: Str(/vets.html)
collector-1  |      -> network.protocol.version: Str(1.1)
collector-1  |      -> http.request.method: Str(GET)
collector-1  |      -> url.scheme: Str(http)
```

同じトレース ID に対して、データベース計装によって出力されたテレメトリーデータを確認できます。

```ignorelang
collector-1  | ScopeSpans #1
collector-1  | ScopeSpans SchemaURL:
collector-1  | InstrumentationScope io.opentelemetry.jdbc 2.8.0-alpha
collector-1  | Span #0
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : fce3cd6376917d72
collector-1  |     Name           : HikariDataSource.getConnection
collector-1  |     Kind           : Internal
collector-1  |     Start time     : 2024-09-16 12:39:41.592567294 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.592584795 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> code.namespace: Str(com.zaxxer.hikari.HikariDataSource)
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> code.function: Str(getConnection)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #1
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : bb91ebc65166b20f
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7.vets
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.593514131 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.593552132 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select v1_0.id,v1_0.first_name,v1_0.last_name from vets v1_0 offset ? rows fetch first ? rows only)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.sql.table: Str(vets)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #2
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : f500cd435ab4be5c
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.594189757 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594210057 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select s1_0.vet_id,s1_1.id,s1_1.name from vet_specialties s1_0 join specialties s1_1 on s1_1.id=s1_0.specialty_id where s1_0.vet_id=?)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #3
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : 22325f527effe3a6
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.594255259 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594265959 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select s1_0.vet_id,s1_1.id,s1_1.name from vet_specialties s1_0 join specialties s1_1 on s1_1.id=s1_0.specialty_id where s1_0.vet_id=?)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #4
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : 55ce3fc09a9a6b0d
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.59428666 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594294761 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select s1_0.vet_id,s1_1.id,s1_1.name from vet_specialties s1_0 join specialties s1_1 on s1_1.id=s1_0.specialty_id where s1_0.vet_id=?)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #5
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : 46b12a2018717141
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.594316061 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594322562 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select s1_0.vet_id,s1_1.id,s1_1.name from vet_specialties s1_0 join specialties s1_1 on s1_1.id=s1_0.specialty_id where s1_0.vet_id=?)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #6
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : 8e0f9f438e25cfe7
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.594338262 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594343162 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select s1_0.vet_id,s1_1.id,s1_1.name from vet_specialties s1_0 join specialties s1_1 on s1_1.id=s1_0.specialty_id where s1_0.vet_id=?)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #7
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : 1a985d47f225eb05
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7.vets
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.594446766 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594455267 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select count(v1_0.id) from vets v1_0)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.sql.table: Str(vets)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  |  {"kind": "exporter", "data_type": "traces", "name": "logging"}
```

次に、ウェブブラウザーで <http://localhost:8080/oups> の URL を選択するか、以下の curl コマンドを実行するとどうなるか見てみましょう。

```shell
curl http://localhost:8080/oups
```

HTTP 呼び出しに関連するスパンが見えますが、このスパンにはスパンイベント `exception` も付与されています。

```ignorelang
collector-1  | InstrumentationScope io.opentelemetry.spring-webmvc-6.0 2.8.0-alpha
collector-1  | Span #0
collector-1  |     Trace ID       : 9e2b052cb84907fc3f648a4131638138
collector-1  |     Parent ID      :
collector-1  |     ID             : 1bf80d8299e87e7f
collector-1  |     Name           : GET /oups
collector-1  |     Kind           : Server
collector-1  |     Start time     : 2024-09-16 12:53:55.078094 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:53:55.07876653 +0000 UTC
collector-1  |     Status code    : Error
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> url.path: Str(/oups)
collector-1  |      -> error.type: Str(500)
collector-1  |      -> network.peer.address: Str(172.19.0.1)
collector-1  |      -> server.address: Str(localhost)
collector-1  |      -> client.address: Str(172.19.0.1)
collector-1  |      -> network.peer.port: Int(53732)
collector-1  |      -> http.route: Str(/oups)
collector-1  |      -> http.request.method: Str(GET)
collector-1  |      -> http.response.status_code: Int(500)
collector-1  |      -> user_agent.original: Str(Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0)
collector-1  |      -> server.port: Int(8080)
collector-1  |      -> network.protocol.version: Str(1.1)
collector-1  |      -> url.scheme: Str(http)
collector-1  | Events:
collector-1  | SpanEvent #0
collector-1  |      -> Name: exception
collector-1  |      -> Timestamp: 2024-09-16 12:53:55.078702027 +0000 UTC
collector-1  |      -> DroppedAttributesCount: 0
collector-1  |      -> Attributes::
collector-1  |           -> exception.message: Str(Request processing failed: java.lang.RuntimeException: Expected: controller used to showcase what happens when an exception is thrown)
collector-1  |           -> exception.stacktrace: Str(jakarta.servlet.ServletException: Request processing failed: java.lang.RuntimeException: Expected: controller used to showcase what happens when an exception is thrown
collector-1  |  at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1019)
collector-1  |  at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903)
collector-1  |  at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564)
collector-1  |  at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885)
collector-1  |  at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:205)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100)
collector-1  |  at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93)
collector-1  |  at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at io.opentelemetry.instrumentation.spring.webmvc.v6_0.WebMvcTelemetryProducingFilter.doFilterInternal(WebMvcTelemetryProducingFilter.java:67)
collector-1  |  at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.springframework.web.filter.ServerHttpObservationFilter.doFilterInternal(ServerHttpObservationFilter.java:109)
collector-1  |  at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201)
collector-1  |  at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:166)
collector-1  |  at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90)
collector-1  |  at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482)
collector-1  |  at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115)
collector-1  |  at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93)
collector-1  |  at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74)
collector-1  |  at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:341)
collector-1  |  at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391)
collector-1  |  at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63)
collector-1  |  at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:894)
collector-1  |  at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1741)
collector-1  |  at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52)
collector-1  |  at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191)
collector-1  |  at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659)
collector-1  |  at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
collector-1  |  at java.base@17.0.7/java.lang.Thread.run(Thread.java:833)
collector-1  |  at com.oracle.svm.core.thread.PlatformThreads.threadStartRoutine(PlatformThreads.java:838)
collector-1  |  at com.oracle.svm.core.posix.thread.PosixPlatformThreads.pthreadStartRoutine(PosixPlatformThreads.java:211)
collector-1  | Caused by: java.lang.RuntimeException: Expected: controller used to showcase what happens when an exception is thrown
collector-1  |  at org.springframework.samples.petclinic.system.CrashController.triggerException(CrashController.java:33)
collector-1  |  at java.base@17.0.7/java.lang.reflect.Method.invoke(Method.java:568)
collector-1  |  at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:207)
collector-1  |  at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:152)
collector-1  |  at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118)
collector-1  |  at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:884)
collector-1  |  at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:797)
collector-1  |  at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87)
collector-1  |  at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1081)
collector-1  |  at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:974)
collector-1  |  at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1011)
collector-1  |  ... 47 more
collector-1  | )
collector-1  |           -> exception.type: Str(jakarta.servlet.ServletException)
collector-1  |  {"kind": "exporter", "data_type": "traces", "name": "logging"}
```

このスパンイベントには、例外メッセージとスタックトレースを含む `exception.message` と `exception.stacktrace` 属性があります。

OpenTelemetry スターターは毎分メトリクスも作成します。
以下に HTTP リクエストの期間に関するメトリクスを示します。

```ignorelang
collector-1  | Metric #0
collector-1  | Descriptor:
collector-1  |      -> Name: http.server.request.duration
collector-1  |      -> Description: Duration of HTTP server requests.
collector-1  |      -> Unit: s
collector-1  |      -> DataType: Histogram
collector-1  |      -> AggregationTemporality: Cumulative
collector-1  | HistogramDataPoints #0
collector-1  | Data point attributes:
collector-1  |      -> http.request.method: Str(GET)
collector-1  |      -> http.response.status_code: Int(200)
collector-1  |      -> http.route: Str(/vets.html)
collector-1  |      -> network.protocol.version: Str(1.1)
collector-1  |      -> url.scheme: Str(http)
collector-1  | StartTimestamp: 2024-09-16 12:39:20.97871 +0000 UTC
collector-1  | Timestamp: 2024-09-16 13:10:20.892779 +0000 UTC
collector-1  | Count: 1
collector-1  | Sum: 0.035795
collector-1  | Min: 0.035795
collector-1  | Max: 0.035795
collector-1  | ExplicitBounds #0: 0.005000
collector-1  | ExplicitBounds #1: 0.010000
collector-1  | ExplicitBounds #2: 0.025000
collector-1  | ExplicitBounds #3: 0.050000
collector-1  | ExplicitBounds #4: 0.075000
collector-1  | ExplicitBounds #5: 0.100000
collector-1  | ExplicitBounds #6: 0.250000
collector-1  | ExplicitBounds #7: 0.500000
collector-1  | ExplicitBounds #8: 0.750000
collector-1  | ExplicitBounds #9: 1.000000
collector-1  | ExplicitBounds #10: 2.500000
collector-1  | ExplicitBounds #11: 5.000000
collector-1  | ExplicitBounds #12: 7.500000
collector-1  | ExplicitBounds #13: 10.000000
collector-1  | Buckets #0, Count: 0
collector-1  | Buckets #1, Count: 0
collector-1  | Buckets #2, Count: 0
collector-1  | Buckets #3, Count: 1
collector-1  | Buckets #4, Count: 0
collector-1  | Buckets #5, Count: 0
collector-1  | Buckets #6, Count: 0
collector-1  | Buckets #7, Count: 0
collector-1  | Buckets #8, Count: 0
collector-1  | Buckets #9, Count: 0
collector-1  | Buckets #10, Count: 0
collector-1  | Buckets #11, Count: 0
collector-1  | Buckets #12, Count: 0
collector-1  | Buckets #13, Count: 0
collector-1  | Buckets #14, Count: 0
collector-1  | HistogramDataPoints #1
collector-1  | Data point attributes:
collector-1  |      -> error.type: Str(500)
collector-1  |      -> http.request.method: Str(GET)
collector-1  |      -> http.response.status_code: Int(500)
collector-1  |      -> http.route: Str(/oups)
collector-1  |      -> network.protocol.version: Str(1.1)
collector-1  |      -> url.scheme: Str(http)
collector-1  | StartTimestamp: 2024-09-16 12:39:20.97871 +0000 UTC
collector-1  | Timestamp: 2024-09-16 13:10:20.892779 +0000 UTC
collector-1  | Count: 1
collector-1  | Sum: 0.000644
collector-1  | Min: 0.000644
collector-1  | Max: 0.000644
collector-1  | ExplicitBounds #0: 0.005000
collector-1  | ExplicitBounds #1: 0.010000
collector-1  | ExplicitBounds #2: 0.025000
collector-1  | ExplicitBounds #3: 0.050000
collector-1  | ExplicitBounds #4: 0.075000
collector-1  | ExplicitBounds #5: 0.100000
collector-1  | ExplicitBounds #6: 0.250000
collector-1  | ExplicitBounds #7: 0.500000
collector-1  | ExplicitBounds #8: 0.750000
collector-1  | ExplicitBounds #9: 1.000000
collector-1  | ExplicitBounds #10: 2.500000
collector-1  | ExplicitBounds #11: 5.000000
collector-1  | ExplicitBounds #12: 7.500000
collector-1  | ExplicitBounds #13: 10.000000
collector-1  | Buckets #0, Count: 1
collector-1  | Buckets #1, Count: 0
collector-1  | Buckets #2, Count: 0
collector-1  | Buckets #3, Count: 0
collector-1  | Buckets #4, Count: 0
collector-1  | Buckets #5, Count: 0
collector-1  | Buckets #6, Count: 0
collector-1  | Buckets #7, Count: 0
collector-1  | Buckets #8, Count: 0
collector-1  | Buckets #9, Count: 0
collector-1  | Buckets #10, Count: 0
collector-1  | Buckets #11, Count: 0
collector-1  | Buckets #12, Count: 0
collector-1  | Buckets #13, Count: 0
collector-1  | Buckets #14, Count: 0
```

Spring PetClinic アプリケーションを使用して、OpenTelemetry Spring Boot スターターの機能の一部を紹介しました。

その他の機能について詳しく知りたい場合は、ぜひ [OpenTelemetry Spring Boot スターターのドキュメント](/docs/zero-code/java/spring-boot-starter)をご覧いただき、[Slack](/community/) で質問してください。
