---
title: OpenTelemetryとは
description: OpenTelemetryが何であり、何でないかについての簡単な説明。
weight: 150
default_lang_commit: 44059882
---

- OpenTelemetryは、[オブザーバビリティ](/docs/concepts/observability-primer/#what-is-observability)フレームワークであり、[トレース](/docs/concepts/signals/traces/)、[メトリクス](/docs/concepts/signals/metrics/)、[ログ](/docs/concepts/signals/logs/)のようなテレメトリーデータを作成・管理するためにデザインされたツールキットです。
- OpenTelemetryは、ベンダーやツールにとらわれません。つまり、[Jaeger](https://www.jaegertracing.io/)や[Prometheus](https://prometheus.io/)のようなオープンソースツールや、商用製品を含む、さまざまなオブザーバビリティバックエンドで使用できるということです。
- OpenTelemetryは、JaegerやPrometheusや他の商用ベンダーのようなオブザーバビリティバックエンドではありません。
- OpenTelemetryは、テレメトリの生成、収集、管理、そしてエクスポートにフォーカスしています。OpenTelemetryの主な目的は、あなたのアプリケーションやシステムを、その言語、インフラ、ランタイム環境に関係なく、簡単に計装できるようにすることです。テレメトリーの保存と可視化は、意図的に他のツールに任せているということを理解するのが重要です。

## オブザーバビリティとはなにか

[オブザーバビリティ](/docs/concepts/observability-primer/#what-is-observability)とは、システムの出力を調べることによって、システムの内部状態を理解する能力のことです。
ソフトウェアの文脈では、これは、トレース、メトリクス、ログを含むテレメトリーデータを調べることによって、システムの内部状態を理解できることを意味します。

システムをオブザーバビリティがある状態にするには、[計装されて](/docs/concepts/instrumentation)いなければなりません。
つまり、コードが[トレース](/docs/concepts/signals/traces/)、[メトリクス](/docs/concepts/signals/metrics/)、または[ログ](/docs/concepts/signals/logs/)を出力しなければなりません。
計装されたデータは、オブザーバビリティバックエンドに送信されなければなりません。

## なぜOpenTelemetryなのか

クラウドコンピューティング、マイクロサービスアーキテクチャ、複雑化するビジネス要件の台頭により、ソフトウェアとインフラの[オブザーバビリティ](/docs/concepts/observability-primer/#what-is-observability)の必要性はかつてないほど高まっています。

OpenTelemetryは、2つの重要な原則に従いながら、オブザーバビリティの需要を満たしています。

1. あなたが生成したデータはあなたのものです。ベンダーのロックインはありません。
2. APIと規約は1セットだけ覚えれば十分です。

この2つの原則を組み合わせることで、現代のコンピューティングの世界で必要とされる柔軟性をチームや組織に与えられます。

もっと知りたければ、OpenTelemetryの[ミッション、ビジョン、バリュー](/community/mission/)を見てください。

## OpenTelemetryの主要コンポーネント

OpenTelemetryは以下の主要コンポーネントで構成されています。

- 全コンポーネントの[仕様](/docs/specs/otel)
- テレメトリーデータの形式を定義する標準[プロトコル](/docs/specs/otlp/)
- 共通のテレメトリーデータ型のための標準の命名スキーマを定義する[セマンティック規約](/docs/specs/semconv/)
- テレメトリーデータの生成方法を定義するAPI
- 仕様、API、テレメトリーデータのエクスポートを実装する[各言語向けSDK](/docs/languages)
- 共通ライブラリやフレームワークの計装を実装する[ライブラリエコシステム](/ecosystem/registry)
- コード変更の必要なくテレメトリーデータを生成する自動計装コンポーネント
- テレメトリーデータの受信、処理、送信のためのプロキシとなる[OpenTelemetryコレクター](/docs/collector)
- [OpenTelemetry Operator for Kubernetes](/docs/platforms/kubernetes/operator/)、[OpenTelemetry Helm Charts](/docs/platforms/kubernetes/helm/)、[FaaS向けコミュニティアセット](/docs/platforms/faas/)といったその他さまざまなツール

OpenTelemetryは、デフォルトでオブザーバビリティを提供するために、OpenTelemetryが統合されたさまざまな[ライブラリ、サービス、アプリ](/ecosystem/integrations/)によって使用されています。

OpenTelemetryは多くの[ベンダー](/ecosystem/vendors/)によってサポートされており、その多くはOpenTelemetryの商用サポートを提供し、プロジェクトに直接貢献しています。

## 拡張性

OpenTelemetryは拡張できるように設計されています。どのように拡張できるかの例をいくつか挙げます。

- OpenTelemetryコレクターにレシーバーを追加して、独自のデータソースからのテレメトリーデータをサポートする
- カスタム計装ライブラリをSDKにロードする
- 特定のユースケースに合わせたSDKまたはコレクターの[ディストリビューション](/docs/concepts/distributions/)の作成
- OpenTelemetryプロトコル(OTLP)をまだサポートしていないカスタムバックエンド用の新しいエクスポーターの作成
- 非標準のコンテキスト伝播形式用のカスタムプロパゲーターの作成

ほとんどのユーザーはOpenTelemetryを拡張する必要はないかもしれませんが、このプロジェクトはほぼすべてのレベルで拡張できるように設計されています。

## 歴史 {#history}

OpenTelemetryは、[Cloud Native Computing Foundation (CNCF)](https://www.cncf.io)プロジェクトであり、[OpenTracing](https://opentracing.io)と[OpenCensus](https://opencensus.io)の2つのプロジェクトが[統合された]成果物です。
これらのプロジェクトはどちらも、コードを計装し、オブザーバビリティバックエンドにテレメトリーデータを送信する方法の標準がないという問題を解決するために作られました。
どちらのプロジェクトも、独立してこの問題を完全には解決できなかったので、協力するためにOpenTelemetryプロジェクトとして合併し、単一のソリューションを提供しながら、それぞれの強みを組み合わせました。

現在OpenTracingまたはOpenCensusを使っている場合は、[移行ガイド](/docs/migration/)でOpenTelemetryへの移行方法を確認してください。

[統合された]: https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/

## 次のステップ

- [Getting started](/docs/getting-started/) &mdash; 早速始めてみましょう！
- [OpenTelemetryの概念](/docs/concepts/)について学ぶ
