---
title: Configuração
weight: 20
description:
  Aprenda a configurar o Collector para atender às necessidades de
  observabilidade
default_lang_commit: 30b7dbbdd94cec0b2a0c99317272b103315518bf
# prettier-ignore
cSpell:ignore: cfssl cfssljson configtls fluentforward gencert genkey initca oidc pprof prodevent prometheusremotewrite spanevents unredacted upsert zpages
---

<!-- markdownlint-disable link-fragments -->

É possível configurar o OpenTelemetry Collector para atender às necessidades de
observabilidade. Antes de aprender como a configuração do Collector funciona,
familiarize-se com o seguinte conteúdo:

- [Conceitos de coleta de dados][dcc], para entender os repositórios aplicáveis
  ao OpenTelemetry Collector.
- [Orientações de segurança para usuários finais](/docs/security/config-best-practices/)
- [Orientações de segurança para desenvolvedores de componentes](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md)

## Localização {#location}

Por padrão, a configuração do Collector está localizada em
`/etc/<otel-directory>/config.yaml`, onde `<otel-directory>` pode ser `otelcol`,
`otelcol-contrib` ou outro valor, dependendo da versão do Collector ou da
distribuição do Collector utilizada.

É possível fornecer uma ou mais configurações usando a opção `--config`. Por
exemplo:

```shell
otelcol --config=customconfig.yaml
```

A _flag_ `--config` aceita um caminho de arquivo ou valores na forma de uma URI
de configuração `"<scheme>:<opaque_data>"`. Atualmente, o OpenTelemetry
Collector suporta os seguintes provedores para `scheme`:

- **file** - Lê a configuração de um arquivo. Ex.: `file:path/to/config.yaml`.
- **env** - Lê a configuração de uma variável de ambiente. Ex.:
  `env:MY_CONFIG_IN_AN_ENVVAR`.
- **yaml** - Lê a configuração de uma string YAML, com `::` delimitando
  subcaminhos. Ex.: `yaml:exporters::debug::verbosity: detailed`.

<!-- prettier-ignore-start -->
- **http** - Lê a configuração de uma URI HTTP. Ex.: `http://www.example.com`
- **https** - Lê a configuração de uma URI HTTPS. Ex.:
`https://www.example.com`
<!-- prettier-ignore-end -->

Também é possível fornecer múltiplas configurações usando múltiplos arquivos em
caminhos diferentes. Cada arquivo pode ser uma configuração completa ou parcial,
e os arquivos podem referenciar componentes uns dos outros. Se a combinação dos
arquivos não constituir uma configuração completa, o usuário recebe um erro,
pois componentes obrigatórios não são adicionados por padrão. Passe múltiplos
caminhos de arquivo na linha de comando da seguinte forma:

```shell
otelcol --config=file:/path/to/first/file --config=file:/path/to/second/file
```

Também é possível fornecer configurações usando variáveis de ambiente, URIs HTTP
ou caminhos YAML. Por exemplo:

```shell
otelcol --config=env:MY_CONFIG_IN_AN_ENVVAR --config=https://server/config.yaml
otelcol --config="yaml:exporters::debug::verbosity: normal"
```

> [!TIP]
>
> Ao referenciar chaves aninhadas em caminhos YAML, certifique-se de usar o
> duplo dois-pontos (`::`) para evitar confusão com _namespaces_ que contêm
> pontos. Por exemplo:
> `receivers::docker_stats::metrics::container.cpu.utilization::enabled: false`.

Para validar um arquivo de configuração, use o comando `validate`. Por exemplo:

```shell
otelcol validate --config=customconfig.yaml
```

## Estrutura da configuração {#basics}

A estrutura de qualquer arquivo de configuração do Collector consiste em quatro
classes de componentes de pipeline que acessam dados de telemetria:

