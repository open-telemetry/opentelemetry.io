---
title: '指数ヒストグラム: 設定不要でより優れたデータを'
linkTitle: 指数ヒストグラム
date: 2022-08-24
author: '[Jack Berg](https://github.com/jack-berg)'
canonical_url: https://newrelic.com/blog/best-practices/opentelemetry-histograms
default_lang_commit: ee3ecff1cb77bdba7b752a4ba9b0808528147566
---

<!-- markdownlint-configure-file {"no-shortcut-ref-link": {"ignore_pattern": "^-?\\d+(,\\d+)+$"}} -->

ヒストグラムはオブザーバビリティツールベルトの中でも強力なツールです。
OpenTelemetry は、計測の分布を効率的に取得・送信し、[パーセンタイル](https://en.wikipedia.org/wiki/Percentile)のような統計的計算を可能にするヒストグラムの能力を重視し、サポートしています。

実際には、ヒストグラムにはいくつかの種類があり、それぞれバケットとバケットカウントの表現方法に独自の戦略を持っています。
OpenTelemetry の最初の安定版メトリクスリリースには明示的バケットヒストグラムが含まれており、現在は新しい指数バケットヒストグラムオプションが導入されています。
このエキサイティングな新しいフォーマットは、計測に合わせて自動的にバケットを調整し、ネットワーク上の送信もよりコンパクトです。
このブログ記事では、指数ヒストグラムの詳細を掘り下げ、その仕組み、解決する問題、そして今すぐ使い始める方法を説明します。

## OpenTelemetry におけるメトリクス入門 {#intro-to-metrics-in-opentelemetry}

指数バケットヒストグラムについて説明する前に、OpenTelemetry のメトリクスの一般的な概念を簡単におさらいしましょう。
すでに理解している方は、[ヒストグラムの構造](#anatomy-of-a-histogram)まで読み飛ばしてください。

メトリクスは多くの計測の集約を表します。
個々の計測をすべてエクスポートして分析するのは非常にコストがかかることが多いため、メトリクスを使用します。
毎秒100万件のリクエストに応答する HTTP サーバーで、各リクエストの所要時間をエクスポートするコストを想像してみてください！
メトリクスは計測を集約することで、データ量を削減しつつ意味のあるシグナルを保持します。

トレーシング（そして近い将来ログも）と同様に、OpenTelemetry のメトリクスは [API][] と [SDK][] に分かれています。
API はコードの計装に使用されます。
アプリケーションオーナーは API を使用して、自分のドメインに特化したカスタム計装を記述できますが、より一般的にはライブラリやフレームワーク向けのビルド済み計装をインストールします。
SDK は、API によって収集されたデータの処理方法を設定するために使用されます。
通常、これにはデータの処理とプロセス外へのエクスポートが含まれ、多くの場合オブザーバビリティプラットフォームへの分析のために行われます。

メトリクスの API エントリポイントは[メータープロバイダー][meter provider]です。
メータープロバイダーは、異なるスコープに対してメーターを提供します。
スコープとは、アプリケーションコードの論理的な単位のことです。
たとえば、HTTP クライアントライブラリの計装は、データベースクライアントライブラリの計装とは異なるスコープを持ち、したがって異なるメーターを使用します。
メーターを使用して計装を取得します。
計装を使用して計測を報告します。
計測は値と属性のセットで構成されます。
以下の Java コードスニペットでこのワークフローを示します。

```java
OpenTelemetry openTelemetry = // OpenTelemetry インスタンスを宣言
Meter meter = openTelemetry.getMeter("my-meter-scope");
DoubleHistogram histogram =
    meter
        .histogramBuilder("my-histogram")
        .setDescription("The description")
        .setUnit("ms")
        .build();
histogram.record(10.2, Attributes.builder().put("key", "value").build());
```

SDK は、メータープロバイダー、メーター、および計装の実装を提供します。
計装から報告された計測を集約し、アプリケーションの設定に従ってメトリクスとしてエクスポートします。

OpenTelemetry のメトリクスには現在6種類の[計装][instruments]があります。
カウンター、アップダウンカウンター、ヒストグラム、非同期カウンター、非同期アップダウンカウンター、非同期ゲージです。
どの計装タイプを選択するかは慎重に検討してください。
各タイプは、記録する計測の性質と分析方法についての特定の情報を暗示します。
たとえば、ものを数えたい場合や、個々の値よりもその合計のほうが重要な場合（ネットワーク上で送信されたバイト数の追跡など）には、カウンターを使用します。
計測の分布が分析に関連する場合はヒストグラムを使用します。
たとえば、HTTP サーバーのレスポンスタイムの追跡にはヒストグラムが自然な選択です。
レスポンスタイムの分布を分析して SLA の評価やトレンドの特定を行うのに役立つからです。
詳しくは、[計装の選択][instrument selection]のガイドラインを参照してください。

先ほど、SDK が計装からの計測を集約すると述べました。
各計装タイプには、計装タイプの選択によって暗示される計測の意図を反映した、デフォルトの集約戦略（または単に[集約][aggregation]）があります。
たとえば、カウンターとアップダウンカウンターは値の合計に集約されます。
ヒストグラムはヒストグラム集約に集約されます。
（ヒストグラムは[計装のタイプ][type of instrument]であると同時に[集約][histogram-aggregation]でもあることに注意してください。）

## ヒストグラムの構造 {#anatomy-of-a-histogram}

ヒストグラムとは何でしょうか。
OpenTelemetry のことはいったん置いておくと、ヒストグラムは誰もがある程度馴染みのあるものです。
ヒストグラムはバケットと、そのバケット内の出現回数で構成されます。

たとえば、ヒストグラムで2つの6面サイコロの合計で特定の数が出た回数を追跡できます。
2から12までの各出目に対して1つのバケットを設定します。
多数回振ると、合計7が出る確率が最も高いため7のバケットのカウントが最も多くなり、最も確率が低い2と12のバケットのカウントが最も少なくなることが期待されます。
以下のヒストグラムの例で示します。

![histogram outcomes 200 rolls two 6 sided dice](histogram-outcomes-200-rolls-two-6-sided-dice.webp)

OpenTelemetry には2種類のヒストグラムがあります。
まず、比較的シンプルな[明示的バケットヒストグラム][explicit bucket histogram]から始めましょう。
初期化時に明示的に定義された境界を持つバケットがあります。
たとえば、境界を _[0,5,10]_ で設定すると、_N+1_ 個のバケットが _(-∞, 0],(0,5],(5,10],(10,+∞]_ という境界で作成されます。
各バケットは、その境界内の値の出現回数を追跡します。
さらに、ヒストグラムはすべての値の合計、すべての値のカウント、最大値、最小値も追跡します。
完全な定義は [opentelemetry-proto][explicit bucket histogram proto] を参照してください。

2番目のタイプのヒストグラムについて説明する前に、このような構造のデータで答えられる質問について考えてみてください。
ヒストグラムを使用してリクエストへの応答にかかったミリ秒数を追跡していると仮定すると、以下のことが判断できます。

- リクエストの数。
- 最小、最大、および平均のリクエストレイテンシー。
- 特定のバケット境界未満のレイテンシーを持つリクエストの割合。
  たとえば、バケット境界が _[0,5,10]_ の場合、バケット _(-∞,0],(0,5],(5,10]_ のカウントの合計を取り、合計カウントで割ることで、10ミリ秒未満のリクエストの割合を求められます。
  リクエストの99%が10ミリ秒以内に解決されるという SLA がある場合、それを満たしているかどうかを判断できます。
- 分布を分析することによるパターンの発見。
  たとえば、ほとんどのリクエストは素早く解決されるが、少数のリクエストに長い時間がかかり、平均を下げていることがわかるかもしれません。

2番目のタイプの OpenTelemetry ヒストグラムは[指数バケットヒストグラム][exponential bucket histogram]です。
指数バケットヒストグラムにはバケットとバケットカウントがありますが、バケット境界を明示的に定義するかわりに、境界は指数スケールに基づいて計算されます。
具体的には、各バケットはインデックス _i_ によって定義され、バケット境界は _(base\*\*i, base\*\*(i+1)]_ です。
ここで _base\*\*i_ は _base_ を _i_ 乗することを意味します。
base はスケールファクターから導出され、報告された計測の範囲を反映するように調整可能で、_2\*\*2\*\*-scale_ に等しくなります。
バケットインデックスは連続的でなければなりませんが、ゼロ以外の正または負のオフセットを定義できます。
たとえば、スケール0では _base = 2\*\*2\*\*-0 = 2_ となり、インデックス _[-2,2]_ のバケット境界は _(.25,.5],(.5,1],(1,2],(2,4],(4,8]_ として定義されます。
スケールを調整することで、大きな値と小さな値の両方を表現できます。
明示的バケットヒストグラムと同様に、指数バケットヒストグラムもすべての値の合計、すべての値のカウント、最大値、最小値を追跡します。
完全な定義は [opentelemetry-proto][exponential bucket histogram proto] を参照してください。

## 指数バケットヒストグラムを使う理由 {#why-use-exponential-bucket-histograms}

表面上、指数バケットヒストグラムは明示的バケットヒストグラムとそれほど違わないように見えます。
しかし実際には、その微妙な違いが大きく異なる結果を生み出します。

**指数バケットヒストグラムはより圧縮された表現です。**
明示的バケットヒストグラムは、バケットカウントのリストと _N-1_ 個のバケット境界のリストでデータをエンコードします。
ここで _N_ はバケット数です。
各バケットカウントとバケット境界は8バイトの値であるため、_N_ バケットの明示的バケットヒストグラムは _2N-1_ 個の8バイト値としてエンコードされます。

一方、指数バケットヒストグラムのバケット境界は、スケールファクターとバケットの開始インデックスを定義するオフセットに基づいて計算されます。
各バケットカウントは8バイトの値であるため、_N_ バケットの指数バケットヒストグラムは _N+2_ 個の8バイト値（_N_ 個のバケットカウントと2つの定数）としてエンコードされます。
もちろん、これらの表現はどちらもネットワーク上で送信する際に圧縮されるのが一般的であり、さらなるサイズ削減が見込めますが、指数バケットヒストグラムは根本的に含む情報量が少なくなっています。

**指数バケットヒストグラムは実質的に設定不要です。**
明示的バケットヒストグラムは、どこかで設定する必要のある明示的に定義されたバケット境界のセットが必要です。
[デフォルトのセット][explicit bucket histogram]が提供されていますが、ヒストグラムの用途は非常に多岐にわたるため、データをより正確に反映するために境界を調整する必要があるでしょう。
View API は、特定の計装を選択し、明示的バケットヒストグラム集約のバケット境界を再定義するメカニズムを提供して支援します。

一方、指数バケットヒストグラムの設定可能なパラメーターはバケット数のみで、正の値に対してデフォルトは160です。
実装は、記録された値の範囲と利用可能なバケット数に基づいて、記録された値の周辺のバケット密度を最大化するようにスケールファクターを自動的に選択します。
これがどれほど有用であるかは強調してもしきれません。

指数バケットヒストグラムは、**計測のスケールと範囲に合わせて自動的に調整された**高密度の値の分布を、設定なしで取得します。
ナノ秒スケールの計測を取得するのと同じヒストグラムが、秒スケールの計測の取得にも同様に適しています。
スケールに関係なく精度を維持します。

HTTP リクエスト時間（ミリ秒）を取得するシナリオを考えてみましょう。
明示的バケットヒストグラムでは、値の分布を正確に取得できることを期待してバケット境界を推測します。
しかし、条件が変化してレイテンシーが急増すると、仮定が成り立たなくなり、すべての値が1つにまとめられてしまう可能性があります。
すると、データの分布に対する可視性が突然失われます。
全体的にレイテンシーが高いことはわかりますが、高いが許容範囲内のリクエストがいくつで、極端に遅いリクエストがいくつかを知ることができません。
一方、指数バケットヒストグラムでは、スケールがレイテンシーの急増に自動的に調整され、最適なバケット範囲が選択されます。
計測値の範囲が大きくても、分布に対する洞察が維持されます。

## シナリオ例: 明示的バケットヒストグラムと指数バケットヒストグラムの比較 {#example-scenario-explicit-bucket-histograms-vs-exponential-bucket-histograms}

明示的バケットヒストグラムと指数バケットヒストグラムを適切なデモンストレーションで比較してみましょう。
HTTP サーバーへのレスポンスタイムをミリ秒で追跡するシミュレーションを行う[サンプルコード][example code]を用意しました。
デフォルトバケットを使用した明示的バケットヒストグラムと、明示的バケットのデフォルトとほぼ同じサイズの [OTLP][] エンコード済み Gzip 圧縮ペイロードを生成するバケット数を持つ指数バケットヒストグラムに、100万サンプルを記録します。
試行錯誤の結果、約40個の指数バケットが11バケットのデフォルト明示的バケットヒストグラムと同等のペイロードサイズを生成することがわかりました。
（結果は異なる場合があります。）

サンプルの分布を実際の HTTP サーバーで観測されるものを反映させたいと考えました。
つまり、異なる操作に対応するレスポンスタイムの帯域を持つようにしました。
以下の例のようなものです。

![target probability distribution response time](target-probability-distribution-response-time.webp)

これを実現するために、カーブの異なる帯域に対応するさまざまな確率分布を使用し、それぞれがサンプル全体の一定割合を占めるようにしました。

シミュレーションを実行し、明示的バケットヒストグラムと指数バケットヒストグラムを比較するためにヒストグラムをエクスポートしました。
次の2つのチャートは結果を示しています。
指数バケットヒストグラムは、明示的バケットヒストグラムのより限られたバケットでは得られない、大幅に詳細な情報を持っています。

> **Note:** これらの可視化は New Relic プラットフォームのものです。
> 筆者が New Relic に勤務しており、ヒストグラムを可視化する最も簡単な方法であるために使用しました。
> 各プラットフォームにはヒストグラムの保存と取得のための独自のメカニズムがあり、通常、バケットを正規化されたストレージフォーマットに非可逆変換します。
> New Relic も例外ではありません。
> また、この可視化ではバケットの境界が明確に区切られていないため、同じカウントを持つ隣接バケットが1つのバケットのように表示されます。

ミリ秒スケールの指数バケットヒストグラムを以下に示します。

![millisecond scale exponential bucket histogram](millisecond-scale-exponential-bucket-histogram.webp)

ミリ秒スケールの明示的バケットヒストグラムを以下に示します。

![millisecond scale explicit bucket histogram](millisecond-scale-explicit-bucket-histogram.webp)

このデモンストレーションは、明示的バケットヒストグラムにとって比較的有利です。
デフォルトバケットの最適な範囲（たとえば0から1000）で値を報告することを選択したためです。
次の2つの例では、同じ値をミリ秒ではなくナノ秒精度で記録した場合（すべての値に 10<sup>6</sup> を掛けた場合）に何が起こるかを示します。
ここが、指数バケットヒストグラムの設定不要の自動スケーリングが真価を発揮するところです。
デフォルトの明示的バケット境界のままでは、明示的バケットヒストグラムではすべてのサンプルが1つのバケットに集中してしまいます。
指数バケットヒストグラムは前の例のミリ秒バージョンと比較するといくらか解像度が落ちますが、レスポンスタイムの帯域は依然として確認できます。

ナノ秒スケールの指数バケットヒストグラムを以下に示します。

![nanosecond scale exponential bucket histogram](nanosecond-scale-exponential-bucket-histogram.webp)

ナノ秒スケールの明示的バケットヒストグラムを以下に示します。

![nanosecond scale explicit bucket histogram](nanosecond-scale-explicit-bucket-histogram.webp)

## 次のステップ {#next-steps}

指数バケットヒストグラムは、メトリクスのための強力な新しいツールです。
この記事の公開時点では実装はまだ進行中ですが、OpenTelemetry のメトリクスを使用する際にはぜひ有効にしたいものです。

[opentelemetry-java][] を使用している場合（そして将来的には他の言語でも）、指数バケットヒストグラムを有効にする最も簡単な方法は、以下のコマンドで[環境変数][environment variable]を設定することです。

```shell
export OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION=exponential_bucket_histogram
```

他の言語での有効化方法については、[計装][instrumentation]や [github.com/open-telemetry][] の関連ドキュメントを参照してください。

_この記事のバージョンは New Relic のブログに[元々投稿][originally posted]されました。_

[api]: /docs/specs/otel/metrics/api/
[sdk]: /docs/specs/otel/metrics/sdk/
[meter provider]: /docs/specs/otel/metrics/api/#meterprovider
[instruments]: /docs/specs/otel/metrics/api/#instrument
[instrument selection]: /docs/specs/otel/metrics/supplementary-guidelines/#instrument-selection
[aggregation]: /docs/specs/otel/metrics/sdk/#aggregation
[type of instrument]: /docs/specs/otel/metrics/api/#histogram
[histogram-aggregation]: /docs/specs/otel/metrics/sdk/#histogram-aggregations
[explicit bucket histogram]: /docs/specs/otel/metrics/sdk/#explicit-bucket-histogram-aggregation
[explicit bucket histogram proto]: https://github.com/open-telemetry/opentelemetry-proto/blob/724e427879e3d2bae2edc0218fff06e37b9eb46e/opentelemetry/proto/metrics/v1/metrics.proto#L382
[exponential bucket histogram]: /docs/specs/otel/metrics/sdk/#base2-exponential-bucket-histogram-aggregation
[exponential bucket histogram proto]: https://github.com/open-telemetry/opentelemetry-proto/blob/724e427879e3d2bae2edc0218fff06e37b9eb46e/opentelemetry/proto/metrics/v1/metrics.proto#L463
[example code]: https://github.com/jack-berg/newrelic-opentelemetry-examples/commit/2681bf25518c02f4e5830f89254c736e0959d306
[otlp]: /docs/specs/otlp/
[opentelemetry-java]: https://github.com/open-telemetry/opentelemetry-java
[environment variable]: /docs/specs/otel/metrics/sdk_exporters/otlp/
[instrumentation]: /docs/languages
[github.com/open-telemetry]: https://github.com/open-telemetry
[originally posted]: <{{% param canonical_url %}}>
