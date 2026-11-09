---
title: Configurações do Exporter OTLP
linkTitle: OTLP Exporter
weight: 20
aliases: [otlp-exporter-configuration]
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
cSpell:ignore: lowmemory
---

{{% include "env-var-note.md" %}}

## Configurações de rota {#endpoint-configuration}

As seguintes variáveis de ambiente permitem configurar uma rota OTLP/gRPC ou
OTLP/HTTP para seus rastros, métricas, perfis e logs.

### `OTEL_EXPORTER_OTLP_ENDPOINT`

A URL da rota base para qualquer tipo de sinal, com um número de porta
especificado opcionalmente. Pode ser útil quando você está enviando mais de um
sinal para a mesma rota e deseja que uma variável de ambiente controle este
valor.

**Valor padrão:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318"`

**Exemplo:**

- gRPC: `export OTEL_EXPORTER_OTLP_ENDPOINT="https://my-api-endpoint:443"`
- HTTP: `export OTEL_EXPORTER_OTLP_ENDPOINT="http://my-api-endpoint/"`

Para OTLP/HTTP, os Exporters no SDK constroem URLs específicos de sinal quando
esta variável de ambiente é definida. Isso significa que se você estiver
enviando rastros, métricas e logs, as seguintes URLs são construídos a partir do
exemplo acima:

- Rastros: `"http://my-api-endpoint/v1/traces"`
- Métricas: `"http://my-api-endpoint/v1/metrics"`
- Logs: `"http://my-api-endpoint/v1/logs"`

Para OTLP/gRPC, os valores de rota são alvos gRPC. Não adicione caminhos de
sinal do OTLP/HTTP, como `/v1/traces`, `/v1/metrics` ou `/v1/logs`, aos valores
de rota gRPC; os Exporters gRPC utilizam o método de serviço protobuf do OTLP
correspondente a cada sinal após se conectarem ao alvo configurado.

### `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`

URL da rota apenas para dados de rastros, com um número de porta especificado
opcionalmente. Normalmente termina com `v1/traces` ao utilizar OTLP/HTTP.

**Valor padrão:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/traces"`

**Exemplo:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://my-api-endpoint/v1/traces"`

### `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`

URL da rota apenas para dados de métricas, com um número de porta especificado
opcionalmente. Normalmente termina com `v1/metrics` ao utilizar OTLP/HTTP.

**Valor padrão:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/metrics"`

**Exemplo:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="http://my-api-endpoint/v1/metrics"`

### `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`

URL da rota apenas para dados de logs, com um número de porta especificado
opcionalmente. Normalmente termina com `v1/logs` ao utilizar OTLP/HTTP.

**Valor padrão:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/logs"`

**Exemplo:**

- gRPC: `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="http://my-api-endpoint/v1/logs"`

### `OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT`

URL da rota apenas para dados de perfis, com um número de porta especificado
opcionalmente. Normalmente termina com `v1/profiles` ao utilizar OTLP/HTTP.

**Valor padrão:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/profiles"`

