---
title: Exporters
weight: 50
description: Processar e exportar seus dados de telemetria
default_lang_commit: f49ec57e5a0ec766b07c7c8e8974c83531620af3
drifted_from_default: true
cSpell:ignore: LOWMEMORY
---

{{% docs/languages/exporters/intro %}}

## Dependências {#otlp-dependencies}

Se você deseja enviar dados de telemetria para um endpoint OTLP (como o
[OpenTelemetry Collector](#collector-setup), [Jaeger](#jaeger) ou
[Prometheus](#prometheus)), você pode escolher entre dois protocolos diferentes
para transportar seus dados:

- [HTTP/protobuf](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/)
- [gRPC](https://pypi.org/project/opentelemetry-exporter-otlp-proto-grpc/)

Comece instalando os pacotes do exporter necessários como dependências do seu
projeto antes de prosseguir.

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```shell
pip install opentelemetry-exporter-otlp-proto-http
```

{{% /tab %}} {{% tab gRPC %}}

```shell
pip install opentelemetry-exporter-otlp-proto-grpc
```

{{% /tab %}} {{< /tabpane >}}

## Uso {#usage}

Em seguida, configure o exporter para apontar para um endpoint OTLP no seu
código.

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```python
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader

# Nome do serviço é necessário para a maioria dos backends
resource = Resource.create(attributes={
    SERVICE_NAME: "nome-do-seu-serviço"
})

tracerProvider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="<traces-endpoint>/v1/traces"))
tracerProvider.add_span_processor(processor)
trace.set_tracer_provider(tracerProvider)

reader = PeriodicExportingMetricReader(
    OTLPMetricExporter(endpoint="<traces-endpoint>/v1/metrics")
)
meterProvider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(meterProvider)
```

{{% /tab %}} {{% tab gRPC %}}

```python
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader

# Nome do serviço é necessário para a maioria dos backends
resource = Resource.create(attributes={
    SERVICE_NAME: "nome-do-seu-serviço"
})

tracerProvider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="seu-endpoint-aqui"))
tracerProvider.add_span_processor(processor)
trace.set_tracer_provider(tracerProvider)

reader = PeriodicExportingMetricReader(
    OTLPMetricExporter(endpoint="localhost:5555")
)
meterProvider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(meterProvider)
```

{{% /tab %}} {{< /tabpane >}}

## Console {#console}

Para depurar sua instrumentação ou ver os valores localmente em desenvolvimento,
você pode usar exporters que escrevem dados de telemetria no console (_stdout_).

O `ConsoleSpanExporter` e o `ConsoleMetricExporter` estão inclusos no pacote
`opentelemetry-sdk`.

```python
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader, ConsoleMetricExporter

# Nome do serviço é necessário para a maioria dos backends,
# e embora não seja necessário para exportação no console,
# é bom definir o nome do serviço de qualquer maneira.
resource = Resource.create(attributes={
    SERVICE_NAME: "nome-do-seu-serviço"
})

tracerProvider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(ConsoleSpanExporter())
tracerProvider.add_span_processor(processor)
trace.set_tracer_provider(tracerProvider)

reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
meterProvider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(meterProvider)
```

{{% alert title="Nota" %}}

Existem predefinições de temporalidade para cada tipo de instrumentação. Essas
predefinições podem ser definidas com a variável de ambiente
`OTEL_EXPORTER_METRICS_TEMPORALITY_PREFERENCE`, por exemplo:

```sh
export OTEL_EXPORTER_METRICS_TEMPORALITY_PREFERENCE="DELTA"
```

O valor padrão para `OTEL_EXPORTER_METRICS_TEMPORALITY_PREFERENCE` é
`"CUMULATIVE"`.

Os valores disponíveis e suas configurações correspondentes para esta variável
de ambiente são:

- `CUMULATIVE`
  - `Counter`: `CUMULATIVE`
  - `UpDownCounter`: `CUMULATIVE`
  - `Histogram`: `CUMULATIVE`
  - `ObservableCounter`: `CUMULATIVE`
  - `ObservableUpDownCounter`: `CUMULATIVE`
  - `ObservableGauge`: `CUMULATIVE`

- `DELTA`
  - `Counter`: `DELTA`
  - `UpDownCounter`: `CUMULATIVE`
  - `Histogram`: `DELTA`
  - `ObservableCounter`: `DELTA`
  - `ObservableUpDownCounter`: `CUMULATIVE`
  - `ObservableGauge`: `CUMULATIVE`

- `LOWMEMORY`
  - `Counter`: `DELTA`
  - `UpDownCounter`: `CUMULATIVE`
  - `Histogram`: `DELTA`
  - `ObservableCounter`: `CUMULATIVE`
  - `ObservableUpDownCounter`: `CUMULATIVE`
  - `ObservableGauge`: `CUMULATIVE`

Definir `OTEL_EXPORTER_METRICS_TEMPORALITY_PREFERENCE` para qualquer valor
diferente de `CUMULATIVE`, `DELTA` ou `LOWMEMORY` registrará um aviso e definirá
esta variável de ambiente como `CUMULATIVE`.

{{% /alert %}}

{{% include "exporters/jaeger.md" %}}

{{% include "exporters/prometheus-setup.md" %}}

## Dependências {#prometheus-dependencies}

Instale o
[pacote de exporter](https://pypi.org/project/opentelemetry-exporter-prometheus/)
como uma dependência para sua aplicação:

```sh
pip install opentelemetry-exporter-prometheus
```

Atualize sua configuração do OpenTelemetry para usar o exporter e enviar dados
para seu backend Prometheus:

```python
from prometheus_client import start_http_server

from opentelemetry import metrics
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

# Nome do serviço é necessário para a maioria dos backends
resource = Resource.create(attributes={
    SERVICE_NAME: "nome-do-seu-serviço"
})

# Iniciar cliente Prometheus
start_http_server(port=9464, addr="localhost")
# Inicializar PrometheusMetricReader que puxa métricas do SDK
# sob demanda para responder a solicitações de extração
reader = PrometheusMetricReader()
provider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(provider)
```

Com o código acima, você pode acessar suas métricas em
<http://localhost:9464/metrics>. O Prometheus ou um OpenTelemetry Collector com
o receptor Prometheus pode extrair as métricas deste endpoint.

{{% include "exporters/zipkin-setup.md" %}}

## Dependências {#zipkin-dependencies}

Para enviar seus dados de rastro para o [Zipkin](https://zipkin.io/), você pode
escolher entre dois protocolos diferentes para transportar seus dados:

- [HTTP/protobuf](https://pypi.org/project/opentelemetry-exporter-zipkin-proto-http/)
- [Thrift](https://pypi.org/project/opentelemetry-exporter-zipkin-json/)

Instale o pacote de exporter como uma dependência para sua aplicação:

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```shell
pip install opentelemetry-exporter-zipkin-proto-http
```

{{% /tab %}} {{% tab Thrift %}}

```shell
pip install opentelemetry-exporter-zipkin-json
```

{{% /tab %}} {{< /tabpane >}}

Atualize sua configuração do OpenTelemetry para usar o exporter e enviar dados
para seu backend Zipkin:

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```python
from opentelemetry import trace
from opentelemetry.exporter.zipkin.proto.http import ZipkinExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

resource = Resource.create(attributes={
    SERVICE_NAME: "nome-do-seu-serviço"
})

zipkin_exporter = ZipkinExporter(endpoint="http://localhost:9411/api/v2/spans")

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(zipkin_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
```

{{% /tab %}} {{% tab Thrift %}}

```python
from opentelemetry import trace
from opentelemetry.exporter.zipkin.json import ZipkinExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

resource = Resource.create(attributes={
    SERVICE_NAME: "nome-do-seu-serviço"
})

zipkin_exporter = ZipkinExporter(endpoint="http://localhost:9411/api/v2/spans")

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(zipkin_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
```

{{% /tab %}} {{< /tabpane >}}

{{% include "exporters/outro.md" `https://opentelemetry-python.readthedocs.io/en/latest/sdk/trace.export.html#opentelemetry.sdk.trace.export.SpanExporter` %}}

```python
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

processor = SimpleSpanProcessor(OTLPSpanExporter(endpoint="seu-endpoint-aqui"))
```
