---
title: Lambdaコレクター設定
linkTitle: Lambdaコレクター設定
weight: 11
description: コレクターLambdaレイヤーをあなたのLambdaに追加して設定する
default_lang_commit: 9ba98f4fded66ec78bfafa189ab2d15d66df2309 # patched
drifted_from_default: true
cSpell:ignore: ADOT awsxray configmap confmap
---

OpenTelemetry コミュニティは、ユーザーに最大限の柔軟性を与えるために、コレクターを計装レイヤーとは別のLambdaレイヤーで提供しています。
これは、計装とコレクターをバンドルしている現在の AWS Distribution of OpenTelemetry (ADOT) の実装とは異なります。

## OTelコレクターLambdaレイヤーのARNを追加する {#add-the-arn-of-the-otel-collector-lambda-layer}

アプリケーションの計装が完了したら、コレクターLambdaレイヤーを追加してデータを収集し、選択したバックエンドに送信します。

[最新のコレクターレイヤーリリース](https://github.com/open-telemetry/opentelemetry-lambda/releases)を見つけ、そのARNを使用します。
`<region>`タグをラムダがいるリージョンに変更します。

注意: ラムダレイヤーはリージョンで分かれたリソースであり、公開されているリージョンでのみ使用できます。Lambda関数と同じリージョンでレイヤーを使用するようにしてください。コミュニティは、利用可能なすべてのリージョンでレイヤーを公開しています。

## OTelコレクターの設定 {#configure-the-otel-collector}

OTelコレクターLambdaレイヤーの設定は、OpenTelemetry標準にしたがっています。

デフォルトでは、OTelコレクターLambdaレイヤーはconfig.yamlを使用します。

### 希望するバックエンドの環境変数を設定する {#set-the-environment-variable-for-your-preferred-backend}

Lambda環境変数の設定で、認証トークンを格納する新しい変数を作成します。

### デフォルトエクスポーターを更新する {#update-the-default-exporters}

もしまだ存在していなければ、`config.yaml` ファイルに好みのエクスポーターを追加します。
前のステップでアクセストークンのために設定した環境変数を使用して、エクスポーターを設定します。

**エクスポーターに環境変数が設定されていない場合、デフォルトの設定は、デバッグエクスポーターを使用したデータ送信のみをサポートします**
以下はデフォルトの設定です。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: '0.0.0.0:4317'
      http:
        endpoint: '0.0.0.0:4318'

exporters:
  # 注意: v0.86.0 より前のバージョンでは、`debug` のかわりに `logging` を使用すること
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
  telemetry:
    metrics:
      address: localhost:8888
```

## Lambdaを公開する {#publish-your-lambda}

Lambdaの新しいバージョンをパブリッシュして、行った変更を有効にします。

## 高度な OTel コレクターの設定 {#advanced-otel-collector-configuration}

カスタム構成でサポートされる利用可能なコンポーネントのリストは、こちらをご覧ください。
デバッグを有効にするには、設定ファイルを使ってログレベルをデバッグに設定します。
以下の例を参照してください。

### 希望のConfmapプロバイダーを選択する {#choose-your-preferred-confmap-provider}

OTel Lambdaレイヤーは `file`、`env`、`yaml`、`http`、`https`、`s3` といった種類の Confmap プロバイダーをサポートしています。
異なる Confmap プロバイダーを使用して OTel コレクターの設定をカスタマイズするには、[Amazon Distribution of OpenTelemetry Confmap providers document](https://aws-otel.github.io/docs/components/confmap-providers#confmap-providers-supported-by-the-adot-collector) を参照してください。

### カスタム設定ファイルの作成 {#create-a-custom-configuration-file}

以下はルートディレクトリにある `collector.yaml` の設定ファイルのサンプルです。

```yaml
# ルート・ディレクトリの collector.yaml
# 環境変数 'OPENTELEMETRY_COLLECTOR_CONFIG_URI' を '/var/task/collector.yaml' に設定する

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  # 注意: v0.86.0 より前のバージョンでは `debug` のかわりに `logging` を使用すること
  debug:
  awsxray:

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [awsxray]
    metrics:
      receivers: [otlp]
      exporters: [debug]
  telemetry:
    metrics:
      address: localhost:8888
```

### 環境変数を使ってカスタム設定ファイルをマップする {#map-your-custom-configuration-file-using-environment-variables}

confmapプロバイダーを通してコレクターを設定したら、Lambda関数に環境変数 `OPENTELEMETRY_COLLECTOR_CONFIG_URI` を作成し、その値としてconfmapプロバイダーの設定のパスを設定します。
たとえば、ファイルconfigmapプロバイダーを使用している場合は、その値を `/var/task/<path>/<to>/<filename>` に設定します。
これにより、拡張モジュールにコレクターの設定がどこにあるかを伝えます。

#### CLIを使用したカスタムコレクター設定 {#custom-collector-configuration-using-the-cli}

Lambdaコンソール、またはAWS CLIから設定できます。

```bash
aws lambda update-function-configuration --function-name Function --environment Variables={OPENTELEMETRY_COLLECTOR_CONFIG_URI=/var/task/collector.yaml}
```

#### CloudFormationから設定用の環境変数を設定する {#set-configuration-environment-variables-from-cloudformation}

環境変数は**CloudFormation**テンプレートでも設定できます。

```yaml
Function:
  Type: AWS::Serverless::Function
  Properties:
    ...
    Environment:
      Variables:
        OPENTELEMETRY_COLLECTOR_CONFIG_URI: /var/task/collector.yaml
```

#### S3オブジェクトから設定を読み込む {#load-configuration-from-an-s3-object}

S3から設定を読み込むには、関数にアタッチされたIAMロールに、関連するバケットへの読み取りアクセスが含まれている必要があります。

```yaml
Function:
  Type: AWS::Serverless::Function
  Properties:
    ...
    Environment:
      Variables:
        OPENTELEMETRY_COLLECTOR_CONFIG_URI: s3://<bucket_name>.s3.<region>.amazonaws.com/collector_config.yaml
```
