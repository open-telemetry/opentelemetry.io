---
title: OpenTelemetry PHP 自動計装
linkTitle: PHP 自動計装
date: 2023-03-21
author: '[Przemek Delewski](https://github.com/pdelewski/) (Sumo Logic)'
default_lang_commit: 1cf18d8b1b5f3e84865cc3f0ba9a37fc82a89fbc
cSpell:ignore: classname Delewski functionname Przemek
---

自動計装は、ユーザーアプリケーションのソースコードを変更せずにトレーシング機能を追加するプロセスです。
そのためのテクニックはいくつかありますが、いずれもコンパイル時、リンク時、実行時に追加コードを元のコードに注入するか、[eBPF](https://ebpf.io/) の場合はオペレーティングシステムを拡張することで、多かれ少なかれ同じ仕組みで動作します。
このブログ記事では、OpenTelemetry PHP 自動計装で使用されている手法を紹介します。

## 前提条件 {#prerequisites}

[PHP 自動計装](https://github.com/open-telemetry/opentelemetry-php-instrumentation)を使用するには、次の3つが必要です。

- PHP 8.0 以降。
  PHP 自動計装は PHP 8.0 で導入された Observability API を使用します。
- [Composer](https://getcomposer.org/download/)
- マシン上で C コンパイラが利用可能であること

### PHP 8.0 Observability API の背景 {#background-on-the-php-80-observability-api}

[Observability API](https://www.datadoghq.com/blog/engineering/php-8-observability-baked-right-in/) を使用すると、他の領域で追加のパフォーマンスペナルティを発生させることなく、元の関数の前後に追加のコード（関数）を登録して実行できます。
PHP 8.0 より前は、トレーシング機能を追加する最も一般的なテクニックは `zend_execute_ex` 関数を変更すること（モンキーパッチに類似したテクニック）でした。
しかし、この方法は実行時のパフォーマンス問題やスタックオーバーフロー、望ましくないアプリケーション全体のオーバーヘッドにつながる可能性があります。
過去に検討された別のアプローチは、AST にプラグインしてコンパイル時に変更する方法でしたが、このテクニックを使用した本番環境対応のトレーサーは知られていません。

### 自動計装の観点から見た Observability API {#observability-api-from-auto-instrumentation-perspective}

この記事の執筆時点で、[Observability API](https://github.com/php/php-src/blob/PHP-8.0/Zend/zend_observer.h) は [C 拡張](https://github.com/open-telemetry/opentelemetry-php-instrumentation)によって使用されており、以下のインターフェイスを持つ1つの関数を公開しています。

```php
function hook(
    ?string $class,
    string $function,
    ?\\Closure $pre = null,
    ?\\Closure $post = null,
): bool {}
```

この関数は、監視対象の関数の前後に実行される追加の機能を加えるために、ユーザーアプリケーションから使用できます。
以下のコードスニペットは、`helloWorld` 関数を計装する方法を示しています。

```php
function helloWorld() {
  echo 'helloWorld';
}

\\OpenTelemetry\\Instrumentation\\hook(null, 'helloWorld',
    static function (?string $class, array $params, ?string $classname, string $functionname, ?string $filename, ?int $lineno)
    {
      echo 'before';
    },
    static function (mixed $object, array $params, mixed $return, ?Throwable $exception)
    {
      echo 'after';
    }
);
```

同様に、[Contrib](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/2b6a02f67d85f7f94ebc285d2c08c3523d26e093/src/Instrumentation?from_branch=main) リポジトリの一部である最も重要な `interfaces/libraries/frameworks` のいくつかに対してトレーシングサポートを実装しました。
各 `auto-instrumentation` パッケージは、上述の `hook` 関数を使用してトレーシング機能を登録し提供します。
まだ言及していないものとして、トレースやその他の必要なコンポーネントを作成するために使用される `API` `SDK` があります。
これは opentelemetry-php の [main](https://github.com/open-telemetry/opentelemetry-php) リポジトリの責務であり、すべての基盤となっています。

![php-rel](php-rel.png)

## 使い方 {#how-to-use-it}

自動計装に必要なすべてのコンポーネントは手動でインストールできますが、参入障壁を下げるために時間を投資し、それをかわりに行ってくれるインストーラーを作成しました。
このセクションでは、ゼロから作成したシンプルな PHP `laravel` アプリケーションを自動計装する方法を示します。

最初のステップは、デモアプリケーションを作成することです。
ここでは人気のある [Laravel](https://laravel.com/docs/10.x/installation) フレームワークを使用します。

```sh
composer create-project laravel/laravel example-app
```

次に、[opentelemetry-instrumentation-installer](https://packagist.org/packages/open-telemetry/opentelemetry-instrumentation-installer) をインストールします。

```sh
cd example-app
composer require open-telemetry/opentelemetry-instrumentation-installer
```

OpenTelemetry 計装インストーラーには2つのモードがあります。

- basic（最新バージョンですべてをインストール）
- advanced（ユーザーに制御を委ねる）

インストール後、以下のように `basic` または `advanced` スイッチを指定して `install-otel-instrumentation` を実行します。

```sh
./vendor/bin/install-otel-instrumentation basic
```

最後のステップは、`run-with-otel-instrumentation` でアプリケーションを実行することです。

```sh
./vendor/bin/run-with-otel-instrumentation php -S localhost:8080 -t public public/index.php
```

run-with-otel-instrumentation は魔法ではありません。
環境変数を設定してアプリケーションを通常どおり実行することで、すべて手動で行うこともできます。
これは、動作するデフォルト設定でアプリケーションに対して OpenTelemetry を素早くテストするための便利なツールです。

```sh
./vendor/bin/run-with-otel-instrumentation php -S localhost:8080 -t public public/index.php
```

<http://localhost:8080> にリクエストを送信した結果、[Jaeger](https://www.jaegertracing.io/docs/1.42/getting-started/) で以下のような結果が表示されるはずです。

![laravel-auto](laravel-auto.png)

## 現在のステータスと今後のステップ {#current-status-and-next-steps}

必要なコンポーネントはすべて揃っています。

- OpenTelemetry 仕様の基盤および実装としての API と SDK。
- 自動計装の基盤としての C 拡張。
- 最も重要で人気のあるライブラリやフレームワークに対する自動計装サポート（WIP）。
- 任意のコードを計装することに関心のあるユーザーや開発者の障壁を下げるための開発ツール。
- [ドキュメント](/docs/zero-code/php/)

私たちの目標の1つは、この取り組みの認知度を高め、改善、カバレッジの拡大、バグ修正を支援してくれるより多くの人々を巻き込むことです。

ぜひ試してフィードバックをお寄せください。
問題が発生した場合は、[イシュー](https://github.com/open-telemetry/opentelemetry-php/issues/new/choose)を開くことができます。
質問がありましたら、CNCF の [#otel-php](https://cloud-native.slack.com/archives/C01NFPCV44V) Slack チャンネルでお気軽にお問い合わせいただくか、[OTel 公開カレンダー](https://calendar.google.com/calendar/embed?src=google.com_b79e3e90j7bbsa2n2p5an5lf60%40group.calendar.google.com)で確認できる SIG ミーティングにご参加ください。
