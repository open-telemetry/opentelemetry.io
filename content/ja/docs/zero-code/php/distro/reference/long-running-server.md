---
title: 長時間実行 PHP サーバー
description: >-
  Laravel Octane（Swoole、RoadRunner）やその他の永続 PHP サーバープロセス向けに
  OpenTelemetry PHP ディストロを設定します。
weight: 5
default_lang_commit: 4f8b46449bcc2980fd81c8e726733e1df1defddd
# prettier-ignore
cSpell:ignore: apache2handler artisan BatchSpanProcessor FPM fpm-fcgi HttpTransportAsync onEnd php-fpm RoadRunner SIGKILL SIGTERM SimpleSpanProcessor Swoole
---

**Laravel Octane**（Swoole または RoadRunner）のような PHP フレームワークは、リクエストごとに新しいプロセスを生成するのではなく、永続的なサーバープロセスとして PHP を実行します。
これにより、ディストロの動作がいくつかの重要な点で変わるため、特定の設定調整が必要になります。

## 従来の PHP サーバーの仕組み {#how-traditional-php-servers-work}

**PHP-FPM** や **Apache mod_php** では、各 HTTP リクエストがそれぞれ固有の PHP プロセスライフサイクルに対応します。

1. PHP プロセスが起動 → ディストロがブートストラップ（OTel SDK の初期化、自動計装フックの登録）
2. リクエストが処理される → HTTP トランザクションと計装対象の呼び出し（curl、PDO など）に対してスパンが作成される
3. レスポンスが送信される → PHP のシャットダウン関数が実行される → スパンがフラッシュされエクスポートされる
4. PHP プロセスが終了する

ディストロの**トランザクションスパン**（`OTEL_PHP_TRANSACTION_SPAN_ENABLED`）は、ちょうど1つの HTTP リクエストをラップします。
リクエストが到着した時点（Web SAPI、`$_SERVER` が設定済み）で開始し、プロセスが終了した時点で終了します。
これは、すべての子スパン（curl、DB クエリなど）がぶら下がるルートスパンです。

## 長時間実行サーバーの違い {#how-long-running-servers-differ}

**Laravel Octane**（Swoole または RoadRunner）では、1つの PHP ワーカープロセスがリクエスト間で終了することなく、多数の HTTP リクエストを連続して処理します。

1. PHP プロセスが起動 — ワーカープロセスが完全に初期化されたディストロ（SDK、フック、エクスポーター）とともに起動する
2. 各 HTTP リクエストがワーカーにディスパッチされる — ワーカーのフックが発火しスパンが作成される
3. レスポンスが送信される — **PHP のシャットダウン関数は実行されない**（プロセスが継続するため）
4. ワーカープロセスはサーバーが停止したとき（グレースフルストップ）にのみ終了する

ワーカープロセスは **CLI プロセス**（`php artisan octane:start` で起動）であるため、SAPI は常に `cli` であり、`fpm-fcgi` や `apache2handler` ではありません。
ディストロはこれを使って以下を区別します。

- `OTEL_PHP_TRANSACTION_SPAN_ENABLED` — Web SAPI（FPM/Apache）用のルートスパン。
  ここでは関係ありません。
- `OTEL_PHP_TRANSACTION_SPAN_ENABLED_CLI` — CLI プロセス用のルートスパン。
  長時間実行サーバーでは、個々のリクエストではなく**サーバーの全ライフタイム**（`octane:start` から `octane:stop` まで）をラップします。

| 側面                             | PHP-FPM / Apache              | 長時間実行サーバー（Octane）                      |
| -------------------------------- | ----------------------------- | ------------------------------------------------- |
| SAPI                             | `fpm-fcgi` / `apache2handler` | `cli`                                             |
| プロセスのライフタイム           | リクエストごとに1プロセス     | 1つのワーカーが多数のリクエストを処理             |
| PHP シャットダウン関数           | 毎リクエスト後に実行          | ワーカー終了時にのみ実行                          |
| ディストロのブートストラップ     | リクエストごとに実行          | ワーカー起動時に1回だけ実行                       |
| トランザクションスパン（`_CLI`） | 該当なし                      | サーバーの全ライフタイムにまたがる — 無効にすべき |

## 推奨設定 {#recommended-configuration}

### CLI トランザクションスパンを無効にする {#disable-the-cli-transaction-span}

自動ルートスパン（`OTEL_PHP_TRANSACTION_SPAN_ENABLED_CLI`）は、PHP プロセス全体をラップします。
長時間実行サーバーでは、サーバーがシャットダウンするまで続く1つのスパンになり、有用なテレメトリーではありません。

```sh
export OTEL_PHP_TRANSACTION_SPAN_ENABLED_CLI=false
```

