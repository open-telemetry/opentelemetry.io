---
title: PHP
description: >-
  <img width="35" class="img-initial otel-icon" src="/img/logos/32x32/PHP.svg"
  alt="PHP"> PHP における OpenTelemetry の言語固有の実装。
redirects:
  - { from: /php/*, to: ':splat' }
  - { from: /docs/php/*, to: ':splat' }
weight: 180
default_lang_commit: 60d50174e01d221f65af4b69ad1ae946fbc16ec8
cSpell:ignore: mbstring opcache
---

{{% docs/languages/index-intro php /%}}

## 参考資料 {#further-reading}

- [OpenTelemetry for PHP（GitHub）](https://github.com/open-telemetry/opentelemetry-php)
- [サンプル](https://github.com/open-telemetry/opentelemetry-php/tree/main/examples)

## 要件 {#requirements}

OpenTelemetry SDK for PHP は、[www.php.net/supported-versions](https://www.php.net/supported-versions.php) に記載されている公式にサポートされているすべての PHP バージョンをサポートすることを目標としており、PHP バージョンの End of Life から12か月以内にサポートが終了します。

自動計装には PHP バージョン 8.0 以上が必要です。

### 依存関係 {#dependencies}

`SDK` および `Contrib` パッケージの一部は、[HTTP Factories (PSR-17)](https://www.php-fig.org/psr/psr-17/) と [php-http/async-client](https://docs.php-http.org/en/latest/clients.html) の両方の実装に依存しています。
適切な composer パッケージは [packagist.org](https://packagist.org/) で見つけられます。

`PSR-17 (HTTP factories)` 実装は [http-factory-implementations](https://packagist.org/providers/psr/http-factory-implementation) を、`php-http/async-client` 実装は [async-client-implementations](https://packagist.org/providers/php-http/async-client-implementation) を参照してください。

### オプションの PHP エクステンション {#optional-php-extensions}

| エクステンション                                                          | 目的                                                                |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [ext-grpc](https://github.com/grpc/grpc/tree/master/src/php)              | OTLP エクスポーターのトランスポートとして gRPC を使用する場合に必要 |
| [ext-mbstring](https://www.php.net/manual/en/book.mbstring.php)           | フォールバックの `symfony/polyfill-mbstring` よりも高性能           |
| [ext-zlib](https://www.php.net/manual/en/book.zlib.php)                   | エクスポートデータを圧縮する場合に使用                              |
| [ext-ffi](https://www.php.net/manual/en/book.ffi.php)                     | Fiber ベースのコンテキストストレージ                                |
| [ext-protobuf](https://github.com/protocolbuffers/protobuf/tree/main/php) | otlp+protobuf エクスポートの*大幅な*パフォーマンス改善              |

#### ext-ffi

Fiber のサポートは、環境変数 `OTEL_PHP_FIBERS_ENABLED` を `true` に設定することで有効にできます。
非 `CLI` SAPI で Fiber を使用する場合、バインディングのプリロードが必要になることがあります。
これを実現する方法の1つは、[`ffi.preload`](https://www.php.net/manual/en/ffi.configuration.php#ini.ffi.preload) を `src/Context/fiber/zend_observer_fiber.h` に、[`opcache.preload`](https://www.php.net/manual/en/opcache.preloading.php) を `vendor/autoload.php` に設定することです。

#### ext-protobuf

[ネイティブ protobuf ライブラリ](https://packagist.org/packages/google/protobuf)はエクステンションに比べて大幅に遅くなります。
エクステンションの使用を強く推奨します。

## セットアップ {#setup}

OpenTelemetry for PHP は [packagist](https://packagist.org/packages/open-telemetry/) を通じて複数のパッケージとして配布されています。
必要なパッケージのみをインストールすることを推奨します。
最低限、通常は `API`、`Context`、`SDK` およびエクスポーターが必要です。

コードが依存するのは `API` パッケージのクラスとインターフェイスのみにすることを強く推奨します。
