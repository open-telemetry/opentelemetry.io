---
title: コンポーネント
description: OpenTelemetryを構成する主なコンポーネント
aliases: [data-collection]
weight: 20
default_lang_commit: 313e391
---

OpenTelemetryは現在、いくつかの主要コンポーネントで構成されています。

- [仕様](#specification)
- [コレクター](#collector)
- [言語固有のAPIとSDKの実装](#language-specific-api--sdk-implementations)
  - [計装ライブラリ](#instrumentation-libraries)
  - [エクスポーター](#exporters)
  - [ゼロコード計装](#zero-code-instrumentation)
  - [リソース検出器](#resource-detectors)
  - [サービス間プロパゲーター](#cross-service-propagators)
  - [サンプラー](#samplers)
- [Kubernetesオペレーター](#kubernetes-operator)
- [Function as a Serviceアセット](#function-as-a-service-assets)

OpenTelemetryは、テレメトリーデータの生成とエクスポートのためのベンダー固有のSDKとツールを置き換えられます。

## 仕様 {#specification}

仕様はすべての実装に対する言語横断的な要件と想定を記述しています。
用語の定義だけでなく、この仕様では以下のことが定義されています。

- **API:** トレース、メトリクス、およびロギングデータを生成および相関させるためのデータ型と操作を定義します。
- **SDK:** 言語固有のAPI実装の要件を定義します。設定、データ処理、エクスポートの概念もここで定義されます。
- **データ:** OpenTelemetryプロトコル（OTLP）と、テレメトリーバックエンドがサポートできるベンダー非依存のセマンティック規約を定義します。

詳細は、[仕様](/docs/specs/)のページを参照してください。

## コレクター {#collector}

OpenTelemetryコレクターは、テレメトリーデータを受信、処理、エクスポートできる、ベンダー非依存のプロキシーです。
複数のフォーマット（たとえば、OTLP、Jaeger、Prometheus、および多くの商用/独自ツール）でテレメトリーデータを受信し、1つ以上のバックエンドにデータを送信します。
また、テレメトリーデータをエクスポートする前の処理やフィルタリングもサポートします。

詳細は、[コレクター](/docs/collector/)のページを参照してください。

## 言語固有のAPIとSDKの実装 {#language-specific-api--sdk-implementations}

OpenTelemetryには言語SDKもあります。このSDKによってOpenTelemetryAPIを使って、選択した言語でテレメトリーデータを生成し、そのデータを好みのバックエンドにエクスポートできます。
これらのSDKはまた、あなたのアプリケーションでの手動計装に接続するために使える、一般的なライブラリとフレームワーク用の計装ライブラリも組み込めます。

詳細は、[計装](/docs/concepts/instrumentation/)のページを参照してください。

### 計装ライブラリ {#instrumentation-libraries}

OpenTelemetry は、サポートされている言語の一般的なライブラリやフレームワークから関連するテレメトリーデータを生成する、幅広い数のコンポーネントをサポートしています。
たとえば、HTTPライブラリからのインバウンドとアウトバウンドのHTTPリクエストは、それらのリクエストに関するデータを生成します。

OpenTelemetryの意欲的なゴールは、すべての一般的なライブラリがデフォルトでオブザーバビリティがあるようにビルドされることです。

詳細は、[計装ライブラリ](/docs/concepts/instrumentation/libraries/)のページを参照してください。

### エクスポーター {#exporters}

{{% ja/docs/languages/exporters/intro %}}

### ゼロコード計装 {#zero-code-instrumentation}

利用できる場合、OpenTelemetryの言語固有の実装は、ソースコードに触れることなくアプリケーションを計装する方法を提供します。
基礎となる仕組みは言語に依存しますが、ゼロコード計装は、アプリケーションにOpenTelemetry API と SDK の機能を追加します。
さらに、計装ライブラリのセットとエクスポーターの依存関係を追加するかもしれません。

詳細は、[ゼロコード計装](/docs/concepts/instrumentation/zero-code/)のページを参照してください。

### リソース検出器 {#resource-detectors}

[リソース](/docs/concepts/resources/)はテレメトリーを生成するエンティティをリソース属性として表します。
たとえば、Kubernetes上のコンテナで実行されているテレメトリーを生成するプロセスには、Pod名、名前空間、そして場合によってはデプロイメント名があります。
これらの属性をすべてリソースに含めることができます。

OpenTelemetry の言語固有の実装は、`OTEL_RESOURCE_ATTRIBUTES` 環境変数からのリソース検出と、プロセスのランタイム、サービス、ホスト、オペレーティングシステムのような多くの一般的なエンティティを提供します。

詳細は、[リソース](/docs/concepts/resources/)のページを参照してください。

### サービス間プロパゲーター {#cross-service-propagators}

伝搬は、サービスやプロセス間でデータを移動させる仕組みです。
トレースに限ったことではありませんが、伝搬により、プロセスやネットワークの境界を越えて任意に分散したサービス間で、トレースはシステムに関する因果情報を構築できます。

ほとんどのユースケースでは、コンテキスト伝搬は計装ライブラリを通じて行われます。
必要であれば、スパンのコンテキストや[バゲッジ](/docs/concepts/signals/baggage/)のような横断的な関心事をシリアライズおよびデシリアライズするために、プロパゲータを使用できます。

### サンプラー {#samplers}

サンプリングは、システムによって生成されるトレースの量を制限するプロセスです。
OpenTelemetryの各言語固有の実装は、いくつかの[ヘッドサンプラー](/docs/concepts/sampling/#head-sampling)を提供しています。

詳細は、[サンプリング](/docs/concepts/sampling)のページを参照してください。

## Kubernetesオペレーター {#kubernetes-operator}

OpenTelemetryオペレーターはKubernetesオペレーターの実装です。
オペレーターはOpenTelemetryコレクターを管理し、OpenTelemetryを使用してワークロードの自動計装を行います。

詳細は、[K8sオペレーター](/docs/kubernetes/operator/)のページを参照してください。

## Function as a Serviceアセット {#function-as-a-service-assets}

OpenTelemetryは、さまざまなクラウドベンダーが提供する Function-as-a-Service を監視するさまざまな方法をサポートしています。
OpenTelemetryコミュニティは、現在、アプリケーションを自動計装できるビルド済みのLambdaレイヤーと、アプリケーションを手動または自動で計装する際に使用できるスタンドアロンのコレクターLambdaレイヤーのオプションを提供しています。

詳細は、[Functions as a Service](/docs/faas/)のページを参照してください。
