---
title: OpenTelemetry in Focus、2023年6月
linkTitle: OTel in Focus 2023/06
date: 2023-07-01
author: '[Austin Parker](https://github.com/austinlparker)'
default_lang_commit: 68b7340491696eb69518241d46fd821e38e368a2
cSpell:ignore: Dyrmishi Farfetch Inet Ktor scraperhelper Skywalking
---

**OpenTelemetry in Focus** の2023年6月号へようこそ！
公式に夏が始まりましたが、暑いのは外だけではありません。
今月はいくつかの大きな発表とリリースがありました。

メンテナーの方でここで取り上げてほしい内容がある場合は、[Austin Parker にメール](mailto:austin+otel@ap2.io)、または [CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルでご連絡ください。

## リリースと更新 {#releases-and-updates}

主要なリポジトリの最新アップデートをお届けします。

<!-- markdownlint-disable heading-increment -->

##### [仕様](/docs/specs/otel/) {#specification}

[バージョン1.22](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.22.0) では、メトリクスにおいて「アグリゲーター」という用語を将来のために確保するという推奨事項の規範化、OTLP 仕様の opentelemetry-proto リポジトリへの移動、カスタム属性を OTel 名前空間に配置することが推奨されない理由の説明が含まれています。

その他の領域に変更はありません。

##### [Collector](/docs/collector/) {#collector}

[バージョン0.80.0](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.80.0) が 0.79 と合わせてリリースされました。

0.80.0 には非推奨化、機能強化、モジュール分割が含まれています。
非推奨化は `service.PipelineConfig` を廃止し `pipelines.Config` を推奨するものです。
機能強化にはドライランフラグの追加、TLS 設定をメモリ上で提供できるようにする変更、コネクターノードの更新、各種モジュールの更新が含まれます。

0.79.0 には非推奨化、機能強化、バグ修正が含まれています。
このリリースでは `Host.GetExporters` 関数が非推奨となり、components コマンドの出力にコネクターが追加され、scraperhelper の動作が改善され、multiBatcher がグローバルロックを回避するよう最適化され、コネクターでのデータ複製に関するバグが修正されました。

加えて、[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.80.0) もリリースされました。
主な変更には、WebSocket プロセッサーの追加、各種レシーバーでのメトリクス単位の更新、SumoLogic エクスポーターでのオプションの非推奨化が含まれます。
詳細はリリースノートをご確認ください。

0.79.0 には多くのバグ修正と機能強化が含まれており、ハッシュアルゴリズムの破壊的変更やエンドポイント要件の変更がありました。
機能強化にはメトリクス取得の改善や新しい設定オプションが含まれ、バグ修正ではサブプロセスのキャンセルや不正なログストリームフィルタリングに関する問題が解決されました。

6月には [Operator](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.80.0) のリリースが3回ありました。
最新のリリース v0.80.0 では、Skywalking パーサーの追加や Prometheus CR スクレイプ設定の認証情報の設定などの機能強化が導入されました。
バグ修正にはアップグレードメカニズムと空のグローバルスクレイプインターバルに関する修正が含まれ、Operator に NGINX 自動計装の新しいコンポーネントが追加されました。

0.79.0 の Operator には、Node.js 自動計装向けの Prometheus メトリクスエクスポーターのサポートや、計装されたアプリケーションの環境にサービスバージョンを注入する機能などの機能強化が含まれています。
また、OpenTelemetry Collector のバージョンがステータスフィールドに正しく表示されない問題のバグ修正もあります。

0.78.0 には各種パッケージの更新、Pod カスタムメトリクスによるスケーリングのサポート、設定バリデーションの改善などの機能強化が含まれています。
バグ修正には prometheus relabel 設定に関する問題の対応や、Go 自動計装のデフォルトバージョンの正しい設定が含まれます。
更新されたコンポーネントには、OpenTelemetry Collector、OpenTelemetry Contrib、Java 自動計装、.NET 自動計装、Node.js、Python、Go、Apache HTTP Server が含まれます。

##### [Java](/docs/languages/java/) {#java}

[バージョン1.27](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.27.0) では、Log Bridge API と SDK が安定版になりました。
重要な変更として、ログ関連のコンテンツが適切なアーティファクトに統合され、ログ SDK アーティファクトが安定版としてマークされ、opentelemetry-sdk-extension-autoconfigure における otel.logs.exporter のデフォルト値が変更されました。
このリリースには、API、SDK、メトリクス、エクスポーター、テスト、SDK エクステンション、セマンティック規約に関するさまざまなバグ修正と改善も含まれています。

注意：Log Bridge API はエンドユーザー向けではありません。
既存のアペンダー（Log4j、SLF4J、Logback、JUL など）を OpenTelemetry にブリッジするために使用されます。

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.27.0) がリリースされ、いくつかのマイグレーションが必要です。

