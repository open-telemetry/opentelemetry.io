---
title: JavaScript
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/JS_SDK.svg"
  alt="JavaScript"> JavaScript（Node.jsとブラウザ向け）でのOpenTelemetryの言語固有実装。
aliases: [/js/metrics, /js/tracing, nodejs]
redirects:
  - { from: /js/*, to: ':splat' }
  - { from: /docs/js/*, to: ':splat' }
weight: 20
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
drifted_from_default: true
---

{{% docs/languages/index-intro js /%}}

{{% include browser-instrumentation-warning.md %}}

## バージョンサポート {#version-support}

OpenTelemetry JavaScriptは、Node.jsのすべてのアクティブまたはメンテナンスLTSバージョンをサポートしています。
以前のNode.jsバージョンは動作する可能性がありますが、OpenTelemetryでテストされていません。

OpenTelemetry JavaScriptには、ブラウザの公式サポートリストはありません。
主要ブラウザの現在サポートされているバージョンで動作することを目指しています。

OpenTelemetry JavaScriptは、TypeScriptについてDefinitelyTypedのサポートポリシーに従い、2年のサポート期間を設定しています。
2年より古いTypeScriptバージョンのサポートは、OpenTelemetry JavaScriptのマイナーリリースで削除されます。

ランタイムサポートの詳細については、[この概要](https://github.com/open-telemetry/opentelemetry-js#supported-runtimes)を参照してください。

## リポジトリ {#repositories}

OpenTelemetry JavaScriptは以下のリポジトリで構成されています。

- [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js)、コア配布APIとSDKを含むコアリポジトリ。
- [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib)、APIとSDKのコア配布の一部ではないコントリビューション。

## ヘルプまたはフィードバック {#help-or-feedback}

OpenTelemetry JavaScriptについて質問がある場合は、[GitHub Discussions](https://github.com/open-telemetry/opentelemetry-js/discussions)または[CNCF Slack](https://slack.cncf.io/)の[#otel-js]チャンネルまでお問い合わせください。

OpenTelemetry JavaScriptに貢献したい場合は、[貢献手順](https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md)を参照してください。
