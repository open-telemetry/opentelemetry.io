---
title: Quick start
description: Setup and collect telemetry in minutes!
aliases: [getting-started]
weight: 1
cSpell:ignore: docker dokey gobin okey telemetrygen
---

<!-- markdownlint-disable ol-prefix blanks-around-fences -->

O OpenTelemetry Collector recebe [traces](/docs/concepts/signals/traces/), [metrics](/docs/concepts/signals/metrics/) e [logs](/docs/concepts/signals/logs/), processa a telemetria e a exporta para uma grande variedade de backends de observabilidade usando seus componentes. Para uma visão geral conceitual do Collector, veja [Collector](/docs/collector).

Você aprenderá o seguinte em menos de cinco minutos:

- Configurar e executar o OpenTelemetry Collector.
- Enviar telemetria e ver como ela é processada pelo Collector.

## Pré-requisitos

Certifique-se de que seu ambiente de desenvolvimento tenha o seguinte. Esta página assume que você está usando `bash`. Adapte as configurações e os comandos conforme o seu shell preferido.

- [Docker](https://www.docker.com/) ou outro ambiente de execução compatível com containers.
- [Go](https://go.dev/) 1.20 ou superior
- A variável de ambiente `GOBIN` está definida; se não estiver, inicialize-a
  apropriadamente, por exemplo[^1]:
  ```sh
  export GOBIN=${GOBIN:-$(go env GOPATH)/bin}
  ```

[^1]: Para mais informações, veja
    [Your first program](https://go.dev/doc/code#Command).

## Configurar o ambiente

1. Baixe a imagem Docker do OpenTelemetry Collector:

  ```sh
  docker pull otel/opentelemetry-collector:{{% param vers %}}
  ```

2. Instale o utilitário [telemetrygen][]:

  ```sh
  go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
  ```

  Esse utilitário pode simular um cliente gerando [traces][], [metrics][] e
  [logs][].

## Gerar e coletar telemetria

3. Execute o Collector, escutando nas portas 4317 (OTLP gRPC), 4318 (OTLP HTTP)
  e 55679 (ZPages):

  ```sh
  docker run \
    -p 127.0.0.1:4317:4317 \
    -p 127.0.0.1:4318:4318 \
    -p 127.0.0.1:55679:55679 \
    otel/opentelemetry-collector:{{% param vers %}} \
    2>&1 | tee collector-output.txt # Opcional: use tee para facilitar buscas
  ```

4. Em outro terminal, gere alguns traces de exemplo:

  ```sh
  $GOBIN/telemetrygen traces --otlp-insecure --traces 3
  ```

  Na saída gerada pela ferramenta, você deverá ver uma confirmação de que traces foram gerados:

  ```text
  2024-01-16T14:33:15.692-0500  INFO  traces/worker.go:99  traces generated  {"worker": 0, "traces": 3}
  2024-01-16T14:33:15.692-0500  INFO  traces/traces.go:58  stop the batch span processor
  ```

  Para facilitar a visualização da saída relevante, você pode filtrá-la:

  ```sh
  $GOBIN/telemetrygen traces --otlp-insecure \
    --traces 3 2>&1 | grep -E 'start|traces|stop'
  ```

5. No terminal onde o container do Collector está em execução, você deverá ver
  atividade de ingestão de traces semelhante ao exemplo a seguir:

  ```console
  $ grep -E '^Span|(ID|Name|Kind|time|Status \w+)\s+:' ./collector-output.txt
  Span #0
     Trace ID       : f30faffbde5fcf71432f89da1bf7bc14
     Parent ID      : 6f1ff7f9cf4ec1c7
     ID             : 8d1e820c1ac57337
     Name           : okey-dokey
     Kind           : Server
     Start time     : 2024-01-16 14:13:54.585877 +0000 UTC
     End time       : 2024-01-16 14:13:54.586 +0000 UTC
     Status code    : Unset
     Status message :
  Span #1
     Trace ID       : f30faffbde5fcf71432f89da1bf7bc14
     Parent ID      :
     ID             : 6f1ff7f9cf4ec1c7
     Name           : lets-go
     Kind           : Client
     Start time     : 2024-01-16 14:13:54.585877 +0000 UTC
     End time       : 2024-01-16 14:13:54.586 +0000 UTC
     Status code    : Unset
     Status message :
  ...
  ```

6. Abra <http://localhost:55679/debug/tracez> e selecione uma das amostras na
  tabela para ver os traces que você acabou de gerar.

7. Quando terminar, pare o contêiner do Collector, por exemplo, usando
  <kbd>Control-C</kbd>.

## Próximos passos

Neste tutorial você iniciou o OpenTelemetry Collector e enviou telemetria para
ele. Como próximos passos, considere:

- Explorar diferentes maneiras de [instalar o Collector](/docs/collector/install/).
- Aprender sobre os diferentes modos do Collector em
  [Deployment Methods](/docs/collector/deploy/).
- Familiarizar-se com os arquivos e a estrutura de
  [configuração](/docs/collector/configuration) do Collector.
- Explorar os componentes disponíveis no
  [registro](/ecosystem/registry/?language=collector).
- Aprender a
  [construir um Collector personalizado com o OpenTelemetry Collector Builder (OCB)](/docs/collector/extend/ocb/).

[gobin]: https://pkg.go.dev/cmd/go#hdr-Environment_variables
[logs]: /docs/concepts/signals/logs/
[metrics]: /docs/concepts/signals/metrics/
[telemetrygen]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen
[traces]: /docs/concepts/signals/traces/
