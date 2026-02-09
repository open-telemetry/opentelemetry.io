---
title: Propagação
description: Propagação de contexto para o SDK Python
weight: 65
default_lang_commit: 424d7671919b2bcf0850a027b4b24786c45e2afd
cSpell:ignore: desserializado sqlcommenter
---

A propagação é o mecanismo que move dados entre serviços e processos. Embora não
seja limitada ao rastreamento, é o que permite que os rastros construam
informações de causalidade sobre um sistema através de serviços que estão
distribuídos arbitrariamente entre processos e limites de rede.

O OpenTelemetry fornece uma abordagem baseada em texto para propagar contexto
para serviços remotos usando os cabeçalhos HTTP do
[W3C Trace Context](https://www.w3.org/TR/trace-context/).

## Propagação automática de contexto {#automatic-context-propagation}

As bibliotecas de instrumentação para _frameworks_ e bibliotecas Python
populares, como Jinja2, Flask, Django e Celery, propagam contexto entre serviços
para você.

> [!NOTE]
>
> Use bibliotecas de instrumentação para propagar contexto. Embora seja possível
> propagar contexto manualmente, a auto-instrumentação Python e as bibliotecas
> de instrumentação são bem testadas e mais fáceis de usar.

## Propagação manual de contexto {#manual-context-propagation}

O seguinte exemplo genérico mostra como você pode propagar o contexto de rastros
manualmente.

Primeiro, no serviço remetente, injete o `context` atual:

```python
from flask import Flask
import requests
from opentelemetry import trace, baggage
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.baggage.propagation import W3CBaggagePropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor

app = Flask(__name__)

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer(__name__)

@app.route('/')
def hello():
    with tracer.start_as_current_span("api1_trecho") as span:
        ctx = baggage.set_baggage("ola", "mundo")

        headers = {}
        W3CBaggagePropagator().inject(headers, ctx)
        TraceContextTextMapPropagator().inject(headers, ctx)
        print(headers)

        response = requests.get('http://127.0.0.1:5001/', headers=headers)
        return f"Olá da API 1! Resposta da API 2: {response.text}"

if __name__ == '__main__':
    app.run(port=5002)
```

No serviço receptor, extraia o `context`, por exemplo, dos cabeçalhos HTTP
analisados, e então defina-os como o contexto de trace atual.

```python
from flask import Flask, request
from opentelemetry import trace, baggage
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor
from opentelemetry.baggage.propagation import W3CBaggagePropagator

app = Flask(__name__)

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer(__name__)

@app.route('/')
def hello():
    # Exemplo: Registrar cabeçalhos recebidos na requisição na API 2
    headers = dict(request.headers)
    print(f"Cabeçalhos recebidos: {headers}")
    carrier ={'traceparent': headers['Traceparent']}
    ctx = TraceContextTextMapPropagator().extract(carrier=carrier)
    print(f"Contexto recebido: {ctx}")

    b2 ={'baggage': headers['Baggage']}
    ctx2 = W3CBaggagePropagator().extract(b2, context=ctx)
    print(f"Contexto recebido 2: {ctx2}")

    # Iniciar um novo trecho
    with tracer.start_span("api2_trecho", context=ctx2):
       # Usar contexto propagado
        print(baggage.get_baggage('ola', ctx2))
        return "Olá da API 2!"

if __name__ == '__main__':
    app.run(port=5001)
```

A partir daí, quando você tiver um contexto ativo desserializado, pode criar
trechos que fazem parte do mesmo rastro de outro serviço.

### sqlcommenter

Algumas instrumentações Python suportam _sqlcommenter_, que enriquece as
declarações de consulta do banco de dados com informações contextuais. Consultas
feitas com _sqlcommenter_ habilitado terão pares chave-valor configuráveis
anexados. Por exemplo:

```sql
"select * from auth_users; /*traceparent=00-01234567-abcd-01*/"
```

Isso suporta a propagação de contexto entre cliente e servidor de banco de dados
quando os registros de log do banco de dados estão habilitados. Para mais
informações, acesse:

- [Exemplo de sqlcommenter do OpenTelemetry Python](https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/sqlcommenter/)
- [Convenções Semânticas - Database Spans](/docs/specs/semconv/db/database-spans/#sql-commenter)
- [sqlcommenter](https://google.github.io/sqlcommenter/)

## Próximos passos {#next-steps}

Para saber mais sobre propagação, veja
[API de Propagadores](/docs/specs/otel/context/api-propagators/).
