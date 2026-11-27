---
title: Zipkin エクスポーターの非推奨化
linkTitle: Zipkin エクスポーターの非推奨化
date: 2025-12-01
author: >-
  [Liudmila Molkova](https://github.com/lmolkova) (Grafana Labs)
sig: Specification
issue: https://github.com/open-telemetry/opentelemetry-specification/pull/4715
default_lang_commit: 2073cde8dd434307b85758ed0eda50108f36b3b6
cSpell:ignore: Liudmila Molkova
---

OpenTelemetry プロジェクトは、[Zipkin の OTLP インジェストサポート](https://github.com/openzipkin-contrib/zipkin-otel)を推奨する形で、Zipkin エクスポーターの仕様を非推奨化します。

このマイルストーンの達成にご協力いただいたすべての Zipkin コントリビューターに感謝します！

各言語エコシステムにおける利用パターンを分析した結果、コミュニティが OTLP に強く傾倒しており、Zipkin エクスポーターの採用は限定的であることがわかりました。
いくつかの言語では、すでに非推奨となった Jaeger エクスポーターよりもさらに少ない状況です。
関連するイシューへのユーザーエンゲージメントも少なく、代替手段も利用可能であることから、OTel SDK における Zipkin エクスポーターを廃止する適切な時期であると考えています。

## タイムラインと移行パス {#timeline-and-migration-path}

- **仕様の非推奨化**: 2025年12月より有効。
- **SDK サポート**: 既存の安定版 Zipkin エクスポーターは、[SDK の安定性保証](/docs/specs/otel/versioning-and-stability/#sdk-support)に従い、少なくとも **2026年12月** まではセキュリティパッチと重要なバグ修正の提供が継続されます。
- **新規 SDK**: 新しい言語の SDK では Zipkin エクスポーターの実装は必須ではありません。

## ユーザーが取るべき対応 {#what-should-users-do}

現在 Zipkin エクスポーターを使用している場合、2つの移行パスがあります。

- **OTLP への切り替え**（推奨）: アプリケーションが OTLP でトレースを送信するように設定し、[Zipkin の OTLP インジェストサポート](https://github.com/openzipkin-contrib/zipkin-otel)を有効にしてください。
- **コレクターの使用**: OTLP データを OpenTelemetry コレクター経由でルーティングし、コレクターの [Zipkin エクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/exporter/zipkinexporter?from_branch=main)を使用してください。

## ご質問は？ {#questions}

CNCF Slack の [#otel-specification](https://cloud-native.slack.com/archives/C01N7PP1THC) チャンネルでお問い合わせいただくか、[opentelemetry-specification](https://github.com/open-telemetry/opentelemetry-specification) リポジトリでイシューを作成してください。
