---
title: Distribuição do OpenTelemetry
linkTitle: Distro
weight: 110
default_lang_commit: 1a135ec4b7a14bddd14b7d70dbf2986695b7a93d
cSpell:ignore: distro
---

Para tornar o uso do OpenTelemetry e da auto-instrumentação o mais rápido
possível sem sacrificar flexibilidade, as distribuições do OpenTelemetry
fornecem um mecanismo para configurar automaticamente algumas das opções mais
comuns para os usuários. Através disso, os usuários do OpenTelemetry podem
configurar os componentes conforme suas necessidades. O pacote
`opentelemetry-distro` fornece alguns padrões para usuários que desejam começar,
configurando:

- o SDK TracerProvider
- um BatchSpanProcessor
- o `SpanExporter` OTLP para enviar dados a um OpenTelemetry Collector

O pacote também fornece um ponto de partida para qualquer pessoa interessada em
produzir uma distribuição alternativa. As _interfaces_ implementadas pelo pacote
são carregadas pela auto-instrumentação por meio dos pontos de entrada
`opentelemetry_distro` e `opentelemetry_configurator`, para configurar a
aplicação antes que qualquer outro código seja executado.

Para exportar automaticamente dados do OpenTelemetry para o OpenTelemetry
Collector, a instalação do pacote irá configurar todos os pontos de entrada
necessários.

```sh
pip install opentelemetry-distro[otlp] opentelemetry-instrumentation
```

Inicie o Collector localmente para ver os dados sendo exportados. Crie o
seguinte arquivo:

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
  # NOTA: Antes da v0.86.0 use `logging` ao invés de `debug`.
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
```

Em seguida, inicie o contêiner Docker:

```sh
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

O código a seguir criará um trecho sem configuração.

```python
# no_configuration.py
from opentelemetry import trace

with trace.get_tracer("meu.rastro").start_as_current_span("foo"):
    with trace.get_tracer("meu.rastro").start_as_current_span("bar"):
        print("baz")
```

Por fim, execute o `no_configuration.py` com a auto-instrumentação:

```sh
opentelemetry-instrument python no_configuration.py
```

O trecho resultante aparecerá na saída do Collector e será semelhante a este:

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
