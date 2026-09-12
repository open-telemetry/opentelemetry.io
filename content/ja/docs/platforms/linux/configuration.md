---
title: 設定
weight: 20
description: OpenTelemetry Injector の参照先を Collector
  またはバックエンドに変更し、Linux ホスト上で計装する対象を制御します。
default_lang_commit: 6fa8e87cacb431b31061635fcddb55990e80538a
---

システムパッケージの[インストール](../installation/)後、[OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector) はサポートされているアプリケーションを計装し、デフォルトで OTLP を使用してテレメトリーを `localhost` のポート `4317`（gRPC）および `4318`（HTTP）にエクスポートします。
このページでは、テレメトリーの送信先の変更方法と、注入される設定の調整方法について説明します。

## エクスポート先の設定 {#set-the-export-destination}

推奨されるセットアップは、テレメトリーを受信してバックエンドに転送するローカルの [OpenTelemetry Collector](/docs/collector/) をホスト上で実行することです。

テレメトリーを別の場所に送信するには、設定ファイルを使用する方法が推奨されます。
一から書く必要はほとんどありません。
各言語パッケージには、環境変数の補間を通じてエクスポーターのエンドポイント、ヘッダー、サービス名を設定する、すぐに使えるリファレンスファイルが `/etc/opentelemetry/<language>/otel-config.yaml` に用意されています。
これらのファイルをコピーまたは[宣言的設定](/docs/languages/sdk-configuration/declarative-configuration/)に合わせて編集し、`/etc/opentelemetry/injector/default_env.conf` のインジェクター環境ファイルで `OTEL_CONFIG_FILE` を設定して有効化します。

```conf
OTEL_CONFIG_FILE=/etc/opentelemetry/config.yaml
```

> [!NOTE]
>
> .NET の場合、ファイルベースの設定には `OTEL_EXPERIMENTAL_FILE_BASED_CONFIGURATION_ENABLED=true` も必要です。
> これがないと、設定ファイルは無視されます。

設定の変更を反映するには、アプリケーションを再起動してください。

## 環境変数による設定 {#configure-with-environment-variables}

設定ファイルを使用しない場合は、`/etc/opentelemetry/injector/default_env.conf` のインジェクター環境ファイルに標準の OpenTelemetry 環境変数を直接設定できます。
ここに設定された変数は、すべての計装されたプロセスに適用されます。
たとえば、API キーを必要とする OTLP エンドポイントに直接エクスポートするには以下のように設定します。

```conf
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.example.com
OTEL_EXPORTER_OTLP_HEADERS=api-key=REPLACE_ME
```

`default_env.conf` は標準の OpenTelemetry 環境変数を使用するため、`OTEL_SERVICE_NAME`、`OTEL_RESOURCE_ATTRIBUTES`、各種サンプラーやエクスポーターの設定など、あらゆる SDK の動作を同じ方法で設定できます。
完全な一覧は [SDK 環境変数](/docs/languages/sdk-configuration/)を参照してください。

設定の変更を反映するには、アプリケーションを再起動してください。

## ローカル Collector の実行 {#run-a-local-collector}

ホスト上で [Collector](/docs/collector/) を実行すると、アプリケーションのエクスポート設定をシンプルに保てます。
アプリケーションは OTLP を `localhost` に送信し、Collector がバッチ処理、リトライ、1つ以上のバックエンドへのルーティングを処理します。
現時点では Collector は別途インストールして実行する必要があります。
ベースの `opentelemetry` メタパッケージにはまだ含まれていません。

## 次のステップ {#next-steps}

- [OpenTelemetry Collector](/docs/collector/) の詳細を学ぶ。
- 利用可能な [SDK 環境変数](/docs/languages/sdk-configuration/)を確認する。
