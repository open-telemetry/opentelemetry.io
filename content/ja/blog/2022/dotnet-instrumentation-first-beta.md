---
title: OpenTelemetry .NET 自動計装が初のベータをリリース
linkTitle: .NET 自動計装ベータ
date: 2022-05-12
author: OpenTelemetry .NET Automatic Instrumentation Team
default_lang_commit: 41477529b5ad5d600c36c57803b3df9cda150941
cSpell:ignore: devopsnote librarysupport
---

[OpenTelemetry .NET 自動計装](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation)プロジェクトの[初のベータリリース](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/tag/v0.1.0-beta.1)を発表できることを嬉しく思います！

このプロジェクトがなければ、.NET 開発者はテレメトリーデータを自動的に生成するために計装ライブラリを使用する必要があります。
たとえば、受信する ASP.NET Core リクエストを計装するには、ASP.NET Core 計装ライブラリを使用し、OpenTelemetry SDK で初期化する必要があります。

現在、開発者は[自動計装](/docs/specs/otel/glossary/#automatic-instrumentation)を使用して[シグナル](/docs/specs/otel/glossary/#signals)プロバイダーを初期化し、サポートされている[計装済みライブラリ](/docs/specs/otel/glossary/#instrumented-library)のテレメトリーデータを生成できます。
このアプローチにはいくつかの利点があります。

- [バイトコード計装](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/design.md#bytecode-instrumentations)による自動計装をサポートするための技術的な道筋が開かれ、公開されている計装ライブラリだけに頼る場合よりも、自動計装の対象を広げられる可能性がある
- 計装ライブラリのインストールと初期化が不要
- 自動計装を追加するためにアプリケーションを修正して再ビルドする必要がない
- 開始に必要なコードが少ない

この初のベータリリースは、豊富な自動計装機能を構築するための技術的基盤を確立する重要なマイルストーンです。
このリリースには以下のサポートが含まれています。

- コード変更なしで .NET アプリケーションからトレースデータを収集[^devopsnote]
- SDK がサポートしていない .NET ライブラリからのトレースデータの収集[^librarysupport]

OpenTelemetry .NET 自動計装がカバーするさまざまな計装シナリオのデモについては、[サンプル](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/tree/v0.1.0-beta.1/examples)を参照してください。

今後数か月で以下を計画しています。

- 追加の[計装ライブラリ](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/config.md#instrumented-libraries-and-frameworks)のサポート
- 依存関係管理の改善
- メトリクスサポートの有効化

ぜひ**フィードバック**をお寄せください（お好みの方法で）。

- [GitHub イシューを作成する](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/new)。
- [Slack](https://cloud-native.slack.com/archives/C01NR1YLSE7) でご連絡ください。
  初めての方は [CNCF Slack アカウントを作成](https://slack.cncf.io/)できます。

[^devopsnote]: [サポートされているシナリオとサポートされていないシナリオのドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/design.md#supported-and-unsupported-scenarios)に現在の制限が記載されています。

[^librarysupport]: [計装ライブラリのドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/config.md#instrumented-libraries-and-frameworks)に、テレメトリーデータを収集可能なライブラリの一覧が記載されています。
