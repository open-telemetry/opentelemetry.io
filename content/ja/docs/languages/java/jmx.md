---
title: JMX メトリクス
weight: 14
description: OpenTelemetry を使用して JMX MBean からメトリクスを収集します
default_lang_commit: fc509b751d6882b99824ea78a1dd8e638dd9055a
cSpell:ignore: jconsole jmxremote mbean visualvm wildfly
---

このページでは、[JMX](https://docs.oracle.com/javase/8/docs/technotes/guides/management/agent.html) (Java Management Extensions) MBean からメトリクスを収集し、OpenTelemetry にエクスポートする方法を説明します。

## 概要 {#overview}

JMX (Java Management Extensions) は、JMX MBean (Managed Bean) を介してアプリケーションを管理・監視するためのツールを提供する Java の技術です。
これらの MBean は外部から観測可能な管理用の属性や操作を公開します。

OpenTelemetry の JMX Metric Insight モジュールを使うと、JMX メトリクスを OpenTelemetry にブリッジでき、次のことが可能になります。

- JVM メトリクス（メモリ、ガベージコレクション、スレッドなど）の監視
- アプリケーション固有の MBean からのメトリクス収集
- JMX データを他の OpenTelemetry テレメトリーシグナルと並べてエクスポート
- 人気のあるターゲットシステム（Tomcat、Jetty、Wildfly など）向けの定義済みメトリクスマッピングの利用

## インストール {#installation}

### Java エージェントを使用する {#using-the-java-agent}

JMX メトリクスを収集する最も簡単な方法は、JMX メトリクス拡張を備えた OpenTelemetry Java エージェントを使用することです。

1. OpenTelemetry Java エージェントをダウンロードします（まだインストールしていない場合）。

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
   ```

2. エージェントを使用してアプリケーションを実行し、JMX メトリクスを有効化します。

   ```sh
   java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.jmx.target.system=tomcat \
     -Dotel.jmx.config=/path/to/custom-metrics.yaml \
     -jar myapp.jar
   ```

JMX メトリクス収集は、次の設定オプションのいずれか（または両方）を設定することで有効になります。

- `otel.jmx.target.system` で有効化する定義済みメトリクスセットを選択する
- `otel.jmx.config` でカスタム JMX ルールへのパスを指定する

Java エージェントを使用する場合、JVM ランタイムメトリクス（CPU、メモリなど）は `runtime-telemetry` モジュールを通じて取得され、追加の設定なしでデフォルトで有効になっています。

## 設定 {#configuration}

JMX メトリクスは 2 つの方法で収集できます。

- **JVM の内部から**: Java エージェントを使用して内部 JMX インターフェイスから収集
- **JVM の外部から**: JMX Scraper を使用してリモート JMX インターフェイスから収集

### Java エージェントの設定 {#java-agent-configuration}

OpenTelemetry Java エージェントを使用する場合、次のプロパティで JMX メトリクスを設定します。

| システムプロパティ       | 環境変数                 | 説明                                                 | デフォルト |
| ------------------------ | ------------------------ | ---------------------------------------------------- | ---------- |
| `otel.jmx.enabled`       | `OTEL_JMX_ENABLED`       | JMX メトリクス収集を有効化                           | `true`     |
| `otel.jmx.target.system` | `OTEL_JMX_TARGET_SYSTEM` | 使用する定義済みメトリクスセットのカンマ区切りリスト | なし       |
| `otel.jmx.config`        | `OTEL_JMX_CONFIG`        | メトリクスマッピング用のカスタム YAML へのパス       | なし       |

### JMX Scraper の設定 {#jmx-scraper-configuration}

スタンドアロンの JMX Scraper を使用してリモート JVM からメトリクスを収集する場合、次のプロパティで設定します（注: `otel.jmx.enabled` は不要です）。

| システムプロパティ       | 環境変数                 | 説明                                                 | デフォルト |
| ------------------------ | ------------------------ | ---------------------------------------------------- | ---------- |
| `otel.jmx.service.url`   | `OTEL_JMX_SERVICE_URL`   | リモート JVM 接続用の JMX サービス URL               | （必須）   |
| `otel.jmx.target.system` | `OTEL_JMX_TARGET_SYSTEM` | 使用する定義済みメトリクスセットのカンマ区切りリスト | なし       |
| `otel.jmx.config`        | `OTEL_JMX_CONFIG`        | メトリクスマッピング用のカスタム YAML へのパス       | なし       |

完全な設定リファレンスは [JMX Scraper ドキュメント](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#configuration-reference) を参照してください。

リモート JVM はリモート JMX 接続を受け付けるように設定されている必要があることに注意してください。
`jconsole` や `visualvm` ツールを使用して接続できることを最初に確認することで、設定とオプションの認証が期待どおりに動作していることを確認できます。

### 定義済みターゲットシステム {#predefined-target-systems}

OpenTelemetry は、人気のある Java フレームワークおよびアプリケーションサーバー向けの定義済みメトリクスマッピングを提供します。
`otel.jmx.target.system` プロパティを使用してそれらを有効化します（Java エージェントと JMX Scraper の両方で利用可能）。

**例 - Tomcat の監視（Java エージェント）:**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.target.system=tomcat \
  -jar myapp.jar
```

利用可能なターゲットシステムの完全なリストは次を参照してください。

- [Java エージェントの定義済みターゲットシステム](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/README.md#predefined-metric-sets)
- [JMX Scraper の定義済みターゲットシステム](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#predefined-metric-sets)

複数のターゲットシステムをカンマで区切って指定できます。

### リモート JMX 接続 {#remote-jmx-connections}

リモート JVM からメトリクスを収集するには、JMX Scraper を使用する必要があります。
これには 2 つの別々の JVM が関係します。

1. **ターゲット JVM** - 監視されるアプリケーション
2. **Scraper JVM** - JMX メトリクススクレイパー

#### ステップ 1: ターゲット JVM の設定 {#step-1-configure-the-target-jvm}

まず、JMX リモートを有効にしてターゲットアプリケーションを起動します。

```sh
java -Dcom.sun.management.jmxremote \
  -Dcom.sun.management.jmxremote.port=9999 \
  -Dcom.sun.management.jmxremote.authenticate=false \
  -Dcom.sun.management.jmxremote.ssl=false \
  -jar myapp.jar
```

> [!WARNING] 上記の例では、単純さのために認証と SSL を無効化しています。
> 本番環境では、JMX 接続に対して必ず認証と SSL を有効化してください。

#### ステップ 2: JMX Scraper の実行 {#step-2-run-the-jmx-scraper}

[OpenTelemetry Java Contrib のリリース](https://github.com/open-telemetry/opentelemetry-java-contrib/releases) ページから JMX Scraper をダウンロードします（`opentelemetry-jmx-scraper-<version>-all.jar` を探してください）。

次に、スクレイパーを実行してターゲット JVM を指定します。

```sh
java -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://tomcat.example.com:9999/jmxrmi \
  -Dotel.jmx.target.system=tomcat \
  -jar opentelemetry-jmx-scraper.jar
```

Java エージェントと同じプロパティ（ターゲットシステム、収集間隔など）を使用してスクレイパーを設定できます。

詳細は [JMX Scraper ドキュメント](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper) を参照してください。

> [!NOTE] 非推奨となった JMX Metric Gatherer から移行する場合は、[移行ガイド](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#migrating-from-jmx-metric-gatherer) を参照してください。

## カスタムメトリクスマッピング {#custom-metric-mappings}

アプリケーション固有の MBean やカスタムの監視要件に対しては、YAML 設定ファイルを使用してカスタムメトリクスマッピングを作成できます。

### カスタム YAML 設定の作成 {#creating-a-custom-yaml-configuration}

JMX 属性を OpenTelemetry メトリクスにマッピングする方法を定義する YAML ファイルを作成します。

**例 - `custom-jmx-metrics.yaml`:**

```yaml
rules:
  - bean: com.myapp:type=CustomMetrics
    mapping:
      RequestCount:
        metric: myapp.requests.count
        type: counter
        description: Total request count
        unit: '1'
      ResponseTime:
        metric: myapp.response.time
        type: gauge
        description: Average response time
        unit: ms
      ActiveSessions:
        metric: myapp.sessions.active
        type: updowncounter
        description: Active sessions
        unit: '1'
```

このファイルをアプリケーションで使用します。

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.config=/path/to/custom-jmx-metrics.yaml \
  -jar myapp.jar
```

YAML 構文の完全なリファレンスは [JMX メトリクス設定ドキュメント](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics) を参照してください。

## 検証 {#verification}

JMX メトリクスが収集されていることを検証するには:

1. **ログを確認する** - JMX メトリクス収集が開始されたことを示すメッセージを探します
2. **ロギングエクスポーターを使用する** - バックエンドを必要とせずにコンソールでメトリクスを確認するために、ロギングエクスポーターを設定します
3. **メトリクスバックエンドを使用する** - OTLP エクスポーターを設定し、オブザーバビリティプラットフォームでメトリクスを表示します
4. **JConsole を使用する** - JConsole でアプリケーションに接続して、MBean にアクセスできることを確認します

**例 - ロギングエクスポーターを使用（Java エージェント）:**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.metrics.exporter=logging \
  -jar myapp.jar
```

**例 - OTLP エクスポーターを使用（Java エージェント）:**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -jar myapp.jar
```

**例 - OTLP エクスポーターを使用（JMX Scraper）:**

```sh
java -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://myapp.example.com:9999/jmxrmi \
  -Dotel.jmx.target.system=tomcat \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -jar opentelemetry-jmx-scraper.jar
```

## 追加リソース {#additional-resources}

- [JMX Scraper ドキュメント](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper) - 完全な設定リファレンスと例
- [JMX Scraper 移行ガイド](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#migrating-from-jmx-metric-gatherer) - 非推奨となった JMX Metric Gatherer からの移行
- [JMX メトリクス（Java エージェント）](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/README.md) - Java エージェントの JMX メトリクスドキュメント
- [定義済みターゲットシステム](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#predefined-metric-sets) - 人気のあるフレームワーク向けの組み込みメトリクスセット
- [Java エージェントドキュメント](/docs/zero-code/java/agent/) - 一般的な Java エージェントの設定
- [設定ガイド](../configuration/) - OpenTelemetry SDK 設定オプション

## 関連トピック {#related-topics}

- [計装エコシステム](../instrumentation/) - その他の計装オプション
- [シム](../instrumentation/#shims) - 他のオブザーバビリティライブラリのブリッジ
- [メトリクス API](../api/#meterprovider) - カスタムメトリクスの作成
