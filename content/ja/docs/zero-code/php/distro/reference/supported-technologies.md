---
title: 対応テクノロジー
description: >-
  OpenTelemetry PHP Distro が対応する PHP バージョン、SAPI、オペレーティングシステム、フレームワーク、ライブラリ。
weight: 2
default_lang_commit: cf9f44c2aaeb97ab9cd891f3de7d27a9f47ac8c9
cSpell:ignore: apk httplug musl mysqli psr
---

OpenTelemetry PHP Distro は OpenTelemetry PHP のディストリビューションです。
OpenTelemetry の互換性を継承し、ネイティブコンポーネントによってランタイム機能を拡張します。

## 自動計装の範囲 {#auto-instrumentation-scope}

自動計装は対応するフレームワークやライブラリのテレメトリーをキャプチャしますが、以下は計装しません。

- プロプライエタリまたはカスタムフレームワークの内部
- 計装フックのないクローズドソースコンポーネント
- アプリケーション固有のビジネスロジック

対応していない領域については、手動の OpenTelemetry 計装を使用してください。

## PHP バージョン {#php-versions}

対応する PHP バージョン: `8.1` から `8.5`。

## 対応する SAPI {#supported-sapis}

- `php-cli`
- `php-fpm`
- `php-cgi`/`fcgi`
- `mod_php`（prefork）

## 対応するオペレーティングシステム {#supported-operating-systems}

- Linux
  - アーキテクチャ: `x86_64`、`arm64`
  - glibc ベースのシステム: `deb`、`rpm`
  - musl ベースのシステム（Alpine）: `apk`

## 計装済みフレームワーク {#instrumented-frameworks}

- Laravel `6.x` から `13.x`
- Slim `4.x`

## 計装済みライブラリ {#instrumented-libraries}

- cURL
- HTTP async（`php-http/httplug`）
- MySQLi
- PDO
- PostgreSQL
- PSR-18 HTTP Client（`psr/http-client`）

## 同梱の自動計装パッケージ {#included-auto-instrumentation-packages}

| 名前                | ディストロバージョン | パッケージ                                                                                                                  |
| ------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `curl`              | 1.0                  | [open-telemetry/opentelemetry-auto-curl](https://packagist.org/packages/open-telemetry/opentelemetry-auto-curl)             |
| `http-async-client` | 1.0                  | [open-telemetry/opentelemetry-auto-http-async](https://packagist.org/packages/open-telemetry/opentelemetry-auto-http-async) |
| `laravel`           | 1.0                  | [open-telemetry/opentelemetry-auto-laravel](https://packagist.org/packages/open-telemetry/opentelemetry-auto-laravel)       |
| `mysqli`            | 1.0                  | [open-telemetry/opentelemetry-auto-mysqli](https://packagist.org/packages/open-telemetry/opentelemetry-auto-mysqli)         |
| `pdo`               | 1.0                  | [open-telemetry/opentelemetry-auto-pdo](https://packagist.org/packages/open-telemetry/opentelemetry-auto-pdo)               |
| `postgresql`        | 1.2                  | [open-telemetry/opentelemetry-auto-postgresql](https://packagist.org/packages/open-telemetry/opentelemetry-auto-postgresql) |
| `psr18`             | 0.5                  | [open-telemetry/opentelemetry-auto-psr18](https://packagist.org/packages/open-telemetry/opentelemetry-auto-psr18)           |
| `slim`              | 1.0                  | [open-telemetry/opentelemetry-auto-slim](https://packagist.org/packages/open-telemetry/opentelemetry-auto-slim)             |

## 同梱のメトリクスパッケージ {#included-metrics-packages}

| ディストロバージョン | パッケージ                                                                                                                  | 出力メトリクス                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 0.6.0                | [open-telemetry/opentelemetry-metrics-runtime](https://packagist.org/packages/open-telemetry/opentelemetry-metrics-runtime) | PHP memory usage, GC cycles, peak memory |

## 追加のランタイム機能 {#additional-runtime-features}

- 自動ルートスパン生成
- ルートスパンの URL グルーピング
- 推論スパン
- [属性ベースの計装](/docs/zero-code/php/distro/reference/attribute-instrumentation/)
  （`#[WithSpan]`、`#[SpanAttribute]`）
- バックグラウンドテレメトリー送信
- PHP ランタイムメトリクス（メモリ、GC — ネイティブ非同期トランスポート経由で自動的にエクスポート）

バックグラウンド送信（ノンブロッキングエクスポート）は OTLP `http/protobuf`（デフォルト）で動作します。
エクスポーターまたはプロトコルが対応していないトランスポート（たとえば gRPC）に変更された場合、エクスポートは同期的になります。
