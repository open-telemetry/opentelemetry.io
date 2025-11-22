---
title: Primeiros Passos
description: Obtenha telemetria para sua aplicação em menos de 5 minutos!
weight: 10
default_lang_commit: f49ec57e5a0ec766b07c7c8e8974c83531620af3
drifted_from_default: true
# prettier-ignore
cSpell:ignore: debugexporter diceroller distro maxlen randint rolldice rollspan venv
---

Esta página mostrará como começar a usar o OpenTelemetry em Python.

Você aprenderá como instrumentar automaticamente uma aplicação simples, de forma
que [rastros][], [métricas][], e [logs][] sejam emitidos para o console.

## Pré-requisitos {#prerequisites}

Certifique-se de ter o seguinte instalado localmente:

- [Python 3](https://www.python.org/)

## Aplicação de Exemplo {#example-application}

O exemplo a seguir usa uma aplicação básica em
[Flask](https://flask.palletsprojects.com/). Se você não estiver usando Flask,
tudo bem — você pode usar OpenTelemetry Python com outros _frameworks_ web
também, como Django e FastAPI. Para uma lista completa de bibliotecas para
_frameworks_ suportados, consulte o
[registro](/ecosystem/registry/?component=instrumentation&language=python).

Para exemplos mais elaborados, consulte
[exemplos](/docs/languages/python/examples/).

## Instalação {#installation}

Para começar, configure um ambiente em um novo diretório:

```shell
mkdir otel-getting-started
cd otel-getting-started
python3 -m venv venv
source ./venv/bin/activate
```

Agora instale Flask:

```shell
pip install flask
```

### Crie e inicie um Servidor HTTP {#create-and-launch-an-http-server}

Crie um arquivo `app.py` e adicione o seguinte código a ele:

```python
from random import randint
from flask import Flask, request
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route("/rolldice")
def roll_dice():
    player = request.args.get('player', default=None, type=str)
    result = str(roll())
    if player:
        logger.warning("%s esta jogando os dados: %s", player, result)
    else:
        logger.warning("Jogador anonimo esta jogando os dados: %s", result)
    return result


def roll():
    return randint(1, 6)
```

Execute a aplicação utilizando o comando abaixo e acesse
<http://localhost:8080/rolldice> no seu navegador para garantir que está
funcionando.

```sh
flask run -p 8080
```

## Instrumentação {#instrumentation}

A instrumentação sem código gerará dados de telemetria em seu nome. Existem
várias opções que você pode seguir, abordadas em mais detalhes em
[Instrumentação sem código](/docs/zero-code/python/). Aqui usaremos o agente
`opentelemetry-instrument`.

Instale o pacote `opentelemetry-distro`, que contém a API e SDK do
OpenTelemetry, além das ferramentas `opentelemetry-bootstrap` e
`opentelemetry-instrument` que serão utilizadas a seguir.

```shell
pip install opentelemetry-distro
```

Execute o comando `opentelemetry-bootstrap`:

```shell
opentelemetry-bootstrap -a install
```

Isso instalará a instrumentação do Flask.

## Execute a aplicação instrumentada {#run-the-instrumented-app}

Agora, você poderá executar a sua aplicação instrumentada com
`opentelemetry-instrument` e fazer com que os dados sejam emitidos no console:

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

Acesse <http://localhost:8080/rolldice> no seu navegador e recarregue a página
algumas vezes. Depois de um tempo, você deverá ver os trechos exibidos no
console, como o seguinte:

<details>
<summary>Ver exemplo de saída</summary>

```json
{
    "name": "/rolldice",
    "context": {
        "trace_id": "0xdb1fc322141e64eb84f5bd8a8b1c6d1f",
        "span_id": "0x5c2b0f851030d17d",
        "trace_state": "[]"
    },
    "kind": "SpanKind.SERVER",
    "parent_id": null,
    "start_time": "2023-10-10T08:14:32.630332Z",
    "end_time": "2023-10-10T08:14:32.631523Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "http.method": "GET",
        "http.server_name": "127.0.0.1",
        "http.scheme": "http",
        "net.host.port": 8080,
        "http.host": "localhost:8080",
        "http.target": "/rolldice?rolls=12",
        "net.peer.ip": "127.0.0.1",
        "http.user_agent": "curl/8.1.2",
        "net.peer.port": 58419,
        "http.flavor": "1.1",
        "http.route": "/rolldice",
        "http.status_code": 200
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.17.0",
            "service.name": "dice-server",
            "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
    }
}
{
    "body": "Jogador anonimo esta jogando os dados: 3",
    "severity_number": "<SeverityNumber.WARN: 13>",
    "severity_text": "WARNING",
    "attributes": {
        "otelSpanID": "5c2b0f851030d17d",
        "otelTraceID": "db1fc322141e64eb84f5bd8a8b1c6d1f",
        "otelServiceName": "dice-server"
    },
    "timestamp": "2023-10-10T08:14:32.631195Z",
    "trace_id": "0xdb1fc322141e64eb84f5bd8a8b1c6d1f",
    "span_id": "0x5c2b0f851030d17d",
    "trace_flags": 1,
    "resource": "BoundedAttributes({'telemetry.sdk.language': 'python', 'telemetry.sdk.name': 'opentelemetry', 'telemetry.sdk.version': '1.17.0', 'service.name': 'dice-server', 'telemetry.auto.version': '0.38b0'}, maxlen=None)"
}
```

</details>

O trecho gerado rastreia o tempo de vida de uma requisição para a rota
`/rolldice`.

A linha de log emitida durante a solicitação contém o mesmo ID de rastro e ID de
trecho e é exportada para o console via o exportador de logs.

Envie mais algumas solicitações para esta rota e em seguida, espere um pouco ou
pare a execução da aplicação e você verá métricas na saída do console, como o
seguinte:

<details>
<summary>Ver exemplo de saída</summary>

```json
{
  "resource_metrics": [
    {
      "resource": {
        "attributes": {
          "service.name": "unknown_service",
          "telemetry.auto.version": "0.34b0",
          "telemetry.sdk.language": "python",
          "telemetry.sdk.name": "opentelemetry",
          "telemetry.sdk.version": "1.13.0"
        },
        "schema_url": ""
      },
      "schema_url": "",
      "scope_metrics": [
        {
          "metrics": [
            {
              "data": {
                "aggregation_temporality": 2,
                "data_points": [
                  {
                    "attributes": {
                      "http.flavor": "1.1",
                      "http.host": "localhost:5000",
                      "http.method": "GET",
                      "http.scheme": "http",
                      "http.server_name": "127.0.0.1"
                    },
                    "start_time_unix_nano": 1666077040061693305,
                    "time_unix_nano": 1666077098181107419,
                    "value": 0
                  }
                ],
                "is_monotonic": false
              },
              "description": "mede o número de requisições HTTP simultâneas que estão atualmente em andamento",
              "name": "http.server.active_requests",
              "unit": "requests"
            },
            {
              "data": {
                "aggregation_temporality": 2,
                "data_points": [
                  {
                    "attributes": {
                      "http.flavor": "1.1",
                      "http.host": "localhost:5000",
                      "http.method": "GET",
                      "http.scheme": "http",
                      "http.server_name": "127.0.0.1",
                      "http.status_code": 200,
                      "net.host.port": 5000
                    },
                    "bucket_counts": [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    "count": 1,
                    "explicit_bounds": [
                      0, 5, 10, 25, 50, 75, 100, 250, 500, 1000
                    ],
                    "max": 1,
                    "min": 1,
                    "start_time_unix_nano": 1666077040063027610,
                    "sum": 1,
                    "time_unix_nano": 1666077098181107419
                  }
                ]
              },
              "description": "mede a duração da requisição HTTP recebida",
              "name": "http.server.duration",
              "unit": "ms"
            }
          ],
          "schema_url": "",
          "scope": {
            "name": "opentelemetry.instrumentation.flask",
            "schema_url": "",
            "version": "0.34b0"
          }
        }
      ]
    }
  ]
}
```

</details>

## Adicione instrumentação manual à instrumentação automática {#add-manual-instrumentation-to-automatic-instrumentation}

A instrumentação automática captura telemetria nas bordas dos seus sistemas,
como requisições HTTP de entrada e saída, mas não captura o que está acontecendo
na sua aplicação. Para isso, você precisará escrever alguma
[instrumentação manual](../instrumentation/). Aqui está como você pode
facilmente vincular a instrumentação manual com a instrumentação automática.

### Rastros {#traces}

Primeiro, modifique `app.py` para incluir código que inicializa um rastreador e
o utiliza para criar um rastro que é filho do que é gerado automaticamente:

```python
from random import randint
from flask import Flask

from opentelemetry import trace

# Adquira um rastreador
tracer = trace.get_tracer("diceroller.tracer")

app = Flask(__name__)

@app.route("/rolldice")
def roll_dice():
    return str(roll())

def roll():
    # Isso cria um novo trecho que é filho do atual
    with tracer.start_as_current_span("roll") as rollspan:
        res = randint(1, 6)
        rollspan.set_attribute("roll.value", res)
        return res
```

Agora, execute a aplicação novamente:

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

Quando você enviar uma requisição ao servidor, verá dois trechos no rastro
emitido para o console, chamado `roll`, que registra o seu pai como o criado
automaticamente:

<details>
<summary>Ver exemplo de saída</summary>

```json
{
    "name": "roll",
    "context": {
        "trace_id": "0x6f781c83394ed2f33120370a11fced47",
        "span_id": "0x623321c35b8fa837",
        "trace_state": "[]"
    },
    "kind": "SpanKind.INTERNAL",
    "parent_id": "0x09abe52faf1d80d5",
    "start_time": "2023-10-10T08:18:28.679261Z",
    "end_time": "2023-10-10T08:18:28.679560Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "roll.value": "6"
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.17.0",
            "service.name": "dice-server",
            "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
    }
}
{
    "name": "/rolldice",
    "context": {
        "trace_id": "0x6f781c83394ed2f33120370a11fced47",
        "span_id": "0x09abe52faf1d80d5",
        "trace_state": "[]"
    },
    "kind": "SpanKind.SERVER",
    "parent_id": null,
    "start_time": "2023-10-10T08:18:28.678348Z",
    "end_time": "2023-10-10T08:18:28.679677Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "http.method": "GET",
        "http.server_name": "127.0.0.1",
        "http.scheme": "http",
        "net.host.port": 8080,
        "http.host": "localhost:8080",
        "http.target": "/rolldice?rolls=12",
        "net.peer.ip": "127.0.0.1",
        "http.user_agent": "curl/8.1.2",
        "net.peer.port": 58485,
        "http.flavor": "1.1",
        "http.route": "/rolldice",
        "http.status_code": 200
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.17.0",
            "service.name": "dice-server",
            "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
    }
}
```

</details>

O `parent_id` de `roll` é o mesmo que o `span_id` para `/rolldice`, indicando
uma relação pai-filho!

### Métricas {#metrics}

Agora modifique `app.py` para incluir código que inicializa um medidor e o usa
para criar um instrumento contador que conta o número de jogadas para cada valor
de jogada possível:

```python
# Estas são as declarações de _imports_ necessários
from opentelemetry import trace
from opentelemetry import metrics

from random import randint
from flask import Flask, request
import logging

# Adquira um rastreador
tracer = trace.get_tracer("diceroller.tracer")
# Adquira um medidor.
meter = metrics.get_meter("diceroller.meter")

# Agora crie um instrumento contador para fazer medições
roll_counter = meter.create_counter(
    "dice.rolls",
    description="O número de jogadas por valor de jogada",
)

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/rolldice")
def roll_dice():
    # Isso cria um novo trecho que é filho do atual
    with tracer.start_as_current_span("roll") as roll_span:
        player = request.args.get('player', default = None, type = str)
        result = str(roll())
        roll_span.set_attribute("roll.value", result)
        # Isso adiciona 1 ao contador para o valor de jogada dado
        roll_counter.add(1, {"roll.value": result})
        if player:
            logger.warn("%s esta jogando os dados: %s", player, result)
        else:
            logger.warn("Jogador anonimo esta jogando os dados: %s", result)
        return result

def roll():
    return randint(1, 6)
```

Agora, execute a aplicação novamente:

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

Quando você enviar uma requisição para o servidor, verá a métrica do contador de
jogadas emitida para o console, com contagens de valor separadas para cada
jogada:

<details>
<summary>Ver exemplo de saída</summary>

```json
{
  "resource_metrics": [
    {
      "resource": {
        "attributes": {
          "telemetry.sdk.language": "python",
          "telemetry.sdk.name": "opentelemetry",
          "telemetry.sdk.version": "1.17.0",
          "service.name": "dice-server",
          "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
      },
      "scope_metrics": [
        {
          "scope": {
            "name": "opentelemetry.instrumentation.flask",
            "version": "0.38b0",
            "schema_url": ""
          },
          "metrics": [
            {
              "name": "http.server.active_requests",
              "description": "mede o número de requisições HTTP simultâneas que estão atualmente em andamento",
              "unit": "requests",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "http.method": "GET",
                      "http.host": "localhost:8080",
                      "http.scheme": "http",
                      "http.flavor": "1.1",
                      "http.server_name": "127.0.0.1"
                    },
                    "start_time_unix_nano": 1696926005694857000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 0
                  }
                ],
                "aggregation_temporality": 2,
                "is_monotonic": false
              }
            },
            {
              "name": "http.server.duration",
              "description": "mede a duração da requisição HTTP recebida",
              "unit": "ms",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "http.method": "GET",
                      "http.host": "localhost:8080",
                      "http.scheme": "http",
                      "http.flavor": "1.1",
                      "http.server_name": "127.0.0.1",
                      "net.host.port": 8080,
                      "http.status_code": 200
                    },
                    "start_time_unix_nano": 1696926005695798000,
                    "time_unix_nano": 1696926063549782000,
                    "count": 7,
                    "sum": 6,
                    "bucket_counts": [
                      1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                    ],
                    "explicit_bounds": [
                      0.0, 5.0, 10.0, 25.0, 50.0, 75.0, 100.0, 250.0, 500.0,
                      750.0, 1000.0, 2500.0, 5000.0, 7500.0, 10000.0
                    ],
                    "min": 0,
                    "max": 1
                  }
                ],
                "aggregation_temporality": 2
              }
            }
          ],
          "schema_url": ""
        },
        {
          "scope": {
            "name": "diceroller.meter",
            "version": "",
            "schema_url": ""
          },
          "metrics": [
            {
              "name": "dice.rolls",
              "description": "O número de jogadas por valor de jogada",
              "unit": "",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "roll.value": "5"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 3
                  },
                  {
                    "attributes": {
                      "roll.value": "6"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  },
                  {
                    "attributes": {
                      "roll.value": "1"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  },
                  {
                    "attributes": {
                      "roll.value": "3"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  },
                  {
                    "attributes": {
                      "roll.value": "4"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  }
                ],
                "aggregation_temporality": 2,
                "is_monotonic": true
              }
            }
          ],
          "schema_url": ""
        }
      ],
      "schema_url": ""
    }
  ]
}
```

</details>

## Envie telemetria para o OpenTelemetry Collector {#send-telemetry-to-an-opentelemetry-collector}

O [OpenTelemetry Collector](/docs/collector/) é um componente crítico da maioria
das implantações em produção. Alguns exemplos de quando é benéfico utilizar um
Collector:

- Um único coletor de telemetria compartilhado por vários serviços, para reduzir
  a sobrecarga de troca de exportadores
- Agregando rastros entre vários serviços, executados em várias instâncias
- Um local central para processar rastros antes de exportá-los para um _backend_

A menos que você tenha apenas um único serviço ou esteja experimentando, você
desejará usar um Collector em implantações de produção.

### Configure e execute um Collector local {#configure-and-run-a-local-collector}

Primeiro, salve o seguinte código de configuração do Collector em um arquivo no
diretório `/tmp/`:

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
  # NOTA: Antes da v0.86.0 use `logging` em vez de `debug`.
  debug:
    verbosity: detailed
processors:
  batch:
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
      processors: [batch]
    metrics:
      receivers: [otlp]
      exporters: [debug]
      processors: [batch]
    logs:
      receivers: [otlp]
      exporters: [debug]
      processors: [batch]
```

Em seguida, execute o comando docker para adquirir e executar o Collector com
base nesta configuração:

```shell
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

Agora, você terá uma instância do Collector em execução localmente, ouvindo na
porta 4317.

### Modifique o comando para exportar trechos e métricas via OTLP {#modify-the-command-to-export-spans-and-metrics-via-otlp}

O próximo passo é modificar o comando para enviar trechos e métricas para o
coletor via OTLP em vez do console.

Para fazer isso, instale o pacote de exportador OTLP:

```shell
pip install opentelemetry-exporter-otlp
```

O agente `opentelemetry-instrument` detectará o pacote que você acabou de
instalar e usará a exportação OTLP na próxima vez que for executado.

### Execute a aplicação {#run-the-application}

Execute a aplicação como antes, mas não exporte para o console:

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument --logs_exporter otlp flask run -p 8080
```

Por padrão, `opentelemetry-instrument` exporta rastros e métricas via OTLP/gRPC
e os enviará para `localhost:4317`, endereço onde o Collector está ouvindo.

Quando você acessar a rota `/rolldice` agora, verá a saída no processo do
Collector em vez do processo do Flask, que deve ser algo assim:

<details>
<summary>Ver exemplo de saída</summary>

```text
2022-06-09T20:43:39.915Z        DEBUG   debugexporter/debug_exporter.go:51  ResourceSpans #0
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.12.0rc1)
     -> telemetry.auto.version: STRING(0.31b0)
     -> service.name: STRING(unknown_service)
InstrumentationLibrarySpans #0
InstrumentationLibrary app
Span #0
    Trace ID       : 7d4047189ac3d5f96d590f974bbec20a
    Parent ID      : 0b21630539446c31
    ID             : 4d18cee9463a79ba
    Name           : roll
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2022-06-09 20:43:37.390134089 +0000 UTC
    End time       : 2022-06-09 20:43:37.390327687 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Attributes:
     -> roll.value: INT(5)
InstrumentationLibrarySpans #1
InstrumentationLibrary opentelemetry.instrumentation.flask 0.31b0
Span #0
    Trace ID       : 7d4047189ac3d5f96d590f974bbec20a
    Parent ID      :
    ID             : 0b21630539446c31
    Name           : /rolldice
    Kind           : SPAN_KIND_SERVER
    Start time     : 2022-06-09 20:43:37.388733595 +0000 UTC
    End time       : 2022-06-09 20:43:37.390723792 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Attributes:
     -> http.method: STRING(GET)
     -> http.server_name: STRING(127.0.0.1)
     -> http.scheme: STRING(http)
     -> net.host.port: INT(5000)
     -> http.host: STRING(localhost:5000)
     -> http.target: STRING(/rolldice)
     -> net.peer.ip: STRING(127.0.0.1)
     -> http.user_agent: STRING(curl/7.82.0)
     -> net.peer.port: INT(53878)
     -> http.flavor: STRING(1.1)
     -> http.route: STRING(/rolldice)
     -> http.status_code: INT(200)

2022-06-09T20:43:40.025Z        INFO    debugexporter/debug_exporter.go:56  MetricsExporter {"#metrics": 1}
2022-06-09T20:43:40.025Z        DEBUG   debugexporter/debug_exporter.go:66  ResourceMetrics #0
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.12.0rc1)
     -> telemetry.auto.version: STRING(0.31b0)
     -> service.name: STRING(unknown_service)
