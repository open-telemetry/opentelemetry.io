---
title: OpenTelemetryディストリビューション
linkTitle: ディストリビューション
weight: 110
default_lang_commit: f625496b2a6d05b95f72389adeb48e52b6d1d42d
cSpell:ignore: distro
---

柔軟性を損なうことなく OpenTelemetry と自動計装をできるだけすばやく使い始められるように、OpenTelemetry ディストリビューションは、より一般的なオプションの一部をユーザー向けに自動設定する仕組みを提供します。
これを活用することで、OpenTelemetry のユーザーは必要に応じてコンポーネントを設定できます。
`opentelemetry-distro` パッケージは、使い始めたいユーザー向けにいくつかのデフォルト設定を提供しており、次のものを構成します。

- `TracerProvider` SDK
- `BatchSpanProcessor`
- OpenTelemetry Collector にデータを送信する OTLP `SpanExporter`

このパッケージは、代替のディストリビューションを作成したい方にとっての出発点でもあります。
このパッケージが実装するインターフェイスは、他のコードが実行される前にアプリケーションを設定するために、`opentelemetry_distro` と `opentelemetry_configurator` のエントリーポイントを介して自動計装から読み込まれます。

OpenTelemetry から OpenTelemetry Collector へデータを自動的にエクスポートするには、このパッケージをインストールすると必要なエントリーポイントがすべて設定されます。

```sh
pip install opentelemetry-distro[otlp] opentelemetry-instrumentation
```

エクスポートされるデータを確認するために、Collector をローカルで起動します。
次のファイルを作成します。

```yaml
# /tmp/otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  # NOTE: v0.86.0 より前では、`debug` のかわりに `logging` を使用します。
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
```

次に、Docker コンテナを起動します。

```sh
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

次のコードは、設定なしでスパンを作成します。

```python
# no_configuration.py
from opentelemetry import trace

with trace.get_tracer("my.tracer").start_as_current_span("foo"):
    with trace.get_tracer("my.tracer").start_as_current_span("bar"):
        print("baz")
```

最後に、自動計装を使用して `no_configuration.py` を実行します。

```sh
opentelemetry-instrument python no_configuration.py
```

生成されたスパンは Collector の出力に表示され、次のようになります。

```nocode
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.1.0)
     -> service.name: STRING(unknown_service)
InstrumentationLibrarySpans #0
InstrumentationLibrary __main__
Span #0
    Trace ID       : db3c99e5bfc50ef8be1773c3765e8845
    Parent ID      : 0677126a4d110cb8
    ID             : 3163b3022808ed1b
    Name           : bar
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2021-05-06 22:54:51.23063 +0000 UTC
    End time       : 2021-05-06 22:54:51.230684 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Span #1
    Trace ID       : db3c99e5bfc50ef8be1773c3765e8845
    Parent ID      :
    ID             : 0677126a4d110cb8
    Name           : foo
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2021-05-06 22:54:51.230549 +0000 UTC
    End time       : 2021-05-06 22:54:51.230706 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
```
