---
title: 用語集
description: OpenTelemetry で使用されるテレメトリー用語の定義と規則
weight: 200
default_lang_commit: 530c8fd130c93dd95e9638c8919518dbbc9c6b0a
drifted_from_default: true
---

この用語集は、OpenTelemetry プロジェクトに対して新しい、用語と[概念](/docs/concepts/)を定義し、オブザーバビリティの分野で一般的に使われている OpenTelemetry 特有の使用法を明確にします。
また、役に立つように、スペルや大文字かについてもコメントしました。
たとえば、[OpenTelemetry](#opentelemetry) と [OTel](#otel) を参照してください。

## 用語 {#terms}

### 集約（集計、アグリゲーション） {#aggregation}

複数の測定値を組み合わせて、プログラム実行中のある時間間隔に行われた測定値に関する正確な統計値または推定統計値にするプロセス。
[メトリクス](#metric)の[データソース](#data-source) で使用されます。

### API {#api}

アプリケーション・プログラミング・インターフェース。
OpenTelemetryプロジェクトでは、[データソース](#data-source)ごとにどのようにテレメトリーデータを生成するかを定義するために使用されます。

### アプリケーション {#application}

エンドユーザーや他のアプリケーションのために設計された1つ以上の[サービス](#service)。

### APM {#apm}

アプリケーション・パフォーマンス・モニタリングは、ソフトウェアアプリケーション、そのパフォーマンス（スピード、信頼性、可用性など）を監視し、問題を検出し、根本原因を見つけるためのアラートとツールを提供することを指します。

### 属性（アトリビュート） {#attribute}

[メタデータ](#metadata)のOpenTelemetry用語。
テレメトリーを生成するエンティティにキーバリュー情報を追加します。
[シグナル](#signal)と[リソース](#resource) にまたがって使用されます。
[属性仕様][attribute]を参照のこと。

### 自動計装 {#automatic-instrumentation}

エンドユーザーがアプリケーションのソースコードを変更する必要のないテレメトリー収集方法を指します。
方法はプログラミング言語によって異なり、バイトコードインジェクションやモンキーパッチがその例です。

### バゲッジ {#baggage}

イベントとサービスの因果関係を確立するための[メタデータ](#metadata)を伝搬するメカニズム。
[バゲッジ仕様][baggage]を参照のこと。

### カーディナリティ {#cardinality}

特定の[属性](#attribute)または属性のセットに対する一意の値の数。
カーディナリティが高いということは、一意の値が多いことを意味しており、テレメトリーバックエンドのパフォーマンスやストレージ要件に影響を与える可能性があります。
たとえば、`user_id` 属性は高いカーディナリティを持ちますが、"200"、"404"、"500" などの値を持つ `status_code` 属性は低いカーディナリティを持ちます。

### クライアントライブラリ {#client-library}

[計装済みライブラリ](#instrumented-library).

### クライアントサイドアプリケーション

[アプリケーション](#application)のコンポーネントで、プライベートなインフラストラクチャ内で実行されておらず、通常エンドユーザーが直接使用するもの。
クライアントサイドアプリの例としては、ブラウザアプリ、モバイルアプリ、IoTデバイス上で動作するアプリなどがあります。

### コレクター {#collector}

[OpenTelemetry コレクター][OpenTelemetry Collector]または短くしてコレクターは、テレメトリーデータの受信、処理、エクスポート方法に関するベンダー非依存の実装です。
エージェントまたはゲートウェイとしてデプロイ可能な単一のバイナリです。

> OpenTelemetry コレクターを指す場合は、常に「コレクター」と大文字で記載してください。「コレクター」を形容詞として使用する場合（例：「コレクターの設定」）も、「コレクター」と記載してください（英語では大文字で Collector と書くことを示しているが、日本語の場合はコレクターと記述する）。

[OpenTelemetry Collector]: /docs/collector/

### Contrib {#contrib}

いくつかの[計装ライブラリ](#instrumentation-library)と[コレクター](#collector)はコア機能のセットと、ベンダーの `エクスポーター` を含む非コア機能専用のcontribリポジトリを提供しています。

<!-- prettier-ignore-start -->
### コンテキスト伝搬（プロパゲーション） {#context-propagation}
<!-- prettier-ignore-end -->

すべての[データソース](#data-source)が、[トランザクション](#transaction)の寿命にわたって状態を保存したりデータにアクセスしたりするための基盤となるコンテキストメカニズムを共有できるようにします。
[コンテキスト伝搬仕様][context propagation]を参照。

### DAG {#dag}

[有向非巡回グラフ（Directed Acyclic Graph）][dag]のこと。

### データソース {#data-source}

[シグナル](#signal)を参照のこと。

### 次元（ディメンション） {#dimension}

[メトリクス](#metric)で特に使われる用語。[属性](#attribute)を参照のこと。

### 分散トレース {#distributed-tracing}

[アプリケーション](#application)を構成する[サービス](#service)によって処理される、[トレース](#trace)と呼ばれる単一の[リクエスト](#request)の進行を追跡します。
[分散トレース](#distributed-tracing)は、プロセス、ネットワーク、セキュリティの境界を越えます。

[分散トレース][distributed tracing]を参照してください。

### ディストリビューション {#distribution}

ディストリビューションとは、アップストリームのOpenTelemetryリポジトリのラッパーで、いくつかのカスタマイズが施されています。
詳細は[ディストリビューション][Distributions]を参照してください。

### イベント {#event}

イベントは、イベント名とよく知られた構造の[ログレコード](#log-record)です。
たとえば、OpenTelemetry のブラウザイベントは、特有の命名規則に従い、共通の構造における特有のデータを運びます。

### エクスポーター {#exporter}

テレメトリーをコンシューマーに送信する機能を提供します。
エクスポーターはプッシュベースかプルベースのいずれかになります。

### フィールド {#field}

[ログレコード](#log-record)で特に使われる用語。
[メタデータ](#metadata)は、[属性](#attribute)や[リソース](#resource)などの定義されたフィールドを通して追加できます。
重大度やトレース情報など、他のフィールドも `Metadata` とみなされるかもしれません。
[フィールド仕様][field]を参照してください。

### gRPC {#grpc}

高性能でオープンソースのユニバーサル [RPC](#rpc) フレームワーク。
詳細は[gRPC](https://grpc.io)を参照してください。

### HTTP {#http}

[Hypertext Transfer Protocol（ハイパーテキスト・トランスファー・プロトコル）][http]の略。

### 計装済みライブラリ {#instrumented-library}

テレメトリーシグナル([トレース](#trace)、[メトリクス](#metric)、[ログ](#log))を収集する[ライブラリ](#library)を表します。
詳細は[計装済みライブラリ][Instrumented library]を参照してください。

### 計装ライブラリ {#instrumentation-library}

特定の[計装済みライブラリ](#instrumented-library)に計装を提供する[ライブラリ](#library)を表します。
[計装済みライブラリ](#instrumented-library)と[計装ライブラリ](#instrumentation-library)は、ビルトインのOpenTelemetry計装をしている場合、同一の[ライブラリ](#library)になります。
詳細は[ライブラリ仕様][spec-instrumentation-lib]を参照してください。

### JSON {#json}

[JavaScript Object Notation][json]の略。

### ラベル {#label}

[メトリクス](#metric)で特に使われる用語。
[メタデータ](#metadata)を参照。

### 言語 {#language}

プログラミング言語のこと。

### ライブラリ {#library}

インターフェイスによって呼び出される動作の言語固有のコレクション。

### ログ {#log}

[ログレコード](#log-record)の集まりを指すのに使われることもあります。
また、単一の[ログ記録](#log-record)を指すために[ログ](#log)を使うこともあるので、曖昧になる可能性があります。
曖昧になる可能性がある場合は、追加の修飾子、たとえば`ログレコード`を使用してください。
詳細は[ログ][log]を参照してください。

### ログレコード {#log-record}

タイムスタンプと重要度のデータの記録です。
トレースと関連があるとき、[トレース ID](#trace)と[スパン ID](#span)を持つ可能性があります。
詳細は[ログレコード][Log record]を参照してください。

### メタデータ {#metadata}

たとえば `foo="bar"` のようなキーと値のペアで、テレメトリーを生成するエンティティに追加されます。
OpenTelemetryはこれらのペアを[属性](#attribute)と呼びます。
また、[メトリクス](#metric)には[次元](#dimension)と[ラベル](#label)があり、[ログ](#log)には[フィールド](#field)があります。

### メトリクス {#metric}

生の測定値または事前定義された集計値のいずれかのデータポイントを、[メタデータ](#metadata)付きの時系列として記録します。
詳細は[メトリクス][metric]を参照してください。

### OC {#oc}

[OpenCensus](#opencensus)の略称。

### オブザーバビリティバックエンド {#observability-backend}

テレメトリーデータの受信、処理、保存、クエリを担うオブザーバビリティプラットフォームのコンポーネントです。
商用製品だけではなく、たとえば [Jaeger] や [Prometheus] のようなオープンソースツールも含みます。
OpenTelemetry はオブザーバビリティバックエンドではありません。

### オブザーバビリティフロントエンド {#observability-frontend}

テレメトリーデータの可視化と分析のためのユーザーインターフェースを提供するオブザーバビリティプラットフォームのコンポーネントです。
特に商用製品を検討すると、オブザーバビリティバックエンドの一部である場合がしばしばあります。

### OpAMP {#opamp}

[Open Agent Management Protocol](/docs/collector/management/#opamp) の省略形。

> **スペル** 説明または指示においては `OPAMP` や `opamp` でもなく OpAMP と書いてください。

### OpenCensus {#opencensus}

OpenTelemetry の前身です。詳細については、[歴史](/docs/what-is-opentelemetry/#history) を参照してください。

### OpenTelemetry {#opentelemetry}

OpenTelemetry は、[OpenTracing](#opentracing) と [OpenCensus](#opencensus) プロジェクトの[統合][merger]によって生まれました。
OpenTelemetry &mdash; 本サイトの主題である &mdash;は、[API](#api)、[SDK](#sdk)、および各種ツールの集合体であり、[計装](/docs/concepts/instrumentation/)を行い、[メトリクス](#metric)、[ログ](#log)、[トレース](#trace)などの[テレメトリーデータ](/docs/concepts/signals/)を生成、[収集](/docs/concepts/components/#collector)、および[エクスポート](/docs/concepts/components/#exporters)するために使用できます。

> **スペル** OpenTelemetry は常にハイフンなしの一語で記述し、例のように大文字で表記してください。

[merger]: /docs/what-is-opentelemetry/#history

### OpenTracing {#opentracing}

OpenTelemetry の前身です。
詳細については、[歴史](/docs/what-is-opentelemetry/#history)を参照してください。

### OT {#ot}

[OpenTracing](#opentracing)の略称。

### OTel {#otel}

[OpenTelemetry](/docs/what-is-opentelemetry/)の略称。

> **スペル** OTel と書いてください。`OTEL` ではありません。

### OTelCol {#otelcol}

[OpenTelemetryコレクター](#collector)の略称。

### OTEP {#otep}

[OpenTelemetry Enhancement Proposal] の頭字語。

> **Spelling**: "OTEPs" は複数形で記述してください。
> 説明で `OTep` または `otep` と書かないでください。

[OpenTelemetry Enhancement Proposal]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/README.md

### OTLP {#otlp}

[OpenTelemetryプロトコル](/docs/specs/otlp/)の略称。

### プロパゲーター {#propagators}

[スパン](#span)内のスパンコンテキストや[バゲッジ](#baggage)など、テレメトリーデータの特定の部分をシリアライズおよびデシリアライズするために使用します。
詳細は[プロパゲーター][Propagators]を参照してください。

### Proto {#proto}

言語に依存しないインターフェイス型。[opentelemetry-proto]を参照してください。

### レシーバー {#receiver}

[コレクター](/docs/collector/configuration/#receivers)が使用する用語で、テレメトリーデータの受信方法を定義します。
レシーバーはプッシュベースとプルベースがあります。
詳細は[レシーバー][Receiver]を参照してください。

### リクエスト {#request}

[分散トレース](#distributed-tracing)を参照のこと。

### リソース {#resource}

テレメトリーを生成するエンティティに関する情報を[属性](#attribute)として捕捉します。
たとえば、Kubernetes 上のコンテナで実行されているテレメトリーを生成するプロセスには、プロセス名、ポッド名、名前空間、そして場合によってはデプロイメント名があります。
これらすべての属性を `Resource` に含めることができます。

### REST {#rest}

[Representational State Transfer][rest]の略称。

### RPC {#rpc}

[Remote Procedure Call（リモートプロシージャーコール、遠隔手続き呼び出し）][rpc]の略称。

### サンプリング {#sampling}

エクスポートされるデータ量を制御するメカニズム。
[トレース](#trace) [データソース](#data-source) と共に使われるのが一般的です。
詳細は[サンプリング][Sampling]を参照してください。

### SDK {#sdk}

ソフトウェア開発キット（Software Development Kit）の略称。
OpenTelemetryの[API](#api)を実装する[ライブラリ](#library)を示すテレメトリーSDKを指します。

### セマンティック規約 {#semantic-conventions}

ベンダー非依存のテレメトリーデータを提供するために、[メタデータ](#metadata)の標準的な名前と値を定義します。

### サービス {#service}

[アプリケーション](#application)のコンポーネント。
[サービス](#service)の複数のインスタンスは、通常、高可用性とスケーラビリティのためにデプロイされます。
[サービス](#service)は複数の場所に配置できます。

### シグナル {#signal}

OpenTelemetryにおいては[トレース](#trace)、[メトリクス](#metric)、[ログ](#log)のいずれか。
詳細は[シグナル][Signals]を参照してください。

### スパン {#span}

[トレース](#trace)内の単一の操作を表します。
詳細は[スパン][Span]参照してください。

### スパンリンク {#span-link}

スパンリンクは、因果関係のあるスパン間のリンクです。
詳細は[スパン間のリンク](/docs/specs/otel/overview#links-between-spans)と[リンクの指定](/docs/specs/otel/trace/api#specifying-links)を参照してください。

### 仕様 {#specification}

すべての実装に対する言語横断的な要求と期待を記述しています。
詳細は[仕様][Specification]を参照してください。

### ステータス {#status}

操作の結果。
通常、エラーが発生したかどうかを示すために使用されます。
詳細は[ステータス][Status]を参照してください。

### タグ {#tag}

[メタデータ](#metadata)を参照のこと。

### トレース {#trace}

[スパン](#span)の[DAG](#dag)で、[スパン](#span)間のエッジ（辺）は親子関係として定義されます。
詳細は[トレース][Traces]を参照してください。

### トレーサー {#tracer}

[スパン](#span)の作成を担当します。
詳細は[トレーサー][Tracer]を参照してください。

### トランザクション {#transaction}

[分散トレース](#distributed-tracing)を参照のこと。

### zPages {#zpages}

外部エクスポーターにかわるプロセス内エクスポーター。
これを使うと、トレースとメトリクスの情報をバックグラウンドで収集し、集約できます。
詳細は[zPages]を参照してください。

[attribute]: /docs/specs/otel/common/#attributes
[baggage]: /docs/specs/otel/baggage/api/
[context propagation]: /docs/specs/otel/overview#context-propagation
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[distributed tracing]: ../signals/traces/
[distributions]: ../distributions/
[field]: /docs/specs/otel/logs/data-model#field-kinds
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[instrumented library]: /docs/specs/otel/glossary/#instrumented-library
[Jaeger]: https://www.jaegertracing.io/
[json]: https://en.wikipedia.org/wiki/JSON
[log record]: /docs/specs/otel/glossary#log-record
[log]: /docs/specs/otel/glossary#log
[metric]: ../signals/metrics/
[opentelemetry-proto]: https://github.com/open-telemetry/opentelemetry-proto
[propagators]: /docs/languages/go/instrumentation/#propagators-and-context
[Prometheus]: https://prometheus.io/
[receiver]: /docs/collector/configuration/#receivers
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rpc]: https://en.wikipedia.org/wiki/Remote_procedure_call
[sampling]: /docs/specs/otel/trace/sdk#sampling
[signals]: ../signals/
[span]: /docs/specs/otel/trace/api#span
[spec-instrumentation-lib]: /docs/specs/otel/glossary/#instrumentation-library
[specification]: ../components/#specification
[status]: /docs/specs/otel/trace/api#set-status
[tracer]: /docs/specs/otel/trace/api#tracer
[traces]: /docs/specs/otel/overview#traces
[zpages]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/development/trace/zpages.md
