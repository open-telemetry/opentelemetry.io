---
title: プロファイリングの現状
linkTitle: プロファイリングの現状
date: 2024-10-25
author: >-
  [Damien Mathieu](https://github.com/dmathieu) (Elastic), [Pablo
  Baeyens](https://github.com/mx-psi) (Datadog), [Felix
  Geisendörfer](https://github.com/felixge) (Datadog), [Christos
  Kalkanis](https://github.com/christos68k) (Elastic), [Morgan
  McLean](https://github.com/mtwo) (Splunk), [Florian
  Lehner](https://github.com/florianl) (Elastic), [Tim
  Rühsen](https://github.com/rockdaboot) (Elastic)
issue: https://github.com/open-telemetry/opentelemetry.io/issues/5477
sig: Profiling SIG
default_lang_commit: 6cc9e7715937274a7195b9275aab44e6e602ee34
cSpell:ignore: Baeyens Florian Geisendörfer Kalkanis Lehner Mathieu Rühsen
---

約半年前、OpenTelemetry は[プロファイリングシグナルのサポート](/blog/2024/profiling/)を発表しました。
このシグナルはまだ開発中であり、本番環境での使用は推奨されていませんが、Profiling SIG は多くの面で大きな進展を遂げています。

この記事では、過去半年間に Profiling SIG が達成した進捗の概要を紹介します。

## OTLP の改善 {#otlp-improvements}

プロファイルは [v1.3.0](https://github.com/open-telemetry/opentelemetry-proto/releases/tag/v1.3.0) で OTLP の新しいシグナルタイプとして追加されましたが、変更を続けているため、この領域はまだ不安定（unstable）としてマークされています。

当初の意図は [pprof](https://github.com/google/pprof) とのワイヤー互換性を維持することでしたが、その目標は現実的ではないことが判明したため、Profiling SIG は[プロトコルをリファクタリングし、pprof との厳密な互換性を目指さないことを決定](https://github.com/open-telemetry/opentelemetry-proto/issues/567#issuecomment-2286565449)しました。
かわりに、他のシグナルで既に行っているのと同様に、変換可能性を目指します。
この移行はまだ進行中であり、プロトコルのプロファイリングセクションにいくつかの破壊的変更を引き起こしています。
なお、これはメトリクス、スパン、ログ、リソースなど、OTLP プロトコルの大部分を占める安定したセクションには影響しません。

## eBPF エージェントの改善 {#ebpf-agent-improvements}

6月に、[Elastic の継続的プロファイリングエージェントの寄贈](/blog/2024/elastic-contributes-continuous-profiling-agent/)が完了しました。
それ以来、[opentelemetry-ebpf-profiler](https://github.com/open-telemetry/opentelemetry-ebpf-profiler) リポジトリでは活発に改善が進んでいます。

eBPF エージェントの次の目標は、Collector のレシーバーとして動作させることです。
これが完了すると、Collector を各ノード上でエージェントとして実行し、そのホストのプロファイルを収集して OTLP で転送できるようになります。
このアーキテクチャにより、ホストメタデータやシステムメトリクスの取得など、厳密にはプロファイリングではないエージェントの特定の部分を抽出してプロセッサーに移すことができ、エージェントをより軽量でモジュラーにできます。

## Collector のサポート {#collector-support}

[v0.112.0](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.112.0) 以降、OpenTelemetry Collector はプロファイリングデータの受信、処理、エクスポートが可能になり、OTLP を使用したプロファイルの取り込みとエクスポートをサポートしています。

Collector で `service.profilesSupport` [フィーチャーゲート](https://github.com/open-telemetry/opentelemetry-collector/blob/9b978f74f37af17e18896b297dd7d929b362674b/featuregate/README.md?from_branch=main#controlling-gates)を有効にし、以下のような設定を行うことで試すことができます。
この設定は OTLP を使用してデータを取り込み、エクスポートします。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
exporters:
  otlp:
    endpoint: 'localhost:4317'
service:
  pipelines:
    profiles:
      receivers: [otlp]
      exporters: [otlp]
```

この機能は現在 Collector で使用できますが、本番環境での使用はまだ推奨しません。
まだ活発に開発中であり、上述の OTLP の変更のような破壊的変更が予想されます。

ただし、Collector でのこのサポートにより、Collector のすべてのレシーバー、プロセッサー、エクスポーターでプロファイルのサポートを追加できるようになりました。
将来のよりスムーズな統合を可能にし、潜在的な問題を早期に発見するために、ぜひ追加することをお勧めします。
バグの報告や貢献をしたい場合は、[contrib リポジトリで確認](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22+label%3Adata%3Aprofiles)できます。

## セマンティック規約と仕様 {#semantic-conventions-and-specification}

相互運用性を向上させるために、Profiling SIG は[プロファイリングの OpenTelemetry セマンティック規約](/docs/specs/semconv/registry/attributes/profile/)にも取り組みました。
また、[プロファイリングの OpenTelemetry 仕様](https://github.com/open-telemetry/opentelemetry-specification/pull/4197)を導入する作業も進行中です。
この作業は今後も続き、さまざまなプラットフォーム、ツール、その他の OTel シグナルにわたる幅広い採用を可能にするはずです。

## 次のステップ {#whats-next-}

OpenTelemetry でのプロファイルのサポートは急速に進んでおり、安定したシグナルを提供できるようになるまでにはまだ遠いですが、すでに試してみることができ、各自のモジュールに統合できるようになったことを嬉しく思います。

プロファイリングの前進に貢献したい方や、統合で問題に直面している方は、Profiling SIG がいつでも喜んでお手伝いします。

CNCF Slack の [#otel-profiles](https://cloud-native.slack.com/archives/C03J794L0BV) でお会いしましょう。
