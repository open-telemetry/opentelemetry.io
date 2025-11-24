---
title: Instrumentação
aliases: [manual]
weight: 20
description: Instrumentação manual para OpenTelemetry Python
default_lang_commit: e04e8da1f4527d65c162af9a670eb3be8e7e7fb9
cSpell:ignore: millis ottrace textmap
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% include instrumentation-intro.md %}}

## Configuração {#setup}

Primeiro, certifique-se de ter os pacotes da API e SDK:

```shell
pip install opentelemetry-api
pip install opentelemetry-sdk
```

## Rastros {#traces}

### Obter um Rastreador {#acquire-tracer}

Para começar a rastrear, você precisará inicializar um
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) e
opcionalmente defini-lo como o padrão global.

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    ConsoleSpanExporter,
)

provider = TracerProvider()
processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)

# Define o provedor global padrão de rastreador
trace.set_tracer_provider(provider)

# Cria um rastreador a partir do provedor global de rastreador
tracer = trace.get_tracer("meu.rastreador.nome")
```

### Criando Trechos {#creating-spans}

Para criar um [trecho](/docs/concepts/signals/traces/#spans), normalmente você
vai querer que seja iniciado como o trecho atual.

```python
def fazer_trabalho():
    with tracer.start_as_current_span("nome-do-trecho") as span:
        # faça algum trabalho que 'span' irá rastrear
        print("fazendo algum trabalho...")
        # Quando o bloco 'with' sair do escopo, 'span' será fechado para você
```

Você também pode usar `start_span` para criar um trecho sem torná-lo o trecho
atual. Isso geralmente é feito para rastrear operações concorrentes ou
assíncronas.

### Criando Trechos Aninhados {#creating-nested-spans}

Se você tiver uma sub-operação distinta que gostaria de rastrear como parte de
outra, você pode criar [trechos](/docs/concepts/signals/traces/#spans) para
representar a relação:

```python
def fazer_trabalho():
    with tracer.start_as_current_span("pai") as parent:
        # faça algum trabalho que 'pai' rastreia
        print("fazendo algum trabalho...")
        # Crie um trecho aninhado para rastrear o trabalho aninhado
        with tracer.start_as_current_span("filho") as child:
            # faça algum trabalho que 'filho' rastreia
            print("fazendo algum trabalho aninhado...")
            # o trecho aninhado é fechado quando sai do escopo

        # Este trecho também é fechado quando sai do escopo
```

Quando você visualizar trechos em uma ferramenta de visualização de rastros,
`filho` será rastreado como um trecho aninhado sob `pai`.

### Criando Trechos com Decoradores {#creating-spans-with-decorators}

É comum ter um único [trecho](/docs/concepts/signals/traces/#spans) rastreando a
execução de uma função inteira. Nesse cenário, há um decorador que você pode
usar para reduzir o código:

```python
@tracer.start_as_current_span("fazer_trabalho")
def fazer_trabalho():
    print("fazendo algum trabalho...")
```

O uso do decorador é equivalente a criar o trecho dentro de `fazer_trabalho()` e
finalizá-lo quando `fazer_trabalho()` for concluído.

Para usar o decorador, você deve ter uma instância de `tracer` disponível
globalmente para a declaração da sua função.

### Obter o Trecho Atual {#get-the-current-span}

Às vezes, é útil acessar o [trecho](/docs/concepts/signals/traces/#spans) atual
em um ponto no tempo para que você possa enriquecê-lo com mais informações.

```python
from opentelemetry import trace

current_span = trace.get_current_span()
# enriqueça 'current_span' com algumas informações
```

### Adicionar Atributos em um Trecho {#add-attributes-to-a-span}

Os [Atributos](/docs/concepts/signals/traces/#attributes) permitem que você
anexe pares de chave/valor em um [trecho](/docs/concepts/signals/traces/#spans)
para transportar mais informações sobre a operação que está sendo rastreada.

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.set_attribute("operacao.valor", 1)
current_span.set_attribute("operacao.nome", "Dizendo olá!")
current_span.set_attribute("operacao.outras-coisas", [1, 2, 3])
```

### Adicionar Atributos Semânticos {#add-semantic-attributes}