- [Receivers](#receivers)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Receivers.svg">
- [Processors](#processors)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Processors.svg">
- [Exporters](#exporters)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Exporters.svg">
- [Connectors](#connectors)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Load_Balancer.svg">

Após cada componente de pipeline ser configurado, é necessário habilitá-lo
usando as pipelines na seção [service](#service) do arquivo de configuração.

Além dos componentes de pipeline, também é possível configurar
[extensions](#extensions), que fornecem capacidades que podem ser adicionadas ao
Collector, como ferramentas de diagnóstico. Extensions não exigem acesso direto
aos dados de telemetria e são habilitadas por meio da seção [service](#service).

<a id="endpoint-0.0.0.0-warning"></a> A seguir, um exemplo de configuração do
Collector com um receiver, um processor, um exporter e três extensions.

> [!WARNING]
>
> Embora seja geralmente preferível vincular rotas (_endpoints_) ao `localhost`
> quando todos os clientes são locais, nossos exemplos de configuração usam o
> endereço "não especificado" `0.0.0.0` por conveniência. O padrão do Collector
> é `localhost`. Para detalhes sobre qualquer uma dessas escolhas como valor de
> configuração de rota, consulte [Proteções contra ataques de negação de >
> serviço][].

[Proteções contra ataques de negação de serviço]:
  https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md#safeguards-against-denial-of-service-attacks

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp_grpc:
    endpoint: otelcol:4317
    sending_queue:
      batch:

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp_grpc]
    metrics:
      receivers: [otlp]
      exporters: [otlp_grpc]
    logs:
      receivers: [otlp]
      exporters: [otlp_grpc]
```

Note que receivers, processors, exporters e pipelines são definidos por meio de
identificadores de componente seguindo o formato `type[/name]`, por exemplo
`otlp` ou `otlp/2`. É possível definir componentes de um mesmo tipo mais de uma
vez, desde que os identificadores sejam únicos. Por exemplo:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  otlp/2:
    protocols:
      grpc:
        endpoint: 0.0.0.0:55690

exporters:
  otlp_grpc:
    endpoint: otelcol:4317
    sending_queue:
      batch:
  otlp_grpc/2:
    endpoint: otelcol2:4317
    sending_queue:
      batch:

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp_grpc]
    traces/2:
      receivers: [otlp/2]
      exporters: [otlp_grpc/2]
    metrics:
      receivers: [otlp]
      exporters: [otlp_grpc]
    logs:
      receivers: [otlp]
      exporters: [otlp_grpc]
```

A configuração também pode incluir outros arquivos, fazendo com que o Collector
os combine em uma única representação em memória da configuração YAML:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters: ${file:exporters.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

Sendo o arquivo `exporters.yaml`:

```yaml
otlp_grpc:
  endpoint: otelcol.observability.svc.cluster.local:443
```

O resultado final em memória será:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  otlp_grpc:
    endpoint: otelcol.observability.svc.cluster.local:443

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

## Receivers <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Receivers.svg"> {#receivers}

Receivers coletam telemetria de uma ou mais fontes. Eles podem ser baseados em
_pull_ ou _push_, e podem suportar uma ou mais
[fontes de dados](/docs/concepts/signals/).

Receivers são configurados na seção `receivers`. Muitos receivers vêm com
configurações padrão, de modo que especificar o nome do receiver é suficiente
para configurá-lo. Caso seja necessário configurar um receiver ou alterar a
configuração padrão, isso pode ser feito nesta seção. Qualquer configuração
especificada sobrescreve os valores padrão, se presentes.

> Configurar um receiver não o habilita. Receivers são habilitados ao serem
> adicionados às pipelines apropriadas na seção [service](#service).

O Collector exige um ou mais receivers. O exemplo a seguir mostra vários
receivers no mesmo arquivo de configuração:

```yaml
receivers:
  # Fontes de dados: logs
  fluentforward:
    endpoint: 0.0.0.0:8006

  # Fontes de dados: métricas
  host_metrics:
    scrapers:
      cpu:
      disk:
      filesystem:
      load:
      memory:
      network:
      process:
      processes:
      paging:

  # Fontes de dados: rastros
  jaeger:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      thrift_binary:
      thrift_compact:
      thrift_http:

  # Fontes de dados: rastros, métricas, logs
  kafka:
    protocol_version: 2.0.0

  # Fontes de dados: rastros, métricas
  opencensus:

  # Fontes de dados: rastros, métricas, logs
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: cert.pem
          key_file: cert-key.pem
      http:
        endpoint: 0.0.0.0:4318

  # Fontes de dados: métricas
  prometheus:
    config:
      scrape_configs:
        - job_name: otel-collector
          scrape_interval: 5s
          static_configs:
            - targets: [localhost:8888]

  # Fontes de dados: rastros
  zipkin:
```

> Para configuração detalhada de receivers, consulte o
> [README de receivers](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md).

## Processors <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Processors.svg"> {#processors}

Processors recebem os dados coletados pelos receivers e os modificam ou
transformam antes de enviá-los aos exporters. O processamento de dados ocorre de
acordo com regras ou configurações definidas para cada processor, que podem
incluir filtrar, descartar, renomear ou recalcular telemetria, entre outras
operações. A ordem dos processors em uma pipeline determina a ordem das
operações de processamento que o Collector aplica ao sinal.

Processors são opcionais, embora alguns
[sejam recomendados](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors).

Processors podem ser configurados usando a seção `processors` do arquivo de
configuração do Collector. Qualquer configuração especificada sobrescreve os
valores padrão, se presentes.

> Configurar um processor não o habilita. Processors são habilitados ao serem
> adicionados às pipelines apropriadas na seção [service](#service).

O exemplo a seguir mostra vários processors padrão no mesmo arquivo de
configuração. A lista completa de processors pode ser encontrada combinando a
lista do
[opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor)
com a lista do
[opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor).

```yaml
processors:
  # Fontes de dados: rastros
  attributes:
    actions:
      - key: environment
        value: production
        action: insert
      - key: db.statement
        action: delete
      - key: email
        action: hash

  # Fontes de dados: rastros, métricas, logs
  filter:
    error_mode: ignore
    traces:
      span:
        - 'attributes["container.name"] == "app_container_1"'
        - 'resource.attributes["host.name"] == "localhost"'
        - 'name == "app_3"'
      spanevent:
        - 'attributes["grpc"] == true'
        - 'IsMatch(name, ".*grpc.*")'
    metrics:
      metric:
        - 'name == "my.metric" and resource.attributes["my_label"] == "abc123"'
        - 'type == METRIC_DATA_TYPE_HISTOGRAM'
      datapoint:
        - 'metric.type == METRIC_DATA_TYPE_SUMMARY'
        - 'resource.attributes["service.name"] == "my_service_name"'
    logs:
      log_record:
        - 'IsMatch(body, ".*password.*")'
        - 'severity_number < SEVERITY_NUMBER_WARN'

  # Fontes de dados: rastros, métricas, logs
  memory_limiter:
    check_interval: 5s
    limit_mib: 4000
    spike_limit_mib: 500

  # Fontes de dados: rastros
  resource:
    attributes:
      - key: cloud.zone
        value: zone-1
        action: upsert
      - key: k8s.cluster.name
        from_attribute: k8s-cluster
        action: insert
      - key: redundant-attribute
        action: delete

  # Fontes de dados: rastros
  probabilistic_sampler:
    hash_seed: 22
    sampling_percentage: 15

  # Fontes de dados: rastros
  span:
    name:
      to_attributes:
        rules:
          - ^\/api\/v1\/document\/(?P<documentId>.*)\/update$
      from_attributes: [db.svc, operation]
      separator: '::'
```

> Para configuração detalhada de processors, consulte o
> [README de processors](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md).

## Exporters <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Exporters.svg"> {#exporters}

Exporters enviam dados para um ou mais backends ou destinos. Exporters podem ser
baseados em _pull_ ou _push_, e podem suportar uma ou mais
[fontes de dados](/docs/concepts/signals/).

Cada chave na seção `exporters` define uma instância de exporter. A chave segue
o formato `type/name`, onde `type` especifica o tipo do exporter (por exemplo,
`otlp`, `kafka`, `prometheus`), e `name` (opcional) pode ser adicionado para
fornecer um nome único para múltiplas instâncias do mesmo tipo.

A maioria dos exporters exige configuração para especificar pelo menos o
destino, bem como configurações de segurança, como tokens de autenticação ou
certificados TLS. Qualquer configuração especificada sobrescreve os valores
padrão, se presentes.

> Configurar um exporter não o habilita. Exporters são habilitados ao serem
> adicionados às pipelines apropriadas na seção [service](#service).

O Collector exige um ou mais exporters. O exemplo a seguir mostra vários
exporters no mesmo arquivo de configuração:

```yaml
exporters:
  # Fontes de dados: rastros, métricas, logs
  file:
    path: ./filename.json

  # Fontes de dados: rastros
  otlp_grpc/jaeger:
    endpoint: jaeger-server:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # Fontes de dados: rastros, métricas, logs
  kafka:
    protocol_version: 2.0.0

  # Fontes de dados: rastros, métricas, logs
  # NOTA: antes da v0.86.0, use `logging` em vez de `debug`
  debug:
    verbosity: detailed

  # Fontes de dados: rastros, métricas
  opencensus:
    endpoint: otelcol2:55678

  # Fontes de dados: rastros, métricas, logs
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # Fontes de dados: rastros, métricas
  otlp_http:
    endpoint: https://otlp.example.com:4318

  # Fontes de dados: métricas
  prometheus:
    endpoint: 0.0.0.0:8889
    namespace: default

  # Fontes de dados: métricas
  prometheusremotewrite:
    endpoint: http://prometheus.example.com:9411/api/prom/push
    # Ao usar o Prometheus oficial (executando via Docker)
    # endpoint: 'http://prometheus:9090/api/v1/write', adicione:
    # tls:
    #   insecure: true

  # Fontes de dados: rastros
  zipkin:
    endpoint: http://zipkin.example.com:9411/api/v2/spans
```

Observe que alguns exporters exigem certificados x.509 para estabelecer conexões
seguras, conforme descrito em
[configuração de certificados](#setting-up-certificates).

> Para mais informações sobre configuração de exporters, consulte o
> [README.md de exporters](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md).

## Connectors <img width="32" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Load_Balancer.svg"> {#connectors}

Connectors unem duas pipelines, atuando tanto como exporter quanto como
receiver. Um connector consome dados como um exporter no final de uma pipeline e
emite dados como um receiver no início de outra pipeline. Os dados consumidos e
emitidos podem ser do mesmo tipo ou de tipos de dados diferentes. É possível
usar connectors para resumir os dados consumidos, replicá-los ou roteá-los.

É possível configurar um ou mais connectors usando a seção `connectors` do
arquivo de configuração do Collector. Por padrão, nenhum connector é
configurado. Cada tipo de connector é projetado para funcionar com um ou mais
pares de tipos de dados e só pode ser usado para conectar pipelines
conformemente.

> Configurar um connector não o habilita. Connectors são habilitados por meio
> das pipelines na seção [service](#service).

O exemplo a seguir mostra o connector `count` e como ele é configurado na seção
`pipelines`. Observe que o connector atua como um exporter para rastros e como
um receiver para métricas, conectando ambas as pipelines:

```yaml
receivers:
  foo:

exporters:
  bar:

connectors:
  count:
    spanevents:
      my.prod.event.count:
        description: O número de eventos de trecho do meu ambiente de produção.
        conditions:
          - 'attributes["env"] == "prod"'
          - 'name == "prodevent"'

service:
  pipelines:
    traces:
      receivers: [foo]
      exporters: [count]
    metrics:
      receivers: [count]
      exporters: [bar]
```

> Para configuração detalhada de connectors, consulte o
> [README de connectors](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md).

## Extensions <img width="32" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Extensions.svg"> {#extensions}

Extensions são componentes opcionais que expandem as capacidades do Collector
para realizar tarefas não diretamente envolvidas com o processamento de dados de
telemetria. Por exemplo, é possível adicionar extensions para monitoramento de
saúde do Collector, descoberta de serviços ou encaminhamento de dados, entre
outras.

Extensions podem ser configuradas por meio da seção `extensions` do arquivo de
configuração do Collector. A maioria das extensions vem com configurações
padrão, então podem ser configuradas apenas especificando o nome da extension.
Qualquer configuração especificada sobrescreve os valores padrão, se presentes.

> Configurar uma extension não a habilita. Extensions são habilitadas na seção
> [service](#service).

Por padrão, nenhuma extension é configurada. O exemplo a seguir mostra várias
extensions configuradas no mesmo arquivo:

```yaml
extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679
```

> Para configuração detalhada de extensions, consulte o
> [README de extensions](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md).

## Seção service {#service}

A seção `service` é usada para configurar quais componentes estão habilitados no
Collector com base na configuração encontrada nas seções receivers, processors,
exporters e extensions. Se um componente estiver configurado, mas não definido
na seção `service`, ele não estará habilitado.

A seção service consiste em três subseções:

- Extensions
- Pipelines
- Telemetria

### Extensions {#service-extensions}

A subseção `extensions` consiste em uma lista das extensions desejadas a serem
habilitadas. Por exemplo:

```yaml
service:
  extensions: [health_check, pprof, zpages]
```

### Pipelines

A subseção `pipelines` é onde as pipelines são configuradas, que podem ser dos
seguintes tipos:

- `traces` coleta e processa dados de rastros.
- `metrics` coleta e processa dados de métricas.
- `logs` coleta e processa dados de logs.

Uma pipeline consiste em um conjunto de receivers, processors e exporters. Antes
de incluir um receiver, processor ou exporter em uma pipeline, certifique-se de
definir sua configuração na seção apropriada.

É possível usar o mesmo receiver, processor ou exporter em mais de uma pipeline.
Quando um processor é referenciado em múltiplas pipelines, cada pipeline obtém
uma instância separada do processor.

A seguir, um exemplo de configuração de pipeline. Note que a ordem dos
processors determina a ordem em que os dados são processados:

```yaml
service:
  pipelines:
    metrics:
      receivers: [opencensus, prometheus]
      exporters: [opencensus, prometheus]
    traces:
      receivers: [opencensus, jaeger]
      processors: [memory_limiter]
      exporters: [opencensus, zipkin]
```

Assim como nos componentes, use a sintaxe `type[/name]` para criar pipelines
adicionais para um mesmo tipo. Aqui está um exemplo estendendo a configuração
anterior:

```yaml
service:
  pipelines:
    # ...
    traces:
      # ...
    traces/2:
      receivers: [opencensus]
      exporters: [zipkin]
```

### Telemetria

A seção de configuração `telemetry` é onde se configura a observabilidade do
próprio Collector. Ela consiste em duas subseções: `logs` e `metrics`. Para
aprender como configurar esses sinais, consulte
[Ativar telemetria interna no Collector](/docs/collector/internal-telemetry#activate-internal-telemetry-in-the-collector).

## Outras informações

### Variáveis de ambiente

O uso e a expansão de variáveis de ambiente são suportados na configuração do
Collector. Por exemplo, para usar os valores armazenados nas variáveis de
ambiente `DB_KEY` e `OPERATION`, pode-se escrever o seguinte:

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY}
        action: ${env:OPERATION}
```

É possível passar valores padrão para uma variável de ambiente usando a sintaxe
bash: `${env:DB_KEY:-some-default-var}`

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY:-mydefault}
        action: ${env:OPERATION:-}
```

Use `$$` para indicar um `$` literal. Por exemplo, representar
`$DataVisualization` ficaria assim:

```yaml
exporters:
  prometheus:
    endpoint: prometheus:8889
    namespace: $$DataVisualization
```

### Suporte a proxy

Exporters que usam o pacote [`net/http`](https://pkg.go.dev/net/http) respeitam
as seguintes variáveis de ambiente de proxy:

- `HTTP_PROXY`: Endereço do proxy HTTP
- `HTTPS_PROXY`: Endereço do proxy HTTPS
- `NO_PROXY`: Endereços que não devem usar o proxy

Se definidas no momento da inicialização do Collector, os exporters,
independentemente do protocolo, enviarão o tráfego pelo proxy ou o ignorarão
conforme definido por essas variáveis de ambiente.

### Autenticação

A maioria dos receivers que expõem uma porta HTTP ou gRPC pode ser protegida
usando o mecanismo de autenticação do Collector. Da mesma forma, a maioria dos
exporters que usam clientes HTTP ou gRPC pode adicionar autenticação às
requisições de saída.

O mecanismo de autenticação no Collector usa o mecanismo de extensions,
permitindo que autenticadores personalizados sejam conectados às distribuições
do Collector. Cada extension de autenticação tem dois usos possíveis:

- Como autenticador de cliente para exporters, adicionando dados de autenticação
  às requisições de saída
- Como autenticador de servidor para receivers, autenticando conexões de
  entrada.

Para uma lista de autenticadores conhecidos, consulte o
[Registro](/ecosystem/registry/?s=authenticator&component=extension). Para
desenvolver um autenticador personalizado, consulte
[Construindo uma extension de autenticador](/docs/collector/extend/custom-component/extension/authenticator).

Para adicionar um autenticador de servidor a um receiver no Collector, siga
estes passos:

1. Adicione a extension de autenticador e sua configuração em `.extensions`.
2. Adicione uma referência ao autenticador em `.services.extensions`, para que
   ele seja carregado pelo Collector.
3. Adicione uma referência ao autenticador em
   `.receivers.<your-receiver>.<http-or-grpc-config>.auth`.

O exemplo a seguir usa o autenticador OIDC no lado do receiver, tornando-o
adequado para um Collector remoto que recebe dados de um OpenTelemetry Collector
atuando como agente:

```yaml
extensions:
  oidc:
    issuer_url: http://localhost:8080/auth/realms/opentelemetry
    audience: collector

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc

processors:

exporters:
  # NOTA: antes da v0.86.0, use `logging` em vez de `debug`.
  debug:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters:
        - debug
```

No lado do agente, este é um exemplo que faz o exporter OTLP obter tokens OIDC,
adicionando-os a cada chamada RPC a um Collector remoto:

```yaml
extensions:
  oauth2client:
    client_id: agent
    client_secret: some-secret
    token_url: http://localhost:8080/auth/realms/opentelemetry/protocol/openid-connect/token

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:

exporters:
  otlp_grpc/auth:
    endpoint: remote-collector:4317
    auth:
      authenticator: oauth2client

service:
  extensions:
    - oauth2client
  pipelines:
    traces:
      receivers:
        - otlp
      processors: []
      exporters:
        - otlp_grpc/auth
```

### Configurando certificados {#setting-up-certificates}

Em um ambiente de produção, use certificados TLS para comunicação segura ou mTLS
para autenticação mútua. Siga estes passos para gerar certificados autoassinados
como neste exemplo. Também é possível usar os procedimentos atuais de
provisionamento de certificados para obter um certificado para uso em produção.

Instale o [`cfssl`](https://github.com/cloudflare/cfssl) e crie o seguinte
arquivo `csr.json`:

```json
{
  "hosts": ["localhost", "127.0.0.1"],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "O": "OpenTelemetry Example"
    }
  ]
}
```

Em seguida, execute os seguintes comandos:

```sh
cfssl genkey -initca csr.json | cfssljson -bare ca
cfssl gencert -ca ca.pem -ca-key ca-key.pem csr.json | cfssljson -bare cert
```

Isso cria dois certificados:

- Uma Autoridade Certificadora (CA) "OpenTelemetry Example" em `ca.pem`, com a
  chave associada em `ca-key.pem`
- Um certificado de cliente em `cert.pem`, assinado pela CA OpenTelemetry
  Example, com a chave associada em `cert-key.pem`.

#### Usando certificados no Collector

Depois de obter os certificados, configure o Collector para usá-los.

##### Configuração TLS para receivers (lado do servidor)

Configure TLS em um receiver para criptografar conexões de entrada. Use
`cert_file` e `key_file` para especificar o certificado do servidor:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: /path/to/cert.pem
          key_file: /path/to/cert-key.pem
      http:
        endpoint: 0.0.0.0:4318
        tls:
          cert_file: /path/to/cert.pem
          key_file: /path/to/cert-key.pem
```

##### Configuração TLS para exporters (lado do cliente)

Configure TLS em um exporter para criptografar conexões de saída. Use `ca_file`
para verificar o certificado do servidor:

```yaml
exporters:
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      ca_file: /path/to/ca.pem
```

Caso também seja necessário apresentar um certificado de cliente ao servidor:

```yaml
exporters:
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/cert.pem
      key_file: /path/to/cert-key.pem
```

##### Configuração mTLS (TLS mútuo)

Para mTLS, tanto o receiver quanto o exporter verificam os certificados um do
outro. No receiver, adicione `client_ca_file` para verificar os certificados do
cliente:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: /path/to/server-cert.pem
          key_file: /path/to/server-key.pem
          client_ca_file: /path/to/ca.pem
```

No exporter, forneça tanto a CA para verificar o servidor quanto o certificado
do cliente:

```yaml
exporters:
  otlp_grpc:
    endpoint: remote-collector:4317
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/client-cert.pem
      key_file: /path/to/client-key.pem
```

##### Configurações comuns de TLS

As seguintes configurações estão disponíveis para configuração de TLS:

| Configuração           | Descrição                                                                   |
| ---------------------- | --------------------------------------------------------------------------- |
| `ca_file`              | Caminho para o certificado da CA para verificar o certificado do par remoto |
| `cert_file`            | Caminho para o certificado TLS                                              |
| `key_file`             | Caminho para a chave privada TLS                                            |
| `client_ca_file`       | Caminho para o certificado da CA para verificar certificados de cliente     |
| `insecure`             | Desativa a verificação TLS (não recomendado para produção)                  |
| `insecure_skip_verify` | Ignora a verificação do certificado do servidor (não recomendado)           |
| `min_version`          | Versão mínima do TLS (por exemplo, `1.2` ou `1.3`)                          |
| `max_version`          | Versão máxima do TLS                                                        |
| `reload_interval`      | Duração após a qual o certificado é recarregado                             |

<!-- prettier-ignore-start -->
<!-- markdownlint-disable MD034 -->
> Para mais detalhes sobre as opções de configuração de TLS, consulte a
> [documentação do configtls](https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/config/configtls/README.md).
<!-- markdownlint-enable MD034 -->
<!-- prettier-ignore-end -->

[dcc]: /docs/concepts/components/#collector

## Sobrescrever configurações

É possível sobrescrever configurações do Collector usando a opção `--set`. As
configurações definidas com este método são combinadas na configuração final
após todas as fontes `--config` serem resolvidas e combinadas.

Os exemplos a seguir mostram como sobrescrever configurações dentro de seções
aninhadas:

### Propriedade simples

A opção `--set` sempre recebe um par chave/valor, e é usada assim:
`--set key=value`. O equivalente em YAML disso é:

```yaml
key: value
```

### Chaves aninhadas complexas

Use o duplo dois-pontos (`::`) no nome do par como separador de chave para
referenciar valores de mapas aninhados. Por exemplo, `--set outer::inner=value`
é traduzido para:

```yaml
outer:
  inner: value
```

### Múltiplos valores

Para definir múltiplos valores, especifique múltiplas _flags_ --set, então
`--set a=b --set c=d` se torna:

```yaml
a: b
c: d
```

### Valores de array

Arrays podem ser expressos envolvendo os valores em `[]`. Por exemplo,
`--set "key=[a, b, c]"` é traduzido para:

```yaml
key:
  - a
  - b
  - c
```

Para representar estruturas de dados mais complexas, o uso de YAML é altamente
recomendado.

> [!CAUTION]
>
> A opção `--set` tem as seguintes limitações:
>
> 1. Não suporta definir uma chave que contenha um ponto `.`.
> 2. Não suporta definir uma chave que contenha um sinal de igual `=`.
> 3. O separador de chaves de configuração dentro da parte do valor da
>    propriedade é "::". Por exemplo, `--set "name={a::b: c}"` é equivalente a
>    `--set name::a::b=c`.

## Incorporando outros provedores de configuração

Um provedor de configuração pode fazer referências a outros provedores de
configuração, como no exemplo a seguir:

```yaml
receivers:
  otlp:
    protocols:
      grpc:

exporters: ${file:otlp-exporter.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

## Como verificar os componentes disponíveis em uma distribuição

Use o subcomando build-info. Abaixo está um exemplo:

```bash
otelcol components
```

Exemplo de saída:

```yaml
buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.143.0
receivers:
  - otlp
processors:
  - memory_limiter
exporters:
  - otlp_grpc
  - otlp_http
  - debug
extensions:
  - zpages
```

## Como examinar a configuração final

> [!CAUTION]
>
> Este comando é uma funcionalidade experimental. Seu comportamento pode mudar
> sem aviso prévio.

Use `print-config` no modo padrão (`--mode=redacted`) e
`--feature-gates=otelcol.printInitialConfig`:

```bash
otelcol print-config --config=file:examples/local/otel-config.yaml
```

Note que, por padrão, a configuração só será exibida quando for válida, e que
informações sensíveis serão ocultadas. Para exibir uma configuração
potencialmente inválida, use `--validate=false`.

### Como visualizar campos sensíveis

Use `print-config` com `--mode=unredacted` e
`--feature-gates=otelcol.printInitialConfig`:

```bash
otelcol print-config --mode=unredacted --config=file:examples/local/otel-config.yaml
```

### Como exibir a configuração final em formato JSON

> [!CAUTION]
>
> Este comando é uma funcionalidade experimental. Seu comportamento pode mudar
> sem aviso prévio.

Use `print-config` com `--format=json` e
`--feature-gates=otelcol.printInitialConfig`. Note que o formato JSON é
considerado instável.

```bash
otelcol print-config --format=json --config=file:examples/local/otel-config.yaml
```
