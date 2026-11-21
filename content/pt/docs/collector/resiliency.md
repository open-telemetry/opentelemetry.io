---
title: Resiliência
description: Como configurar um pipeline resiliente do OTel Collector
weight: 26
default_lang_commit: 4edfbfc2ff38123678ca63eca95de94ede457623
---

O OpenTelemetry Collector foi projetado com componentes e configurações que
minimizam a perda de dados durante o processamento e a exportação de telemetria.
No entanto, compreender os possíveis cenários em que pode ocorrer perda de dados
e como mitigá-los é fundamental para um pipeline de observabilidade resiliente.

## Entendendo a resiliência do Collector {#understanding-collector-resilience}

Um Collector resiliente mantém o fluxo dos dados de telemetria e a capacidade de
processamento mesmo diante de condições adversas, garantindo que o pipeline de
observabilidade como um todo permaneça funcional.

A resiliência do Collector concentra-se principalmente na forma como ele lida
com os dados quando a rota configurada, ou seja, o destino dos rastros, das
métricas ou dos logs, fica indisponível ou quando a própria instância do
Collector apresenta problemas, como falhas.

## Fila de envio (buffer em memória) {#sending-queue-in-memory-buffering}

A forma mais básica de resiliência integrada aos Exporters do Collector é a fila
de envio.

- **Como funciona:** quando um Exporter é configurado, ele geralmente inclui uma
  fila de envio que mantém os dados em um buffer na memória antes de enviá-los
  para a rota downstream. Se a rota estiver disponível, os dados passam
  rapidamente pela fila.
- **Tratamento da indisponibilidade da rota:** se a rota ficar indisponível, por
  exemplo, devido a problemas de rede ou à reinicialização de um backend, o
  Exporter não poderá enviar os dados imediatamente. Em vez de descartar os
  dados, ele os adicionará à fila de envio em memória.
- **Mecanismo de novas tentativas:** o Collector utiliza um mecanismo de novas
  tentativas com backoff exponencial e jitter. Ele tenta reenviar repetidamente
  os dados armazenados no buffer após intervalos de espera. Por padrão, essas
  tentativas continuam por até cinco minutos.
- **Cenário de perda de dados:**
  - **Fila cheia:** a fila em memória tem um tamanho configurável, cujo padrão
    geralmente é de 1.000 lotes ou requisições. Se a rota permanecer
    indisponível e novos dados continuarem chegando, a fila poderá ficar cheia.
    Quando isso acontecer, os dados recebidos serão descartados para evitar que
    o Collector fique sem memória.
  - **Tempo limite das novas tentativas:** se a rota permanecer indisponível por
    mais tempo que a duração máxima configurada para novas tentativas, cujo
    padrão é de cinco minutos, o Collector interromperá as tentativas de envio
    dos dados mais antigos da fila e os descartará.
- **Configuração:** você pode configurar o tamanho da fila e o comportamento das
  novas tentativas nas configurações do Exporter:

```yaml
exporters:
  otlp:
    endpoint: otlp.example.com:4317
    sending_queue:
      storage: file_storage
      queue_size: 5_000 # Aumenta o tamanho da fila (padrão: 1000)
    retry_on_failure:
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 10m # Aumenta o tempo máximo de novas tentativas (padrão: 300s)
```

> [!TIP] **Use filas de envio para Exporters remotos**
>
> Habilite filas de envio para qualquer Exporter que envie dados por uma rede.
> Ajuste `queue_size` e `max_elapsed_time` com base no volume esperado de dados,
> na memória disponível do Collector e no tempo de indisponibilidade aceitável
> da rota. Monitore as métricas da fila (`otelcol_exporter_queue_size`,
> `otelcol_exporter_queue_capacity`).

## Armazenamento persistente (Write-Ahead Log - WAL) {#persistent-storage-write-ahead-log-wal}

Para evitar a perda de dados caso a própria instância do Collector falhe ou seja
reiniciada, habilite o armazenamento persistente para a fila de envio usando a
Extension `file_storage`.

