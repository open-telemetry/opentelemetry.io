---
title: OpenTelemetry デモが一般提供になりました！
linkTitle: デモ GA リリース
date: 2022-10-24
author: Austin Parker
default_lang_commit: 56822f6fceee3f9a58cfbac337869438994f1437
---

今年の初めに、OpenTelemetry の機能と言語の幅広さを表す [OpenTelemetry デモ](/blog/2022/demo-announcement/)を構築するプロジェクトを発表しました。
本日、[Demo SIG](https://cloud-native.slack.com/archives/C03B4CWV4DA) は [OpenTelemetry Demo v1.0](https://github.com/open-telemetry/opentelemetry-demo/tree/v1.0.0) のリリースを誇りを持ってお知らせします！
このデモにより、100% OpenTelemetry のトレースとメトリクスで計装された完全なエンドツーエンドの分散システムを素早く実行できます。

![Jaeger UI でDAG（有向非巡回グラフ）として表現されたデモアプリケーションのシステムアーキテクチャ](system-architecture.png)

このプロジェクトの主な目標の一つは、開発者が OpenTelemetry を学ぶ際に使用できる堅牢なサンプルアプリケーションを作成することでした。
そしてまさにそれを実現できたことを誇りに思います。
Swift を除くすべての OpenTelemetry 言語 SDK がこのリリースに[含まれています](/docs/demo/services/)。
はい、PHP も含まれています！
以下のような一般的な計装タスクの幅広さを実演する完全な[トレースフロー](/docs/demo/telemetry-features/trace-coverage/)を構築しました。

- 自動計装からのスパンのエンリッチメント。
- よりリッチで有用なトレースのためのカスタムスパンの作成。
- トレースコンテキストの自動および手動での伝搬。
- サービス間で属性を渡すためのオブザーバビリティバゲージの処理。
- 属性、イベント、その他のテレメトリーメタデータの作成。

また、ランタイムおよびビジネスメトリクスのユースケースに対応するために、[複数のサービス](/docs/demo/telemetry-features/metric-coverage/)に OpenTelemetry メトリクスを統合しました。

OpenTelemetry の優れたデモンストレーションを提供するだけでも十分ですが、1.0リリースで重視したのは、OpenTelemetry の「どのように」だけでなく「なぜ」を示すことでした。
そのために、フィーチャーフラグで制御される[障害シナリオ](/docs/demo/#scenarios)を実装するフレームワークを構築しました。
さらに、事前設定されたダッシュボードと、各サービスが出力するテレメトリーデータを読み取り解釈してアプリケーションのパフォーマンス低下の根本原因を発見する方法についてのウォークスルーをドキュメントに含めています。

このデモのもう一つの目標は、ベンダーや OpenTelemetry の商用実装者が、デモを構築するための標準化されたターゲットを持てるようにすることです。
すでに多くの採用が見られ、Datadog、Dynatrace、Honeycomb、Lightstep、New Relic の5社がコミュニティデモアプリケーションを自社の[製品デモ](https://github.com/open-telemetry/opentelemetry-demo#demos-featuring-the-astronomy-shop)に統合しています。
今後もこの方向でのさらなるコントリビューションとコラボレーションを促進したいと考えています。

ただし、1.0に到達したからといって、止まるわけではありません。
このデモは生きた成果物であり、今後も改善を続ける予定です。
今後数か月間、より多くの SDK が成熟するにつれて、メトリクスとログのカバレッジを反復的に改善し続ける計画です。

また、アプリケーションの機能を拡張することで、新しい計装シナリオとパターンを追加したいと考えています。
キューやリクエストの非同期処理、セットアップ不要でデモを探索できるホスト版、Swift のサポートの追加などを予定しています。

ぜひデモを試してご感想をお聞かせください！
[ドキュメント](https://github.com/open-telemetry/opentelemetry-demo/tree/06aa374799319143c15bf7add18a5f056a2c4504/docs?from_branch=main#opentelemetry-demo-documentation)をご覧いただくか、[Docker](/docs/demo/docker-deployment/) または [Kubernetes](/docs/demo/kubernetes-deployment/) でデモを実行して、ご意見をお聞かせください。
コントリビューションを希望される方は、[GitHub でイシューを作成する](https://github.com/open-telemetry/opentelemetry-demo/issues)か、CNCF Slack の [#otel-community-demo](https://cloud-native.slack.com/archives/C03B4CWV4DA) にご参加ください。
