---
title: OpenTelemetry Java メトリクスのパフォーマンス比較
linkTitle: Java メトリクスシステムの比較
date: 2024-05-24
author: '[Jack Berg](https://github.com/jack-berg) (New Relic)'
default_lang_commit: ab725471f2b3eab8eef931273b18cb45c6889c34
cSpell:ignore: Asaf dropwizard Mesika Sonoma
---

OpenTelemetry の最大の価値提案は、言語に依存しない汎用的なオブザーバビリティ標準を目指していることでしょう。
トレース、メトリクス、ログ（そしてまもなくプロファイリングも！）のためのツールと、多くの主要言語での実装を提供することで、OpenTelemetry はポリグロットなチームの認知的負荷を軽減し、ひとつの語彙とひとつのツールキットを提供します。

それはすべて事実ですが、今回は特定のシグナルと言語にフォーカスし、[OpenTelemetry Java][] メトリクス SDK のパフォーマンスについてお話ししたいと思います。

## メトリクス入門 {#metrics-primer}

メトリクスは多義語ですが、オブザーバビリティの分野では、多数の個別の計測値を集約するためにメトリクスを使用します。
すべての個別の計測値をエクスポートする場合と比較して、集約結果をエクスポートするとデータ量の面ではるかにコンパクトなフットプリントになります。
ただし、集約プロセスで根本的に情報が失われるため、一部の分析形式を諦めざるを得ません。

パフォーマンスの観点からは、計測値の記録に必要な CPU / メモリは、メトリクスシステムの重要な特性です。
数百万または数十億の計測値を記録する可能性があるからです。
さらに、集約されたメトリクスをプロセス外にエクスポートするための CPU / メモリも重要です。
エクスポートは定期的に行われ、アプリケーションの「ホットパス」上にはありませんが、リソースを消費するため、パフォーマンスに断続的な影響を引き起こす可能性があります。

### 例 {#an-example}