Os [Atributos Semânticos](/docs/specs/semconv/general/trace/) são
[Atributos](/docs/concepts/signals/traces/#attributes) predeterminados, que são
nomenclaturas bastante conhecidas para tipos comuns de dados. Usar Atributos
Semânticos permite que você normalize esse tipo de informação em seus sistemas.

Para usar Atributos Semânticos em Python, certifique-se de ter o pacote de
convenções semânticas:

```shell
pip install opentelemetry-semantic-conventions
```

Então você pode usá-lo no código:

```python
from opentelemetry import trace
from opentelemetry.semconv.trace import SpanAttributes

// ...

current_span = trace.get_current_span()
current_span.set_attribute(SpanAttributes.HTTP_METHOD, "GET")
current_span.set_attribute(SpanAttributes.HTTP_URL, "https://opentelemetry.io/")
```

### Adicionando Eventos {#adding-events}

Um [evento](/docs/concepts/signals/traces/#span-events) é uma mensagem legível
por humanos em um [trecho](/docs/concepts/signals/traces/#spans) que representa
"algo está acontecendo" durante sua vida. Você pode pensar nisso como um log
primitivo.

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.add_event("Vou tentar!")

# Faça alguma coisa

current_span.add_event("Consegui!")
```

### Adicionando Links {#adding-links}

Um [trecho](/docs/concepts/signals/traces/#spans) pode ser criado com zero ou
mais [links de trecho](/docs/concepts/signals/traces/#span-links) que o vinculam
causalmente a outro trecho. Um link precisa de um contexto de trecho para ser
criado.

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("trecho-1"):
    # Faça algo que 'trecho-1' rastreia.
    ctx = trace.get_current_span().get_span_context()
    link_from_span_1 = trace.Link(ctx)

with tracer.start_as_current_span("trecho-2", links=[link_from_span_1]):
    # Faça algo que 'trecho-2' rastreia.
    # O link em 'trecho-2' está causalmente associado ao 'trecho-1',
    # mas não é um trecho filho.
    pass
```

### Definir Status do Trecho {#set-span-status}

{{% include "span-status-preamble.md" %}}

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # algo que pode falhar
except:
    current_span.set_status(Status(StatusCode.ERROR))
```

### Registrar Exceções em Trechos {#record-exceptions-in-spans}

Pode ser uma boa ideia registrar exceções quando elas acontecem. Recomenda-se
fazer isso em conjunto com a definição do [status do trecho](#set-span-status).

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # algo que pode falhar

# Considere capturar uma exceção mais específica em seu código
except Exception as ex:
    current_span.set_status(Status(StatusCode.ERROR))
    current_span.record_exception(ex)
```

### Alterar o Formato de Propagação Padrão {#change-the-default-propagation-format}

Por padrão, o OpenTelemetry Python usará os seguintes formatos de propagação:

- W3C Trace Context
- W3C Baggage

Se você precisar alterar os padrões, pode fazê-lo por meio de variáveis de
ambiente ou no código:

#### Usando Variáveis de Ambiente {#using-environment-variables}

Você pode definir a variável de ambiente `OTEL_PROPAGATORS` com uma lista
separada por vírgulas. Os valores aceitos são:

- `"tracecontext"`: W3C Trace Context
- `"baggage"`: W3C Baggage
- `"b3"`: B3 Single
- `"b3multi"`: B3 Multi
- `"jaeger"`: Jaeger
- `"xray"`: AWS X-Ray (terceiros)
- `"ottrace"`: OT Trace (terceiros)
- `"none"`: Nenhum propagador configurado automaticamente.

A configuração padrão é equivalente a `OTEL_PROPAGATORS="tracecontext,baggage"`.

#### Usando APIs do SDK {#using-sdk-apis}

Como alternativa, você pode alterar o formato no código.

Por exemplo, se você precisar usar o formato de propagação B3 do Zipkin, pode
instalar o pacote B3:

```shell
pip install opentelemetry-propagator-b3
```

E então definir o propagador B3 no seu código de inicialização de rastreamento:

```python
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.b3 import B3Format

set_global_textmap(B3Format())
```

Observe que as variáveis de ambiente substituirão o que está configurado no
código.

### Leituras Adicionais {#further-reading}

- [Conceitos de Rastros](/docs/concepts/signals/traces/)
- [Especificação de Rastros](/docs/specs/otel/overview/#tracing-signal)
- [Documentação da API de Rastros do Python](https://opentelemetry-python.readthedocs.io/en/latest/api/trace.html)
- [Documentação do SDK de Rastros do Python](https://opentelemetry-python.readthedocs.io/en/latest/sdk/trace.html)

## Métricas {#metrics}

Para começar a coletar métricas, você precisará inicializar um
[`MeterProvider`](/docs/specs/otel/metrics/api/#meterprovider) e opcionalmente
defini-lo como o padrão global.

```python
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import (
    ConsoleMetricExporter,
    PeriodicExportingMetricReader,
)

metric_reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
provider = MeterProvider(metric_readers=[metric_reader])

# Define o provedor global padrão de medidor
metrics.set_meter_provider(provider)

# Cria um medidor a partir do provedor global de medidor
meter = metrics.get_meter("meu.medidor.nome")
```

### Criando e Usando Instrumentos Síncronos {#creating-and-using-synchronous-instruments}

Os
[instrumentos síncronos](/docs/specs/otel/metrics/api/#synchronous-and-asynchronous-instruments)
são usados para fazer medições do seu aplicativo e são usados em linha com a
lógica de processamento de aplicativos/negócios, como ao lidar com uma
solicitação ou chamar outro serviço.

Primeiro, crie seu instrumento. Os instrumentos geralmente são criados uma vez
no nível do módulo ou da classe e depois usados em linha com a lógica de
negócios. Este exemplo usa um instrumento
[Counter](/docs/specs/otel/metrics/api/#counter) para contar o número de itens
de trabalho concluídos:

```python
work_counter = meter.create_counter(
    "trabalho.contador", unit="1", description="Conta a quantidade de trabalho feito"
)
```

Usando a [operação de adição](/docs/specs/otel/metrics/api/#add) do Counter, o
código abaixo incrementa a contagem em um, usando o tipo de item de trabalho
como um atributo.

```python
def fazer_trabalho(item_trabalho):
    # conta o trabalho sendo feito
    work_counter.add(1, {"trabalho.tipo": item_trabalho.tipo_trabalho})
    print("fazendo algum trabalho...")
```

### Criando e Usando Instrumentos Assíncronos {#creating-and-using-asynchronous-instruments}

[Instrumentos assíncronos](/docs/specs/otel/metrics/api/#synchronous-and-asynchronous-instruments)
fornecem ao usuário uma maneira de registrar funções de _callback_, que são
invocadas sob demanda para fazer medições. Isso é útil para medir periodicamente
um valor que não pode ser instrumentado diretamente. Os instrumentos assíncronos
são criados com zero ou mais callbacks que serão invocados durante a coleta de
métricas. Cada callback aceita opções do SDK e retorna suas observações.

Este exemplo usa um instrumento
[Gauge Assíncrono](/docs/specs/otel/metrics/api/#asynchronous-gauge) para
relatar a versão de configuração atual fornecida por um servidor de
configuração, por meio da extração de um endpoint HTTP. Primeiro, escreva um
callback para fazer observações:

```python
from typing import Iterable
from opentelemetry.metrics import CallbackOptions, Observation


def raspar_versoes_configuracao(options: CallbackOptions) -> Iterable[Observation]:
    r = requests.get(
        "http://configserver/version_metadata", timeout=options.timeout_millis / 10**3
    )
    for metadata in r.json():
        yield Observation(
            metadata["version_num"], {"config.name": metadata["version_num"]}
        )
```

Observe que o OpenTelemetry passará opções para seu callback contendo um
timeout. Os callbacks devem respeitar esse timeout para evitar bloqueios
indefinidamente. Por fim, crie o instrumento com o callback para registrá-lo:

```python
meter.create_observable_gauge(
    "config.versao",
    callbacks=[raspar_versoes_configuracao],
    description="A versão de configuração ativa para cada configuração",
)
```

### Leituras Adicionais {#further-reading}

- [Conceitos de Métricas](/docs/concepts/signals/metrics/)
- [Especificação de Métricas](/docs/specs/otel/metrics/)
- [Documentação da API de Métricas do Python](https://opentelemetry-python.readthedocs.io/en/latest/api/metrics.html)
- [Documentação do SDK de Métricas do Python](https://opentelemetry-python.readthedocs.io/en/latest/sdk/metrics.html)

## Logs {#logs}

A API e o SDK de logs ainda estão em desenvolvimento. Para começar a coletar
logs, é necessário inicializar um
[`LoggerProvider`](/docs/specs/otel/logs/api/#loggerprovider) e, opcionalmente,
defini-lo como o padrão global. Em seguida, use o módulo de _logging_ embutido
do Python para criar registros de log que o OpenTelemetry possa processar.

```python
import logging
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor, ConsoleLogExporter
from opentelemetry._logs import set_logger_provider, get_logger

provider = LoggerProvider()
processor = BatchLogRecordProcessor(ConsoleLogExporter())
provider.add_log_record_processor(processor)
# Define o logger provider global padrão
set_logger_provider(provider)

logger = get_logger(__name__)

handler = LoggingHandler(level=logging.INFO, logger_provider=provider)
logging.basicConfig(handlers=[handler], level=logging.INFO)

logging.info("Este é um registro de log do OpenTelemetry!")
```

### Leituras Adicionais {#further-reading}

- [Conceitos de Logs](/docs/concepts/signals/logs/)
- [Especificação de Logs](/docs/specs/otel/logs/)
- [Documentação da API de Logs do Python](https://opentelemetry-python.readthedocs.io/en/latest/api/_logs.html)
- [Documentação do SDK de Logs do Python](https://opentelemetry-python.readthedocs.io/en/latest/sdk/_logs.html)

## Próximos Passos {#next-steps}

Você também desejará configurar um exportador apropriado para
[exportar seus dados de telemetria](/docs/languages/python/exporters) para um ou
mais backends de telemetria.
