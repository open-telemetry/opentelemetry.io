{{/* cSpell:ignore cond */ -}} [OpenTelemetryコレクター](/docs/collector/)にテレメトリーを送信し、正しくエクスポートされることを確認してください。本番環境でコレクターを使用することはベストプラクティスです。テレメトリーを可視化するために、[Jaeger](https://jaegertracing.io/)、[Zipkin](https://zipkin.io/)、
[Prometheus](https://prometheus.io/)、または[ベンダー固有](/ecosystem/vendors/)のようなバックエンドにエクスポートしてください。

{{ $lang := .Get 0 | default "" -}}

{{ $name := "" -}}

{{ if $lang -}}

{{ $name = (index $.Site.Data.instrumentation $lang).name -}}

## 使用可能なエクスポーター {#available-exporters}

レジストリには、[{{ $name }} 用のエクスポーターのリスト][reg]が含まれています。

{{ else -}}

レジストリには、[言語固有のエクスポーターのリスト][reg]が含まれています。

{{ end -}}

エクスポーターの中でも、[OpenTelemetry Protocol (OTLP)][OTLP]エクスポーターは、OpenTelemetryのデータモデルを考慮して設計されており、OTelデータを情報の損失なく出力します。さらに、多くのテレメトリデータを扱うツールがOTLPに対応しており（たとえば、[Prometheus]、[Jaeger]やほとんどの[ベンダー]）、必要なときに高い柔軟性を提供します。OTLPについて詳細に学習したい場合は、[OTLP仕様][OTLP]を参照してください。

[Jaeger]: /blog/2022/jaeger-native-otlp/
[OTLP]: /docs/specs/otlp/
[Prometheus]:
  https://prometheus.io/docs/prometheus/latest/feature_flags/#otlp-receiver
[ベンダー]: /ecosystem/vendors/

[reg]: /ecosystem/registry/?component=exporter&language={{ $lang }}

{{ if $name -}}

This page covers the main OpenTelemetry {{ $name }} exporters and how to set
them up.

{{ end -}}

{{ $l := cond (eq $lang "dotnet") "net" $lang }}
{{ with $.Page.GetPage (print "/docs/zero-code/" $l "/configuration" ) }}

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Note</h4>

If you use [zero-code instrumentation](/docs/zero-code/{{ $l }}), you can learn
how to set up exporters by following the [Configuration
Guide](/docs/zero-code/{{ $l }}/configuration/).

</div>

{{ end -}}

{{/*
 below list needs to grow until all languages are updated to a consistent structure.
 */ -}}

{{ if in (slice "python" "js" "java" "cpp" "dotnet") $lang -}}

## OTLP

### Collector Setup

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Note</h4>

If you have a OTLP collector or backend already set up, you can skip this
section and [setup the OTLP exporter dependencies](#otlp-dependencies) for your
application.

</div>

To try out and verify your OTLP exporters, you can run the collector in a docker
container that writes telemetry directly to the console.

In an empty directory, create a file called `collector-config.yaml` with the
following content:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
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
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Now run the collector in a docker container:

```shell
docker run -p 4317:4317 -p 4318:4318 --rm -v $(pwd)/collector-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector
```

This collector is now able to accept telemetry via OTLP. Later you may want to
[configure the collector](/docs/collector/configuration) to send your telemetry
to your observability backend.

{{ end -}}
