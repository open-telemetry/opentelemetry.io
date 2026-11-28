---
title: Solução de problemas
description: Recomendações para solucionar problemas do Collector.
weight: 25
cSpell:ignore: confmap pprof tracez zpages
default_lang_commit: e75af5ff9e415f62cc1136f3170708c2567b3370
---

Nesta página, você aprenderá como diagnosticar problemas relacionados à
integridade e ao desempenho do OpenTelemetry Collector.

## Ferramentas de solução de problemas {#troubleshooting-tools}

O Collector fornece uma variedade de métricas, logs e Extensions para depurar
problemas.

### Telemetria interna {#internal-telemetry}

Você pode configurar e utilizar a
[telemetria interna](/docs/collector/internal-telemetry/) do próprio Collector
para monitorar seu desempenho.

### Exporters locais {#local-exporters}

Para determinados tipos de problemas, como validação de configuração e depuração
de rede, você pode enviar uma pequena quantidade de dados de teste para um
Collector configurado para gerar saída em logs locais. Utilizando um
[Exporter local](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter#general-information),
você pode inspecionar os dados que estão sendo processados pelo Collector.

Para solucionar problemas em tempo real, considere utilizar o
[Exporter `debug`](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/debugexporter/README.md),
que pode confirmar que o Collector está recebendo, processando e exportando
dados. Por exemplo:

```yaml
receivers:
  zipkin:
exporters:
  debug:
service:
  pipelines:
    traces:
      receivers: [zipkin]
      processors: []
      exporters: [debug]
```

Para iniciar os testes, gere um payload do Zipkin. Por exemplo, você pode criar
um arquivo chamado `trace.json` contendo:

```json
[
  {
    "traceId": "5982fe77008310cc80f1da5e10147519",
    "parentId": "90394f6bcffb5d13",
    "id": "67fae42571535f60",
    "kind": "SERVER",
    "name": "/m/n/2.6.1",
    "timestamp": 1516781775726000,
    "duration": 26000,
    "localEndpoint": {
      "serviceName": "api"
    },
    "remoteEndpoint": {
      "serviceName": "apip"
    },
    "tags": {
      "data.http_response_code": "201"
    }
  }
]
```

Com o Collector em execução, envie esse payload para o Collector:

```shell
curl -X POST localhost:9411/api/v2/spans -H'Content-Type: application/json' -d @trace.json
```

Você deverá visualizar uma entrada de log semelhante à seguinte:

```text
2023-09-07T09:57:43.468-0700 info TracesExporter {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
```

Você também pode configurar o Exporter `debug` para exibir todo o payload:

```yaml
exporters:
  debug:
    verbosity: detailed
```

Se você executar novamente o teste anterior com a configuração modificada, a
saída de log será semelhante a esta:

```text
2023-09-07T09:57:12.820-0700 info TracesExporter {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
2023-09-07T09:57:12.821-0700 info ResourceSpans #0
Resource SchemaURL: https://opentelemetry.io/schemas/1.4.0
Resource attributes:
     -> service.name: Str(telemetrygen)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope telemetrygen
Span #0
    Trace ID       : 0c636f29e29816ea76e6a5b8cd6601cf
    Parent ID      : 1a08eba9395c5243
    ID             : 10cebe4b63d47cae
    Name           : okey-dokey
    Kind           : Internal
    Start time     : 2023-09-07 16:57:12.045933 +0000 UTC
    End time       : 2023-09-07 16:57:12.046058 +0000 UTC
    Status code    : Unset
    Status message :
Attributes:
     -> span.kind: Str(server)
     -> net.peer.ip: Str(1.2.3.4)
     -> peer.service: Str(telemetrygen)
```

### Verificar os componentes do Collector {#check-collector-components}

Use o seguinte subcomando para listar os componentes disponíveis em uma
distribuição do Collector, incluindo seus níveis de estabilidade. Observe que o
formato da saída pode mudar entre versões.

```shell
otelcol components
```

Exemplo de saída:

```yaml
buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.96.0
receivers:
  - name: opencensus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Beta
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
  - name: zipkin
   stability:
      logs: Undefined
      metrics: Undefined
      traces: Beta
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
processors:
  - name: resource
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
  - name: span
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Alpha
  - name: probabilistic_sampler
    stability:
      logs: Alpha
      metrics: Undefined
      traces: Beta
exporters:
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: otlphttp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: debug
    stability:
      logs: Development
      metrics: Development
      traces: Development
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
connectors:
  - name: forward
    stability:
      logs-to-logs: Beta
      logs-to-metrics: Undefined
      logs-to-traces: Undefined
      metrics-to-logs: Undefined
      metrics-to-metrics: Beta
      traces-to-traces: Beta
extensions:
  - name: zpages
    stability:
      extension: Beta
  - name: health_check
    stability:
      extension: Beta
  - name: pprof
    stability:
      extension: Beta

```

### Extensões {#extensions}

Esta é uma lista de extensões que você pode habilitar para depurar o Collector.

#### Performance Profiler (pprof)

A extensão **pprof**, disponível localmente na porta `1777`, permite criar
perfis de desempenho do Collector enquanto ele está em execução.

Este é um caso de uso avançado e, na maioria das situações, não é necessário.

#### zPages

A extensão **zPages**, exposta localmente na porta `55679`, pode ser utilizada
para inspecionar dados em tempo real provenientes dos _receivers_ e _exporters_
do Collector.

A página **TraceZ**, disponível em `/debug/tracez`, é útil para depurar
operações de rastreamento (_trace operations_), como:

- Problemas de latência. Identifique as partes mais lentas de uma aplicação.
- Deadlocks e problemas de instrumentação. Identifique _spans_ em execução que
  não são finalizados.
- Erros. Determine quais tipos de erro estão ocorrendo e onde eles acontecem.

> **Observação:** o `zpages` pode conter logs de erro que não são emitidos
> diretamente pelo próprio Collector.

Em ambientes conteinerizados, talvez seja necessário expor essa porta em uma
interface pública em vez de apenas localmente. O `endpoint` pode ser configurado
na seção `extensions` da configuração:

```yaml
extensions:
  zpages:
    endpoint: 0.0.0.0:55679
```

## Lista de verificação para depuração de pipelines complexos {#checklist-for-debugging-complex-pipelines}

Pode ser difícil isolar problemas quando os dados de telemetria passam por
múltiplos Collectors e redes. Para cada "salto" (_hop_) da telemetria através de
um Collector ou outro componente do pipeline, é importante verificar:

1. Existem mensagens de erro nos logs internos do Collector?
2. Como a telemetria está sendo ingerida por esse componente?
3. Como a telemetria está sendo modificada por esse componente (por exemplo,
   através de _sampling_ ou mascaramento de dados)?
4. Como a telemetria está sendo exportada por esse componente?
5. Em qual formato a telemetria está?
6. Como o próximo salto (_next hop_) está configurado?
7. Existem políticas de rede que impedem a entrada ou saída dos dados?

## Solução de problemas em ambientes Kubernetes {#troubleshooting-in-kubernetes-environments}

Ao executar o OpenTelemetry Collector no Kubernetes, você pode utilizar
**ephemeral debug containers** para investigar problemas relacionados ao
Collector.

## Problemas comuns do Collector {#common-collector-issues}

Esta seção aborda como resolver problemas comuns do Collector.

### O Collector está apresentando problemas com dados {#collector-is-experiencing-data-issues}

O Collector e seus componentes podem apresentar diversos problemas relacionados
ao processamento de dados.

#### O Collector está descartando dados {#collector-is-dropping-data}

O Collector pode descartar dados por diversos motivos, mas os mais comuns são:

1. O Collector não foi dimensionado adequadamente e não consegue processar e
   exportar os dados na mesma velocidade em que os recebe.
2. O destino configurado no _exporter_ está indisponível ou está aceitando os
   dados muito lentamente.

Para reduzir perdas de dados (_drops_), configure as opções de **queued retry**
nos _exporters_ habilitados, especialmente as configurações de **Sending Queue
Batch Settings**.

#### O Collector não está recebendo dados {#collector-is-not-receiving-data}

O Collector pode deixar de receber dados pelos seguintes motivos:

1. Problemas de configuração de rede.
2. Configuração incorreta de um _receiver_.
3. Configuração incorreta do cliente.
4. O _receiver_ está definido na seção `receivers`, mas não foi habilitado em
   nenhum `pipeline`.

Verifique os logs do Collector e também o `zPages` para identificar possíveis
problemas.

#### O Collector não está processando dados {#collector-is-not-processing-data}

A maioria dos problemas de processamento ocorre devido a um entendimento
incorreto de como um _processor_ funciona ou devido a uma configuração
incorreta.

Por exemplo:

- O **attributes processor** funciona apenas para atributos (_tags_) em _spans_.
  O nome do _span_ é tratado pelo **span processor**.
- Processadores de dados de rastreamento (_trace data_), com exceção do **tail
  sampling**, operam apenas em _spans_ individuais.

#### O Collector não está exportando dados {#collector-is-not-exporting-data}

O Collector pode não exportar dados pelos seguintes motivos:

1. Problemas de configuração de rede.
2. Configuração incorreta de um _exporter_.
3. O destino configurado está indisponível.

Verifique os logs do Collector e também o `zPages` para identificar possíveis
problemas.

Problemas de exportação geralmente estão relacionados à infraestrutura de rede,
por exemplo:

- Firewall
- DNS
- Proxy

O Collector possui suporte nativo a proxy.

### O Collector está apresentando problemas de controle {#collector-is-experiencing-control-issues}

O Collector pode apresentar falhas de inicialização, encerramentos inesperados
ou reinicializações.

#### O Collector encerra ou reinicia {#collector-exits-or-restarts}

O Collector pode encerrar ou reiniciar pelos seguintes motivos:

1. Pressão de memória causada pela ausência ou configuração incorreta do
   processor `memory_limiter`.
2. Dimensionamento inadequado para a carga de trabalho.
3. Configuração incorreta. Por exemplo, uma fila (_queue_) maior do que a
   memória disponível.
4. Limitações de recursos da infraestrutura, como em ambientes Kubernetes.

#### O Collector falha ao iniciar em contêineres Docker Windows {#collector-fails-to-start-in-windows-docker-containers}

Nas versões `v0.90.1` e anteriores, o Collector pode falhar ao iniciar em
contêineres Docker Windows, exibindo a seguinte mensagem:

```text
The service process could not connect to the service controller
```

Nesse caso, a variável de ambiente abaixo deve ser configurada:

```text
NO_WINDOWS_SERVICE=1
```

Isso força o Collector a iniciar como se estivesse sendo executado em um
terminal interativo, sem tentar operar como um serviço do Windows.

### O Collector está apresentando problemas de configuração {#collector-is-experiencing-configuration-issues}

O Collector pode apresentar problemas relacionados à configuração.

#### Mapas nulos (Null maps) {#null-maps}

Durante a resolução de múltiplos arquivos de configuração, valores definidos em
configurações anteriores podem ser removidos em favor de valores definidos
posteriormente, mesmo quando o valor mais recente é nulo.

Você pode corrigir esse problema das seguintes formas:

1. Utilize `{}` para representar um mapa vazio. Por exemplo:

```yaml
processors: {}
```

em vez de:

```yaml
processors:
```

1. Remova configurações vazias do arquivo, como:

```yaml
processors:
```

Consulte a documentação de **confmap troubleshooting** para mais informações.
