---
title: Cookbook
weight: 100
default_lang_commit: 16a511143f570ba02e16fffe706c11a9bfe05a79
---

Esta página é um _cookbook_ para cenários comuns.

## Criar um novo trecho {#create-a-new-span}

```python
from opentelemetry import trace

tracer = trace.get_tracer("meu.rastreador")
with tracer.start_as_current_span("imprimindo") as span:
    print("foo")
    span.set_attribute("imprimindo_caracter", "foo")
```

## Obter e modificar um trecho {#get-and-modify-a-span}

```python
from opentelemetry import trace

current_span = trace.get_current_span()
current_span.set_attribute("cidade_natal", "Fortaleza")
```

## Criar um trecho aninhado {#create-a-nested-span}

```python
from opentelemetry import trace
import time

tracer = trace.get_tracer("meu.rastreador")

# Criar um novo trecho para rastrear alguma tarefa
with tracer.start_as_current_span("pai"):
    time.sleep(1)

    # Criar um trecho aninhado para rastrear trabalho aninhado
    with tracer.start_as_current_span("filho"):
        time.sleep(2)
        # O trecho aninhado é fechado quando sai de escopo

    # Agora o trecho pai é o trecho atual novamente
    time.sleep(1)

    # Este trecho também é fechado quando sai de escopo
```

## Capturar bagagem em diferentes contextos {#capturing-baggage-at-different-contexts}

```python
from opentelemetry import trace, baggage

tracer = trace.get_tracer("meu.rastreador")
with tracer.start_as_current_span(name="trecho raiz") as root_span:
    parent_ctx = baggage.set_baggage("contexto", "pai")
    with tracer.start_as_current_span(
        name="trecho filho", context=parent_ctx
    ) as child_span:
        child_ctx = baggage.set_baggage("contexto", "filho")

print(baggage.get_baggage("contexto", parent_ctx))
print(baggage.get_baggage("contexto", child_ctx))
```

## Definir contexto de trecho manualmente {#manually-setting-span-context}

Geralmente sua aplicação ou _framework_ de servidor cuidará da propagação do
contexto de rastro para você. Mas, em alguns casos, você pode precisar salvar
seu contexto de rastro (com `.inject`) e recuperá-lo em outro lugar (com
`.extract`) por conta própria.

```python
from opentelemetry import trace, context
from opentelemetry.trace import NonRecordingSpan, SpanContext, TraceFlags
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# Configurar um processador simples para escrever trechos no console para podermos ver o que está acontecendo.
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer("meu.rastreador")

# Um TextMapPropagator funciona com qualquer objeto tipo dicionário como seu Transportador (Carrier) por padrão. Você também pode implementar getters e setters personalizados.
with tracer.start_as_current_span('primeiro-trecho'):
    carrier = {}
    # Escrever o contexto atual no carrier.
    TraceContextTextMapPropagator().inject(carrier)

# O código abaixo pode estar em uma _thread_ diferente, em uma máquina diferente, etc.
# Como um exemplo típico, estaria em um microsserviço diferente e o transportador teria
# sido encaminhado via cabeçalhos HTTP.

# Extrair o contexto de rastro do transportador.
# Aqui está como um transportador típico pode parecer, como teria sido injetado acima.
carrier = {'traceparent': '00-a9c3b99a95cc045e573e163c3ac80a77-d99d251a8caecd06-01'}
# Então usamos um propagador para obter um contexto dele.
ctx = TraceContextTextMapPropagator().extract(carrier=carrier)

# Em vez de extrair o contexto de rastro do transportador, se você já tem um objeto SpanContext
# você pode obter um contexto de rastro dele assim.
span_context = SpanContext(
    trace_id=2604504634922341076776623263868986797,
    span_id=5213367945872657620,
    is_remote=True,
    trace_flags=TraceFlags(0x01)
)
ctx = trace.set_span_in_context(NonRecordingSpan(span_context))

# Agora existem algumas maneiras de usar o contexto de rastro.

# Você pode passar o objeto de contexto ao iniciar um trecho.
with tracer.start_as_current_span('filho', context=ctx) as span:
    span.set_attribute('primos', [2, 3, 5, 7])

# Ou você pode torná-lo o contexto atual, e então o próximo trecho o utilizará.
# O _token_ retornado permite que você restaure o contexto anterior.
token = context.attach(ctx)
try:
    with tracer.start_as_current_span('filho') as span:
        span.set_attribute('pares', [2, 4, 6, 8])
finally:
    context.detach(token)
```

## Usar múltiplos provedores de rastro com diferentes Resources {#using-multiple-tracer-providers-with-different-resource}

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor

# Provedor de rastro global que só pode ser definido uma vez
trace.set_tracer_provider(
    TracerProvider(resource=Resource.create({"service.name": "service1"}))
)
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer("rastreador.um")
with tracer.start_as_current_span("algum-nome") as span:
    span.set_attribute("key", "valor")



another_tracer_provider = TracerProvider(
    resource=Resource.create({"service.name": "service2"})
)
another_tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

another_tracer = trace.get_tracer("rastreador.dois", tracer_provider=another_tracer_provider)
with another_tracer.start_as_current_span("outro-nome") as span:
    span.set_attribute("another-key", "outro valor")
```
