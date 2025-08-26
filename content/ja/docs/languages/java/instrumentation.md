---
title: 計装エコシステム
aliases:
  - /docs/java/getting_started
  - /docs/java/manual_instrumentation
  - manual
  - manual_instrumentation
  - libraries
weight: 10
description: OpenTelemetry Javaにおける計装エコシステム
default_lang_commit: f9a0439ac56dba1515283e1a1cb6d6a90634a20f
cSpell:ignore: logback
---

<!-- markdownlint-disable no-duplicate-heading -->

計装は[API](../api/)を使用してテレメトリーを記録します。[SDK](../sdk/)はAPIの組み込みリファレンス実装であり、計装APIコールによって生成されたテレメトリーを処理およびエクスポートするように[構成](../configuration/)されています。
このページでは、エンドユーザー向けのリソースと横断的な計装トピックを含む、OpenTelemetry JavaにおけるOpenTelemetryエコシステムについて説明します。

- さまざまなユースケースとインストールパターンに対応する[計装カテゴリ](#instrumentation-categories)。
- [コンテキスト伝播](#context-propagation)は、トレース、メトリクス、およびログ間の相関を提供し、シグナルが互いに補完し合えるようにします。
- [セマンティック規約](#semantic-conventions)は、標準操作のテレメトリーを生成する方法を定義します。
- [ログ計装](#log-instrumentation)は、既存のJavaロギングフレームワークからOpenTelemetryにログを取得するために使用されます。

{{% alert %}}
[計装カテゴリ](#instrumentation-categories)はアプリケーションを計装するためのいくつかのオプションを列挙していますが、ユーザーには[Javaエージェント](#zero-code-java-agent)から始めることをお勧めします。
Javaエージェントには簡単なインストールプロセスがあり、大規模なライブラリから計装を自動的に検出してインストールします。
{{% /alert %}}

## 計装カテゴリ {#instrumentation-categories}

計装にはいくつかのカテゴリがあります。

- [ゼロコード：Javaエージェント](#zero-code-java-agent)は、アプリケーションのバイトコードを動的に操作するゼロコード計装 **[1]** の形式です。
- [ゼロコード：Spring Bootスターター](#zero-code-spring-boot-starter)は、Springの自動構成を活用して[ライブラリ計装](#library-instrumentation)をインストールするゼロコード計装 **[1]** の形式です。
- [ライブラリ計装](#library-instrumentation)は、ライブラリをラップまたは拡張ポイントを使用して計装し、ユーザーがライブラリの使用をインストールおよび/または適応させる必要があります。
- [ネイティブ計装](#native-instrumentation)は、ライブラリとフレームワークに直接組み込まれています。
- [手動計装](#manual-instrumentation)は、アプリケーション作成者によって記述され、通常はアプリケーションドメインに固有です。
- [シム](#shims)は、あるオブザーバビリティライブラリから別のライブラリ（通常は何らかのライブラリ\_から\_OpenTelemetry）にデータをブリッジします。

**[1]**：ゼロコード計装は、検出されたライブラリ/フレームワークに基づいて自動的にインストールされます。

[opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)プロジェクトには、Javaエージェント、Spring Bootスターター、およびライブラリ計装のソースコードが含まれています。

### ゼロコード：Javaエージェント {#zero-code-java-agent}

Javaエージェントは、アプリケーションのバイトコードを動的に操作するゼロコード[自動計装](/docs/specs/otel/glossary/#automatic-instrumentation)の形式です。

Javaエージェントによって計装されたライブラリのリストについては、[サポートされているライブラリ](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md)の「自動計装バージョン」列を参照してください。

詳細については、[Javaエージェント](/docs/zero-code/java/agent/)を参照してください。

### ゼロコード：Spring Bootスターター {#zero-code-spring-boot-starter}

Spring Bootスターターは、Springの自動構成を活用して[ライブラリ計装](#library-instrumentation)をインストールするゼロコード[自動計装](/docs/specs/otel/glossary/#automatic-instrumentation)の形式です。

詳細については、[Spring Bootスターター](/docs/zero-code/java/spring-boot-starter/)を参照してください。

### ライブラリ計装 {#library-instrumentation}

[ライブラリ計装](/docs/specs/otel/glossary/#instrumentation-library)は、ライブラリをラップまたは拡張ポイントを使用して計装し、ユーザーがライブラリの使用をインストールおよび/または適応させる必要があります。

計装ライブラリのリストについては、[サポートされているライブラリ](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md)の「スタンドアロンライブラリ計装」列を参照してください。

### ネイティブ計装 {#native-instrumentation}

[ネイティブ計装](/docs/specs/otel/glossary/#natively-instrumented)は、ライブラリまたはフレームワークに直接組み込まれています。
OpenTelemetryは、[API](../api/)を使用してネイティブ計装を追加することをライブラリ作成者に推奨しています。
長期的には、ネイティブ計装が標準になることを期待しており、[opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)でOpenTelemetryによって維持される計装は、ギャップを埋める一時的な手段と見なしています。

{{% docs/languages/native-libraries %}}

### 手動計装 {#manual-instrumentation}

[手動計装](/docs/specs/otel/glossary/#manual-instrumentation)は、アプリケーション作成者によって記述され、通常はアプリケーションドメインに固有です。

### シム {#shims}

シムは、あるオブザーバビリティライブラリから別のライブラリにデータをブリッジする計装であり、通常は何らかのライブラリ\_から\_OpenTelemetryへです。

OpenTelemetry Javaエコシステムで維持されているシム。

| 説明                                                                                                         | ドキュメント                                                                                                                                                                    | シグナル             | アーティファクト                                                                                                                |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [OpenTracing](https://opentracing.io/)をOpenTelemetryにブリッジ                                              | [README](https://github.com/open-telemetry/opentelemetry-java/tree/main/opentracing-shim)                                                                                       | トレース             | `io.opentelemetry:opentelemetry-opentracing-shim:{{% param vers.otel %}}`                                                       |
| [Opencensus](https://opencensus.io/)をOpenTelemetryにブリッジ                                                | [README](https://github.com/open-telemetry/opentelemetry-java/tree/main/opencensus-shim)                                                                                        | トレース、メトリクス | `io.opentelemetry:opentelemetry-opencensus-shim:{{% param vers.otel %}}-alpha`                                                  |
| [Micrometer](https://micrometer.io/)をOpenTelemetryにブリッジ                                                | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/micrometer/micrometer-1.5/library)                                      | メトリクス           | `io.opentelemetry.instrumentation:opentelemetry-micrometer-1.5:{{% param vers.instrumentation %}}-alpha`                        |
| [JMX](https://docs.oracle.com/javase/7/docs/technotes/guides/management/agent.html)をOpenTelemetryにブリッジ | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/README.md)                                                  | メトリクス           | `io.opentelemetry.instrumentation:opentelemetry-jmx-metrics:{{% param vers.instrumentation %}}-alpha`                           |
| OpenTelemetryを[Prometheus Javaクライアント](https://github.com/prometheus/client_java)にブリッジ            | [README](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/prometheus-client-bridge)                                                                       | メトリクス           | `io.opentelemetry.contrib:opentelemetry-prometheus-client-bridge:{{% param vers.contrib %}}-alpha`                              |
| OpenTelemetryを[Micrometer](https://micrometer.io/)にブリッジ                                                | [README](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/micrometer-meter-provider)                                                                      | メトリクス           | `io.opentelemetry.contrib:opentelemetry-micrometer-meter-provider:{{% param vers.contrib %}}-alpha`                             |
| [Log4j](https://logging.apache.org/log4j/2.x/index.html)をOpenTelemetryにブリッジ                            | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-appender-2.17/library)                                      | ログ                 | `io.opentelemetry.instrumentation:opentelemetry-log4j-appender-2.17:{{% param vers.instrumentation %}}-alpha`                   |
| [Logback](https://logback.qos.ch/)をOpenTelemetryにブリッジ                                                  | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-appender-1.0/library)                                   | ログ                 | `io.opentelemetry.instrumentation:opentelemetry-logback-appender-1.0:{{% param vers.instrumentation %}}-alpha`                  |
| OpenTelemetryコンテキストを[Log4j](https://logging.apache.org/log4j/2.x/index.html)にブリッジ                | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-context-data/log4j-context-data-2.17/library-autoconfigure) | コンテキスト         | `io.opentelemetry.instrumentation:opentelemetry-log4j-context-data-2.17-autoconfigure:{{% param vers.instrumentation %}}-alpha` |
| OpenTelemetryコンテキストを[Logback](https://logback.qos.ch/)にブリッジ                                      | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-mdc-1.0/library)                                        | コンテキスト         | `io.opentelemetry.instrumentation:opentelemetry-logback-mdc-1.0:{{% param vers.instrumentation %}}-alpha`                       |

## コンテキスト伝搬 {#context-propagation}

OpenTelemetry APIは補完的に設計されており、全体が部分の合計よりも大きくなります。
各シグナルには独自の強みがあり、集合的に説得力のあるオブザーバビリティストーリーをつなぎ合わせます。

重要なことに、さまざまなシグナルからのデータは、トレースコンテキストを介して相互にリンクされています。

- スパンは、スパンの親とリンクを介して他のスパンに関連付けられており、それぞれが関連するスパンのトレースコンテキストを記録します。
- メトリクスは、特定の測定のトレースコンテキストを記録する[エグザンプラー](/docs/specs/otel/metrics/data-model/#exemplars)を介してスパンに関連付けられています。
- ログは、ログレコードにトレースコンテキストを記録することによってスパンに関連付けられています。

この相関が機能するためには、トレースコンテキストがアプリケーション全体（関数呼び出しやスレッド間）およびアプリケーション境界を越えて伝搬される必要があります。
[コンテキストAPI](../api/#context-api)はこれを促進します。計装は、コンテキストを認識する方法で記述される必要があります。

- アプリケーションへのエントリポイントを表すライブラリ（HTTPサーバー、メッセージコンシューマーなど）は、受信メッセージから[コンテキストを抽出](../api/#contextpropagators)する必要があります。
- アプリケーションからの出口ポイントを表すライブラリ（HTTPクライアント、メッセージプロデューサーなど）は、送信メッセージに[コンテキストを注入](../api/#contextpropagators)する必要があります。
- ライブラリは、暗黙的または明示的に、コールスタックおよびスレッド間で[コンテキスト](../api/#context)を渡す必要があります。

## セマンティック規約 {#semantic-conventions}

[セマンティック規約](/docs/specs/semconv/)は、標準操作のテレメトリーを生成する方法を定義します。
とりわけ、セマンティック規約は、スパン名、スパンの種類、メトリクス計器、メトリクス単位、メトリクスタイプ、および属性キー、値、および要件レベルを指定します。

計装を記述する際は、セマンティック規約を参照し、ドメインに適用可能なものに準拠してください。

OpenTelemetry Javaは、属性キーと値の生成された定数を含む、セマンティック規約に準拠するのに役立つ[アーティファクトを公開](../api/#semantic-attributes)しています。

## ログ計装 {#log-instrumentation}

[LoggerProvider](../api/#loggerprovider) / [Logger](../api/#logger) APIは、同等の[トレース](../api/#tracerprovider)および[メトリクス](../api/#meterprovider) APIと構造的に類似していますが、異なるユースケースに対応しています。
現時点では、`LoggerProvider` / `Logger`および関連するクラスは[ログブリッジAPI](/docs/specs/otel/logs/api/)を表しており、他のログAPI/フレームワークを介して記録されたログをOpenTelemetryにブリッジするログアペンダーを記述するために存在します。
これらは、Log4j / SLF4J / Logbackなどの代替としてエンドユーザーが使用することを意図したものではありません。

OpenTelemetryでログ計装を使用するための2つの典型的なワークフローがあり、さまざまなアプリケーション要件に対応しています。

### コレクターへの直接送信 {#direct-to-collector}

コレクターへの直接送信ワークフローでは、ログはネットワークプロトコル（例：OTLP）を使用してアプリケーションからコレクターに直接出力されます。
このワークフローは、追加のログ転送コンポーネントを必要としないため設定が簡単で、[ログデータモデル](/docs/specs/otel/logs/data-model/)に準拠する構造化ログをアプリケーションが簡単に出力できるようにします。
ただし、アプリケーションがネットワークの場所にログをキューイングしてエクスポートするために必要なオーバーヘッドは、すべてのアプリケーションに適しているわけではありません。

このワークフローを使用するには。

- 適切なログアペンダーをインストールします。**[1]**
- OpenTelemetry [ログSDK](../sdk/#sdkloggerprovider)を構成して、ログレコードを目的のターゲット宛先（[コレクター](https://github.com/open-telemetry/opentelemetry-collector)またはその他）にエクスポートします。

**[1]**：ログアペンダーは、ログフレームワークからOpenTelemetryログSDKにログをブリッジする[シム](#shims)の一種です。「Log4jをOpenTelemetryにブリッジ」、「LogbackをOpenTelemetryにブリッジ」のエントリを参照してください。さまざまなシナリオのデモンストレーションについては、[ログアペンダーの例](https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/log-appender)を参照してください。

### ファイルまたは標準出力経由 {#via-file-or-stdout}

ファイルまたは標準出力ワークフローでは、ログはファイルまたは標準出力に書き込まれます。
別のコンポーネント（例：FluentBit）がログの読み取り/テーリング、より構造化された形式への解析、およびコレクターなどのターゲットへの転送を担当します。
このワークフローは、アプリケーション要件が[コレクターへの直接送信](#direct-to-collector)からの追加のオーバーヘッドを許可しない状況で好ましい場合があります。
ただし、下流で必要なすべてのログフィールドがログにエンコードされ、ログを読み取るコンポーネントがデータを[ログデータモデル](/docs/specs/otel/logs/data-model/)に解析する必要があります。
ログ転送コンポーネントのインストールと構成は、このドキュメントの範囲外です。

トレースとのログ相関は、OpenTelemetryコンテキストをログフレームワークにブリッジする[シム](#shims)をインストールすることで利用できます。「OpenTelemetryコンテキストをLog4jにブリッジ」、「OpenTelemetryコンテキストをLogbackにブリッジ」のエントリを参照してください。

{{% alert title="注意" %}}

標準出力を使用したログ計装のエンドツーエンドの例は、[Javaサンプルリポジトリ](https://github.com/open-telemetry/opentelemetry-java-examples/blob/main/logging-k8s-stdout-otlp-json/README.md)で入手できます。

{{% /alert %}}