以降のテキストで参照できる例を紹介しましょう。
OpenTelemetry で最も有用なメトリクスの1つは [`http.server.request.duration`](/docs/specs/semconv/http/http-metrics/#metric-httpserverrequestduration) です。
これは HTTP サーバーが処理した各リクエストの応答レイテンシーの計測値を記録し、ヒストグラムに集約します。
各計測値にはさまざまな属性（ラベル、タグ、ディメンションとも呼ばれます）が関連付けられていますが、簡略化のために `http.request.method`、`http.route`、`http.response.status_code` に注目します。
詳細は [HTTP セマンティック規約](/docs/specs/semconv/http/http-metrics/)を参照してください。
これにより、スループット、平均応答時間、最小・最大応答時間、パーセンタイル応答時間（p95、p99 など）を、HTTP メソッド、ルート、レスポンスステータスコードなどで分類して計算できます。

このメトリクスに計測値を記録するには、HTTP サーバーが受信する各リクエストに対して以下を行います。

- リクエストのライフサイクルのできるだけ早い段階で開始時刻を記録します（遅延するとメトリクスの精度が低下します）。
- リクエストを処理し、レスポンスを返します。
- レスポンスが返された直後に、最初に記録した開始時刻と現在時刻の差分を記録します。
  この持続時間がリクエストレイテンシーです。
- リクエストコンテキストから `http.request.method`、`http.route`、`http.response.status_code` の属性キーの値を抽出します。
- 計算されたリクエストレイテンシーと属性で構成される計測値を `http.server.request.duration` ヒストグラム計装に記録します。

メトリクスシステムは、これらの計測値を、遭遇した属性キーと値の組み合わせ（`http.request.method`、`http.route`、`http.response.status_code`）ごとに個別の系列に集約します。
定期的に、メトリクスが収集されプロセス外にエクスポートされます。
このエクスポートプロセスは、アプリケーションが一定間隔でメトリクスをどこかにプッシュする「プッシュベース」の場合と、他のプロセスが一定間隔でアプリケーションからメトリクスをプル（またはスクレイプ）する「プルベース」の場合があります。
OpenTelemetry では、OTLP が「プッシュベース」のプロトコルであるため、プッシュが推奨されます。

以下の操作を持つシンプルな HTTP サーバーがあるとします。

- `GET /users`
- `GET /users/{id}`
- `PUT /users/{id}`

これらは通常 200 OK の HTTP ステータスコードを返しますが、404 が返される可能性もあります（その他のエラーも同様です）。
`http.server.request.duration` ヒストグラムに計測値を記録する Java の擬似コードは次のようになります。

```java
// 計装を初期化
DoubleHistogram histogram = meterProvider.get("my-instrumentation-name")
    .histogramBuilder("http.server.request.duration")
    .setUnit("s")
    .setExplicitBucketBoundariesAdvice(Arrays.asList(1.0, 5.0, 10.0)) // ヒストグラムのバケット境界を関心のある閾値に設定
    .build();

// ... コードの別の場所で、処理した各 HTTP リクエストの計測値を記録
histogram.record(22.0, httpAttributes("GET", "/users", 200));
histogram.record(7.0, httpAttributes("GET", "/users/{id}", 200));
histogram.record(11.0, httpAttributes("GET", "/users/{id}", 200));
histogram.record(4.0, httpAttributes("GET", "/users/{id}", 200));
histogram.record(6.0, httpAttributes("GET", "/users/{id}", 404));
histogram.record(6.2, httpAttributes("PUT", "/users/{id}", 200));
histogram.record(7.2, httpAttributes("PUT", "/users/{id}", 200));

// ヘルパー定数
private static final AttributeKey<String> HTTP_REQUEST_METHOD = AttributeKey.stringKey("http.request.method");
private static final AttributeKey<String> HTTP_ROUTE = AttributeKey.stringKey("http.route");
private static final AttributeKey<String> HTTP_RESPONSE_STATUS_CODE = AttributeKey.stringKey("http.response.status_code");

// ヘルパー関数
private static Attributes httpAttributes(String method, String route, int responseStatusCode) {
  return Attributes.of(
    HTTP_REQUEST_METHOD, method,
    HTTP_ROUTE, route,
    HTTP_RESPONSE_STATUS_CODE, responseStatusCode);
}
```

エクスポートの際には、集約されたメトリクスがシリアライズされてプロセス外に送信されます。
この例では、出力メトリクスの簡単なテキストエンコーディングを示しています。
実際のアプリケーションでは、Prometheus のテキストフォーマットや [OTLP](/docs/specs/otlp/) など、使用するプロトコルで定義されたエンコーディングを使用します。

```text
2024-05-20T18:05:57Z: http.server.request.duration:
  attributes: {"http.request.method":"GET","http.route":"/users/{id}","http.response.status_code":200}
  value: {"count":3,"sum":22.0,"min":4.0,"max":11.0,"buckets":[[1.0,0],[5.0,1],[10.0,1]]}

  attributes: {"http.request.method":"GET","http.route":"/users/{id}","http.response.status_code":404}
  value: {"count":1,"sum":6.0,"min":6.0,"max":6.0,"buckets":[[1.0,0],[5.0,0],[10.0,1]]}

  attributes: {"http.request.method":"GET","http.route":"/users","http.response.status_code":200}
  value: {"count":1,"sum":22.0,"min":22.0,"max":22.0,"buckets":[[1.0,0],[5.0,0],[10.0,0]]}

  attributes: {"http.request.method":"PUT","http.route":"/users/{id}","http.response.status_code":200}
  value: {"count":2,"sum":13.4,"min":6.2,"max":7.2,"buckets":[[1.0,0],[5.0,0],[10.0,2]]}
```

`http.server.request.duration` メトリクスには4つの異なる系列があることに注目してください。
これは `http.request.method`、`http.route`、`http.response.status_code` の値の組み合わせが4つあるためです。
各系列には、カウント（合計数）、合計値、最小値、最大値、およびバケット境界とバケットカウントのペアの配列で構成されるヒストグラムがあります。

この例は些細なものですが、数百万または数十億の計測値の記録にスケールアウトすることを想像してみてください。
集約されたメトリクスのメモリおよびシリアライズのフットプリントは、異なる系列の数に比例し、記録された計測値の数に関係なく一定のままです。
**計測値の数からデータフットプリントを切り離すことが、メトリクスシステムの根本的な価値です。**

## 良いメトリクスシステムとは {#what-makes-a-metric-system-good}

メトリクスシステムは計測値を記録し、集約された状態をプロセス外に収集またはエクスポートします。
これら2つの操作を個別に見てみましょう。

**記録**側では、メトリクスシステムは以下を行う必要があります。

- 計測値の属性に基づいて、更新すべき適切な集約状態を見つけます。
  一部のシステムでは、API の呼び出し元が集約状態への直接参照を保持するハンドルをリクエストでき、検索は不要です。
  これらの参照は、特定の属性セットにバインドされているため、**バウンド計装**と呼ばれることがあります。
  多くの場合、属性値をアプリケーションコンテキストを使って計算する必要があるため、これは不可能です（たとえば、この例では HTTP リクエスト属性の値はリクエスト処理の結果に基づいて解決されます）。
  メトリクスシステムがバウンド計装をサポートしていない場合、または属性をアプリケーションコンテキストで計算する必要がある場合、メトリクスシステムは通常、計測値の属性に対応する系列をマップで検索する必要があります。
- 集約状態をアトミックに更新し、異なるスレッドで収集が行われた場合でも、部分的に更新された状態が読み取られることがないようにします。
- 記録は高速かつスレッドセーフでなければなりません。
  計測値はアプリケーションのホットパスで記録されることが想定されているため、記録にかかる時間はアプリケーションの SLA に直接影響します。
  複数のスレッドが同時に同じ属性で計測値を記録する可能性があるため、速度が正確性を犠牲にしないよう注意が必要であり、競合を軽減する必要があります。
- 記録はメモリを割り当てるべきではありません。
  記録は数百万または数十億回行われます。
  各記録がメモリを割り当てると、システムは GC チャーンにさらされ、アプリケーションのパフォーマンスに影響を与えます。
  メトリクスシステムが定常状態に達した後（つまり、すべての系列が計測値を受信した後）、計測値の記録はメモリ割り当てをゼロにすべきです。
  例外は、記録される属性が事前にわからず、記録時にアプリケーションコンテキストから計算する必要がある場合です。
  ただし、これらの割り当ては最小限であるべきであり、メトリクスシステム自体ではなくユーザーに帰属するものと言えるでしょう。

**収集またはエクスポート**側では、メトリクスシステムは以下を行う必要があります。

- すべての異なる系列（計測値を受信した異なる属性）を反復処理し、集約状態を読み取ります。
- 集約状態を何らかのプロトコルでエンコードして、プロセス外にエクスポートします。
  これは、他のプロセスが定期的にプルして読み取る Prometheus のテキストフォーマットの場合もあれば、定期的にプッシュされる OTLP のような場合もあります。
- 各系列の状態は、エクスポーターが常に増加する累積状態を必要とするか、各収集後にリセットされるデルタ状態を必要とするかによって、リセットが必要な場合があります。
- 収集は記録操作への影響を最小限にする必要があります。
  メトリクスの収集は、収集とは異なるスレッドでアトミックに更新される集約メトリクスの状態を読み取ることを意味します。
  一般的に、パフォーマンスの優先度としては収集は記録に劣ります。
  収集は、ホットパス上の記録操作をブロックする時間を最小限にするよう努めるべきです。
- 収集はメモリ割り当てを最小限にすべきです。
  収集時にいくつかの割り当ては避けられません（あるいは避けられるかも…続きを読んでみてください）が、本当に最小限にすべきです。
  そうでなければ、高いカーディナリティでメトリクスを記録するシステム（つまり、多数の異なる属性セットで計測値を記録するシステム）は、収集時のメモリチャーンにより高いメモリ割り当てとそれに続く GC が発生します。
  これはアプリケーションの SLA に影響する定期的なパフォーマンスのブリップを引き起こす可能性があります。

この例では、サーバーが応答する各 HTTP リクエストの持続時間を、そのリクエストを説明する属性セットとともに記録します。
属性に対応する系列を検索し（存在しない場合は新しい系列を作成し）、メモリに保持する状態（合計値、最小値、最大値、バケットカウント）をアトミックに更新します。
収集時には、4つの異なる系列それぞれの状態を読み取り、この簡単な例では情報の文字列エンコーディングを出力します。

## OpenTelemetry Java メトリクス {#opentelemetry-java-metrics}

OpenTelemetry Java プロジェクトは高性能なメトリクスシステムであり、記録側ではゼロ（または特定のケースでは低い）割り当て、収集側では非常に低い割り当てになるよう設計されています。

この例を見て、舞台裏で何が起こっているかを分析してみましょう。

```java
// 計測値を記録
histogram.record(7.2, httpAttributes("PUT", "/users/{id}", 200));

// ヘルパー定数
private static final AttributeKey<String> HTTP_REQUEST_METHOD = AttributeKey.stringKey("http.request.method");
private static final AttributeKey<String> HTTP_ROUTE = AttributeKey.stringKey("http.route");
private static final AttributeKey<String> HTTP_RESPONSE_STATUS_CODE = AttributeKey.stringKey("http.response.status_code");

// ヘルパー関数
private static Attributes httpAttributes(String method, String route, int responseStatusCode) {
  return Attributes.of(
    HTTP_REQUEST_METHOD, method,
    HTTP_ROUTE, route,
    HTTP_RESPONSE_STATUS_CODE, responseStatusCode);
```

ヒストグラム計装に計測値を記録するたびに、計測値と属性を引数として渡します。
この例では、各リクエストのアプリケーションコンテキストを使用して属性を計算していますが、すべての異なる属性セットが事前にわかっている場合は、事前に割り当てて定数の `Attributes` 変数に保持することができ、またそうすべきです。
これにより不要なメモリ割り当てが削減されます。
ただし、属性が事前にわからない場合でも、属性キーは事前にわかっています。
ここでは、属性に出現する各 `AttributeKey` の定数を事前に割り当てています。
OpenTelemetry Java の `Attributes` 実装は非常に効率的に実装されており、数年にわたってベンチマークと最適化が行われてきました。

内部的には、記録時に計測値の系列に対応する集約状態（OpenTelemetry Java の用語では `AggregatorHandle`）を検索する必要があります。
重い処理の大部分は `ConcurrentHashMap<Attributes, AggregatorHandle>` の検索によって行われますが、注目すべき詳細がいくつかあります。

- `AggregatorHandle` を取得するプロセスは、記録と同時に別のスレッドで収集が行われている場合でも、競合を減らすよう最適化されています。
  取得されるロックは ConcurrentHashMap 内のものだけであり、競合を減らすために複数のロックを使用しています。
  各検索時の CPU サイクルを節約するために `Attributes` のハッシュコードをキャッシュしています。
- エクスポーターが `AggregationTemporality=delta` の場合、各 `AggregatorHandle` の状態は各収集後にリセットする必要があります。
  各エクスポートサイクルで新しい `AggregatorHandle` インスタンスを再割り当てすることを避けるために、オブジェクトプーリングが使用されています。
- サポートされている各[集約](/docs/specs/otel/metrics/sdk/#aggregation)に対して異なる `AggregatorHandle` 実装があります。
  これらの実装はすべて、可能な限りコンペアアンドスワップ、`LongAdder`、`Atomic*` などの低競合ツールを使用し、収集間で状態を保持するために使用されるデータ構造を再利用するよう最適化されています。
  指数ヒストグラムの実装は、`Math.log` の使用を避けるために低レベルのビットシフトを使用してバケットを計算します。
  ナノ秒単位の最適化が重要なのです！

収集時には、すべての計装を反復処理し、エクスポートに使用するプロトコルに従って各 `AggregatorHandle` の状態を読み取りシリアライズする必要があります。
過去1年ほどの間に、収集サイクルのメモリ割り当てを最適化するために大きな取り組みを行ってきました。
この最適化は、メトリクスの[エクスポーターが同時に呼び出されることはない](/docs/specs/otel/metrics/sdk/#exportbatch)という認識から生まれています。
定期的にメトリクスの状態を読み取ってエクスポーターにシリアライズのために送信し、次にメトリクスの状態を再度読み取る前にそのエクスポートが完了するまで待つことを保証すれば、メトリクスの状態をエクスポーターに渡すために使用されるすべてのデータ構造を安全に再利用できます。
もちろん、一部のメトリクスリーダー（Prometheus のメトリクスリーダーなど）はメトリクスの状態を並行して読み取る場合があります。
これらについては、最適化されたメモリ割り当てよりも安全性と正確性を優先します。

その結果、OpenTelemetry Java 固有の設定可能なオプションである `MemoryMode` が生まれました。
`MetricReaders`（またはそれに関連する `MetricExporter`）は、メトリクスの状態を並行して読み取るかどうかに基づいて、メモリモードを指定します。
現在、最適化されたメモリ動作（`MemoryMode.reusable_data` と呼んでいます）は[環境変数](/docs/languages/java/configuration/#properties-exporters)を通じてオプトインします。
将来的には、並行アクセスが必要なのは例外的なケースのみであるため、最適化されたメモリモードがデフォルトで有効になります。
メトリクスの状態を保持するオブジェクト（OpenTelemetry Java の用語では `MetricData`）が、収集サイクルにおけるメモリ割り当てのほぼすべてを占めることがわかっています。
これらを再利用することで（状態を保持するために使用される他の内部オブジェクトとともに）、**コアメトリクス SDK のメモリ割り当てを99%以上削減しました**。
詳細は[このブログ記事](https://medium.com/@asafmesika/optimizing-java-observability-opentelemetrys-new-memory-mode-reduces-memory-allocations-by-99-98-e0062eccdc3f)を参照してください。

次に、OTLP シリアライズのパフォーマンスに注目しました。
OTLP は [protobuf](https://protobuf.dev/) のバイナリシリアライズを使用してペイロードをエンコードします。
デフォルトの実装では、まず protobuf メッセージを表す生成されたクラスにデータを変換する必要があります。
これらのクラスと関連するシリアライズロジックには大きな依存関係（[com.google.protobuf:protobuf-java](https://mvnrepository.com/artifact/com.google.protobuf/protobuf-java/4.26.1) は 1.7MB）が必要であり、中間表現からの不要なメモリ割り当てが発生します。
数年前に、これらの問題を回避するために独自の OTLP シリアライズを手書きしましたが、まだ改善の余地がありました。
OTLP ペイロードの生成には、シリアライズする前にリクエストボディのサイズを知る必要があることがわかっています。
これにはシリアライズの実装がデータを2回反復処理する必要があります。
1回目はペイロードサイズの計算です。
2回目はシリアライズです。
その過程で、UTF-8 エンコーディングの計算やメモリ割り当てにつながる中間データの保存などを行う必要があります。
私たちは OTLP シリアライズを再設計し、可能な限りステートレスな方法でペイロードサイズの計算とシリアライズを行い、ステートレスにできない場合はデータ構造を再利用するようにしました。
[opentelemetry-java:1.38.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.38.0) で初めてリリースされたこの動作は、前述の同じ MemoryMode オプションを使用して設定でき、将来的にはデフォルトになります。
（注：シリアライズの最適化は、メトリクスに加えて OTLP トレースとログのシリアライズにも適用されます！）

## ベンチマーク: OpenTelemetry Java vs. Micrometer vs. Prometheus Java {#benchmark-opentelemetry-java-vs-micrometer-vs-prometheus-java}

OpenTelemetry Java では多くのパフォーマンスエンジニアリングを行ってきましたが、Java エコシステムの他の一般的なメトリクスシステムと比較するとどうでしょうか。
最も人気のある（[GitHub スター](https://star-history.com/#prometheus/client_java&open-telemetry/opentelemetry-java&micrometer-metrics/micrometer&Date)を参照）2つの Java メトリクスシステム、micrometer と prometheus と比較してみましょう。
[dropwizard metrics](https://github.com/dropwizard/metrics) も非常に人気がありますが、ディメンションがないため他のシステムとの比較が難しく、除外しました。

方法論、結果、結論を共有する前に、システム間のベンチマーク比較の課題について、いくつかの注意点を述べます。

- **標準的な語彙がありません。** OpenTelemetry の属性は、micrometer ではタグ、prometheus ではラベルと呼ばれます。
  micrometer と prometheus にはレジストリの概念がありますが、OpenTelemetry にはメトリクスリーダーとメトリクスエクスポーターがあります。
  私は OpenTelemetry プロジェクトのメンバーであるため、用語が競合する場合は OpenTelemetry の用語を使用します。
- **完璧に同条件の比較ができるとは限りません。** OpenTelemetry の指数ヒストグラムに対応する micrometer のアナログはありません。
  OpenTelemetry はバウンド計装をサポートしていませんが、micrometer と prometheus はこれに大きく依存しています。
  prometheus と micrometer は OTLP をサポートしていますが、OpenTelemetry は OTLP のために構築されており、いくつかの利点があります。
- **何を比較するかの判断。** これらのシステムでは多くの異なることが可能です。
  どの側面が最も重要かについて、私自身の主観的な理由を用いて、ベンチマーク対象をかなり選択的に決めました。
  それでも、精査すべき生データは大量にあります。
  結果には、データを理解しやすくするための集約されたビジュアルエイドが含まれています。
- **すべてのシステムの専門家ではありません。** OpenTelemetry Java のメンテナーとして、設定方法と使用方法については知り尽くしています。
  micrometer と prometheus はドキュメントに記載されているとおりに使用していますが、パワーユーザーが知っているような設定や使用方法の最適化を見落としている可能性があります。
  知らないことは知ることができません。

### 方法論 {#methodology}

方法論の説明とデータの解釈方法について述べます。

- これらのベンチマークをサポートするコードは [github.com/jack-berg/metric-system-benchmarks](https://github.com/jack-berg/metric-system-benchmarks) にあり、[生の結果データは Google スプレッドシート](https://docs.google.com/spreadsheets/d/1I2ACFAgzWaa1H5EQx99-rLTro2FHlS44gsWuQsU8Ssw/edit#gid=191407209)として利用できます。
- ベンチマークは、MacBook Pro（M1 Max、64GB RAM、Sonoma 14.3.1）のローカルマシンで実行しました。
- システムの主要な側面を比較するために、3つの異なるベンチマークがあります。
  - 記録: 計測値の記録に必要な CPU 時間とメモリ割り当てを比較します。
  - 収集: メモリ内のメトリクス状態の読み取りに必要なメモリ割り当てを比較します（エクスポートなし）。
  - 収集とエクスポート: メトリクス状態の読み取りと OTLP レシーバーへのプッシュに必要なメモリ割り当てを比較します。
- 各ベンチマークでは、さまざまなシナリオが評価されます。
  - 異なる計装の比較: カウンター、明示的バケットヒストグラム（OpenTelemetry のデフォルトバケット境界を使用）、および指数バケットヒストグラムです。
    micrometer は指数バケットヒストグラムをサポートしていません。
  - 100の異なる属性セットに対応する系列に対して記録・収集を行います。
    各属性セットにはランダムな26文字の値を持つ単一のキーバリューペアがあります。
    これは、属性の内容よりもカーディナリティの方が重要であるという私の直感を反映しています。
  - 属性が事前にわかっている場合（結果では「Attributes Known」）とわかっていない場合（チャートでは「Attributes Unknown」）のシナリオを比較し、アプリケーションがアプリケーションコンテキストを使用して属性を計算する必要があるかどうかを反映します。
    属性が事前にわかっている場合、サポートされていればバウンド計装を取得します。OpenTelemetry はバウンド計装をサポートしていませんが、micrometer と prometheus はサポートしています。
    属性が事前にわかっていない場合は、記録時に属性を計算します。
  - 記録ベンチマークをシングルスレッドとマルチスレッドの両方のシナリオで実行します。
    簡潔にするため、以下ではシングルスレッドの結果のみを示します。
    マルチスレッドのテストでは、ボトルネックがメトリクスシステムの実装の決定から離れるため、システム間の差異が消える傾向がありました。
- OpenTelemetry のシナリオでは、近い将来にデフォルトにする予定であるため、`MemoryMode=reusable_data` を有効にします。
  デフォルトではスパンが記録されている場合にのみ exemplar を記録するため、メトリクスシステムの比較を分離するために exemplar を無効にします。
- ベンチマークの実行には [JMH](https://github.com/openjdk/jmh) を使用します。
  誤った CPU やメモリ割り当てに対して分離するようにベンチマークを設定します。
  たとえば、収集ベンチマークではすべての計測値を事前に記録し、純粋に収集プロセスを評価するようにしています。
- 結果は計装タイプごとにグラフを分けています。
  記録操作は1つのグラフ系列で示されます。
  収集とエクスポート付き収集の結果は別のグラフ系列で示されます。

### 結果 {#results}

以下のグラフは、記録ベンチマークの結果をまとめたものです。

![カウンターへの記録ベンチマーク結果](record-counter.png)

**図 1:** カウンターへの記録ベンチマーク結果。

![明示的バケットヒストグラムへの記録ベンチマーク結果](record-explicit-histogram.png)

**図 2:** 明示的バケットヒストグラムへの記録ベンチマーク結果。

![指数バケットヒストグラムへの記録ベンチマーク結果](record-expo-histogram.png)

**図 3:** 指数バケットヒストグラムへの記録ベンチマーク結果。

以下のグラフは、収集およびエクスポート付き収集ベンチマークの結果をまとめたものです。

![カウンターからの収集ベンチマーク結果](collect-counter.png)

**図 4:** カウンターからの収集ベンチマーク結果。

![明示的バケットヒストグラムからの収集ベンチマーク結果](collect-explicit-histogram.png)

**図 5:** 明示的バケットヒストグラムの収集ベンチマーク結果。

![指数バケットヒストグラムからの収集ベンチマーク結果](collect-expo-histogram.png)

**図 6:** 指数バケットヒストグラムの収集ベンチマーク結果。

### 結論 {#conclusions}

記録側では、属性が事前にわかっている場合、micrometer と prometheus はカウンターにおいて 11ns のアドバンテージがあります。
バウンド計装を使用して集約状態への直接参照を取得し、マップ検索を回避しているためです（OpenTelemetry ではサポートされていません）。
それにもかかわらず、OpenTelemetry は明示的バケットヒストグラムにおいて 32ns のアドバンテージがあります。
これは、micrometer と prometheus が OpenTelemetry ヒストグラムの合計値、最小値、最大値、バケットカウントよりも多くのサマリー値を計算しようとしていることが原因と考えられます。
属性が事前にわかっていない場合、このアドバンテージは縮小します。

属性値が事前にわかっている場合、どのシステムも記録時にメモリを割り当てません。
これは素晴らしいことであり、本格的なメトリクスシステムにとっては最低限の要件であるべきです。
属性値が事前にわかっていない場合（つまり、アプリケーションコンテキストから計算される場合）、OpenTelemetry は prometheus や micrometer よりも一貫してメモリ割り当てが少なくなっています。
OpenTelemetry は明らかにこのシナリオに最適化されていますが、micrometer と prometheus は属性値が事前にわかっていることとバウンド計装に重点を置いています。
多くの場合、属性値は事前にわからないと私は主張します。
これにより micrometer や prometheus のアドバンテージは限定的になります。
それでもなお、これは OpenTelemetry の改善の余地がある領域です。

収集側では、OpenTelemetry が非常に低いメモリ割り当てで際立っています。
エクスポートなしの収集では、OpenTelemetry は micrometer と prometheus よりも 22%〜99.7% 少ないメモリ割り当てです。
OTLP 経由での収集とエクスポートでは、OpenTelemetry は micrometer と prometheus よりも 85%〜98.4% 少ないメモリ割り当てです。
prometheus は直接 OpenTelemetry の OTLP エクスポーターライブラリを使用していますが、OpenTelemetry が垂直統合（エクスポーターとコアメトリクスシステムが協力して最適な結果を達成）によって実現できる最適化なしでの使用であることに注意してください。
micrometer の OTLP サポートは、メモリ内の micrometer 表現を生成された Java クラスに変換してからシリアライズするため、便利ですがパフォーマンスの観点からは最適ではありません。

全体として、これらは3つの本格的なメトリクスシステムです。
いずれも記録側では立派なパフォーマンスを発揮しています。
これは、すべてのシステムに注がれたパフォーマンスエンジニアリングの証です。
長期にわたる一連の最適化を終えた後、OpenTelemetry は収集側で輝いています。
その低い割り当ては、すべてのアプリケーションに恩恵をもたらしますが、高いカーディナリティと厳格なパフォーマンス SLA を持つアプリケーションにとって特に重要です。

この記事を読んで Java メトリクスシステムを検討されている方は、[OpenTelemetry Java][] を選んでいただければ幸いです。
単体でも強力で高性能なツールですが、他の主要なオブザーバビリティシグナルのための API、[豊富な計装エコシステム](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/9b99a549b7e1f4b180625a2771706d7170a7e949/docs/supported-libraries.md?from_branch=main)、[さまざまな他の言語での実装](/docs/languages/)、そして十分にサポートされた[オープンガバナンス構造](https://github.com/open-telemetry/community)を備えています。

## 謝辞 {#acknowledgements}

ここまで到達するのを助けてくれたすべての [opentelemetry-java コントリビューター](https://github.com/open-telemetry/opentelemetry-java/graphs/contributors)に感謝します。
特に、現在および過去の[メンテナーと承認者](https://github.com/open-telemetry/opentelemetry-java?tab=readme-ov-file#contributing)に感謝します。
常に高い基準を求め続けてくれた [Asaf Mesika](https://github.com/asafm) に特別な感謝を送ります。

[OpenTelemetry Java]: /docs/languages/java/