- **Como funciona:** em vez de manter os dados apenas em um buffer na memória, a
  fila de envio os grava em um Write-Ahead Log (WAL) no disco antes de tentar
  exportá-los.
- **Tratamento de falhas do Collector:** se o Collector falhar enquanto houver
  dados na fila, esses dados serão mantidos no disco. Quando o Collector for
  reiniciado, ele lerá os dados do WAL e retomará as tentativas de enviá-los
  para a rota.
- **Cenário de perda de dados:** ainda pode ocorrer perda de dados se o disco
  falhar ou ficar sem espaço, ou se a rota permanecer indisponível além dos
  limites de novas tentativas, mesmo após a reinicialização do Collector. As
  garantias de entrega podem não ser tão robustas quanto as oferecidas por filas
  de mensagens dedicadas.
- **Configuração:**
  - Defina a Extension `file_storage`.
  - Referencie o ID do armazenamento na configuração `sending_queue` do
    Exporter.

```yaml
extensions:
  file_storage: # Defina a instância da Extension
    directory: /var/lib/otelcol/storage # Escolha um diretório persistente

exporters:
  otlp:
    endpoint: otlp.example.com:4317
    sending_queue:
      storage: file_storage # Referencie a instância da Extension de armazenamento

service:
  extensions: [file_storage] # Habilite a Extension na pipeline do serviço
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp]
```

> [!TIP] **Use WALs em Collectors selecionados**
>
> Use armazenamento persistente em Collectors críticos, como instâncias de
> Gateways ou Agents que coletam dados essenciais, nos quais a perda de dados
> causada por falhas do Collector seja inaceitável. Verifique se o diretório
> escolhido possui espaço em disco suficiente e as permissões adequadas.

## Filas de mensagens {#message-queues}

Para obter o nível mais alto de resiliência, especialmente entre diferentes
camadas de Collectors, como de Agent para Gateway, ou entre sua infraestrutura e
o backend de um fornecedor, você pode introduzir uma fila de mensagens dedicada,
como o Kafka.

- **Como funciona:** uma instância do Collector, o Agent, exporta dados para um
  tópico do Kafka usando o Kafka Exporter. Outra instância do Collector, o
  Gateway, consome os dados desse tópico usando o Kafka Receiver.
- **Tratamento da indisponibilidade da rota ou do Collector:**
  - Se o Collector consumidor, o Gateway, estiver indisponível, as mensagens
    simplesmente se acumularão no tópico do Kafka até os limites de retenção do
    Kafka. O Collector produtor, o Agent, não será afetado enquanto o Kafka
    permanecer disponível.
  - Se o Collector produtor, o Agent, estiver indisponível, nenhum dado novo
    entrará na fila, mas o consumidor poderá continuar processando as mensagens
    existentes.
  - Se o próprio Kafka estiver indisponível, o Collector produtor precisará de
    seu próprio mecanismo de resiliência, como uma fila de envio, possivelmente
    com WAL, para manter em buffer os dados destinados ao Kafka.
- **Cenário de perda de dados:** a perda de dados está relacionada
  principalmente ao próprio Kafka, como em casos de falha do cluster,
  configuração incorreta do tópico ou expiração dos dados, ou à falha do
  produtor ao enviar dados para o Kafka sem um buffer local adequado.
- **Configuração:**

Configuração do Collector Agent (produtor):

```yaml
exporters:
  kafka:
    brokers: ['kafka-broker1:9092', 'kafka-broker2:9092']
    topic: otlp_traces

receivers:
  otlp:
    protocols:
      grpc:

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [kafka]
```

Configuração do Collector Gateway (consumidor):

```yaml
receivers:
  kafka:
    brokers: ['kafka-broker1:9092', 'kafka-broker2:9092']
    topic: otlp_traces
    initial_offset: earliest # Processe as mensagens acumuladas

exporters:
  otlp:
    endpoint: otlp.example.com:4317
    # Considere usar fila e novas tentativas na exportação do Gateway para o Backend

service:
  pipelines:
    traces:
      receivers: [kafka]
      exporters: [otlp]
```

