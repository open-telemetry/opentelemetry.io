---
title: OpenTelemetryとは
description: OpenTelemetryが何であり、何でないかについての簡潔な説明。
weight: 150
default_lang_commit: 9b427bf25703c33a2c6e05c2a7b58e0f768f7bad
---

OpenTelemetry とは、次のようなものです。

- **[オブザーバビリティ](/docs/concepts/observability-primer/#what-is-observability)フレームワークでありツールキット**です。[トレース][traces]、[メトリクス][metrics]、[ログ][logs]のような[テレメトリーデータ][telemetry data] の次の処理を容易にするために設計されています
  - [生成][instr]
  - エクスポート
  - [収集](../concepts/components/#collector)

- **オープンソース**であり、**ベンダーやツールにとらわれません**。つまり、[Jaeger]や[Prometheus]のようなオープンソースツールや、商用製品を含む、さまざまなオブザーバビリティバックエンドで使用できるということです。OpenTelemetry はオブザーバビリティバックエンドでは**ありません**。

OpenTelemetryの主な目的は、あなたのアプリケーションやシステムを、その言語、インフラ、ランタイム環境に関係なく、簡単に計装できるようにすることです。

テレメトリーデータのバックエンド（保存）とフロントエンド（可視化）は意図的に他のツールに任せています。

<div class="td-max-width-on-larger-screens">
{{< youtube iEEIabOha8U >}}
</div>

より多くの、このシリーズのビデオや追加のリソースについては、[次のステップ](#what-next)を参照してください。

## オブザーバビリティとはなにか {#what-is-observability}

[オブザーバビリティ][observability]とは、システムの出力を調べることによって、システムの内部状態を理解する能力のことです。
ソフトウェアの文脈では、これは、トレース、メトリクス、ログを含むテレメトリーデータを調べることによって、システムの内部状態を理解できることを意味します。

システムをオブザーバビリティがある状態にするには、[計装されて][instr]いなければなりません。
つまり、コードが[トレース][traces]、[メトリクス][metrics]、または[ログ][logs]を出力しなければなりません。
計装されたデータは、オブザーバビリティバックエンドに送信されなければなりません。

## なぜOpenTelemetryなのか {#why-opentelemetry}

クラウドコンピューティング、マイクロサービスアーキテクチャ、複雑化するビジネス要件の台頭により、ソフトウェアとインフラの[オブザーバビリティ][observability]の必要性はかつてないほど高まっています。

OpenTelemetryは、2つの重要な原則に従いながら、オブザーバビリティの需要を満たしています。

1. あなたが生成したデータはあなたのものです。ベンダーのロックインはありません。
2. APIと規約は1セットだけ覚えれば十分です。

この2つの原則を組み合わせることで、現代のコンピューティングの世界で必要とされる柔軟性をチームや組織に与えられます。

もっと知りたければ、OpenTelemetryの[ミッション、ビジョン、バリュー](/community/mission/)を見てください。

## OpenTelemetryの主要コンポーネント {#main-opentelemetry-components}

OpenTelemetryは以下の主要コンポーネントで構成されています。

- 全コンポーネントの[仕様](/docs/specs/otel)
- テレメトリーデータの形式を定義する標準[プロトコル](/docs/specs/otlp/)
- 共通のテレメトリーデータ型のための標準の命名スキーマを定義する[セマンティック規約](/docs/specs/semconv/)
- テレメトリーデータの生成方法を定義するAPI
- 仕様、API、テレメトリーデータのエクスポートを実装する[各言語向けSDK](../languages)
- 共通ライブラリやフレームワークの計装を実装する[ライブラリエコシステム](/ecosystem/registry)
- コード変更の必要なくテレメトリーデータを生成する自動計装コンポーネント
- テレメトリーデータの受信、処理、送信のためのプロキシとなる[OpenTelemetryコレクター](../collector)
- [OpenTelemetry Operator for Kubernetes](../platforms/kubernetes/operator/)、[OpenTelemetry Helm Charts](../platforms/kubernetes/helm/)、[FaaS向けコミュニティアセット](../platforms/faas/)といったその他さまざまなツール

OpenTelemetryは、デフォルトでオブザーバビリティを提供するために、OpenTelemetryが統合されたさまざまな[ライブラリ、サービス、アプリ](/ecosystem/integrations/)によって使用されています。

OpenTelemetryは多くの[ベンダー](/ecosystem/vendors/)によってサポートされており、その多くはOpenTelemetryの商用サポートを提供し、プロジェクトに直接貢献しています。

## 拡張性 {#extensibility}

OpenTelemetryは拡張できるように設計されています。どのように拡張できるかの例をいくつか挙げます。

- OpenTelemetryコレクターにレシーバーを追加して、独自のデータソースからのテレメトリーデータをサポートする
- カスタム計装ライブラリをSDKにロードする
- 特定のユースケースに合わせたSDKまたはコレクターの[ディストリビューション](../concepts/distributions/)の作成
- OpenTelemetryプロトコル(OTLP)をまだサポートしていないカスタムバックエンド用の新しいエクスポーターの作成
- 非標準のコンテキスト伝搬形式用のカスタムプロパゲーターの作成

ほとんどのユーザーはOpenTelemetryを拡張する必要はないかもしれませんが、このプロジェクトはほぼすべてのレベルで拡張できるように設計されています。

## 歴史 {#history}

OpenTelemetryは、[Cloud Native Computing Foundation][](CNCF)プロジェクトであり、[OpenTracing](https://opentracing.io)と[OpenCensus](https://opencensus.io)の2つのプロジェクトが[統合された]成果物です。
これらのプロジェクトはどちらも、コードを計装し、オブザーバビリティバックエンドにテレメトリーデータを送信する方法の標準がないという問題を解決するために作られました。
どちらのプロジェクトも、独立してこの問題を完全には解決できなかったので、協力するためにOpenTelemetryプロジェクトとして合併し、単一のソリューションを提供しながら、それぞれの強みを組み合わせました。

現在OpenTracingまたはOpenCensusを使っている場合は、[移行ガイド](../migration/)でOpenTelemetryへの移行方法を確認してください。

[統合された]: https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/

## 次のステップ {#what-next}

- [Getting started](../getting-started/) &mdash; 早速始めてみましょう！
- [OpenTelemetryの概念](../concepts/)について学ぶ
- [Watch videos][] from the [OTel for beginners][] or other [playlists].
- Sign up for [training](/training), including the **free course** [Getting started with OpenTelemetry](/training/#courses).

[Cloud Native Computing Foundation]: https://www.cncf.io
[instr]: ../concepts/instrumentation
[Jaeger]: https://www.jaegertracing.io/
[logs]: ../concepts/signals/logs/
[metrics]: ../concepts/signals/metrics/
[observability]: ../concepts/observability-primer/#what-is-observability
[OTel for beginners]: https://www.youtube.com/playlist?list=PLVYDBkQ1TdyyWjeWJSjXYUaJFVhplRtvN
[playlists]: https://www.youtube.com/@otel-official/playlists
[Prometheus]: https://prometheus.io/
[telemetry data]: ../concepts/signals/
[traces]: ../concepts/signals/traces/
[Watch videos]: https://www.youtube.com/@otel-official
