---
title: OpenTelemetryとは
description: OpenTelemetryが何であり、何でないかについての簡単な説明。
weight: 150
---

..
  OpenTelemetry is an
  [Observability](/docs/concepts/observability-primer/#what-is-observability)
  framework and toolkit designed to create and manage telemetry data such as
  [traces](/docs/concepts/signals/traces/),
  [metrics](/docs/concepts/signals/metrics/), and
  [logs](/docs/concepts/signals/logs/). Crucially, OpenTelemetry is vendor- and
  tool-agnostic, meaning that it can be used with a broad variety of Observability
  backends, including open source tools like
  [Jaeger](https://www.jaegertracing.io/) and
  [Prometheus](https://prometheus.io/), as well as commercial offerings.

OpenTelemetryは[オブザーバビリティ](/docs/concepts/observability-primer/#what-is-observability)フレームワークであり、[トレース](/docs/concepts/signals/traces/)、[メトリクス](/docs/concepts/signals/metrics/)、[ログ](/docs/concepts/signals/logs/)のようなテレメトリーデータを作成・管理するためにデザインされたツールキットです。
重要なことは、OpenTelemetryはベンダーやツールにとらわれないということです。
つまり、[Jaeger](https://www.jaegertracing.io/)や[Prometheus](https://prometheus.io/)のようなオープンソースツールや、商用製品を含む、さまざまなオブザーバビリティバックエンドで使用できるということです。

..
  OpenTelemetry is not an observability backend like Jaeger, Prometheus, or other
  commercial vendors. OpenTelemetry is focused on the generation, collection,
  management, and export of telemetry. A major goal of OpenTelemetry is that you
  can easily instrument your applications or systems, no matter their language,
  infrastructure, or runtime environment. Crucially, the storage and visualization
  of telemetry is intentionally left to other tools.

OpenTelemetryは、JaegerやPrometheusや他の商用ベンダーのようなオブザーバビリティバックエンドではありません。
OpenTelemetryはテレメトリの生成、収集、管理、そしてエクスポートにフォーカスしています。
OpenTelemetryの主な目的は、あなたのアプリケーションやシステムを、その言語、インフラ、ランタイム環境に関係なく、簡単に計装できるようにすることです。
テレメトリーの保存と可視化は、意図的に他のツールに任せているということを理解するのが重要です。

## オブザーバビリティとはなにか

[オブザーバビリティ](/docs/concepts/observability-primer/#what-is-observability)とは、システムの出力を調べることによって、システムの内部状態を理解する能力のことです。
ソフトウェアの文脈では、これは、トレース、メトリクス、ログを含むテレメトリーデータを調べることによって、システムの内部状態を理解できることを意味します。

システムをオブザーバビリティがある状態にするには、[軽装されて](/docs/concepts/instrumentation)いなければなりません。
つまり、コードが[トレース](/docs/concepts/signals/traces/)、[メトリクス](/docs/concepts/signals/metrics/)、または[ログ](/docs/concepts/signals/logs/)を出力しなければなりません。
計装されたデータは、オブザーバビリティバックエンドに送信されなければなりません。

## なぜOpenTelemetryなのか

クラウドコンピューティング、マイクロサービスアーキテクチャー、複雑化するビジネス要件の台頭により、ソフトウェアとインフラの[オブザーバビリティ](/docs/concepts/observability-primer/#what-is-observability)の必要性はかつてないほど高まっています。

OpenTelemetryは、2つの重要な原則に従いながら、オブザーバビリティの需要を満たしています。

  1. あなたが生成したデータはあなたのものです。ベンダーのロックインはありません。
  2. APIと規約は1セットだけ覚えれば良いです。

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
- [OpenTelemetry Operator for Kubernetes](/docs/kubernetes/operator/)、[OpenTelemetry Helm Charts](/docs/kubernetes/helm/)、[FaaS向けコミュニティアセット](/docs/faas/)といったその他さまざまなツール

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

## 歴史

..
  OpenTelemetry is a
  [Cloud Native Computing Foundation (CNCF)](https://www.cncf.io) project that is
  the result of a merger between two prior projects,
  [OpenTracing](https://opentracing.io) and [OpenCensus](https://opencensus.io).
  Both of these projects were created to solve the same problem: the lack of a
  standard for how to instrument code and send telemetry data to an Observability
  backend. As neither project was fully able to solve the problem independently,
  they merged to form OpenTelemetry and combine their strengths while offering a
  single solution.

OpenTelemetryは、[Cloud Native Computing Foundation (CNCF)](https://www.cncf.io)プロジェクトであり、[OpenTracing](https://opentracing.io)と[OpenCensus](https://opencensus.io)の2つのプロジェクトが統合された成果物です。
これらのプロジェクトはどちらも、コードを計装し、オブザーバビリティバックエンドにテレメトリーデータを送信する方法の標準がないという問題を解決するために作られました。
どちらのプロジェクトも、独立してこの問題を完全には解決できなかったので、協力するためにOpenTelemetryプロジェクトとして合併し、単一のソリューションを提供しながら、それぞれの強みを組み合わせました。

現在OpenTracingまたはOpenCensusを使っている場合は、[移行ガイド](/docs/migration/)でOpenTelemetryへの移行方法を確認してください。

## 次のステップ

- [Getting started](/docs/getting-started/) &mdash; 早速始めてみましょう！
- [OpenTelemetryの概念](/docs/concepts/)について学ぶ