InstrumentationLibraryMetrics #0
InstrumentationLibrary app
Metric #0
Descriptor:
     -> Name: roll_counter
     -> Description: O número de jogadas por valor de jogada
     -> Unit:
     -> DataType: Sum
     -> IsMonotonic: true
     -> AggregationTemporality: AGGREGATION_TEMPORALITY_CUMULATIVE
NumberDataPoints #0
Data point attributes:
     -> roll.value: INT(5)
StartTimestamp: 2022-06-09 20:43:37.390226915 +0000 UTC
Timestamp: 2022-06-09 20:43:39.848587966 +0000 UTC
Value: 1
```

</details>

## Próximos passos {#next-steps}

Existem várias opções disponíveis para instrumentação automática em Python. Veja
[Instrumentação sem código](/docs/zero-code/python/) para aprender sobre e como
configurá-las.

Há muito mais na instrumentação manual do que apenas criar um trecho filho. Para
aprender detalhes sobre a inicialização da instrumentação manual e muitas outras
partes da API do OpenTelemetry que você pode usar, veja
[Instrumentação Manual](../instrumentation/).

Existem várias opções para exportar seus dados de telemetria com OpenTelemetry.
Para aprender como exportar seus dados para um _backend_ preferido, veja
[Exporters](../exporters/).

Se você gostaria de explorar um exemplo mais complexo, dê uma olhada na
[demonstração do OpenTelemetry](/docs/demo/), que inclui o
[Serviço de Recomendação](/docs/demo/services/recommendation/) baseado em Python
e o [Gerador de Carga](/docs/demo/services/load-generator/).

[rastros]: /docs/concepts/signals/traces/
[métricas]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
