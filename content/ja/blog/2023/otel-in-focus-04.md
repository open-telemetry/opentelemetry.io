---
title: OpenTelemetry in Focus、2023年4月
linkTitle: OTel in Focus 2023/04
date: 2023-05-01
author: '[Austin Parker](https://github.com/austinlparker)'
default_lang_commit: 9303f8245fc0b7e9f51d9b42696b7144bfef2ae1
cSpell:ignore: confmap
---

今月の **OpenTelemetry in Focus** へようこそ！
OpenTelemetry コミュニティではまた忙しい1か月があり、コアリポジトリからの大きな発表と新しいリリースがありました。
KubeCon EU での OpenTelemetry のハイライトもいくつか共有します。
とても楽しいイベントでした。
今年秋のシカゴが待ちきれません！

ここで紹介してほしいことがあるメンテナーの方は、[Austin Parker にメール](mailto:austin@lightstep.com)か、[CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルで連絡してください。

## リリースとアップデート {#releases-and-updates}

一部のコアリポジトリからの最新アップデートをお知らせします。

<!-- markdownlint-disable heading-increment -->

##### [仕様](/docs/specs/otel/) {#specification}

[バージョン1.20](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.20.0) がリリースされました。
これは大きなリリースです！

まず、**OpenTelemetry Protocol** が安定版として宣言されました！
次に、[Elastic Common Schema と OpenTelemetry セマンティック規約を統合する](/blog/2023/ecs-otel-semconv-convergence/)プロセスが開始されました。
これは何を意味するのでしょうか。
大まかに言うと、標準の整合化を進めるにあたり、セマンティック規約が仕様から分離されることが予想されます。
詳細は今後の情報をお待ちください。

その他の変更点は以下のとおりです。

- スパンとメトリクス SDK の詳細の変更。
- ログブリッジ API のクリーンアップ。
- 既存のセマンティック規約に関する主要な安定化作業。
- `http.server.active_requests` メトリクスへの破壊的変更。
  `http.status_code` 属性は廃止されました。

##### [Collector](/docs/collector/) と contrib {#collector-and-contrib}

Collector の[バージョン0.76.1/v1.0-rcv0011](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.76.1) がリリースされました。
[operator](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.75.0) はv0.75.0にアップデートされ、operator でのフィーチャーゲートのサポートが追加されました。

このリリースには、コネクターに関するいくつかのバグ修正と改善、および `confmap` コンポーネントへの破壊的変更が含まれています。

##### [Go](/docs/languages/go/) {#go}

[バージョン v1.15.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.15.0) がリリースされました！
これは Go における OpenTelemetry メトリクス v1 の公式リリースです。
いくつかの重要な変更とリネームがありますので、特にメトリクスを使用している方はリリースノートの全文をご確認ください。

##### [Java](/docs/languages/java/) {#java}

Java SDK の[バージョン1.25.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.25.0) がリリースされ、いくつかのバグ修正と改善が行われました。
このリリースには指数バケットヒストグラムへの変更が含まれていますので、ヒストグラムの自動設定に依存している場合は、詳細についてリリースノートをご確認ください。

加えて、[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.25.1) パッケージも1.25.1にアップデートされました。
主な変更点は以下のとおりです。

- R2DBC、JFR ストリーミングメトリクス、ZIO 2.0 の新しい計装を追加。
- JDBC 計装使用時に db.user からパスワードが出力されなくなりました。
- Apache HTTP Client ライブラリがクライアントメトリクスも出力するようになりました。
- セマンティック規約との整合化。

ほかにも多くの変更があります。ぜひリリースノートをご確認ください！

## プロジェクトアップデート {#project-updates}

KubeCon EU では1万人を超えるクラウドネイティブ開発者がアムステルダムに集まり、多くの方が OpenTelemetry ブースに立ち寄ってくれました！
限定版の KubeCon ステッカーを手に入れられた方もいらっしゃるとよいのですが。
もし手に入れられなかった方も、今後また限定版ステッカーを用意します。
ただし KubeCon 用ではありません。
KubeCon はもう終わりましたので。

素晴らしいフィードバックが数多くあり、私たちは今後数か月にわたりプロジェクトとして取り組むことを楽しみにしています。
たとえば以下のようなものです。

- Collector のコンポーネントの見つけやすさの改善。
- プルリクエストやイシューへの対応速度の向上。
- ログブリッジ API の完成とログの安定化。

KubeCon では、オブザーバビリティコミュニティから多くの素晴らしい講演もありました。
[Observability Day Europe](https://www.youtube.com/watch?v=2VuAIhL3xG4&list=PLj6h78yzYM2ORxwcjTn4RLAOQOYjvQ2A3) での講演もその中に含まれていました。
時間があればぜひご覧ください。
OpenTelemetry の実際の活用事例がとても興味深い内容です！

## ニュースと今後のイベント {#news-and-upcoming-events}

2023年7月に [OpenCensus はサンセット](/blog/2023/sunsetting-opencensus/)されます。
これが完了すると、OpenTracing と OpenCensus の単一の後継としての OpenTelemetry という当初の目標が実現されることになります！