> [!TIP] **Use filas de mensagens em saltos críticos**
>
> Use uma fila de mensagens em caminhos críticos de dados que exijam alta
> durabilidade, especialmente entre limites de rede, como entre data centers,
> zonas de disponibilidade ou na comunicação com um fornecedor de nuvem. Essa
> abordagem aproveita a resiliência robusta e integrada de sistemas como o
> Kafka, mas adiciona complexidade operacional e exige experiência no
> gerenciamento do sistema de filas de mensagens.

## Circunstâncias de perda de dados {#circumstances-of-data-loss}

A perda de dados pode ocorrer nas seguintes circunstâncias:

- **Indisponibilidade da rede e tempo limite:** a rota downstream permanece
  indisponível por mais tempo que o `max_elapsed_time` configurado em
  `retry_on_failure`.
- **Indisponibilidade da rede e estouro da fila:** a rota downstream está
  indisponível, e a fila de envio, em memória ou persistente, atinge sua
  capacidade máxima antes que a rota se recupere. Os novos dados são
  descartados.
- **Falha do Collector, sem persistência:** a instância do Collector falha ou é
  encerrada enquanto utiliza apenas uma fila de envio em memória. Os dados
  mantidos na memória são perdidos.
- **Falha no armazenamento persistente:** o disco usado pela Extension
  `file_storage` falha ou fica sem espaço.
- **Falha na fila de mensagens:** a fila de mensagens externa, como o Kafka,
  sofre uma indisponibilidade ou um evento de perda de dados, e o Collector
  produtor não possui um buffer local adequado.
- **Configuração incorreta:** Exporters ou Receivers estão configurados
  incorretamente, impedindo o fluxo dos dados.
- **Resiliência desabilitada:** filas de envio ou mecanismos de novas tentativas
  estão explicitamente desabilitados na configuração.

## Recomendações para evitar a perda de dados {#recommendations-for-preventing-data-loss}

Siga estas recomendações para minimizar a perda de dados e garantir uma coleta
confiável de telemetria:

- **Sempre use filas de envio:** habilite `sending_queue` para Exporters que
  enviam dados pela rede.
- **Monitore as métricas do Collector:** monitore ativamente
  `otelcol_exporter_queue_size`, `otelcol_exporter_queue_capacity` e
  `otelcol_exporter_send_failed_spans`, assim como as métricas equivalentes para
  métricas e logs, a fim de detectar possíveis problemas antecipadamente.
- **Ajuste o tamanho da fila e as novas tentativas:** ajuste os parâmetros
  `queue_size` e `retry_on_failure` com base na carga esperada, nos recursos de
  memória e disco e no tempo aceitável de indisponibilidade da rota.
- **Use armazenamento persistente (WAL):** para Agents ou Gateways nos quais a
  perda de dados durante a reinicialização de um Collector seja inaceitável,
  configure a Extension `file_storage` para a fila de envio.
- **Considere usar filas de mensagens:** para obter a máxima durabilidade entre
  segmentos de rede ou desacoplar as camadas de Collectors, use uma fila de
  mensagens gerenciada, como o Kafka, se a sobrecarga operacional for aceitável.
- **Use padrões de implantação apropriados:**
  - Adote uma arquitetura Agent + Gateway. Os Agents realizam a coleta local,
    enquanto os Gateways realizam o processamento, o agrupamento em lotes e a
    exportação resiliente.
  - Concentre os esforços de resiliência, como filas, WAL e Kafka, nos saltos de
    rede: Agent -> Gateway e Gateway -> Backend.
  - A resiliência entre a aplicação, o SDK e um Agent local, como Sidecar ou
    DaemonSet, geralmente é menos crítica devido à confiabilidade da rede local.
    Adicionar filas nesse ponto pode, em alguns casos, afetar negativamente a
    aplicação se o Agent estiver indisponível.

Ao compreender esses mecanismos e aplicar as configurações apropriadas, você
pode aumentar significativamente a resiliência da sua implantação do
OpenTelemetry Collector e minimizar a perda de dados.
