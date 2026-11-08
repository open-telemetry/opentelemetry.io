---
title: Início rápido
description: Configure e colete telemetria em minutos!
aliases: [getting-started]
weight: 1
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
cSpell:ignore: docker dokey gobin okey telemetrygen
---

<!-- markdownlint-disable ol-prefix blanks-around-fences -->

O OpenTelemetry Collector recebe telemetria como
[rastros](/docs/concepts/signals/traces/),
[métricas](/docs/concepts/signals/metrics/) e
[logs](/docs/concepts/signals/logs/), processa esses dados e os encaminha para
um ou mais _backends_ de observabilidade por meio do seu _pipeline_ de
componentes.

> [!NOTE]
>
> Esta demonstração de início rápido cria uma configuração local básica. O
> objetivo é mostrar como o Collector funciona, não configurar um ambiente
> pronto para produção.

Neste guia, você irá:

- Iniciar uma instância local do OpenTelemetry Collector
- Gerar dados de rastros e enviá-los ao Collector
- Verificar se o Collector recebe e processa os dados

Ao final, você terá um _pipeline_ simples em execução na sua máquina e uma ideia
mais clara de como o Collector se encaixa em uma _stack_ de observabilidade. Se
quiser mais contexto antes de começar, consulte a visão geral do
[Collector](/docs/collector).

## Pré-requisitos {#prerequisites}

Antes de começar, certifique-se de que seu ambiente tenha as seguintes
ferramentas instaladas:

- [Docker](https://www.docker.com/) ou qualquer ambiente de execução de
  contêineres compatível — usado para executar o Collector
- [Go](https://go.dev/), uma das duas versões menores mais recentes — usado para
  instalar o gerador de telemetria
- [Variável de ambiente `GOBIN`][gobin] definida — garante que os binários Go
  instalados estejam disponíveis no seu PATH[^1]

Se `GOBIN` não estiver definida, execute:

```sh
export GOBIN=${GOBIN:-$(go env GOPATH)/bin}
```

Este guia utiliza comandos `bash`. Se você estiver usando um _shell_ diferente,
talvez seja necessário ajustar a sintaxe dos comandos.

[^1]:
    Para mais informações, consulte
    [_Your first program_](https://go.dev/doc/code#Command).

## Configurar o ambiente {#set-up-the-environment}

1. Baixe a imagem Docker da [distribuição](/docs/collector/distributions/) core
   do OpenTelemetry Collector:

   ```sh
   docker pull otel/opentelemetry-collector:{{% param vers %}}
   ```

2. Instale o [telemetrygen][], que usaremos para simular um cliente que gera
   telemetria:

   ```sh
   go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
   ```

## Gerar e coletar telemetria {#generate-and-collect-telemetry}

3. Inicie o Collector:

   ```sh
   docker run \
     -p 127.0.0.1:4317:4317 \
     -p 127.0.0.1:4318:4318 \
     -p 127.0.0.1:55679:55679 \
     otel/opentelemetry-collector:{{% param vers %}} \
     2>&1 | tee collector-output.txt
   ```

   O comando anterior executa o Collector localmente e abre três portas:
   - `4317` — OTLP sobre gRPC, o padrão para a maioria dos SDKs
   - `4318` — OTLP sobre HTTP, para clientes que não suportam gRPC
   - `55679` — ZPages, uma interface de depuração integrada que você pode abrir
     no navegador

4. Em um terminal separado, gere alguns rastros:

   ```sh
   $GOBIN/telemetrygen traces --otlp-insecure --traces 3
   ```

   Você verá uma saída confirmando que os rastros foram enviados:

   ```text
   2024-01-16T14:33:15.692-0500  INFO  traces/worker.go:99  traces generated  {"worker": 0, "traces": 3}
   2024-01-16T14:33:15.692-0500  INFO  traces/traces.go:58  stop the batch span processor
   ```

5. De volta ao terminal do Collector, você deverá ver atividade de ingestão de
   rastros semelhante à seguinte:

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

6. Pressione <kbd>Control-C</kbd> para encerrar o Collector.

## Próximos passos {#next-steps}

Neste ponto, você executou o Collector localmente e viu como ele processa
telemetria de ponta a ponta. A partir daqui, você pode começar a aprender como
ele é usado em configurações reais:

- [Configuração](/docs/collector/configuration): Aprenda como funciona o arquivo
  de configuração do Collector e como conectá-lo a um _backend_ real, como
  Jaeger ou Prometheus.
- [Padrões de implantação](/docs/collector/deploy/): Entenda a diferença entre
  executar o Collector como agente ou como _gateway_.
- [Instalar o Collector](/docs/collector/install/): Explore opções de instalação
  além do Docker, incluindo binários e Kubernetes.
- [Registro de componentes](/ecosystem/registry/?language=collector): Navegue
  pelos _receivers_, _processors_ e _exporters_ disponíveis para estender seu
  _pipeline_.

[gobin]: https://pkg.go.dev/cmd/go#hdr-Environment_variables
[telemetrygen]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen
