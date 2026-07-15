---
title: OpenTelemetry Sampling の最新情報
linkTitle: OpenTelemetry Sampling の最新情報
date: 2025-10-15
author: >-
  [Joshua MacDonald](https://github.com/jmacd) (Microsoft), [Kent
  Quirk](https://github.com/kentquirk) (Honeycomb), [Otmar
  Ertl](https://github.com/oertl) (Dynatrace), [Peter
  Findeisen](https://github.com/PeterF778) (Cisco), [Yuanyuan
  Zhao](https://github.com/yuanyuanzhao3) (DataDog)
sig: SIG Sampling
default_lang_commit: 5e10a38c4879c9c45a4063b04834755bdffeb4cb
cSpell:ignore: Ertl Findeisen probabilisticsampler Yuanyuan Zhao
---

## はじめに {#introduction}

OpenTelemetry がトレーシング仕様のバージョン 1.0 を公開してから4年以上が経ち、同年に [W3C TraceContext Level 1][TRACECONTEXT1] が W3C 勧告ステータスで公開されました。
コミュニティとして、そしてオブザーバビリティ業界として、私たちは分散トレーシングのための2つの新しい標準を手にしました。
もちろん、これで終わりではありませんでした。

[TRACECONTEXT1]: https://www.w3.org/TR/trace-context-1
[JAEGERREMOTE]: https://www.jaegertracing.io/docs/1.22/architecture/sampling/

サンプリングはトレーシング SDK 仕様の主要なトピックであり、最初の仕様には組み込みサンプラーとして `AlwaysOn`、`AlwaysOff`、`ParentBased`、`TraceIdRatioBased` が含まれ、新しいサンプラーを実装するためのインターフェイスも用意されていました。
その代表例が [Jaeger Remote][JAEGERREMOTE] です。

しかし、1.0 トレーシング仕様には `TraceIdRatioBased` サンプラーに影響する[確率サンプリングに関する目立った「TODO」](https://github.com/open-telemetry/opentelemetry-specification/issues/1413)が残されていました。
この TODO は、`TraceIdRatioBased` サンプラーが「一貫性のない」結果を返すこと、つまりルートスパンに対してのみ安全に設定できることを仕様の利用者に警告するものでした。

これは、OpenTelemetry のユーザーが分散システムで独立した確率サンプリングポリシーを安全に設定できないことを意味していました。
一貫性を実現する方法が仕様でカバーされていなかったためです。
この機能、つまりトレース内で等しくない確率のサンプリングポリシーを設定しつつ完全なトレースを得られる能力は、ユーザーが期待するものです。
これにより、サービスオーナーはシステムで収集するトレーシングデータの量に対して独立した制限を設定できます。

## 一貫性の具体例 {#consistency-by-example}

一貫性がなぜ重要かを理解するために、Frontend と2つのバックエンドサービス Cache および Storage を持つシステムを考えてみましょう。
Frontend は高価値のユーザーリクエストを処理するため、Frontend のリクエストは 100% サンプリングされます。
ルートスパンはエンドユーザーにエラーが見える点で重要であるため、この例では SLO 計測の基盤となります。
システムオペレーターはすべてのスパンを収集する意思があります。

Cache サービスは比較的高いボリュームのリクエストを受信するため、オブザーバビリティコストを節約するために 1000 分の 1 のトレースをサンプリングするよう設定されています。
リクエストレートが高いため、この 0.1% のポリシーにより、Cache サービスは多くのオブザーバビリティシナリオに十分なトレースを生成します。

Storage サービスは Cache サーバーと比較して受信するリクエストのボリュームは少ないですが、Frontend サービスと比べると依然として多くのリクエストを受信します。
Storage は 10 分の 1 のトレースをサンプリングするよう設定されています。

分散トレーシングにおける一貫性とは、最も低い確率のサンプラー（ここでは 0.1%）がサンプリングを選択した場合、より高い確率のサンプラーも同じ判定を下すことを保証するという目標です。
この設定で保証できる特性は以下の通りです。

- Frontend スパンの 100% が収集される
- 10 分の 1 のトレースは Frontend と Storage のスパンで構成される
- 1000 分の 1 のトレースは完全なものとなる

## TraceIdRatioBased の問題 {#problems-with-traceidratiobased}

OpenTelemetry の `TraceIdRatioBased` 確率サンプラーは当初から一貫性を持つことが意図されていましたが、ワーキンググループは具体的な詳細について合意するのに苦労しました。
サンプリングの一貫性に関する TODO は、ルートのみのサンプリングが当時のオープンソーストレーシングシステムの標準であり、Jaeger が採用したモデルであったことで緩和されていました。

名前の「ratio-based」の部分は、一貫したサンプリング問題の解決形態を示唆しています。

1. TraceID の値を N ビットのランダム値と見なす
2. 2 の N 乗を計算する
3. 2 の累乗に比率を掛け、「閾値」を算出する
4. TraceID と閾値を比較し、一貫した判定を得る

この形式の解決策について合意が得られなかったのは、より大きな問題があったためです。
_TraceID のどのビットがランダムであると信頼できるのか？_
ランダム性に関する基本的な要件がなければ、OpenTelemetry は一貫したサンプリング判定を仕様化できませんでした。

ランダム性に関する確固たる要件がない場合、一般的なアプローチはハッシュ関数を使用することです。
`Hash(TraceID)` を使って N ビットのランダム性を生成する方法は、ハッシュ関数が良好であれば合理的に機能しますが、このアプローチは多言語対応の SDK 仕様には適していません。

ここでの詳細はやっかいです。
TraceID の何ビットあれば十分でしょうか？
すべての言語の SDK が必要なロジックを効率的に実装できるでしょうか？

## W3C TraceContext Level 2 の導入 {#introducing-w3c-tracecontext-level-2}

OpenTelemetry は、このより大きな問題を念頭に置いて W3C Trace Context ワーキンググループに働きかけました。
OpenTelemetry と非 OpenTelemetry のトレーシングシステムを含め、TraceID の何ビットがランダムであるかについて合意できるのでしょうか？

[W3C TraceContext Level 2][TRACECONTEXT2] 仕様は、現在[候補勧告草案](https://www.w3.org/standards/types/#x4-2-1-candidate-recommendation-draft)であり、新しい [`Random` Trace Flag 値](https://www.w3.org/TR/trace-context-2/#random-trace-id-flag)でこの問題に答えています。
このフラグにより、新しい W3C 仕様は TraceID の最下位 56 ビットが「十分に」ランダムであることを要求します。
これは、たとえば [TraceID を 32 桁の16進数で表現する](/docs/specs/otel/trace/api/#retrieving-the-traceid-and-spanid)場合、最後の右端 14 桁がランダムであることを意味します。
16 バイトで表現する場合、最後の右端 7 バイトがランダムです。

[TRACECONTEXT2]: https://www.w3.org/TR/trace-context-2

OpenTelemetry は、一貫したサンプリングの基盤として W3C TraceContext Level 2 の勧告草案を採用しています。
すべての SDK は `Random` フラグを設定し、生成する TraceID がデフォルトで必要な 56 ビットのランダム性を持つことを保証します。

## 棄却のための一貫したサンプリング閾値 {#consistent-sampling-threshold-for-rejection}

一貫した「ratio-based」ロジックに話を戻すと、TraceID から 56 ビットのランダム性を取得できるようになり、上述の判定プロセスでは比較のための閾値が必要です。

確率サンプリング仕様に関して、グループとしてもう一つ求めたことがありました。
それは、SDK がサンプリング判定を TraceContext 内で互いに伝達し、スパンの完了後にコレクションパスでも伝達する方法です。

新しい仕様により、OpenTelemetry のコンポーネントは「どれだけのサンプリング」がスパンに適用されたかを伝達できます。
これは多くの高度なサンプリングアーキテクチャをサポートします。

- スパン数の信頼性の高い推定
- 一貫したレート制限付きサンプリング
- 適応型サンプリング
- 一貫した多段階サンプリング

設計の要点を次にまとめますが、詳しくは[完全な仕様](/docs/specs/otel/trace/tracestate-probability-sampling/)を参照してください。

ビット数が決まれば、仕様化すべきことはそれほど多くありません。
しかし、以下の特性を持つアプローチを求めました。

- 辞書順比較と数値比較の両方をサポートする
- TraceContext のオーバーヘッドを最小化する
- 上級 OpenTelemetry ユーザーにとって可読性が高い

このアプローチは、_棄却のためのサンプリング閾値_ と呼ぶ概念に基づいています。
ランダム値 `R` と棄却閾値 `T` が与えられた場合、`T <= R` のときに正のサンプリング判定を行います。
同様に、`T > R` のときに負のサンプリング判定を行います。

設計上、閾値 `0` は 100% サンプリングに対応するため、ユーザーはこの設定を容易に認識できます。
抽象的には、`R` と `T` はいずれも 56 ビットの範囲を持ち、符号なし整数、7 バイトスライス、または 14 桁の16進文字列として表現できます。

## OpenTelemetry TraceState {#opentelemetry-tracestate}

W3C TraceContext 仕様は、分散トレーシングシステムで使用する2つの HTTP ヘッダーを定義しています。
1つはバージョン、TraceID、SpanID、フラグを含む `tracecontext` ヘッダー、もう1つは「ベンダー固有」のコンテキスト追加をサポートする `tracestate` です。
OpenTelemetry トレーシング SDK は、まもなく `tracestate` ヘッダーにキー "ot" のエントリを追加し始めます。
以下が例です。

```http
tracestate: ot=th:0
```

100% サンプリング設定では、OpenTelemetry トレーシング SDK は TraceState に `ot=th:0` を挿入します。
TraceState の値は、コンテキストに入力されると、伝搬と OpenTelemetry スパンデータへの記録の両方が行われます。
設計上、新しい OpenTelemetry TraceState の値は正のサンプリング判定に対してのみエンコードおよび送信されます。
負のサンプリング判定の結果として `tracestate` ヘッダーが出力されることはありません。

この表現では、サンプリング閾値は論理的に 14 桁の16進数または 56 ビットの情報を表します。

ただし、サンプリング閾値を効率的に伝達するために、末尾のゼロを省略します（`0` 自体は除く）。
これにより、閾値の精度を 56 ビット未満に制限でき、コンテキストあたりのバイト数を削減できます。
以下は、12 ビット精度に制限された 1% サンプリングを示す tracestate の例です。

```http
tracestate: ot=th:fd7
```

後方互換性について多くの検討を重ねましたが、外挿のために常に指定されたサンプリング閾値を、統計的に信頼できる形で使用できることも確認したいと考えていました。
このことを念頭に、仕様にはもう一つの OpenTelemetry TraceState 値があります。
`tracestate` ヘッダーで明示的なランダム性を提供する方法です。

一貫したサンプリングを有効にしつつ非ランダムな TraceID を引き続き使用するために、ユーザーは明示的なランダム性を選択できます。

```http
tracestate: ot=rv:abcdef01234567
```

明示的なランダム値にはいくつかの他の用途もあります。

- 同じ明示的なランダム値を独立したトレースルートに適用することで、複数のトレースにわたる一貫したサンプリングを実現する
- 外部の一貫したサンプリング判定（たとえばハッシュ関数ベース）を OpenTelemetry の一貫したサンプリング判定に変換する

デモンストレーションとして、OpenTelemetry Collector-Contrib の [`probabilisticsampler` プロセッサー][PROBABILISTICSAMPLERPROCESSOR]をアップグレードし、元の一貫したサンプリング判定を維持しつつ、サンプリング確率を OpenTelemetry TraceState にエンコードするようにしました。
これは、使用するハッシュ関数から明示的なランダム値を合成することで実現しています。

[PROBABILISTICSAMPLERPROCESSOR]: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/549e115b28292c164eb671618c0ec8b728b69d2a/processor/probabilisticsamplerprocessor/README.md?from_branch=main

## 今後の展望 {#looking-forward}

この投稿は、OpenTelemetry トレーシング仕様の重要なアップグレードについて取り上げました。
これにより、OpenTelemetry SDK と Collector コンポーネントのための新世代のサンプラーが実現します。

以下は、方向性を示した4つの OpenTelemetry Enhancement Proposal を含む有用なリファレンスです。

- [0168 Sampling Propagation](https://github.com/open-telemetry/opentelemetry-specification/blob/97c826b70e2f89cfdf655d5150791f3f0c2bae19/oteps/trace/0168-sampling-propagation.md?from_branch=main)
- [0170 Sampling Probability](https://github.com/open-telemetry/opentelemetry-specification/blob/97c826b70e2f89cfdf655d5150791f3f0c2bae19/oteps/trace/0170-sampling-probability.md?from_branch=main)
- [0235 Sampling Threshold in TraceState](https://github.com/open-telemetry/opentelemetry-specification/blob/02531b063da09bca753070d8071180ca2c287117/oteps/trace/0235-sampling-threshold-in-trace-state.md?from_branch=main)
- [0250 Composite Samplers](https://github.com/open-telemetry/opentelemetry-specification/blob/b72b9e1127391871eaedee841895ff9ce52d11f3/oteps/trace/0250-Composite_Samplers.md?from_branch=main)

以下は主要な仕様ドキュメントです。

- [Trace Probability Sampling](/docs/specs/otel/trace/tracestate-probability-sampling/)
- [Trace SDK Samplers](/docs/specs/otel/trace/sdk/#sampler)
- [TraceID Randomness](/docs/specs/otel/trace/sdk/#traceid-randomness)
