---
title: OpenTelemetry で Apache Kafka クライアントを計装する
linkTitle: Apache Kafka クライアントの計装
date: 2022-09-06
author: '[Paolo Patierno](https://github.com/ppatierno)'
default_lang_commit: 693603b4ddda1532e0d550b03fb84797ba098491
cSpell:ignore: Paolo Patierno
---

今日、[Apache Kafka](https://kafka.apache.org/) は分散環境における神経系として選ばれています。
さまざまなサービスが Apache Kafka をメッセージングシステムとして、さらにはイベントストリーミングやデータストリーミングプラットフォームとして利用し、互いに通信しています。

クラウドネイティブなアプローチでマイクロサービスを開発する場合、ワークロードの実行には [Kubernetes](https://kubernetes.io/) もよく使われます。
このシナリオでは、[Strimzi](https://strimzi.io/) のようなプロジェクトを使用することで、Kubernetes 上に Apache Kafka クラスターを簡単にデプロイし管理できます。
Strimzi が Kafka インフラストラクチャ全体を管理してくれるため、開発者はそれを利用するアプリケーションの開発に集中できます。

全体像を見ると、分散という性質上、メッセージがどのように移動しているかを追跡するのは非常に困難です。
ここで OpenTelemetry の出番です。
OpenTelemetry は、メッセージングベースのアプリケーションにトレーシングを追加するための計装ライブラリを複数提供しています。
もちろん、Apache Kafka クライアント用のライブラリもあります。
また、[メッセージングシステム](/docs/specs/semconv/messaging/messaging-spans/)のセマンティック規約の仕様も定義しています。

しかし通常、アーキテクチャはさらに複雑になることがあります。
たとえば、Apache Kafka クラスターに直接接続できず、Kafka 固有のプロトコルではなく HTTP のような別のプロトコルを使用するアプリケーションがある場合です。
このケースでは、HTTP を介して Apache Kafka を経由するメッセージの生成と消費をトレースするのは本当に複雑です。
Strimzi プロジェクトは、対応する計装ライブラリを使用してトレーシングデータを追加するための OpenTelemetry 対応ブリッジを提供しています。

この記事では、Apache Kafka ベースのクライアントアプリケーションでトレーシングを有効にするさまざまな方法を学びます。
ここでは Java ベースの計装を参照します。
すべてのサンプルは、この[リポジトリ](https://github.com/ppatierno/kafka-opentelemetry)でも確認できます。

## Kafka クライアントでトレーシングを有効にする {#enable-tracing-on-the-kafka-clients}

Kafka クライアント API を使用してメッセージの生成と消費を行うアプリケーションがあると仮定しましょう。
シナリオを簡単にするために、ビジネスロジック内に追加のトレーシング情報を加える必要はないとします。
Kafka 関連の部分にのみトレーシングを追加することに関心があり、Kafka クライアントを介してメッセージがどのように生成・消費されるかをトレースしたいとします。

そのためには、2つの方法があります。

- アプリケーションと並行して実行される外部エージェントを使用してトレーシングを追加する。
- アプリケーションが使用する Kafka クライアントで直接トレーシングを有効にする。

前者は、アプリケーションにまったく手を加えない「自動」アプローチです。
アプリケーションと並行して実行されるエージェントが、送受信されるメッセージをインターセプトし、トレーシング情報を追加します。

後者は、アプリケーションを直接計装する「手動」アプローチです。
プロジェクトに特定の依存関係を追加し、コードを変更する必要があります。

## エージェントを使用した計装 {#instrumenting-by-using-the-agent}

より簡単で自動的なアプローチは、アプリケーションコードに変更や追加を加えずにトレーシングを追加する方法です。
OpenTelemetry 固有のライブラリへの依存関係を追加する必要もありません。
[opentelemetry-java-instrumentation/releases](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases) からダウンロードできる OpenTelemetry エージェントを使用することで実現できます。
このエージェントは、Kafka クラスターとの間で送受信されるメッセージにトレーシングロジックを注入するために、アプリケーションと並行して実行する必要があります。

以下のようにプロデューサーアプリケーションを実行します。

```shell
java -javaagent:path/to/opentelemetry-javaagent.jar \
      -Dotel.service.name=my-kafka-service \
      -Dotel.traces.exporter=jaeger \
      -Dotel.metrics.exporter=none \
      -jar kafka-producer-agent/target/kafka-producer-agent-1.0-SNAPSHOT-jar-with-dependencies.jar
```

同様にコンシューマーアプリケーションを実行します。

```shell
java -javaagent:path/to/opentelemetry-javaagent.jar \
      -Dotel.service.name=my-kafka-service \
      -Dotel.traces.exporter=jaeger \
      -Dotel.metrics.exporter=none \
      -Dotel.instrumentation.messaging.experimental.receive-telemetry.enabled=true \
      -jar kafka-consumer-agent/target/kafka-consumer-agent-1.0-SNAPSHOT-jar-with-dependencies.jar
```

エージェントは、後述する自動設定 SDK エクステンションを活用し、システムプロパティを通じて主要なパラメーターを設定します。

## Apache Kafka クライアントの計装 {#instrumenting-the-apache-kafka-clients}

OpenTelemetry プロジェクトは、Kafka クライアントのトレーシング計装を提供する `opentelemetry-kafka-clients-2.6` モジュールを提供しています。
まず、対応する依存関係をアプリケーションに追加する必要があります。

```xml
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-kafka-clients-2.6</artifactId>
</dependency>
```

トレーシング情報のエクスポートに使用するエクスポーターに応じて、対応する依存関係も追加する必要があります。
たとえば、Jaeger エクスポーターを使用する場合、依存関係は以下のとおりです。

```xml
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-jaeger</artifactId>
</dependency>
```

これにより、Kafka ベースのアプリケーションでトレーシングを有効にするための最小限のセットアップが整います。

### OpenTelemetry インスタンスのセットアップ {#setting-up-the-opentelemetry-instance}

トレーシング計装全体は、コード内の `OpenTelemetry` インスタンスによって処理されます。
このインスタンスを作成し、グローバルに登録することで、Kafka クライアント計装ライブラリから利用可能にする必要があります。

これは2つの方法で行えます。

- 環境ベースの自動設定用 SDK エクステンションを使用する。
- SDK ビルダークラスを使用してプログラム的に設定する。

#### SDK 自動設定の使用 {#using-the-sdk-autoconfiguration}

自動設定用の SDK エクステンションによって、環境変数を使用してグローバルな `OpenTelemetry` インスタンスを設定できます。
以下の依存関係をアプリケーションに追加することで有効になります。

```xml
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-sdk-extension-autoconfigure</artifactId>
</dependency>
```

Kafka クライアント計装ライブラリが使用されると、`OpenTelemetry` インスタンスがすでに作成・登録されているかを確認します。
されていない場合、ライブラリコードは SDK 自動設定モジュールがクラスパスにあるかを確認し、ある場合は `OpenTelemetry` インスタンスを自動的に作成するためにモジュールを初期化します。
対応する設定は環境変数（または対応するシステムプロパティ）を通じて行われます。
これはトレーシングの初期化を簡素化する方法です。

設定すべき主な環境変数は以下のとおりです。

- `OTEL_SERVICE_NAME`: 論理的なサービス名を指定します。
  トレーシング UI（たとえば Jaeger UI）でデータを表示する際に非常に便利であり、設定することが推奨されます。
- `OTEL_TRACES_EXPORTER`: トレーシングに使用するエクスポーターのリスト。
  たとえば、`jaeger` を使用する場合、アプリケーションに対応する依存関係も必要です。

上記の環境変数のかわりに、対応するシステムプロパティをコード内でプログラム的に設定するか、アプリケーション起動時のコマンドラインで設定することもできます。
それらは `otel.service.name` と `otel.traces.exporter` です。

#### SDK ビルダーの使用 {#using-the-sdk-builders}

自動設定に頼らず独自の `OpenTelemetry` インスタンスを構築するには、SDK ビルダークラスを使用してプログラム的に行えます。
コード内でそのような SDK ビルダーを利用するには、OpenTelemetry SDK の依存関係が必要です。

```xml
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-sdk</artifactId>
</dependency>
```

以下のコードスニペットでは、サービス名などの主要な属性を設定し、次に Jaeger エクスポーターを設定します。
最後に、`OpenTelemetry` インスタンスを作成し、Kafka クライアント計装ライブラリから使用できるようにグローバルに登録します。

```java
Resource resource = Resource.getDefault()
        .merge(Resource.create(Attributes.of(ResourceAttributes.SERVICE_NAME, "my-kafka-service")));

SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
        .addSpanProcessor(BatchSpanProcessor.builder(JaegerGrpcSpanExporter.builder().build()).build())
        .setSampler(Sampler.alwaysOn())
        .setResource(resource)
        .build();

OpenTelemetry openTelemetry = OpenTelemetrySdk.builder()
        .setTracerProvider(sdkTracerProvider)
        .setPropagators(ContextPropagators.create(W3CTraceContextPropagator.getInstance()))
        .buildAndRegisterGlobal();
```

### インターセプターの使用 {#using-the-interceptors}

Kafka クライアント API は、メッセージがブローカーに送信される前やブローカーから受信されたメッセージがアプリケーションに渡される前に、メッセージを「インターセプト」する方法を提供します。
このアプローチは、メッセージが送信される直前にロジックやコンテンツを追加する必要がある場合に多用されます。
同時に、消費されたメッセージが上位のアプリケーション層に渡される前に処理するのにも便利です。
メッセージの送受信時にスパンを作成またはクローズする必要があるトレーシングにうまく適合します。

Kafka クライアント計装ライブラリは、トレーシング情報を自動的に追加するために設定する2つのインターセプターを提供します。
インターセプタークラスは、アプリケーション内で Kafka クライアントを作成する際に使用するプロパティバッグに設定する必要があります。

プロデューサーには `TracingProducerInterceptor` を使用して、メッセージが送信されるたびに自動的に「send」スパンを作成します。

```java
props.setProperty(ProducerConfig.INTERCEPTOR_CLASSES_CONFIG, TracingProducerInterceptor.class.getName());
```

コンシューマーには `TracingConsumerInterceptor` を使用して、メッセージが受信されるたびに自動的に「receive」スパンを作成します。

```java
props.setProperty(ConsumerConfig.INTERCEPTOR_CLASSES_CONFIG, TracingConsumerInterceptor.class.getName());
```

### クライアントのラッピング {#wrapping-the-clients}

もう1つの方法は、Kafka クライアントをトレーシング対応のクライアントでラップすることです。

プロデューサー側では、`Producer<K, V>` インスタンスがある場合、以下のようにラップできます。

```java
KafkaTelemetry telemetry = KafkaTelemetry.create(GlobalOpenTelemetry.get());
Producer<String, String> tracingProducer = telemetry.wrap(producer);
```

その後、`tracingProducer` を通常どおり使用して、Kafka クラスターにメッセージを送信します。

コンシューマー側では、`Consumer<K, V>` インスタンスがある場合、以下のようにラップできます。

```java
KafkaTelemetry telemetry = KafkaTelemetry.create(GlobalOpenTelemetry.get());
Consumer<String, String> tracingConsumer = telemetry.wrap(this.consumer);
```

その後、`tracingConsumer` を通常どおり使用して、Kafka クラスターからメッセージを受信します。

## 計装の実行 {#instrumentation-in-action}

提供されているサンプルを使って Kafka クライアントの計装を実践するには、まず Apache Kafka クラスターが必要です。
最も簡単な方法は、[公式ウェブサイト](https://kafka.apache.org/downloads)からダウンロードし、1つの ZooKeeper ノードと1つの Kafka ブローカーを実行することです。
[クイックスタート](https://kafka.apache.org/documentation/#quickstart)に従えば、数分でクラスターを起動できます。
トレーシング情報の分析には、Web UI を使用するとより簡単です。
たとえば、Jaeger が提供する UI があります。
この場合も[公式ウェブサイト](https://www.jaegertracing.io/download/)からダウンロードしてローカルで実行するのは非常に簡単です。

環境の準備ができたら、最初の試みとして、インターセプターまたはラッパーを使用して計装されたプロデューサーとコンシューマーアプリケーションを実行します。
1つのメッセージを送信して消費するだけで、以下のようなトレーシング情報が得られます。

![send と receive のスパン](send-receive-spans.png)

ご覧のとおり、「send」と「receive」のスパンは同じトレース内にあり、「receive」スパンは「send」スパンの `CHILD_OF` として定義されています。
また、セマンティック規約により、スパンに `messaging.` 接頭辞を持つメッセージング関連の特定のタグが定義されていることがわかります。
send 操作は receive に依存しないため（これが `CHILD_OF` 関係の意味するところです）、このセマンティクスは実際には正しくありません。
しかし、この GitHub の[ディスカッション](https://github.com/open-telemetry/opentelemetry-specification/discussions/2695)と、この新しい [OTEP（OpenTelemetry Enhancement Proposal）](https://github.com/open-telemetry/oteps/pull/192)を通じて安定化される予定の新しいメッセージングセマンティック規約により、変更される予定です。
目標は、「send」と「receive」のスパンを2つの異なるトレースに配置し、`FOLLOW_FROM` 関係でリンクすることです。

このアプローチは、エージェントを使用した場合により反映されており、以下のように「send」スパンが独自のトレースに存在します。

![エージェントでの send スパン](send-span-agent.png)

受信側では、プロデューサーのスパンを参照する「receive」と「process」のスパンもあります。

![エージェントでの receive と process のスパン](receive-process-spans-agent.png)

## まとめ {#conclusion}

Apache Kafka は、分散システムにおけるマイクロサービス間の通信に使用できるメッセージングプラットフォームの1つです。
メッセージがどのように交換されているかを監視し、問題をトラブルシュートすることは非常に複雑です。
ここで OpenTelemetry プロジェクトの出番であり、トレーシングを手元に届けてくれます。
この記事では、Kafka クライアント計装ライブラリにより、Kafka ベースのアプリケーションにトレーシング情報を非常に簡単に追加できることを見てきました。
プロデューサーとコンシューマーの動作に関する詳細な情報を取得でき、各メッセージを端から端まで追跡できます。
では、あとは何でしょうか。ぜひ試してみてください！

## リファレンス {#references}

- [Apache Kafka](https://kafka.apache.org/)
- Strimzi
  - [ウェブサイト](https://strimzi.io/)
  - [GitHub](https://github.com/strimzi)
  - [ブリッジ](https://github.com/strimzi/strimzi-kafka-bridge)
- [Kubernetes](https://kubernetes.io/)
