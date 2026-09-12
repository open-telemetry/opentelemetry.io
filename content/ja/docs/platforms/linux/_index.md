---
title: Linux ホスト上の OpenTelemetry
linkTitle: Linux
description: OpenTelemetry をシステムパッケージとしてインストールし、Linux
  ホスト上で動作するアプリケーションを自動的に計装します。
weight: 250
default_lang_commit: 6fa8e87cacb431b31061635fcddb55990e80538a
---

OpenTelemetry のセットアップは通常、アプリケーションの実行環境に依存します。
OpenTelemetry Operator のおかげで高度に自動化されている [Kubernetes](/docs/platforms/kubernetes/) や、OpenTelemetry Lambda レイヤーを備えた [Functions as a Service](/docs/platforms/faas/) のような環境もあります。
しかし、多くの Java、.NET、Node.js、Python アプリケーションは Linux ホスト上で直接動作しており、これらの計装にはエージェントを手動でダウンロードし、環境変数を自分で設定する必要がありました。

[OpenTelemetry Packaging SIG](https://github.com/open-telemetry/opentelemetry-packaging) は、OpenTelemetry をホスト自体の依存関係にする**システムパッケージ**を提供しています。
パッケージを1つインストールしてアプリケーションを再起動するだけで、ホスト上の Java、.NET、Node.js、Python プロセスが自動的に計装され、テレメトリーの送信を開始します。

## 仕組み {#how-it-works}

`opentelemetry` パッケージは、以下に依存するメタパッケージです。

- [OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector)。
  プロセスの起動時にサポートされているランタイムが対応する自動計装を読み込むよう、ダイナミックリンカーを設定します。
- Java、.NET、Node.js、Python 向けの言語固有の自動計装パッケージ。

インストール後、インジェクターはホスト上で新たに起動された、動的リンクされたすべてのプロセスにアタッチします。
サポートされているランタイムのプロセスにのみ作用し、対応する自動計装を読み込みます。
OpenTelemetry SDK がないランタイムのプロセスには影響しません。
すでに実行中のアプリケーションは、再起動後に計装されます。
デフォルトでは、テレメトリーは OTLP を使用して `localhost` のポート `4317`（gRPC）および `4318`（HTTP）にエクスポートされるため、通常はローカルの [OpenTelemetry Collector](/docs/collector/) を実行してテレメトリーを受信し、転送します。
Collector 自体は [OpenTelemetry Collector Releases](https://github.com/open-telemetry/opentelemetry-collector-releases) プロジェクトによってシステムパッケージとして配布されています。
このシステムパッケージリポジトリへの統合は [opentelemetry-collector-releases#1561](https://github.com/open-telemetry/opentelemetry-collector-releases/issues/1561) で追跡されています。

Packaging SIG と OBI SIG は、[OpenTelemetry eBPF Instrumentation](/docs/zero-code/obi/) もシステムパッケージとして提供し、Go、Rust、C++ などの追加ランタイムにゼロコード計装を拡張する予定です。

## はじめに {#get-started}

- [インストール](installation/)：リポジトリを追加し、Debian、Ubuntu、Fedora、または RHEL とその派生ディストリビューションにパッケージをインストールします。
- [設定](configuration/)：インジェクターが Collector またはバックエンドを参照するよう設定し、計装対象を調整します。

## ステータスと制限事項 {#status-and-limitations}

> [!WARNING]
>
> システムパッケージはまだ初期段階にあり、**本番ワークロードでの使用は想定されていません**。
> パッケージングの成熟に伴い、変更が発生する可能性があります。
>
> 具体的には以下のとおりです。
>
> - APT および YUM リポジトリは現在 GitHub Pages 上でホストされていますが、これは**最終的な提供場所ではありません**。
> - パッケージは**まだ署名されていない**ため、インストール手順では署名検証を無効にしています。
> - [OpenTelemetry Collector](/docs/collector/) はまだベースのメタパッケージに含まれていないため、現時点では別途インストールして実行する必要があります。
>
> Packaging SIG はエンドユーザーからのフィードバックを積極的に求めています。
> パッケージを試して、[opentelemetry-packaging](https://github.com/open-telemetry/opentelemetry-packaging) リポジトリにイシューを報告してください。

## さらに詳しく {#learn-more}

- ブログ記事：[One-command OpenTelemetry setup on Linux hosts](/blog/2026/packaging-first-repo/)
- [opentelemetry-packaging](https://github.com/open-telemetry/opentelemetry-packaging) リポジトリと毎週開催される SIG ミーティング。
