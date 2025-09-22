---
title: Serviço de Recomendação
linkTitle: Recomendação
aliases: [recommendationservice]
cSpell:ignore: cpython instrumentor NOTSET
---

Este serviço é responsável por obter uma lista de produtos recomendados para o usuário
baseado em IDs de produtos existentes que o usuário está navegando.

[Código fonte do serviço de recomendação](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/recommendation/)

## Auto-instrumentação

Este serviço baseado em Python, faz uso do auto-instrumentador OpenTelemetry para
Python, realizado aproveitando o wrapper Python `opentelemetry-instrument`
para executar os scripts. Isso pode ser feito no comando `ENTRYPOINT` para o
`Dockerfile` do serviço.

```dockerfile
ENTRYPOINT [ "opentelemetry-instrument", "python", "recommendation_server.py" ]
```

## Rastreamentos

### Inicializando Rastreamento

O SDK do OpenTelemetry é inicializado no bloco de código `__main__`. Este código
criará um provedor de tracer e estabelecerá um Processador de Span para usar. Pontos de
exportação, atributos de recurso e nome do serviço são automaticamente definidos pelo
auto instrumentador OpenTelemetry baseado em variáveis de ambiente.

```python
tracer = trace.get_tracer_provider().get_tracer("recommendation")
```

### Adicionar atributos a spans auto-instrumentados

Dentro da execução de código auto-instrumentado você pode obter o span atual do
contexto.

```python
span = trace.get_current_span()
```

Adicionar atributos a um span é realizado usando `set_attribute` no objeto
span. Na função `ListRecommendations` um atributo é adicionado ao span.

```python
span.set_attribute("app.products_recommended.count", len(prod_list))
```

### Criar novos spans

Novos spans podem ser criados e colocados no contexto ativo usando
`start_as_current_span` de um objeto Tracer do OpenTelemetry. Quando usado em
conjunto com um bloco `with`, o span será automaticamente encerrado quando o
bloco terminar a execução. Isso é feito na função `get_product_list`.

```python
with tracer.start_as_current_span("get_product_list") as span:
```

## Métricas

### Inicializando Métricas

O SDK do OpenTelemetry é inicializado no bloco de código `__main__`. Este código
criará um provedor de medidor. Pontos de exportação, atributos de recurso e nome do
serviço são automaticamente definidos pelo auto instrumentador OpenTelemetry baseado em variáveis de ambiente.

```python
meter = metrics.get_meter_provider().get_meter("recommendation")
```

### Métricas personalizadas

As seguintes métricas personalizadas estão atualmente disponíveis:

- `app_recommendations_counter`: Contagem cumulativa de # produtos recomendados por
  chamada de serviço

### Métricas auto-instrumentadas

As seguintes métricas estão disponíveis através de auto-instrumentação, cortesia do
`opentelemetry-instrumentation-system-metrics`, que é instalado como parte do
`opentelemetry-bootstrap` ao construir a imagem Docker do serviço de recomendação:

- `runtime.cpython.cpu_time`
- `runtime.cpython.memory`
- `runtime.cpython.gc_count`

## Logs

### Inicializando logs

O SDK do OpenTelemetry é inicializado no bloco de código `__main__`. O seguinte
código cria um provedor de logger com um processador em lote, um exportador de log OTLP, e
um manipulador de logging. Finalmente, ele cria um logger para uso em toda a
aplicação.

```python
logger_provider = LoggerProvider(
    resource=Resource.create(
        {
            'service.name': service_name,
        }
    ),
)
set_logger_provider(logger_provider)
log_exporter = OTLPLogExporter(insecure=True)
logger_provider.add_log_record_processor(BatchLogRecordProcessor(log_exporter))
handler = LoggingHandler(level=logging.NOTSET, logger_provider=logger_provider)

logger = logging.getLogger('main')
logger.addHandler(handler)
```

### Criar registros de log

Crie logs usando o logger. Exemplos podem ser encontrados nas funções `ListRecommendations` e
`get_product_list`.

```python
logger.info(f"Receive ListRecommendations for product ids:{prod_list}")
```

Como você pode ver, após a inicialização, registros de log podem ser criados da mesma
maneira que no Python padrão. Bibliotecas OpenTelemetry automaticamente adicionam um trace ID
e span ID para cada registro de log e, dessa forma, habilitam correlacionar logs e
rastreamentos.

### Notas

Logs para Python ainda são experimentais, e algumas mudanças podem ser esperadas. A
implementação neste serviço segue o
[exemplo de log Python](https://github.com/open-telemetry/opentelemetry-python/blob/stable/docs/examples/logs/example.py).
