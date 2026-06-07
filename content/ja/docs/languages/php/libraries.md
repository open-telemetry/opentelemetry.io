---
title: 計装ライブラリの使用
linkTitle: ライブラリ
weight: 40
default_lang_commit: 80f1878ba5e02e1ac98daab3397999078dc67179
cSpell:ignore: Packagist
---

{{% docs/languages/libraries-intro "php" %}}

## 計装ライブラリを使用する {#use-instrumentation-libraries}

ライブラリにネイティブの OpenTelemetry サポートが含まれていない場合は、[計装ライブラリ](/docs/specs/otel/glossary/#instrumentation-library)を使用して、ライブラリまたはフレームワークのテレメトリーデータを生成できます。

OpenTelemetry PHP エクステンションには、多くの一般的な PHP フレームワーク用の計装ライブラリが含まれています。
たとえば、[Laravel 計装](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/src/Instrumentation/Laravel)は、アプリケーションのアクティビティに基づいて[スパン](/docs/concepts/signals/traces/#spans)を自動的に作成します。

## セットアップ {#setup}

各計装ライブラリは Composer パッケージです。
インストールするには、次のコマンドを実行します。

```sh
php composer.phar install {name-of-instrumentation}:{version-number}
```

ここで `{name-of-instrumentation}` は、使用したい特定の計装の Packagist 参照名です。

計装の識別子を `OTEL_PHP_DISABLED_INSTRUMENTATIONS` 環境変数に追加することで、任意の計装を無効にできます。

## 利用可能な計装ライブラリ {#available-instrumentation-libraries}

利用可能な計装の一覧は、Packagist の [OpenTelemetry 計装ライブラリ](https://packagist.org/search/?query=open-telemetry&tags=instrumentation)を参照してください。

## 次のステップ {#next-steps}

計装ライブラリをセットアップした後は、カスタムのテレメトリーデータを収集するために[追加の計装](/docs/languages/php/instrumentation)を追加したいと思うかもしれません。

また、適切なエクスポーターを設定して、1つ以上のテレメトリーバックエンドに[テレメトリーデータをエクスポート](/docs/languages/php/exporters)することもできます。
