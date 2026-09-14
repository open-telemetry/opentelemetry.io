---
title: 設定
weight: 10
aliases: [agent-config]
default_lang_commit: 5f5a44354bde52f1854c9e9e551ac2ba97787a20
cSpell:ignore: customizer
---

> [!NOTE] 詳細情報
>
> このページでは、Java エージェントに設定を渡すさまざまな方法について説明します。
> 設定オプションそのものについては、[SDK の設定](/docs/languages/java/configuration)を参照してください。

## エージェントの設定 {#agent-configuration}

エージェントは、以下のソースの1つまたは複数から設定を読み込むことができます（優先度の高い順）。

- システムプロパティ
- [環境変数](#configuring-with-environment-variables)
- [設定ファイル](#configuration-file)
- [`AutoConfigurationCustomizer#addPropertiesSupplier()`](https://github.com/open-telemetry/opentelemetry-java/blob/f92e02e4caffab0d964c02a32fe305d6d6ba372e/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizer.java#L73)
  関数で提供されるプロパティ。
  [`AutoConfigurationCustomizerProvider`](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.java)
  SPI を使用

## 環境変数による設定 {#configuring-with-environment-variables}

特定の環境では、環境変数を通じて設定を行うことが好まれます。
システムプロパティで設定できるすべての設定は、環境変数でも設定できます。
以下の設定の多くは両方の形式の例を示していますが、示していないものについては、以下の手順で目的のシステムプロパティに対応する環境変数名を特定できます。

- システムプロパティ名を大文字に変換する。
- すべての `.` と `-` を `_` に置き換える。

たとえば、`otel.instrumentation.common.default-enabled` は `OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED` に変換されます。

## 設定ファイル {#configuration-file}

以下のプロパティを設定して、エージェント設定ファイルのパスを指定できます。

{{% config_option name="otel.javaagent.configuration-file" %}} エージェント設定を含む有効な Java プロパティファイルのパス。
{{% /config_option %}}

## エクステンション {#extensions}

以下のプロパティを設定して、[エクステンション][extensions]を有効にできます。

{{% config_option name="otel.javaagent.extensions" %}}

エクステンション jar ファイルまたは jar ファイルを含むフォルダーのパス。
フォルダーを指定した場合、そのフォルダー内のすべての jar ファイルが個別の独立したエクステンションとして扱われます。

{{% /config_option %}}

## Java エージェントのログ出力 {#java-agent-logging-output}

以下のプロパティを設定して、エージェントのログ出力を設定できます。

{{% config_option name="otel.javaagent.logging" %}}

Java エージェントのログモード。
以下の3つのモードがサポートされています。

- `simple`: エージェントは標準エラーストリームを使用してログを出力します。
  `INFO` 以上のログのみが出力されます。
  これはデフォルトの Java エージェントログモードです。
- `none`: エージェントは何もログに記録しません。バージョン情報も含まれません。
- `application`: エージェントは自身のログを計装対象アプリケーションの slf4j ロガーにリダイレクトしようとします。
  これは、複数のクラスローダーを使用しないシンプルな単一 jar アプリケーションに最適です。
  Spring Boot アプリケーションもサポートされています。
  Java エージェントの出力ログは、計装対象アプリケーションのログ設定（たとえば `logback.xml` や `log4j2.xml`）を使用してさらに設定できます。
  **本番環境で実行する前に、このモードがアプリケーションで正しく動作することを必ずテストしてください。**

{{% /config_option %}}

## SDK の設定 {#sdk-configuration}

SDK の自動設定モジュールは、エージェントの基本設定に使用されます。
エクスポートやサンプリングの設定などについては、[ドキュメント](/docs/languages/java/configuration)を参照してください。

> [!IMPORTANT]
>
> SDK の自動設定とは異なり、バージョン 2.0 以降の Java エージェントと OpenTelemetry Spring Boot スターターは、デフォルトプロトコルとして `grpc` ではなく `http/protobuf` を使用します。

## デフォルトで無効なリソースプロバイダーの有効化 {#enable-resource-providers-that-are-disabled-by-default}

SDK の自動設定によるリソース設定に加えて、デフォルトで無効になっている追加のリソースプロバイダーを有効にできます。

{{% config_option
name="otel.resource.providers.aws.enabled"
default=false
%}} [AWS Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources) を有効にします。
{{% /config_option %}}

{{% config_option
name="otel.resource.providers.gcp.enabled"
default=false
%}} [GCP Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources) を有効にします。
{{% /config_option %}}

{{% config_option
name="otel.resource.providers.azure.enabled"
default=false
%}} [Azure Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/azure-resources) を有効にします。
{{% /config_option %}}

[extensions]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension#readme
