---
title: OpenTelemetry in Focus、2023年9月
linkTitle: OTel in Focus 2023/09
date: 2023-10-01
author: '[Austin Parker](https://github.com/austinlparker)'
default_lang_commit: ae6f19265db7d108bae078c7cc1814d208bd6f4a
# prettier-ignore
cSpell:ignore: attributesprocessor Autoscaler checkapi Contribfest coreinternal jaegerthrifthttp obsreport ottl resourcedetection resourceprocessor tailsampling ucum
---

**OpenTelemetry in Focus** の2023年9月号へようこそ！
秋風が吹き始め、KubeCon と Observability Day に向けてプロジェクトは活発な動きを見せています。
参加予定ですか？
初開催の OpenTelemetry Contribfest、Project Pavilion などで皆さまにお会いできることを楽しみにしています！

メンテナーの方でここで取り上げてほしい内容がある場合は、[Austin Parker にメール](mailto:austin+otel@ap2.io)、または [CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルでご連絡ください。

## リリースと更新 {#releases-and-updates}

主要なリポジトリの最新アップデートをお届けします。

<!-- markdownlint-disable heading-increment -->

##### [仕様](/docs/specs/otel/) {#specification}

最新アップデート（v1.25.0）は、主にメトリクスとログにいくつかの変更をもたらしました。
メトリクス名の最大長が63文字から255文字に増加しました。
`MetricProducer` の仕様がフィーチャーフリーズとなり、安定化されました。
同期ゲージ計装の追加やメトリクスポイントの永続性に関する明確化が実施され、「advice」という用語が「advisory parameters」に置き換えられました。
`SimpleFixedSizeExemplarReservoir` のデフォルトサイズを1とする新しいルールが策定されました。
ログでは、GCP データモデルが `gcp.trace_sampled` のかわりに `TraceFlags` を使用するよう更新されました。
また、OpenTelemetry Protocol の変更により、OTLP エクスポーター仕様における「transient error」の定義が修正および明確化されました。

互換性の更新には、OpenTracing Shim と Prometheus の変更が含まれており、後者は Prometheus から OpenTelemetry への変換時にデフォルトでメトリクス名の変更が許可されるようになりました。

詳細については、[v1.24.0 と v1.25.0 の間の変更点](https://github.com/open-telemetry/opentelemetry-specification/compare/v1.24.0...v1.25.0)をご覧ください。

##### [Collector](/docs/collector/) {#collector}

OpenTelemetry Collector の最新リリース（v0.86.0）では、いくつかの重要な更新が行われました。
logging エクスポーターが非推奨となり、新しく追加された debug エクスポーターに置き換えられました。
さらに、linux/s390x アーキテクチャがクロスビルドテストに組み込まれました。

このリリースでは重要な API 変更が行われました。
`service.PipelineConfig` が削除され、破壊的変更となりました。
いくつかの `obsreport` モジュールの関数と構造体が非推奨となり、主に Exporter、Processor、Receiver、Scraper の機能に関連するものです。
これらの機能はさまざまなヘルパーモジュールに移動されました。

詳細な説明と、それぞれの移動先および非推奨情報へのリンクは、[リリースページ](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.86.0)で確認できます。

[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.86.0) にも多くの更新が含まれています。
重要な破壊的変更として、非推奨の `jaeger` および `jaegerthrifthttp` エクスポーターの削除や、`checkapi` に準拠するための `pkg/ottl`、`pkg/stanza`、`mongoDb` レシーバー、Azure Monitor エクスポーター、`tailsampling` プロセッサーなどの複数パッケージに関する変更が含まれます。

機能強化には、`tailsampling` プロセッサーでのサブ秒の判定待ち時間、`resourcedetection` プロセッサーでのホストの cpuinfo 属性サポート、`split.Config` への 'omit_pattern' 設定の追加、`pkg/ottl` パッケージへの新しい 'TruncateTime' 関数の追加や関数呼び出しにおける名前付き引数のサポートなどが含まれます。

`tailsampling` プロセッサーが重複するポリシー名を受け入れてしまう問題、AWS EMF Exporter での NaN 値を持つメトリクスの JSON マーシャルエラー、エクスポート時の AWS X-Ray メタデータ構造の復元など、さまざまなコンポーネントのバグ修正が実施されました。

v0.85.0 でもいくつかの破壊的変更がありました。

- 非推奨の Kubernetes API リソースである HorizontalPodAutoscaler v2beta2 と CronJob v1beta1 の削除により、Kubernetes 1.22 以前ではこれらのリソースのメトリクスが出力されなくなりました。
- Prometheus エクスポーターがデフォルトで型とユニットの接尾辞を追加するようになりました。
  これは "add_metric_suffixes" を false に設定することで無効にできます。
- `attributesprocessor` と `resourceprocessor` のフィーチャーゲート `coreinternal.attraction.hash.sha256` が安定版に移行しました。

更新前にリリースノートを注意深く確認してください。

[Operator v0.85.0](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.85.0) がリリースされました。
機能強化として、自動計装における Alpine ベースのイメージ向け .NET 自動計装サポートの追加、Go 自動計装サポートの v0.3.0-alpha へのアップグレードが行われました。
さらに、Operator は Collector CRD でマウントする ConfigMap のリストを指定できるようになり、複雑さと重複を軽減する新しいリコンシリエーション方法が導入されました。
また、Operator がインスタンスの変更時にアップグレードメカニズムを確実に実行するようにするバグが修正されました。
これは、Operator のアップグレード時にアンマネージドからマネージド状態に移行するインスタンスに特に有用です。
コンポーネントの更新には、OpenTelemetry Collector、Contrib、および各言語固有の自動計装が含まれます。

重要な変更：Operator は、インスタンスの変更を処理するための信頼性の高いアップグレードメカニズムの導入を可能にしました。

破壊的変更：Go 自動計装サポートが以前のバージョンから v0.3.0-alpha に大幅にアップグレードされ、大きな変更が含まれる可能性があります。

このリリースには v0.84.0 からの破壊的変更も含まれています。

- ターゲットアロケーターのデフォルトのメモリおよび CPU 制限が削除され、Collector のデフォルトに合わせられました。
- Prometheus エクスポーターが使用される場合に ServiceMonitor が作成されるようになりました。

##### [Java](/docs/languages/java/) {#java}

[バージョン1.30](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.30.1) には、インキュベーティング API と SDK への多数の更新が含まれています。
API インキュベーターでは、実験的な同期ゲージが追加されました。
SDK メトリクスシステムでは、属性アドバイス API、AttributesProcessor の `toString`、属性フィルターヘルパーの追加、メトリクス名の最大長の63文字から255文字への増加が行われました。
Prometheus エクスポーターでは、非 ucum ユニットと TYPE および HELP コメントでのメトリクス名へのユニット追加に関する変更が行われました。

SDK Extensions では、インキュベーターにファイルベースの設定サポートが追加されました。
Autoconfigure の `ConfigProperties#getMap` フィルターで空白値エントリを処理するよう更新されました。

開発者に注目すべき重要な非推奨があります。
`io.opentelemetry:opentelemetry-semconv` が削除予定として非推奨となり、代替として新しいリポジトリから `io.opentelemetry.semconv:opentelemetry-semconv:1.21.0-alpha` が導入されました。

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.30.0) では、新しい Java エージェント計装の追加、機能強化、バグ修正を含む重要な変更がもたらされました。
重要な変更として、実験的な HTTP サーバーメトリクスの別クラスへの分離、`HttpClientResend` と `HttpRouteHolder` の `HttpClientResendCount` と `HttpServerRoute` へのリネーム、非推奨の設定の削除が含まれます。

Hibernate Reactive 向けの新しい Java エージェント計装が追加されました。
機能強化には、AWS Secrets Manager JDBC URL のサポート、セマンティック規約変更に対する改善されたサポート、計装 BOM への `javaagent` の追加などが含まれます。
OpenJ9 での `getDefinedPackage` ルックアップの問題、Lettuce 計装でのキーのシリアライズ、トリガーなしでは JMX を使った自動計装が動作しない問題など、いくつかのバグも修正されました。

#### [Go](/docs/languages/go/) {#go}

[バージョン1.19.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.19.0) は、メトリクスの最初の安定版リリースであり、標準的なプロジェクトの安定性保証が `go.opentelemetry.io/otel/sdk/metric` パッケージに適用されるようになりました。

追加された機能には、新しい「Roll the Dice」アプリケーションの例、`io.Writer` をカスタマイズして人間が読みやすい JSON 形式で出力を表示する `WithWriter` および `WithPrettyPrint` オプションが含まれます。

主な変更として、メトリクス計装名での '/' 文字の使用が許可されたこと、エクスポーターのデフォルト出力形式がよりコンパクトになったことが挙げられます。

修正された問題には、スコープが無効であるとわかっていても、SDK が Collect のたびに Prometheus メトリクスを作成しようとする再発性の問題が含まれます。
削除に関しては、`go.opentelemetry.io/otel/bridge/opencensus.NewMetricExporter` が `NewMetricProducer` に置き換えられました。

コンテンツが多いため、詳細は [Full Changelog](https://github.com/open-telemetry/opentelemetry-go/compare/v1.18.0...v1.19.0) を参照してください。

v1.18.0 にはいくつかの非推奨と削除が含まれていたことにご注意ください。

- Jaeger は OTLP をネイティブで受け付けるようになったため、Jaeger エクスポーターとサンプルが削除されました。
- バージョン1.20 より前の Go 互換性は保証されなくなりました。

#### [JavaScript](/docs/languages/js/) {#javascript}

[バージョン1.17.0](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.17.0) は、以前のリリースでの意図しない破壊的変更を修正しました。

実験的パッケージにいくつかの重要な変更があり、レガシー設定 API の非推奨が含まれます。

#### [.NET](/docs/languages/dotnet/) {#net}

[バージョン1.6.0](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.6.0) には、メトリクスへの軽微な更新が含まれています。

## ニュースと今後のイベント {#news-and-upcoming-events}

KubeCon North America がまもなくシカゴで開催され、スケジュールが発表されました！
[オブザーバビリティトラックをチェック](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/)して、OpenTelemetry、Prometheus などに関するトークをご覧ください。

[Observability Day](https://colocatedeventsna2023.sched.com/overview/type/Observability+Day) も開催され、素晴らしいイベントになりそうです！
上記リンクから発表されたスケジュールをご確認ください。

初開催の [Contribfest](https://kccncna2023.sched.com/event/1R2rQ) のお知らせもあります！
Collector と JavaScript SIG のメンテナーとともにイシューや PR に取り組み、OpenTelemetry への貢献方法について学ぶ機会があります。

今週のブログでは、この11月の KubeCon で行われるすべてのイベントの詳細をお届けしますので、お見逃しなく！
