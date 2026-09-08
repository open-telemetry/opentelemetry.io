---
title: OpenTelemetry PHP Distro
linkTitle: PHP Distro
description: >-
  PHP 向けの本番環境対応ゼロコード OpenTelemetry 計装。ネイティブ Linux パッケージとして提供されます。
weight: 30
aliases: [/docs/zero-code/php-distro/]
default_lang_commit: 669d1a40e56ed2dd914d48340b31e16a83610d40
cSpell:ignore: apk rpm
---

OpenTelemetry PHP Distro は、PHP アプリケーションを OpenTelemetry で計装するための、本番環境に特化したディストリビューションです。

多くの PHP 環境では、Composer のみのワークフローでは計装が困難です（ロックダウンされたホスト、限られたビルドツール、厳格なデプロイパイプラインなど）。
OpenTelemetry PHP Distro はそのような本番環境の現実に焦点を当てています。

- OS パッケージ（`deb`、`rpm`、`apk`）でインストール
- PHP プロセスを再起動
- テレメトリーの送信を開始

一般的なセットアップでは、アプリケーションコードの変更は不要です。

## 含まれるもの {#what-is-included}

Distro は以下を組み合わせたものです。

- ネイティブ PHP エクステンションとローダー（`.so` アーティファクト）
- PHP ランタイム/ブートストラップロジック
- 一般的なライブラリやフレームワーク向けの自動計装の依存関係
- Linux ディストリビューション向けのパッケージングスクリプト

## 主な機能 {#key-features}

- `deb`、`rpm`、`apk` ワークフロー向けのネイティブ OS パッケージ
- インストール後の自動ブートストラップと自動計装
- バックグラウンドでのテレメトリー送信（ノンブロッキング）
- 推論スパンと自動ルートスパン生成
- トランザクションルートスパンの URL グルーピング
- ネイティブ OTLP protobuf シリアライゼーション（別途 `ext-protobuf` 不要）
- PHP `8.1` から `8.4` のサポート

## 他の OTel PHP プロジェクトとの関係 {#relationship-to-other-otel-php-projects}

OpenTelemetry PHP Distro は `opentelemetry-php` および `opentelemetry-php-instrumentation` を補完するものです。

- パッケージ管理された、本番環境優先のゼロコードオンボーディングが必要な場合は、Distro を選択してください。
- 手動制御やプラットフォームの柔軟性を最大限に高めたい場合は、Composer ベースの計装を選択してください。

## クイックスタート {#quick-start}

1. プラットフォームに合った Distro パッケージ（`deb`、`rpm`、または `apk`）をインストールします。
2. `OTEL_EXPORTER_OTLP_ENDPOINT` と `OTEL_EXPORTER_OTLP_HEADERS` を設定します。
3. PHP プロセスを再起動し、バックエンドでトレースを確認します。

詳しい手順は[セットアップガイド](/docs/zero-code/php/distro/getting-started/setup/)を参照してください。
