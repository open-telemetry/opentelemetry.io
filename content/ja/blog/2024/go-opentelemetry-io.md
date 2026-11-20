---
title: go.opentelemetry.io の移行計画
date: 2024-08-27
author: '[Mike Dame](https://github.com/damemi) (Google)'
body_class: otel-with-contributions-from
issue: 5086
sig: Go SIG
default_lang_commit: edfda068e00cd45e50a77967e193baad2beeccb5
cSpell:ignore: vanityurls Yahn
---

Tyler Yahn と Austin Parker の協力によるものです。

## TL;DR {#tldr}

[go.opentelemetry.io][] へのリクエストを処理するアプリケーションは、2024年9月5日の東部時間午前11時頃に新しいホストへ移行されます。
**あなた側で必要な変更はありません**。
この移行中にダウンタイムが発生する可能性は低いですが、ゼロではないため、このお知らせを公開しています。

## 詳細 {#details}

OpenTelemetry は、2024年9月5日に `go.opentelemetry.io` へのすべてのリクエストを処理するアプリケーションを新しいホストプロジェクトへ移行する予定です。
この日に、`go.opentelemetry.io` の現在の DNS エントリが新しいホストを指すように更新されます。

これはシームレスな移行となるはずですが、この期間中にダウンタイムが発生する可能性があります。
OpenTelemetry のエンジニアがリスクを最小限に抑えるため、移行を能動的に監視します。

### 影響を受けるリソース {#affected-resources}

今回の変更で問題が発生する可能性は低いものの、万一発生した場合は、以下のドメインからの Go パッケージのダウンロードに影響が及びます。

- `go.opentelemetry.io/auto`
- `go.opentelemetry.io/build-tools`
- `go.opentelemetry.io/collector-contrib`
- `go.opentelemetry.io/collector`
- `go.opentelemetry.io/contrib`
- `go.opentelemetry.io/otel`
- `go.opentelemetry.io/proto`

これには、以下のアーティファクトのユーザーも含まれることに注意してください。

- OpenTelemetry Go 言語ライブラリ（Contrib を含む）
- OpenTelemetry Go 自動計装ライブラリ
- OpenTelemetry コレクターライブラリ（Contrib を含む）
- OpenTelemetry Collector Builder

## あなたがすべきこと {#what-you-need-to-do}

**あなた側で必要なアクションはありません。**
`go.opentelemetry.io`（およびサブモジュールパス、たとえば `go.opentelemetry.io/otel`）を使用したすべてのインポートは引き続き機能します。
これを変更する予定はありません。

## 気づくかもしれないこと {#what-you-might-notice}

この移行中に [go.opentelemetry.io][] ドメインでダウンタイムが発生する可能性があります。
その場合、`go.opentelemetry.io` モジュールをインポートしているプロジェクトのコンパイルが失敗する可能性があります。

これは、DNS の伝搬の遅延や設定ミスなど、いくつかの要因によって発生する可能性があります。
この期間中は複数のメンテナーが同時に対応し、ダウンタイムが発生した場合は最小限に抑えます。

この移行後に問題が発生した場合は、[Slack #otel-go](https://cloud-native.slack.com/archives/C01NPAXACKT) で連絡を取るか、[opentelemetry-go-vanityurls](https://github.com/open-telemetry/opentelemetry-go-vanityurls) に[イシューを作成](https://github.com/open-telemetry/opentelemetry-go-vanityurls/issues/new)してください。

## なぜこの変更を行うのか {#why-are-we-making-this-change}

この移行は、リクエストを処理するアプリケーションのモダナイゼーションと所有権の移転の両方に対応し、OpenTelemetry Go パッケージを安全かつ堅牢な方法で提供し続けられるようにするためのものです。

詳細については、[この変更を提案するコミュニティの GitHub イシュー](https://github.com/open-telemetry/community/issues/2260)を参照してください。

[go.opentelemetry.io]: https://go.opentelemetry.io
