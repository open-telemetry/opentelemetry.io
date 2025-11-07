---
title: SDKの設定
linkTitle: SDKの設定
weight: 13
aliases: [config]
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
drifted_from_default: true
# prettier-ignore
cSpell:ignore: autoconfigured blrp Customizer Dotel ignore LOWMEMORY ottrace PKCS
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

[SDK](../sdk/)は[API](../api/)の組み込み参照実装で、計装API呼び出しによって生成されたテレメトリーを処理およびエクスポートします。
テレメトリーを適切に処理およびエクスポートするようにSDKを設定することは、OpenTelemetryをアプリケーションに統合するために不可欠なステップです。

すべてのSDKコンポーネントには[プログラム設定API](#programmatic-configuration)があります。
これは、SDKを設定する最も柔軟で表現力豊かな方法です。
ただし、設定を変更するにはコードを調整してアプリケーションを再コンパイルする必要があり、APIがJavaで書かれているため言語の相互運用性がありません。

[ゼロコードSDK自動設定](#zero-code-sdk-autoconfigure)モジュールは、システムプロパティまたは環境変数を通じてSDKコンポーネントを設定し、プロパティが不十分な場合のさまざまな拡張ポイントを提供します。

{{% alert %}}

[ゼロコードSDK自動設定](#zero-code-sdk-autoconfigure)モジュールの使用を推奨します。
これにより定型コードが削減され、コードの書き直しやアプリケーションの再コンパイルなしに再設定が可能になり、言語の相互運用性があります。

{{% /alert %}}

{{% alert %}}

[Javaエージェント](/docs/zero-code/java/agent/)と[Springスターター](/docs/zero-code/java/spring-boot-starter/)は、ゼロコードSDK自動設定モジュールを使用してSDKを自動的に設定し、それとともに計装をインストールします。

すべての自動設定コンテンツは、JavaエージェントとSpringスターターユーザーに適用されます。

{{% /alert %}}

## プログラム設定 {#programmatic-configuration}

プログラム設定インターフェースは、[SDK](../sdk/)コンポーネントを構築するためのAPIのセットです。
すべてのSDKコンポーネントにはプログラム設定APIがあり、他のすべての設定メカニズムはこのAPIの上に構築されています。
たとえば、[自動設定環境変数とシステムプロパティ](#environment-variables-and-system-properties)設定インターフェースは、よく知られた環境変数とシステムプロパティをプログラム設定APIへの一連の呼び出しに解釈します。

他の設定メカニズムはより便利ですが、必要な正確な設定を表現するコードを書くことの柔軟性を提供するものはありません。
特定の機能が上位の設定メカニズムでサポートされていない場合、プログラム設定を使用するしかない場合があります。

[SDKコンポーネント](../sdk/#sdk-components)セクションでは、SDKの主要なユーザー向け領域の簡単なプログラム設定APIを示しています。
完全なAPIリファレンスについてはコードを参照してください。

## ゼロコードSDK自動設定 {#zero-code-sdk-autoconfigure}

自動設定モジュール（アーティファクト`io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`）は、[プログラム設定インターフェース](#programmatic-configuration)の上に構築された設定インターフェースで、[SDKコンポーネント](../sdk/#sdk-components)をゼロコードで設定します。
2つの異なる自動設定ワークフローがあります。

- [環境変数とシステムプロパティ](#environment-variables-and-system-properties)は、環境変数とシステムプロパティを解釈してSDKコンポーネントを作成し、プログラム設定をオーバーレイするためのさまざまなカスタマイゼーションポイントを含みます
- [宣言的設定](#declarative-configuration)（**現在開発中**）は、設定モデルを解釈してSDKコンポーネントを作成し、通常はYAML設定ファイルでエンコードされます

自動設定を使用してSDKコンポーネントを自動的に設定するには以下のようにします。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;

public class AutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.initialize().getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

{{% alert %}}

[Javaエージェント](/docs/zero-code/java/agent/)と[Springスターター](/docs/zero-code/java/spring-boot-starter/)は、ゼロコードSDK自動設定モジュールを使用してSDKを自動的に設定し、それとともに計装をインストールします。
すべての自動設定コンテンツは、JavaエージェントとSpringスターターユーザーに適用されます。

{{% /alert %}}

{{% alert %}}

自動設定モジュールは、適切なときにSDKをシャットダウンするためにJavaシャットダウンフックを登録します。
OpenTelemetry Javaは[内部ログに`java.util.logging`を使用](../sdk/#internal-logging)するため、シャットダウンフック中に一部のログが抑制される可能性があります。
これはJDK自体のバグであり、OpenTelemetry Javaの制御下にあるものではありません。
シャットダウンフック中にログが必要な場合は、シャットダウンフック内で自身をシャットダウンしてログメッセージを抑制する可能性があるログフレームワークではなく、`System.out`の使用を検討してください。
詳細については、この[JDKバグ](https://bugs.openjdk.java.net/browse/JDK-8161253)を参照してください。

{{% /alert %}}

### 環境変数とシステムプロパティ {#environment-variables-and-system-properties}

自動設定モジュールは、[環境変数設定仕様](/docs/specs/otel/configuration/sdk-environment-variables/)にリストされているプロパティをサポートし、時々実験的およびJava固有の追加があります。

以下のプロパティはシステムプロパティとしてリストされていますが、環境変数を使用して設定することもできます。
システムプロパティを環境変数に変換するには以下のステップを適用してください。

- 名前を大文字に変換します
- すべての`.`と`-`文字を`_`に置き換えます

たとえば、`otel.sdk.disabled`システムプロパティは`OTEL_SDK_DISABLED`環境変数と同等です。

プロパティがシステムプロパティと環境変数の両方として定義されている場合、システムプロパティが優先されます。

#### プロパティ：一般{#properties-general}

[SDK](../sdk/#opentelemetrysdk)を無効にするためのプロパティ。

| システムプロパティ  | 説明                                                   | デフォルト |
| ------------------- | ------------------------------------------------------ | ---------- |
| `otel.sdk.disabled` | `true`の場合、OpenTelemetry SDKを無効にします。**[1]** | `false`    |

**[1]**: 無効にした場合、`AutoConfiguredOpenTelemetrySdk#getOpenTelemetrySdk()`は最小限に設定されたインスタンス（例：`OpenTelemetrySdk.builder().build()`）を返します。

属性制限のプロパティ（[スパン制限](../sdk/#spanlimits)、[ログ制限](../sdk/#loglimits)を参照）。

| システムプロパティ                  | 説明                                                                                                                                                    | デフォルト |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `otel.attribute.value.length.limit` | 属性値の最大長。スパンとログに適用されます。`otel.span.attribute.value.length.limit`、`otel.span.attribute.count.limit`によってオーバーライドされます。 | 制限なし   |
| `otel.attribute.count.limit`        | 属性の最大数。スパン、スパンイベント、スパンリンク、ログに適用されます。                                                                                | `128`      |

[コンテキスト伝播](../sdk/#textmappropagator)のプロパティ。

| システムプロパティ | 説明                                                                                                                                                        | デフォルト                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `otel.propagators` | プロパゲーターのカンマ区切りリスト。既知の値には`tracecontext`、`baggage`、`b3`、`b3multi`、`jaeger`、`ottrace`、`xray`、`xray-lambda`が含まれます。**[1]** | `tracecontext,baggage`（W3C） |

**[1]**: 既知のプロパゲーターとアーティファクト（アーティファクト座標については[text map propagator](../sdk/#textmappropagator)を参照）。

- `tracecontext`は`W3CTraceContextPropagator`を設定します
- `baggage`は`W3CBaggagePropagator`を設定します
- `b3`、`b3multi`は`B3Propagator`を設定します
- `jaeger`は`JaegerPropagator`を設定します
- `ottrace`は`OtTracePropagator`を設定します
- `xray`は`AwsXrayPropagator`を設定します
- `xray-lambda`は`AwsXrayLambdaPropagator`を設定します

#### プロパティ：リソース {#properties-resource}

[リソース](../sdk/#resource)を設定するためのプロパティ。

| システムプロパティ                      | 説明                                                                                                                                           | デフォルト             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `otel.service.name`                     | 論理サービス名を指定します。`otel.resource.attributes`で定義された`service.name`よりも優先されます。                                           | `unknown_service:java` |
| `otel.resource.attributes`              | 次の形式でリソース属性を指定します：`key1=val1,key2=val2,key3=val3`。                                                                          |                        |
| `otel.resource.disabled.keys`           | フィルタリングするリソース属性キーを指定します。                                                                                               |                        |
| `otel.java.enabled.resource.providers`  | 有効にする`ResourceProvider`完全修飾クラス名のカンマ区切りリスト。**[1]** 設定されていない場合、すべてのリソースプロバイダーが有効になります。 |                        |
| `otel.java.disabled.resource.providers` | 無効にする`ResourceProvider`完全修飾クラス名のカンマ区切りリスト。**[1]**                                                                      |                        |

**[1]**: たとえば、[OSリソースプロバイダー](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/resources/library/src/main/java/io/opentelemetry/instrumentation/resources/OsResourceProvider.java)を無効にするには、`-Dotel.java.disabled.resource.providers=io.opentelemetry.instrumentation.resources.OsResourceProvider`を設定します。

**注意**: `otel.service.name`と`otel.resource.attributes`システムプロパティ/環境変数は、`io.opentelemetry.sdk.autoconfigure.internal.EnvironmentResourceProvider`リソースプロバイダーで解釈されます。`otel.java.enabled.resource-providers`経由でリソースプロバイダーを指定することを選択した場合、サプライズを避けるためにそれを含めたい場合があります。リソースプロバイダーのアーティファクト座標については[ResourceProvider](#resourceprovider)を参照してください。

#### プロパティ：トレース {#properties-traces}

`otel.traces.exporter`で指定されたエクスポーターと組み合わせた[バッチスパンプロセッサー](../sdk/#spanprocessor)のプロパティ。

| システムプロパティ               | 説明                                             | デフォルト |
| -------------------------------- | ------------------------------------------------ | ---------- |
| `otel.bsp.schedule.delay`        | 2つの連続するエクスポート間の間隔（ミリ秒）。    | `5000`     |
| `otel.bsp.max.queue.size`        | バッチ処理前にキューに入れられるスパンの最大数。 | `2048`     |
| `otel.bsp.max.export.batch.size` | 単一バッチでエクスポートするスパンの最大数。     | `512`      |
| `otel.bsp.export.timeout`        | データをエクスポートする最大許可時間（ミリ秒）。 | `30000`    |

[サンプラー](../sdk/#sampler)のプロパティ。

| システムプロパティ        | 説明                                                                                                                                                                                           | デフォルト              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `otel.traces.sampler`     | 使用するサンプラー。既知の値には`always_on`、`always_off`、`traceidratio`、`parentbased_always_on`、`parentbased_always_off`、`parentbased_traceidratio`、`jaeger_remote`が含まれます。**[1]** | `parentbased_always_on` |
| `otel.traces.sampler.arg` | サポートされている場合の設定されたトレーサーへの引数（例：比率）。                                                                                                                             |                         |

**[1]**: 既知のサンプラーとアーティファクト（アーティファクト座標については[sampler](../sdk/#sampler)を参照）。

- `always_on`は`AlwaysOnSampler`を設定します
- `always_off`は`AlwaysOffSampler`を設定します
- `traceidratio`は`TraceIdRatioBased`を設定します。`otel.traces.sampler.arg`で比率を設定します
- `parentbased_always_on`は`ParentBased(root=AlwaysOnSampler)`を設定します
- `parentbased_always_off`は`ParentBased(root=AlwaysOffSampler)`を設定します
- `parentbased_traceidratio`は`ParentBased(root=TraceIdRatioBased)`を設定します。`otel.traces.sampler.arg`で比率を設定します
- `jaeger_remote`は`JaegerRemoteSampler`を設定します。`otel.traces.sampler.arg`は[仕様](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)で説明されている引数のカンマ区切りリストです

[スパン制限](../sdk/#spanlimits)のプロパティ。

| システムプロパティ                       | 説明                                                                          | デフォルト |
| ---------------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| `otel.span.attribute.value.length.limit` | スパン属性値の最大長。`otel.attribute.value.length.limit`よりも優先されます。 | 制限なし   |
| `otel.span.attribute.count.limit`        | スパンごとの属性の最大数。`otel.attribute.count.limit`よりも優先されます。    | `128`      |
| `otel.span.event.count.limit`            | スパンごとのイベントの最大数。                                                | `128`      |
| `otel.span.link.count.limit`             | スパンごとのリンクの最大数。                                                  | `128`      |

#### プロパティ：メトリクス {#properties-metrics}

[定期的メトリクスリーダー](../sdk/#metricreader)のプロパティ。

| システムプロパティ            | 説明                                            | デフォルト |
| ----------------------------- | ----------------------------------------------- | ---------- |
| `otel.metric.export.interval` | 2つのエクスポート試行の開始間の間隔（ミリ秒）。 | `60000`    |

エグザンプラーのプロパティ。

| システムプロパティ             | 説明                                                                                             | デフォルト    |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ------------- |
| `otel.metrics.exemplar.filter` | エグザンプラーサンプリングのフィルター。`ALWAYS_OFF`、`ALWAYS_ON`、`TRACE_BASED`のいずれかです。 | `TRACE_BASED` |

カーディナリティ制限のプロパティ。

| システムプロパティ                    | 説明                                                                                                       | デフォルト |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| `otel.java.metrics.cardinality.limit` | 設定された場合、カーディナリティ制限を設定します。値はメトリクスごとの異なるポイントの最大数を指示します。 | `2000`     |

#### プロパティ：ログ {#properties-logs}

`otel.logs.exporter`経由でエクスポーターと組み合わせた[ログレコードプロセッサー](../sdk/#logrecordprocessor)のプロパティ。

| システムプロパティ                | 説明                                                   | デフォルト |
| --------------------------------- | ------------------------------------------------------ | ---------- |
| `otel.blrp.schedule.delay`        | 2つの連続するエクスポート間の間隔（ミリ秒）。          | `1000`     |
| `otel.blrp.max.queue.size`        | バッチ処理前にキューに入れられるログレコードの最大数。 | `2048`     |
| `otel.blrp.max.export.batch.size` | 単一バッチでエクスポートするログレコードの最大数。     | `512`      |
| `otel.blrp.export.timeout`        | データをエクスポートする最大許可時間（ミリ秒）。       | `30000`    |

#### プロパティ：エクスポーター {#properties-exporters}

エクスポーターを設定するためのプロパティ。

| システムプロパティ               | 目的                                                                                                                                                                                          | デフォルト      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `otel.traces.exporter`           | スパンエクスポーターのカンマ区切りリスト。既知の値には`otlp`、`zipkin`、`console`、`logging-otlp`、`none`が含まれます。**[1]**                                                                | `otlp`          |
| `otel.metrics.exporter`          | メトリクスエクスポーターのカンマ区切りリスト。既知の値には`otlp`、`prometheus`、`none`が含まれます。**[1]**                                                                                   | `otlp`          |
| `otel.logs.exporter`             | ログレコードエクスポーターのカンマ区切りリスト。既知の値には`otlp`、`console`、`logging-otlp`、`none`が含まれます。**[1]**                                                                    | `otlp`          |
| `otel.java.exporter.memory_mode` | `reusable_data`の場合、アロケーションを削減するために（サポートするエクスポーターで）再利用可能メモリモードを有効にします。既知の値には`reusable_data`、`immutable_data`が含まれます。**[2]** | `reusable_data` |

**[1]**: 既知のエクスポーターとアーティファクト（エクスポーターのアーティファクト座標については[span exporter](../sdk/#spanexporter)、[metric exporter](../sdk/#metricexporter)、[log exporter](../sdk/#logrecordexporter)を参照）。

- `otlp`は`OtlpHttp{Signal}Exporter` / `OtlpGrpc{Signal}Exporter`を設定します
- `zipkin`は`ZipkinSpanExporter`を設定します
- `console`は`LoggingSpanExporter`、`LoggingMetricExporter`、`SystemOutLogRecordExporter`を設定します
- `logging-otlp`は`OtlpJsonLogging{Signal}Exporter`を設定します
- `experimental-otlp/stdout`は`OtlpStdout{Signal}Exporter`を設定します（このオプションは実験的で、変更または削除される可能性があります）

**[2]**: `otel.java.exporter.memory_mode=reusable_data`に準拠するエクスポーターは、`OtlpGrpc{Signal}Exporter`、`OtlpHttp{Signal}Exporter`、`OtlpStdout{Signal}Exporter`、`PrometheusHttpServer`です。

`otlp`スパン、メトリクス、ログエクスポーターのプロパティ。

| システムプロパティ                                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                   | デフォルト                                                                                                                  |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `otel.{signal}.exporter=otlp`                              | {signal}用のOpenTelemetryエクスポーターを選択します。                                                                                                                                                                                                                                                                                                                                                                  |                                                                                                                             |
| `otel.exporter.otlp.protocol`                              | OTLPトレース、メトリクス、ログリクエストで使用するトランスポートプロトコル。オプションには`grpc`と`http/protobuf`が含まれます。                                                                                                                                                                                                                                                                                        | `grpc` **[1]**                                                                                                              |
| `otel.exporter.otlp.{signal}.protocol`                     | OTLP {signal}リクエストで使用するトランスポートプロトコル。オプションには`grpc`と`http/protobuf`が含まれます。                                                                                                                                                                                                                                                                                                         | `grpc` **[1]**                                                                                                              |
| `otel.exporter.otlp.endpoint`                              | すべてのOTLPトレース、メトリクス、ログを送信するエンドポイント。多くの場合、OpenTelemetry Collectorのアドレスです。TLSの使用に基づいて`http`または`https`のスキームを持つURLでなければなりません。                                                                                                                                                                                                                     | プロトコルが`grpc`の場合は`http://localhost:4317`、プロトコルが`http/protobuf`の場合は`http://localhost:4318`。             |
| `otel.exporter.otlp.{signal}.endpoint`                     | OTLP {signal}を送信するエンドポイント。多くの場合、OpenTelemetry Collectorのアドレスです。TLSの使用に基づいて`http`または`https`のスキームを持つURLでなければなりません。プロトコルが`http/protobuf`の場合、バージョンとシグナルをパスに追加する必要があります（例：`v1/traces`、`v1/metrics`、`v1/logs`）                                                                                                             | プロトコルが`grpc`の場合は`http://localhost:4317`、プロトコルが`http/protobuf`の場合は`http://localhost:4318/v1/{signal}`。 |
| `otel.exporter.otlp.certificate`                           | OTLPトレース、メトリクス、ログサーバーのTLS認証を検証するときに使用する信頼できる証明書を含むファイルのパス。ファイルはPEM形式の1つ以上のX.509証明書を含む必要があります。                                                                                                                                                                                                                                             | ホストプラットフォームの信頼できるルート証明書が使用されます。                                                              |
| `otel.exporter.otlp.{signal}.certificate`                  | OTLP {signal}サーバーのTLS認証を検証するときに使用する信頼できる証明書を含むファイルのパス。ファイルはPEM形式の1つ以上のX.509証明書を含む必要があります。                                                                                                                                                                                                                                                              | ホストプラットフォームの信頼できるルート証明書が使用されます                                                                |
| `otel.exporter.otlp.client.key`                            | OTLPトレース、メトリクス、ログクライアントのTLS認証を検証するときに使用するプライベートクライアントキーを含むファイルのパス。ファイルは1つのプライベートキーPKCS8 PEM形式を含む必要があります。                                                                                                                                                                                                                        | クライアントキーファイルは使用されません。                                                                                  |
| `otel.exporter.otlp.{signal}.client.key`                   | OTLP {signal}クライアントのTLS認証を検証するときに使用するプライベートクライアントキーを含むファイルのパス。ファイルは1つのプライベートキーPKCS8 PEM形式を含む必要があります。                                                                                                                                                                                                                                         | クライアントキーファイルは使用されません。                                                                                  |
| `otel.exporter.otlp.client.certificate`                    | OTLPトレース、メトリクス、ログクライアントのTLS認証を検証するときに使用する信頼できる証明書を含むファイルのパス。ファイルはPEM形式の1つ以上のX.509証明書を含む必要があります。                                                                                                                                                                                                                                         | チェインファイルは使用されません。                                                                                          |
| `otel.exporter.otlp.{signal}.client.certificate`           | OTLP {signal}サーバーのTLS認証を検証するときに使用する信頼できる証明書を含むファイルのパス。ファイルはPEM形式の1つ以上のX.509証明書を含む必要があります。                                                                                                                                                                                                                                                              | チェインファイルは使用されません。                                                                                          |
| `otel.exporter.otlp.headers`                               | OTLPトレース、メトリクス、ログリクエストでリクエストヘッダーとして渡すカンマで区切られたキー値ペア。                                                                                                                                                                                                                                                                                                                   |                                                                                                                             |
| `otel.exporter.otlp.{signal}.headers`                      | OTLP {signal}リクエストでリクエストヘッダーとして渡すカンマで区切られたキー値ペア。                                                                                                                                                                                                                                                                                                                                    |                                                                                                                             |
| `otel.exporter.otlp.compression`                           | OTLPトレース、メトリクス、ログリクエストで使用する圧縮タイプ。オプションには`gzip`が含まれます。                                                                                                                                                                                                                                                                                                                       | 圧縮は使用されません。                                                                                                      |
| `otel.exporter.otlp.{signal}.compression`                  | OTLP {signal}リクエストで使用する圧縮タイプ。オプションには`gzip`が含まれます。                                                                                                                                                                                                                                                                                                                                        | 圧縮は使用されません。                                                                                                      |
| `otel.exporter.otlp.timeout`                               | 各OTLPトレース、メトリクス、ログバッチの送信に許可される最大待機時間（ミリ秒）。                                                                                                                                                                                                                                                                                                                                       | `10000`                                                                                                                     |
| `otel.exporter.otlp.{signal}.timeout`                      | 各OTLP {signal}バッチの送信に許可される最大待機時間（ミリ秒）。                                                                                                                                                                                                                                                                                                                                                        | `10000`                                                                                                                     |
| `otel.exporter.otlp.metrics.temporality.preference`        | 希望する出力集約時間性。オプションには`DELTA`、`LOWMEMORY`、`CUMULATIVE`が含まれます。`CUMULATIVE`の場合、すべての計装が累積時間性を持ちます。`DELTA`の場合、カウンター（同期および非同期）とヒストグラムがデルタ、アップダウンカウンター（同期および非同期）が累積になります。`LOWMEMORY`の場合、同期カウンターとヒストグラムがデルタ、非同期カウンターとアップダウンカウンター（同期および非同期）が累積になります。 | `CUMULATIVE`                                                                                                                |
| `otel.exporter.otlp.metrics.default.histogram.aggregation` | 希望するデフォルトヒストグラム集約。オプションには`BASE2_EXPONENTIAL_BUCKET_HISTOGRAM`と`EXPLICIT_BUCKET_HISTOGRAM`が含まれます。                                                                                                                                                                                                                                                                                      | `EXPLICIT_BUCKET_HISTOGRAM`                                                                                                 |
| `otel.java.exporter.otlp.retry.disabled`                   | `false`の場合、一時的なエラーが発生したときにリトライします。**[2]**                                                                                                                                                                                                                                                                                                                                                   | `false`                                                                                                                     |

**注意**: テキストプレースホルダー`{signal}`は、サポートされている[OpenTelemetry Signal](/docs/concepts/signals/)を指します。有効な値には`traces`、`metrics`、`logs`が含まれます。シグナル固有の設定は汎用バージョンよりも優先されます。
たとえば、`otel.exporter.otlp.endpoint`と`otel.exporter.otlp.traces.endpoint`の両方を設定した場合、後者が優先されます。

**[1]**: OpenTelemetry Javaエージェント 2.xとOpenTelemetry Spring Boot starterは、デフォルトで`http/protobuf`を使用します。

**[2]**: [OTLP](/docs/specs/otlp/#otlpgrpc-response)は、[一時的](/docs/specs/otel/protocol/exporter/#retry)エラーをリトライストラテジーで処理することを要求します。リトライが有効な場合、リトライ可能なgRPCステータスコードはジッターアルゴリズムを使用した指数バックオフでリトライされます。`RetryPolicy`の特定のオプションは[プログラムカスタマイゼーション](#programmatic-customization)を介してのみカスタマイズできます。

`zipkin`スパンエクスポーターのプロパティ。

| システムプロパティ              | 説明                                                       | デフォルト                           |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------ |
| `otel.traces.exporter=zipkin`   | Zipkinエクスポーターを選択                                 |                                      |
| `otel.exporter.zipkin.endpoint` | 接続するZipkinエンドポイント。HTTPのみがサポートされます。 | `http://localhost:9411/api/v2/spans` |

`prometheus`メトリクスエクスポーターのプロパティ。

| システムプロパティ                 | 説明                                                         | デフォルト |
| ---------------------------------- | ------------------------------------------------------------ | ---------- |
| `otel.metrics.exporter=prometheus` | Prometheusエクスポーターを選択                               |            |
| `otel.exporter.prometheus.port`    | Prometheusメトリクスサーバーをバインドするローカルポート。   | `9464`     |
| `otel.exporter.prometheus.host`    | Prometheusメトリクスサーバーをバインドするローカルアドレス。 | `0.0.0.0`  |

#### プログラムカスタマイゼーション {#programmatic-customization}

プログラムカスタマイゼーションは、[サポートされているプロパティ](#environment-variables-and-system-properties)を[プログラム設定](#programmatic-configuration)で補完するフックを提供します。

[Springスターター](/docs/zero-code/java/spring-boot-starter/)を使用している場合は、[Springスタータープログラム設定](/docs/zero-code/java/spring-boot-starter/sdk-configuration/#programmatic-configuration)も参照してください。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizedAutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;
import java.util.Collections;

public class CustomizedAutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.builder()
        // オプションでTextMapPropagatorをカスタマイズ。
        .addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator)
        // オプションでResourceをカスタマイズ。
        .addResourceCustomizer((resource, configProperties) -> resource)
        // オプションでSamplerをカスタマイズ。
        .addSamplerCustomizer((sampler, configProperties) -> sampler)
        // オプションでSpanExporterをカスタマイズ。
        .addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter)
        // オプションでSpanProcessorをカスタマイズ。
        .addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor)
        // オプションで追加のプロパティを提供。
        .addPropertiesSupplier(Collections::emptyMap)
        // オプションでConfigPropertiesをカスタマイズ。
        .addPropertiesCustomizer(configProperties -> Collections.emptyMap())
        // オプションでSdkTracerProviderBuilderをカスタマイズ。
        .addTracerProviderCustomizer((builder, configProperties) -> builder)
        // オプションでSdkMeterProviderBuilderをカスタマイズ。
        .addMeterProviderCustomizer((builder, configProperties) -> builder)
        // オプションでMetricExporterをカスタマイズ。
        .addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter)
        // オプションでMetricReaderをカスタマイズ。
        .addMetricReaderCustomizer((metricReader, configProperties) -> metricReader)
        // オプションでSdkLoggerProviderBuilderをカスタマイズ。
        .addLoggerProviderCustomizer((builder, configProperties) -> builder)
        // オプションでLogRecordExporterをカスタマイズ。
        .addLogRecordExporterCustomizer((logRecordExporter, configProperties) -> logRecordExporter)
        // オプションでLogRecordProcessorをカスタマイズ。
        .addLogRecordProcessorCustomizer((processor, configProperties) -> processor)
        .build()
        .getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

#### SPI（Service provider interface） {#spi-service-provider-interface}

[SPIs](https://docs.oracle.com/javase/tutorial/sound/SPI-intro.html)（アーティファクト`io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}`）は、SDKに組み込まれたコンポーネントを超えてSDK自動設定を拡張します。

以下のセクションでは、利用可能なSPIについて説明します。
各SPIセクションには以下が含まれます。

- Javadoc型リファレンスへのリンクを含む簡潔な説明
- 利用可能な組み込みおよび`opentelemetry-java-contrib`実装のテーブル
- カスタム実装の簡単なデモンストレーション

##### ResourceProvider {#resourceprovider}

[ResourceProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ResourceProvider.html)は、自動設定された[リソース](../sdk/#resource)に貢献します。

SDKに組み込まれ、`opentelemetry-java-contrib`でコミュニティによって維持されている`ResourceProvider`です。

| クラス                                                                      | アーティファクト                                                                                    | 説明                                                                                            |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `io.opentelemetry.sdk.autoconfigure.internal.EnvironmentResourceProvider`   | `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`                | `OTEL_SERVICE_NAME`および`OTEL_RESOURCE_ATTRIBUTES`環境変数に基づいてリソース属性を提供します。 |
| `io.opentelemetry.instrumentation.resources.ContainerResourceProvider`      | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | コンテナリソース属性を提供します。                                                              |
| `io.opentelemetry.instrumentation.resources.HostResourceProvider`           | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | ホストリソース属性を提供します。                                                                |
| `io.opentelemetry.instrumentation.resources.HostIdResourceProvider`         | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | ホストIDリソース属性を提供します。                                                              |
| `io.opentelemetry.instrumentation.resources.ManifestResourceProvider`       | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | jarマニフェストに基づいてサービスリソース属性を提供します。                                     |
| `io.opentelemetry.instrumentation.resources.OsResourceProvider`             | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | OSリソース属性を提供します。                                                                    |
| `io.opentelemetry.instrumentation.resources.ProcessResourceProvider`        | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | プロセスリソース属性を提供します。                                                              |
| `io.opentelemetry.instrumentation.resources.ProcessRuntimeResourceProvider` | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | プロセスランタイムリソース属性を提供します。                                                    |
| `io.opentelemetry.contrib.gcp.resource.GCPResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-gcp-resources:{{% param vers.contrib %}}-alpha`             | GCPランタイム環境リソース属性を提供します。                                                     |
| `io.opentelemetry.contrib.aws.resource.BeanstalkResourceProvider`           | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | AWS Elastic Beanstalkランタイム環境リソース属性を提供します。                                   |
| `io.opentelemetry.contrib.aws.resource.Ec2ResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Amazon EC2ランタイム環境リソース属性を提供します。                                              |
| `io.opentelemetry.contrib.aws.resource.EcsResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Amazon EC2ランタイム環境リソース属性を提供します。                                              |
| `io.opentelemetry.contrib.aws.resource.EksResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Amazon EKSランタイム環境リソース属性を提供します。                                              |
| `io.opentelemetry.contrib.aws.resource.LambdaResourceProvider`              | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | AWS Lambdaランタイム環境リソース属性を提供します。                                              |

リソース自動設定に参加するには、`ResourceProvider`インターフェースを実装してください。
例を挙げましょう。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomResourceProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ResourceProvider;
import io.opentelemetry.sdk.resources.Resource;

public class CustomResourceProvider implements ResourceProvider {

  @Override
  public Resource createResource(ConfigProperties config) {
    // リソースに貢献するために呼び出されるコールバック。
    return Resource.builder().put("my.custom.resource.attribute", "abc123").build();
  }

  @Override
  public int order() {
    // オプションで呼び出し順序に影響を与える。
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### AutoConfigurationCustomizerProvider {#autoconfigurationcustomizerprovider}

[AutoConfigurationCustomizerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.html)インターフェースを実装して、さまざまな自動設定されたSDKコンポーネントをカスタマイズします。
例を挙げましょう。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizer;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import java.util.Collections;

public class CustomizerProvider implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer customizer) {
    // オプションでTextMapPropagatorをカスタマイズ。
    customizer.addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator);
    // オプションでResourceをカスタマイズ。
    customizer.addResourceCustomizer((resource, configProperties) -> resource);
    // オプションでSamplerをカスタマイズ。
    customizer.addSamplerCustomizer((sampler, configProperties) -> sampler);
    // オプションでSpanExporterをカスタマイズ。
    customizer.addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter);
    // オプションでSpanProcessorをカスタマイズ。
    customizer.addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor);
    // オプションで追加のプロパティを提供。
    customizer.addPropertiesSupplier(Collections::emptyMap);
    // オプションでConfigPropertiesをカスタマイズ。
    customizer.addPropertiesCustomizer(configProperties -> Collections.emptyMap());
    // オプションでSdkTracerProviderBuilderをカスタマイズ。
    customizer.addTracerProviderCustomizer((builder, configProperties) -> builder);
    // オプションでSdkMeterProviderBuilderをカスタマイズ。
    customizer.addMeterProviderCustomizer((builder, configProperties) -> builder);
    // オプションでMetricExporterをカスタマイズ。
    customizer.addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter);
    // オプションでMetricReaderをカスタマイズ。
    customizer.addMetricReaderCustomizer((metricReader, configProperties) -> metricReader);
    // オプションでSdkLoggerProviderBuilderをカスタマイズ。
    customizer.addLoggerProviderCustomizer((builder, configProperties) -> builder);
    // オプションでLogRecordExporterをカスタマイズ。
    customizer.addLogRecordExporterCustomizer((exporter, configProperties) -> exporter);
    // オプションでLogRecordProcessorをカスタマイズ。
    customizer.addLogRecordProcessorCustomizer((processor, configProperties) -> processor);
  }

  @Override
  public int order() {
    // オプションで呼び出し順序に影響を与える。
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSpanExporterProvider {#configurablespanexporterprovider}

[ConfigurableSpanExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSpanExporterProvider.html)インターフェースを実装して、カスタムスパンエクスポーターが自動設定に参加できるようにします。
例を挙げましょう。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSpanExporterProvider;
import io.opentelemetry.sdk.trace.export.SpanExporter;

public class CustomSpanExporterProvider implements ConfigurableSpanExporterProvider {

  @Override
  public SpanExporter createExporter(ConfigProperties config) {
    // OTEL_TRACES_EXPORTERにgetName()からの値が含まれる場合に呼び出されるコールバック。
    return new CustomSpanExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableMetricExporterProvider {#configurablemetricexporterprovider}

[ConfigurableMetricExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/metrics/ConfigurableMetricExporterProvider.html)インターフェースを実装して、カスタムメトリクスエクスポーターが自動設定に参加できるようにします。
例を挙げましょう。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.metrics.ConfigurableMetricExporterProvider;
import io.opentelemetry.sdk.metrics.export.MetricExporter;

public class CustomMetricExporterProvider implements ConfigurableMetricExporterProvider {

  @Override
  public MetricExporter createExporter(ConfigProperties config) {
    // OTEL_METRICS_EXPORTERにgetName()からの値が含まれる場合に呼び出されるコールバック。
    return new CustomMetricExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableLogRecordExporterProvider {#configurablelogrecordexporterprovider}

[ConfigurableLogRecordExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/logs/ConfigurableLogRecordExporterProvider.html)インターフェースを実装して、カスタムログレコードエクスポーターが自動設定に参加できるようにします。
例を挙げましょう。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.logs.ConfigurableLogRecordExporterProvider;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;

public class CustomLogRecordExporterProvider implements ConfigurableLogRecordExporterProvider {

  @Override
  public LogRecordExporter createExporter(ConfigProperties config) {
    // OTEL_LOGS_EXPORTERにgetName()からの値が含まれる場合に呼び出されるコールバック。
    return new CustomLogRecordExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSamplerProvider {#configurablesamplerprovider}

[ConfigurableSamplerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSamplerProvider.html)インターフェースを実装して、カスタムサンプラーが自動設定に参加できるようにします。
例を挙げましょう。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSamplerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSamplerProvider;
import io.opentelemetry.sdk.trace.samplers.Sampler;

public class CustomSamplerProvider implements ConfigurableSamplerProvider {

  @Override
  public Sampler createSampler(ConfigProperties config) {
    // OTEL_TRACES_SAMPLERがgetName()からの値に設定されている場合に呼び出されるコールバック。
    return new CustomSampler();
  }

  @Override
  public String getName() {
    return "custom-sampler";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurablePropagatorProvider {#configurablepropagatorprovider}

[ConfigurablePropagatorProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ConfigurablePropagatorProvider.html)インターフェースを実装して、カスタムプロパゲーターが自動設定に参加できるようにします。
例を挙げましょう。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomTextMapPropagatorProvider.java"?>
```java
package otel;

import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigurablePropagatorProvider;

public class CustomTextMapPropagatorProvider implements ConfigurablePropagatorProvider {
  @Override
  public TextMapPropagator getPropagator(ConfigProperties config) {
    // OTEL_PROPAGATORSにgetName()からの値が含まれる場合に呼び出されるコールバック。
    return new CustomTextMapPropagator();
  }

  @Override
  public String getName() {
    return "custom-propagator";
  }
}
```
<!-- prettier-ignore-end -->

### 宣言的設定 {#declarative-configuration}

宣言的設定は現在開発中です。
これは、[opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration)と[宣言的設定](/docs/specs/otel/configuration/#declarative-configuration)で説明されているYAMLファイルベースの設定を可能にします。

使用するには、`io.opentelemetry:opentelemetry-sdk-extension-incubator:{{% param vers.otel %}}-alpha`を含め、以下の表で説明されているように設定ファイルのパスを指定します。

| システムプロパティ              | 目的                    | デフォルト |
| ------------------------------- | ----------------------- | ---------- |
| `otel.experimental.config.file` | SDK設定ファイルのパス。 | 未設定     |

{{% alert title="注意" color="warning" %}}

設定ファイルが指定された場合、[環境変数とシステムプロパティ](#environment-variables-and-system-properties)は無視され、[プログラムカスタマイゼーション](#programmatic-customization)と[SPIs](#spi-service-provider-interface)はスキップされます。
ファイルの内容のみがSDK設定を決定します。

{{% /alert %}}

詳細については、以下のリソースを参照してください。

- [使用ドキュメント](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/incubator#declarative-configuration)
- [Javaエージェントでの例](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent#declarative-configuration)
- [Javaエージェントなしでの例](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/declarative-configuration)