> [!NOTE] `OTEL_PHP_TRANSACTION_SPAN_ENABLED_CLI` は CLI 固有であり、Web SAPI（FPM/Apache）デプロイメントには影響しません。

### 推論スパンを無効にする {#disable-inferred-spans}

推論スパン（スタックトレースサンプリング）は、従来のリクエストベースの PHP 向けに設計されています。
長時間実行サーバーでは、サンプリングがリクエスト間で継続的に実行されるため、ノイズが発生し CPU を消費します。

```sh
export OTEL_PHP_INFERRED_SPANS_ENABLED=false
```

これはデフォルト値であるため、以前にグローバルで推論スパンを有効にした場合にのみ必要です。

### スパンプロセッサーとエクスポートレイテンシー {#span-processor-and-export-latency}

デフォルトでは、ディストロは `BatchSpanProcessor` を使用します。
これはスパンをメモリに蓄積し、タイマーでエクスポートします（デフォルト: 5秒ごと）。
PHP はシングルスレッドであるため、タイマーチェックは `onEnd()` で新しいスパンが終了したときにのみ実行されます。
バックグラウンドティックはありません。
常にグレースフルストップ（`php artisan octane:stop`、SIGTERM）を使用して、ワーカーが現在のリクエストを完了し、PHP シャットダウン関数を実行し、終了前にエクスポーターをフラッシュできるようにしてください。
ハードキル（SIGKILL）はこれらすべてをバイパスします。

グレースフルストップでは、OTLP エンドポイントが到達可能であれば、メモリにバッファされたスパンはプロセス終了前にフラッシュされます。
ただし、`BatchSpanProcessor` はリクエストの到着頻度に比例した**エクスポートレイテンシー**を生じさせます。
トラフィックが少ないアプリケーションでは、10:00に作成されたスパンが Collector に表示されるのは10:05になる可能性があります（次のリクエストがようやくタイマーチェックをトリガーするため）。
ほぼリアルタイムの可視性を得るには、`SimpleSpanProcessor` を使用してください。

```sh
export OTEL_PHP_TRACES_PROCESSOR=simple
```

各スパンは、トラフィック量に関係なく、`onEnd()` で即座にエクスポートキューにプッシュされます。

ディストロのネイティブ C++ トランスポート（`HttpTransportAsync`）は、独自の内部キューと OTLP エンドポイントへの永続接続を持っているため、`simple` に切り替えても、スパンごとに1つの HTTP リクエストが発生するわけでは**ありません**。
PHP レイヤーは C++ キューに同期的にプッシュし（高速なインプロセス操作）、C++ レイヤーは独立してバッチ処理と永続接続での送信を行います。

## 完全な例 {#complete-example}

同じ設定が Swoole と RoadRunner の両方に適用されます。

```sh
export OTEL_SERVICE_NAME="my-laravel-octane-app"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"

# 長時間実行サーバーの調整
export OTEL_PHP_TRANSACTION_SPAN_ENABLED_CLI=false
export OTEL_PHP_INFERRED_SPANS_ENABLED=false
export OTEL_PHP_TRACES_PROCESSOR=simple

# Swoole
php artisan octane:start --server=swoole

# RoadRunner
php artisan octane:start --server=roadrunner
```

## サーバータイプ別の計装の仕組み {#how-instrumentation-works-per-server-type}

### Swoole {#swoole}

Swoole は、マスター PHP プロセスをフォークしてワーカープロセスを作成します。
ディストロはマスターで1回ブートストラップされ、ワーカーは初期化済みの状態（フック、SDK、エクスポーター接続）を継承します。
ワーカーでの各 HTTP リクエストは、登録済みの自動計装フック（Laravel、curl、PDO など）をトリガーし、ワーカーの TracerProvider の下にスパンが作成されます。

### RoadRunner {#roadrunner}

RoadRunner は、PHP ワーカープロセスを管理する Go ベースのアプリケーションサーバーです。
Swoole とは異なり、フォークは行わず、各 PHP ワーカーを個別のプロセスとして起動します。
そのため、各ワーカーは起動時に独立してディストロをブートストラップします。
計装の観点からは動作は同じです。
ワーカーの SAPI は `cli` であり、リクエスト間で終了せずに多数のリクエストを処理し、同じ設定が適用されます。

## BatchSpanProcessor のスケジュール遅延 {#batchspanprocessor-schedule-delay}

`BatchSpanProcessor` を維持しつつエクスポートレイテンシーを削減したい場合は、スケジュール遅延を短くします。

```sh
export OTEL_BSP_SCHEDULE_DELAY=500   # ミリ秒、デフォルトは 5000
```

これは安定したトラフィックがあるアプリケーションでのみ効果があります。
タイマーは `onEnd()` で発火するため、トラフィックが少ないアプリケーションでは、リクエスト間の間隔に比例したレイテンシーが依然として発生します。
