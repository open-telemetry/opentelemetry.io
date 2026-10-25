---
title: OpenTelemetry Go 2025年の目標
linkTitle: Go 2025年の目標
date: 2025-01-22
author: >-
  [Tyler Yahn](https://github.com/MrAlias) (Splunk)
sig: SIG Go
default_lang_commit: d77e62fcb215a6d125720da2909add086a87a913
# prettier-ignore
cSpell:ignore: codeboten dashpole dmathieu otelhttp otellogr otellogrus otelslog otelzap otelzerolog pellared Yahn
---

2025年の幕開けにあたり、[OpenTelemetry Go](https://github.com/open-telemetry/opentelemetry-go) チームは今年のロードマップを策定しました。
OpenTelemetry Go プロジェクトを前進させるとともに、より広い OpenTelemetry エコシステムとの統合を強化することに重点を置いています。

## 目標 {#goals}

目標の概要、想定されるタイムライン、各イニシアチブを支える主要コントリビューターを紹介します。

### 新しいセマンティック規約（Weaver） {#new-semantic-conventions-weaver}

- 優先度：第1四半期の目標
- トラッキングイシュー：
  [#5668](https://github.com/open-telemetry/opentelemetry-go/issues/5668)
- スポンサー：[@MrAlias](https://github.com/MrAlias)

セマンティック規約は OpenTelemetry の基盤であり、エコシステム全体のデータ品質の礎です。
OpenTelemetry コミュニティは最近、これらの規約を利用可能なコードに生成するためのツールを刷新し、[weaver](https://github.com/open-telemetry/weaver) プロジェクトを導入しました。
この新しいツールを OpenTelemetry Go プロジェクトに統合し、セマンティック規約の最新バージョンへの更新を提供する予定です。

### SDK のセルフオブザーバビリティシグナル {#sdk-self-observability-signals}

- 優先度：年間目標
- トラッキングイシュー：
  [#2547](https://github.com/open-telemetry/opentelemetry-go/issues/2547)
- スポンサー：[@dashpole](https://github.com/dashpole)

この目標は、OpenTelemetry Go SDK 自体のオブザーバビリティを強化することを目指しています。
最初のステップとして SDK のトレース部分に関するメトリクスを追加する予定ですが、SDK の全領域を計測するシグナルをさらに拡大したいと考えています。
すべての OpenTelemetry 言語間での統一されたセマンティック規約が、この目標の達成において重要な役割を果たします。

### Go ランタイムメトリクスの安定化 {#go-runtime-metrics-stabilization}

- 優先度：年間目標
- トラッキングイシュー：
  [#5655](https://github.com/open-telemetry/opentelemetry-go-contrib/issues/5655)
- スポンサー：[@dashpole](https://github.com/dashpole)

最近、Go チームが [Go 言語内のランタイムメトリクスを更新しました](https://github.com/golang/go/issues/67120)。
これらの更新は [OpenTelemetry セマンティック規約に体系化](https://github.com/open-telemetry/semantic-conventions/pull/981)されており、[`runtime` パッケージ](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/runtime#pkg-overview)でオプトインメトリクスとして提供されています。
Go SIG はコミュニティからフィードバックを収集し、これらのメトリクスをオプトアウトモデルに移行して、Go ランタイムのオブザーバビリティを向上させる予定です。

### Logs API の安定化 {#logs-api-stability}

- 優先度：年間目標
- トラッキングプロジェクト：
  [Go: Logs (GA)](https://github.com/orgs/open-telemetry/projects/43)
- スポンサー：[@pellared](https://github.com/pellared)

Logs API の安定化は、OpenTelemetry の包括的な目標に沿ったログソリューションを提供するために不可欠です。
現在、この API の安定版ではない「ベータ」実装が [`log` パッケージ](https://pkg.go.dev/go.opentelemetry.io/otel/log)で提供されており、一般的なログパッケージへの多数のブリッジも用意されています。

- [`otellogr`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otellogr)
- [`otellogrus`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otellogrus)
- [`otelslog`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otelslog)
- [`otelzap`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otelzap)
- [`otelzerolog`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otelzerolog)

Go SIG は上流の仕様開発への取り組みを継続する予定です。
OpenTelemetry Go 実装の安定化は、イベントの追加を含むこの上流の開発に依存しています。

### `otelhttp` の安定化 {#otelhttp-stabilization}

- 優先度：年間目標
- トラッキングプロジェクト：
  [Go: HTTP Semconv Migration](https://github.com/orgs/open-telemetry/projects/87)
- スポンサー：[@dmathieu](https://github.com/dmathieu)

[`otelhttp` 計装パッケージ](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp)を安定化することで、シームレスな HTTP オブザーバビリティと OpenTelemetry エコシステムとの統合の改善を実現します。
これを達成するには、まず計装をセマンティック規約の最新安定版を使用するようにアップグレードする必要があります。
現在、`otelhttp` パッケージは新しいバージョンへの移行中にセマンティック規約の複製をサポートしています。
すべての HTTP 計装でこの複製のサポートを完了し、その後すべての計装パッケージで最新のセマンティック規約をオプトアウトモデルに移行する予定です。

### ファイルベースの設定 {#file-based-configuration}

- 優先度：年間目標
- トラッキングラベル：
  [File-Based Configuration](https://github.com/open-telemetry/opentelemetry-go-contrib/labels/area%3A%20config)
- スポンサー：[@MrAlias](https://github.com/MrAlias)
  [@codeboten](https://github.com/codeboten)

この取り組みは、YAML および JSON ファイルによる SDK の設定を可能にすることに焦点を当てており、環境変数やコード変更だけに頼ることなく、ユーザーが OpenTelemetry をより簡単に導入・カスタマイズできるようにします。
現在、[`config` パッケージ](https://pkg.go.dev/go.opentelemetry.io/contrib/config)がこの機能の実装を提供しています。
[ファイルベースの設定が上流の仕様で安定化](https://github.com/orgs/open-telemetry/projects/38)されるのに合わせて、`config` をこれらの変更に追従させ、その開発にフィードバックを提供する予定です。

## まとめ {#wrapping-up}

OpenTelemetry Go チームは、2025年に向けて意欲的で焦点を絞った一連の目標を掲げています。
これらのイニシアチブにより、オブザーバビリティを取り巻く環境が強化され、開発者体験が向上し、より広いエコシステムにおける OpenTelemetry の統合が強化されます。
これらの目標を実現するために、コミュニティと協力できることを楽しみにしています！

皆さんのご意見をお聞かせください！
[トラッキング用の GitHub イシュー](https://github.com/open-telemetry/opentelemetry-go/issues/6175)にコメントして、不足している点や優先してほしい点をお知らせください。

私たちの取り組みに参加し、OpenTelemetry Go SIG のコントリビューターになりたい方は、毎週木曜日に 09:00 PT と 10:00 PT を交互に開催している SIG ミーティングと、[CNCF Slack](https://slack.cncf.io) の [#otel-go](https://cloud-native.slack.com/archives/C01NPAXACKT) チャンネルにご参加ください。
