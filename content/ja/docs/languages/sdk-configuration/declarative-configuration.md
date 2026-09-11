---
title: 宣言的設定
linkTitle: 宣言的設定
weight: 30
default_lang_commit: aac3db2d7779c644ad981d0797e0028738698826
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/otel-config"?>

宣言的設定は、環境変数のかわりに YAML ファイルを使用します。

このアプローチは次のような場合に有用です。

- 設定する項目が多い場合。
- 環境変数では利用できない設定オプションを使いたい場合。

> [!WARNING]
>
> 宣言的設定のスキーマは安定版です。
> まだ実験的な部分には `/development` というサフィックスが付いています。
> さまざまな実装における宣言的設定のサポートはまだ実験的です。

## 対応言語 {#supported-languages}

以下の OpenTelemetry SDK が宣言的設定をサポートしています。

- [Java](/docs/zero-code/java/agent/declarative-configuration/)

詳細は[準拠マトリクス](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#declarative-configuration)を参照してください。

## はじめに {#getting-started}

1. 以下の設定ファイルを `otel-config.yaml` として保存します。
2. 環境変数 `OTEL_CONFIG_FILE=/path/to/otel-config.yaml` を設定します。

推奨される設定ファイル:

<!-- prettier-ignore-start -->
<?code-excerpt "examples/otel-getting-started.yaml"?>
```yaml
# otel-getting-started.yaml は SDK を設定するための良い出発点であり、
# OTLP 経由で localhost にエクスポートすることを含みます。
#
# 注: 環境変数の置換構文（つまり ${MY_ENV}）を除き、SDK は設定ファイルの解釈時に
# 環境変数を無視します。これには、
# https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
# で定義されているすべての環境変数の無視が含まれます。
#
# 必須プロパティ、セマンティクス、デフォルトの動作などのスキーマドキュメントは、
# https://github.com/open-telemetry/opentelemetry-configuration/blob/main/schema-docs.md
# を参照してください。

file_format: "1.1"

resource:
  # OTEL_RESOURCE_ATTRIBUTES 環境変数からリソース属性を読み取ります。
  # これは OpenTelemetry Operator やその他のデプロイ方法とうまく連携します。
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development: # /development プロパティはすべての SDK でサポートされているとは限りません
    detectors:
      - service: # "service.instance.id" と OTEL_SERVICE_NAME 環境変数からの "service.name" を追加します
      - host:
      - process:
      - container:

propagator:
  composite:
    - tracecontext:
    - baggage:

# バックエンドのエンドポイントは OTEL_EXPORTER_OTLP_ENDPOINT 環境変数から読み取ります。
# これは OpenTelemetry Operator やその他のデプロイ方法とうまく連携します。

tracer_provider:
  sampler:
    parent_based:
      root:
        always_on:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/traces

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/metrics

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/logs
```
<!-- prettier-ignore-end -->

## 環境変数 {#environment-variables}

- 宣言的設定は**環境変数**を読み取る構文をサポートしています。
- すべての環境変数は、**設定ファイルに明示的に追加しない限り無視されます**。

たとえば、次のように設定した場合:

```shell
OTEL_RESOURCE_ATTRIBUTES=service.version=1.1,deployment.environment.name=staging
```

以下の設定により、`service.version=1.1` と `deployment.environment.name=staging` を持つリソースが作成されます。

```yaml
resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
```

> [!WARNING]
>
> すべての環境変数は、設定ファイルに明示的に追加しない限り無視されます。

## 移行用設定 {#migration-configuration}

既存の設定が環境変数に依存している場合は、[移行用設定](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/otel-sdk-migration-config.yaml)を出発点として宣言的設定への移行に利用できます。

## 利用可能な設定オプション {#available-config-options}

設定オプションの完全なリストは[設定の例][otel-sdk-config.yaml]に記載されています。

[otel-sdk-config.yaml]: https://github.com/open-telemetry/opentelemetry-configuration/blob/v1.0.0-rc.1/examples/kitchen-sink.yaml

## シグナルごとのエンドポイント {#endpoint-per-signal}

トレース、メトリクス、ログそれぞれに異なるエンドポイントがある場合は、`otlp_http` を使用するときに以下の設定を使用してください。

| OTLP HTTP エクスポーター | エンドポイントの値                                                         |
| ------------------------ | -------------------------------------------------------------------------- |
| トレース                 | `${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}`   |
| メトリクス               | `${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}` |
| ログ                     | `${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}`       |

## gRPC エクスポーター {#grpc-exporter}

`otlp_http` のかわりに `otlp_grpc` を使用して gRPC 経由でエクスポートすることもできます。

```yaml
otlp_grpc:
  endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4317}
```

## リソース属性 {#resource-attributes}

リソース属性を設定する推奨アプローチは環境変数を使用することです。
[Kubernetes 用 OpenTelemetry Operator](/docs/platforms/kubernetes/operator/) など、環境変数を設定するツールとうまく連携するためです。

ただし、設定ファイルで直接リソース属性を設定することもできます。

```yaml
resource:
  attributes:
    - name: service.name
      value: shopping_cart
    - name: deployment.environment.name
      value: staging
```
