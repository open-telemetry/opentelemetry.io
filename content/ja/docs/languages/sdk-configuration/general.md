---
title: 一般的なSDK設定
linkTitle: 一般
weight: 10
aliases: [general-sdk-configuration]
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
cSpell:ignore: ottrace
---

{{% alert title="Note" %}}

環境変数のサポートはオプションです。
各言語の実装がどの環境変数をサポートしているかの詳細については、[実装準拠マトリックス](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#environment-variables)を参照してください。

{{% /alert %}}

## `OTEL_SERVICE_NAME`

[`service.name`](/docs/specs/semconv/resource/#service) リソース属性の値を設定します。

**デフォルト値:** `"unknown_service"`

`OTEL_RESOURCE_ATTRIBUTES` に `service.name` も指定されている場合は、`OTEL_SERVICE_NAME` が優先されます。

**例:**

`export OTEL_SERVICE_NAME="your-service-name"`

## `OTEL_RESOURCE_ATTRIBUTES`

リソース属性として使用されるキーと値のペア。
詳細は[リソースSDK](/docs/specs/otel/resource/sdk#specifying-resource-information-via-an-environment-variable)を参照してください。

**デフォルト値:** 空

一般的なリソースタイプで従うべきセマンティック規約については、[リソースのセマンティック規約](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value)を参照してください。

**例:**

`export OTEL_RESOURCE_ATTRIBUTES="key1=value1,key2=value2"`

## `OTEL_TRACES_SAMPLER`

SDKによるトレースのサンプリングに使用するサンプラーを指定します。

**デフォルト値:** `"parentbased_always_on"`

**例:**

`export OTEL_TRACES_SAMPLER="traceidratio"`

`OTEL_TRACES_SAMPLER` に指定できる値の一覧は以下です。

- `"always_on"`: `AlwaysOnSampler`
- `"always_off"`: `AlwaysOffSampler`
- `"traceidratio"`: `TraceIdRatioBased`
- `"parentbased_always_on"`: `ParentBased(root=AlwaysOnSampler)`
- `"parentbased_always_off"`: `ParentBased(root=AlwaysOffSampler)`
- `"parentbased_traceidratio"`: `ParentBased(root=TraceIdRatioBased)`
- `"parentbased_jaeger_remote"`: `ParentBased(root=JaegerRemoteSampler)`
- `"jaeger_remote"`: `JaegerRemoteSampler`
- `"xray"`:
  [AWS X-Ray Centralized Sampling](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)
  (_サードパーティ_)

## `OTEL_TRACES_SAMPLER_ARG`

`OTEL_TRACES_SAMPLER` で定義されているサンプラーの引数を指定します。
指定した値は `OTEL_TRACES_SAMPLER` が設定されている場合にのみ使用されます。
各サンプラータイプは、期待される入力があれば、それを定義します。
無効な入力や認識できない入力はエラーとしてログに記録されます。

**デフォルト値:** 空

**例:**

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.5"
```

`OTEL_TRACES_SAMPLER` の値によって、`OTEL_TRACES_SAMPLER_ARG` は以下のように設定されます。

- `traceidratio` と `parentbased_traceidratio` サンプラーの場合: サンプリング確率。[0..1]の範囲で指定します。未設定の場合、デフォルトは1.0。
- `jaeger_remote` と `parentbased_jaeger_remote` の場合: 値はカンマ区切りのリストです。
  - 例:
    `"endpoint=http://localhost:14250,pollingIntervalMs=5000,initialSamplingRate=0.25"`
  - `endpoint`: サービスのサンプリング戦略を提供する gRPC サーバの `scheme://host:port` 形式のエンドポイント ([sampling.proto](https://github.com/jaegertracing/jaeger-idl/blob/main/proto/api_v2/sampling.proto)).
  - `pollingIntervalMs`: サンプラーがサンプリング戦略の更新のためにバックエンドをポーリングする頻度をミリ秒単位で指定します。
  - `initialSamplingRate`: [0..1]の範囲で、サンプリング戦略を取得するためにバックエンドに到達できない場合のサンプリング確率として使用されます。サンプリング戦略の取得に成功すると、この値は意味を持たなくなり、新しいアップデートが取得されるまでリモート戦略が使用されるようになります。

## `OTEL_PROPAGATORS`

カンマ区切りのリストで使用するプロパゲーターを指定します。

**デフォルト値:** `"tracecontext,baggage"`

**Example:**

`export OTEL_PROPAGATORS="b3"`

`OTEL_PROPAGATORS` に指定できる値の一覧は以下です。

- `"tracecontext"`: [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- `"baggage"`: [W3C Baggage](https://www.w3.org/TR/baggage/)
- `"b3"`: [B3 Single](/docs/specs/otel/context/api-propagators#configuration)
- `"b3multi"`:
  [B3 Multi](/docs/specs/otel/context/api-propagators#configuration)
- `"jaeger"`:
  [Jaeger](https://www.jaegertracing.io/docs/1.21/client-libraries/#propagation-format)
- `"xray"`:
  [AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-tracingheader)
  (_サードパーティ_)
- `"ottrace"`:
  [OT Trace](https://github.com/opentracing?q=basic&type=&language=) (_サードパーティ_)
- `"none"`: 自動設定されたプロパゲータがない。

## `OTEL_TRACES_EXPORTER`

トレースに使用するエクスポーターを指定します。
実装によっては、カンマ区切りのリストになります。

**デフォルト値:** `"otlp"`

**例:**

`export OTEL_TRACES_EXPORTER="jaeger"`

指定できる値の一覧は以下です。

- `"otlp"`: [OTLP][]
- `"jaeger"`: Jaegerデータモデルでのエクスポート
- `"zipkin"`: [Zipkin](https://zipkin.io/zipkin-api/)
- `"console"`: [Standard Output](/docs/specs/otel/trace/sdk_exporters/stdout/)
- `"none"`: トレース用に自動設定されたエクスポーターがない。

## `OTEL_METRICS_EXPORTER`

メトリクスに使用するエクスポーターを指定します。
実装によっては、カンマ区切りのリストになります。

**デフォルト値:** `"otlp"`

**例:**

`export OTEL_METRICS_EXPORTER="prometheus"`

`OTEL_METRICS_EXPORTER` に指定できる値の一覧は以下です。

- `"otlp"`: [OTLP][]
- `"prometheus"`:
  [Prometheus](https://github.com/prometheus/docs/blob/main/docs/instrumenting/exposition_formats.md)
- `"console"`: [標準出力](/docs/specs/otel/metrics/sdk_exporters/stdout/)
- `"none"`: メトリクスのエクスポーターが自動的に設定されない。

## `OTEL_LOGS_EXPORTER`

ログにどのエクスポーターを使用するかを指定します。
実装によっては、カンマ区切りのリストになります。

**デフォルト値:** `"otlp"`

**例:**

`export OTEL_LOGS_EXPORTER="otlp"`

`OTEL_LOGS_EXPORTER` に指定できる値の一覧は以下です。

- `"otlp"`: [OTLP][]
- `"console"`: [標準出力](/docs/specs/otel/logs/sdk_exporters/stdout/)
- `"none"`: ログのエクスポーターが自動的に設定されない。

[otlp]: /docs/specs/otlp/