**Exemplo:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT="http://my-api-endpoint/v1/profiles"`

## Configurações de cabeçalhos {#header-configuration}

As seguintes variáveis de ambiente permitem configurar cabeçalhos adicionais
como uma lista de pares chave-valor para adicionar em solicitações gRPC ou HTTP.

Os cabeçalhos são representados em um formato correspondente ao
[W3C Baggage](https://www.w3.org/TR/baggage/#header-content), por exemplo
`key1=value1,key2=value2`. [Metadados](https://www.w3.org/TR/baggage/#property)
delimitados por ponto e vírgula não são suportados. Para mais detalhes, consulte
[Especificando cabeçalhos via variáveis de ambiente](/docs/specs/otel/protocol/exporter/#specifying-headers-via-environment-variables)
na especificação do protocolo.

### `OTEL_EXPORTER_OTLP_HEADERS`

Uma lista de cabeçalhos para aplicar a todos os dados de saída (rastros,
métricas e logs).

**Valor padrão:** N/A

**Exemplo:**
`export OTEL_EXPORTER_OTLP_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_TRACES_HEADERS`

Uma lista de cabeçalhos para aplicar a todos os dados de rastros de saída.

**Valor padrão:** N/A

**Exemplo:**
`export OTEL_EXPORTER_OTLP_TRACES_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_METRICS_HEADERS`

Uma lista de cabeçalhos para aplicar a todos os dados de métricas de saída.

**Valor padrão:** N/A

**Exemplo:**
`export OTEL_EXPORTER_OTLP_METRICS_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_LOGS_HEADERS`

Uma lista de cabeçalhos para aplicar a todos os dados de logs de saída.

**Valor padrão:** N/A

**Exemplo:**
`export OTEL_EXPORTER_OTLP_LOGS_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_PROFILES_HEADERS`

Uma lista de cabeçalhos para aplicar a todos os dados de perfis de saída.

**Valor padrão:** N/A

**Exemplo:**
`export OTEL_EXPORTER_OTLP_PROFILES_HEADERS="api-key=key,other-config-value=value"`

## Configurações de tempo limite {#timeout-configuration}

As seguintes variáveis de ambiente configuram o tempo máximo (em milissegundos)
que um Exporter OTLP aguardará antes de transmitir o próximo lote de dados.

### `OTEL_EXPORTER_OTLP_TIMEOUT`

O valor de tempo limite para todos os dados de saída (rastros, métricas e logs)
em milissegundos.

**Valor padrão:** `10000` (10s)

**Exemplo:** `export OTEL_EXPORTER_OTLP_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`

O tempo limite para todos os rastros de saída em milissegundos.

**Valor padrão:** 10000 (10s)

**Exemplo:** `export OTEL_EXPORTER_OTLP_TRACES_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`

O tempo limite para todas as métricas de saída em milissegundos.

**Valor padrão:** 10000 (10s)

**Exemplo:** `export OTEL_EXPORTER_OTLP_METRICS_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`

O tempo limite para todos os logs de saída em milissegundos.

**Valor padrão:** 10000 (10s)

**Exemplo:** `export OTEL_EXPORTER_OTLP_LOGS_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT`

O tempo limite para todos os dados de perfis de saída em milissegundos.

**Valor padrão:** 10000 (10s)

**Exemplo:** `export OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT=500`

## Configurações de protocolo {#protocol-configuration}

As seguintes variáveis de ambiente configuram o protocolo de transporte OTLP que
um Exporter OTLP utiliza.

### `OTEL_EXPORTER_OTLP_PROTOCOL`

Especifica o protocolo de transporte OTLP a ser utilizado para todos os dados de
telemetria.

**Valor padrão:** depende do SDK, porém, geralmente é `http/protobuf` ou `grpc`.

**Exemplo:** `export OTEL_EXPORTER_OTLP_PROTOCOL=grpc`

Os valores válidos são:

- `grpc` para utilizar OTLP/gRPC
- `http/protobuf` para utilizar OTLP/HTTP + protobuf
- `http/json` para utilizar OTLP/HTTP + JSON

### `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`

Especifica o protocolo de transporte OTLP a ser utilizado para dados de rastros.

**Valor padrão:** depende do SDK, porém, geralmente é `http/protobuf` ou `grpc`.

**Exemplo:** `export OTEL_EXPORTER_OTLP_TRACES_PROTOCOL=grpc`

Os valores válidos são:

- `grpc` para utilizar OTLP/gRPC
- `http/protobuf` para utilizar OTLP/HTTP + protobuf
- `http/json` para utilizar OTLP/HTTP + JSON

### `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`

Especifica o protocolo de transporte OTLP a ser utilizado para dados de
métricas.

**Valor padrão:** depende do SDK, porém, geralmente é `http/protobuf` ou `grpc`.

**Exemplo:** `export OTEL_EXPORTER_OTLP_METRICS_PROTOCOL=grpc`

Os valores válidos são:

- `grpc` para utilizar OTLP/gRPC
- `http/protobuf` para utilizar OTLP/HTTP + protobuf
- `http/json` para utilizar OTLP/HTTP + JSON

### `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`

Especifica o protocolo de transporte OTLP a ser utilizado para dados de logs.

**Valor padrão:** depende do SDK, porém, geralmente é `http/protobuf` ou `grpc`.

**Exemplo:** `export OTEL_EXPORTER_OTLP_LOGS_PROTOCOL=grpc`

Os valores válidos são:

- `grpc` para utilizar OTLP/gRPC
- `http/protobuf` para utilizar OTLP/HTTP + protobuf
- `http/json` para utilizar OTLP/HTTP + JSON

### `OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL`

Especifica o protocolo de transporte OTLP a ser utilizado para dados de perfis.

**Valor padrão:** depende do SDK, porém, geralmente é `http/protobuf` ou `grpc`.

**Exemplo:** `export OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL=grpc`

Os valores válidos são:

- `grpc` para utilizar OTLP/gRPC
- `http/protobuf` para utilizar OTLP/HTTP + protobuf
- `http/json` para utilizar OTLP/HTTP + JSON

## Configurações específicas de métricas {#metrics-specific-configuration}

As seguintes variáveis de ambiente configuram opções do Exporter que são
exclusivas para métricas.

### `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE`

Configura a preferência de temporalidade de agregação do Exporter com base no
tipo de instrumento.

**Valor padrão:** `cumulative`

**Exemplo:** `export OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE=delta`

Os valores válidos são:

- `cumulative` para utilizar temporalidade de agregação cumulativa para todos os
  tipos de instrumento.
- `delta` para utilizar temporalidade de agregação delta para Counter,
  Asynchronous Counter e Histogram, e cumulativa para UpDownCounter e
  Asynchronous UpDownCounter.
- `lowmemory` para utilizar temporalidade de agregação delta para Synchronous
  Counter e Histogram, e cumulativa para os demais.

### `OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION`

Configura a agregação padrão do Exporter para o tipo de instrumento Histogram.

**Valor padrão:** `explicit_bucket_histogram`

**Exemplo:**
`export OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION=base2_exponential_bucket_histogram`

Os valores válidos são:

- `explicit_bucket_histogram` para utilizar agregação de histograma com
  _buckets_ explícitos.
- `base2_exponential_bucket_histogram` para utilizar agregação de histograma
  exponencial com _buckets_ de base 2.