- マイグレーションに関する注意事項：Jersey 3.0 計装のサプレッションキーの変更、opentelemetry-runtime-metrics アーティファクトのリネームと分割、InetSocketAddressNetServerAttributesGetter および InetSocketAddressNetClientAttributesGetter の非推奨化、新しい HTTP およびネットワークセマンティック規約の導入。
- Quarkus RESTEasy Reactive と Reactor Kafka 向けの新しい Java エージェント計装。
- Micrometer ブリッジ、Ktor 計装、AWS SDK サポート、OkHttp 3、Jetty 11、Spring Boot、AWS Lambda トレーシング、型マッチングの改善を含む機能強化。
- Logback MDC 計装、Kafka メトリクスレポーター、Jetty コンテキストリーク、スカラー Mono/Flux インスタンスのフィルタリングなどに関するバグ修正。

#### [JavaScript](/docs/languages/js/) {#javascript}

[バージョン1.14](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.14.0) では、`SpanExporter` インターフェイスにオプショナルな `forceFlush` メソッドが追加されました。

#### [.NET](/docs/languages/dotnet/) {#net}

[バージョン1.5.1](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.5.1) が 1.5.0 と合わせてリリースされました。
1.5.1 は 1.5.0 で発生した問題に対する修正であり、1.5.0 では以下の主な変更が行われました。

- 1.5.0-rc.1 で発生した「Build」エクステンションが null を返すバグが修正されました。
- Exemplars 機能が内部としてマークされ、1.6.x プレリリースバージョンで再追加される予定です。
- IServiceCollection が変更可能な状態で MeterProviderBuilders を設定するための新しいオーバーロードが追加されました。
- Console および OpenTelemetryProtocol エクスポーターが Exemplars のエクスポートをサポートしなくなりました。
- ASP.NET Core 計装が更新され、Activity 停止時にバゲージがクリアされる問題が修正され、System.Text.Encodings.Web への直接参照が追加されました。
- HTTP 計装が更新され、ネットワーク障害時のメトリクスデータ欠落の問題が修正され、一般的なステータスコード値のボクシングを回避することでパフォーマンスが向上しました。

## プロジェクトとコミュニティの更新 {#project-and-community-updates}

### OTLP 1.0 がリリースされました {#otlp-10-is-here}

OTLP 1.0 がリリースされました（もしくは間もなくリリースされます）！
これが何を意味するかについて、後日ブログで詳細を公開する予定です。
仕様とプロトコルが 1.0 であるからといって、すべての OpenTelemetry SIG がそれを採用またはリリースしたわけではないことにご注意ください。
今後の情報にご注目ください。

これは依然として大きな成果であり、貢献されたすべての方に大いなるお祝いを申し上げます。
ありがとうございます！

### ブログより {#from-the-blog}

最新のブログ記事をご紹介します。
記事を寄稿しませんか？
ぜひご連絡ください！

- [エンドユーザー Q&A：Farfetch における OTel](/blog/2023/end-user-q-and-a-03/) は、Farfetch の Iris Dyrmishi をフィーチャーした、エンドユーザー Q&A シリーズの最新記事です。

- [ランタイムオブザーバビリティを備えた Kubernetes クラスターの作成](/blog/2023/k8s-runtime-observability/) では、Kubernetes コンポーネントの最新のトレーシング機能を使用して K8s クラスターをより深く理解する方法について解説しています。

## ニュースと今後のイベント {#news-and-upcoming-events}

Observability Day が KubeCon North America としてシカゴにやってきます！
CFP は8月6日まで受け付けています。
[今すぐトークを応募しましょう！](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/co-located-events/cfp-colocated-events/)
