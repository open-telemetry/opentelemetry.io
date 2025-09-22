---
title: Gerador de Carga
aliases: [loadgenerator]
cSpell:ignore: instrumentor instrumentors locustfile urllib
---

O gerador de carga é baseado no framework de teste de carga Python
[Locust](https://locust.io). Por padrão ele simulará usuários solicitando
várias rotas diferentes do frontend.

[Código fonte do gerador de carga](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/load-generator/)

## Rastreamentos

### Inicializando Rastreamento

Como este serviço é um
[locustfile](https://docs.locust.io/en/stable/writing-a-locustfile.html), o
SDK do OpenTelemetry é inicializado após as declarações de import. Este código
criará um provedor de tracer e estabelecerá um Processador de Span para usar. Pontos de
exportação, atributos de recurso e nome do serviço são automaticamente definidos usando
[variáveis de ambiente do OpenTelemetry](/docs/specs/otel/configuration/sdk-environment-variables/).

```python
tracer_provider = TracerProvider()
trace.set_tracer_provider(tracer_provider)
tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
```

### Adicionando bibliotecas de instrumentação

Para adicionar bibliotecas de instrumentação você precisa importar os Instrumentors para cada
biblioteca no seu código Python. O Locust usa as bibliotecas `Requests` e `URLLib3`,
então importaremos seus Instrumentors.

```python
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import URLLib3Instrumentor
```

No seu código antes da biblioteca ser utilizada, o Instrumentor precisa ser
inicializado chamando `instrument()`.

```python
RequestsInstrumentor().instrument()
URLLib3Instrumentor().instrument()
```

Uma vez inicializado, toda requisição Locust para este gerador de carga terá seu
próprio trace com um span para cada uma das bibliotecas `Requests` e `URLLib3`.

## Métricas

TBD

## Logs

TBD

## Baggage

O Baggage do OpenTelemetry é usado pelo gerador de carga para indicar que os traces
são gerados sinteticamente. Isso é feito na função `on_start` criando
um objeto de contexto contendo o item de baggage, e associando esse contexto para
todas as tarefas pelo gerador de carga.

```python
ctx = baggage.set_baggage("synthetic_request", "true")
context.attach(ctx)
```
