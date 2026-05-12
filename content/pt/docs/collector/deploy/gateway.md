---
title: Padrão de implantação de Gateway
linkTitle: Padrão de Gateway
description:
  Saiba por que e como enviar sinais primeiro para uma única rota OTLP e, em
  seguida, para os backends
aliases: [/docs/collector/deployment/gateway]
weight: 300
default_lang_commit: ccb79745a6b30511661b7071ecf1e866fcd2a122
cSpell:ignore:
  hostnames loadbalancer loadbalancing resourcedetectionprocessor subchave
---

O padrão de implantação de Gateway do Collector consiste em aplicações ou outros
Collectors enviando sinais de telemetria para uma única
[rota](/docs/specs/otlp/) OTLP. Esta rota é fornecida por uma ou mais instâncias
de Collector executando como um serviço independente, por exemplo, em uma
implantação de Kubernetes. Geralmente, uma rota é fornecida por _cluster_, por
data center ou por região.

Em geral, você pode usar um balanceador de carga pronto para uso imediato para
distribuir a carga entre os Collectors:

![Conceito de implantação de gateway](../../img/otel-gateway-sdk.svg)

Para casos de uso onde os dados de telemetria devem ser processados em um
Collector específico, use uma configuração de duas camadas. O Collector de
primeira camada possui um pipeline configurado com o [exportador de
balanceamento de carga ciente de ID de rastro ou nome de serviço][lb-exporter].
Na segunda camada, cada Collector recebe e processa a telemetria que pode ser
direcionada especificamente para ele. Por exemplo, você pode usar o Exporter de
balanceamento de carga em sua primeira camada para enviar dados a um Collector
de segunda camada configurado com o [Processor de amostragem de cauda (tail
sampling)][tailsample-processor], de modo que todos os trechos de um determinado
rastro alcancem a mesma instância de Collector onde a política de amostragem é
aplicada.

O diagrama a seguir mostra essa configuração usando o exportador de
balanceamento de carga:

![Implantação de gateway com exportador de balanceamento de carga](../../img/otel-gateway-lb-sdk.svg)

1. Na aplicação, o SDK é configurado para enviar dados OTLP para um local
   central.
2. Um Collector é configurado para usar o exportador de balanceamento de carga
   para distribuir os sinais para um grupo de Collectors.
3. Os Collectors enviam dados de telemetria para um ou mais _backends_.

## Exemplos {#examples}

Os exemplos a seguir mostram como configurar um Collector de gateway com
componentes comuns.

### NGINX como um balanceador de carga pronto para uso {#nginx-as-an-out-of-the-box-load-balancer}

Supondo que você tenha três Collectors (`collector1`, `collector2` e
`collector3`) configurados e queira balancear o tráfego entre eles usando o
NGINX, você pode usar a seguinte configuração:

```nginx
server {
    listen 4317 http2;
    server_name _;

    location / {
            grpc_pass      grpc://collector4317;
            grpc_next_upstream     error timeout invalid_header http_500;
            grpc_connect_timeout   2;
            grpc_set_header        Host            $host;
            grpc_set_header        X-Real-IP       $remote_addr;
            grpc_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 4318;
    server_name _;

    location / {
            proxy_pass      http://collector4318;
            proxy_redirect  off;
            proxy_next_upstream     error timeout invalid_header http_500;
            proxy_connect_timeout   2;
            proxy_set_header        Host            $host;
            proxy_set_header        X-Real-IP       $remote_addr;
            proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

upstream collector4317 {
    server collector1:4317;
    server collector2:4317;
    server collector3:4317;
}

upstream collector4318 {
    server collector1:4318;
    server collector2:4318;
    server collector3:4318;
}
```

### Exporter de balanceamento de carga {#load-balancing-exporter}

Para um exemplo concreto do padrão de implantação de Collector centralizado,
veja primeiro o Exporter de balanceamento de carga. Ele possui dois campos
principais de configuração:

- O `resolver` determina onde encontrar os Collectors _downstream_ ou
  _backends_. Se você usar a subchave `static` aqui, deverá enumerar manualmente
  as URLs do Collector. O outro resolvedor suportado é o DNS, que verifica
  atualizações periodicamente e resolve endereços IP. Para este tipo de
  resolvedor, a subchave `hostname` especifica o nome do _host_ a ser consultado
  para obter a lista de endereços IP.
- O campo `routing_key` roteia os spans para Collectors _downstream_
  específicos. Se você definir este campo como `traceID`, o exportador de
  balanceamento de carga exportará spans com base em seus `traceID`. Caso
  contrário, se você usar `service` para `routing_key`, ele exportará spans com
  base em seu nome de serviço. Esse roteamento é útil ao usar conectores como o
  [conector de métricas de span (span metrics
  connector)][spanmetrics-connector], pois todos os spans de um serviço são
  enviados para o mesmo Collector _downstream_ para coleta de métricas,
  garantindo agregações precisas.

O Collector de primeira camada que serve o endpoint OTLP é configurado da
seguinte forma:

{{< tabpane text=true >}} {{% tab Static %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      static:
        hostnames:
          - collector-1.example.com:4317
          - collector-2.example.com:5317
          - collector-3.example.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{% tab DNS %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: collectors.example.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{% tab "DNS with service" %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    routing_key: service
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: collectors.example.com
        port: 5317

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{< /tabpane >}}

O exportador de balanceamento de carga emite
[métricas](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter#metrics)
incluindo `otelcol_loadbalancer_num_backends` e
`otelcol_loadbalancer_backend_latency` que você pode usar para monitorar a saúde
e o desempenho do Collector que serve o endpoint OTLP.

## Vantagens e desvantagens {#trade-offs}

Prós:

- Separação de responsabilidades, como gerenciamento centralizado de credenciais
- Gerenciamento centralizado de políticas (por exemplo, filtragem de certos logs
  ou amostragem)

Contras:

- Mais um item para manutenção e que pode falhar (complexidade)
- Latência adicional no caso de coletores em cascata
- Maior uso geral de recursos (custos)

[lb-exporter]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter
[tailsample-processor]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor
[spanmetrics-connector]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector

## Múltiplos Collectors e o princípio de escritor único {#multiple-collectors-and-the-single-writer-principle}

Todos os fluxos de dados de métricas dentro do OTLP devem ter um
[escritor único](/docs/specs/otel/metrics/data-model/#single-writer). Ao
implantar múltiplos Collectors em uma configuração de _gateway_, certifique-se
de que todos os fluxos de dados de métricas tenham um único escritor e uma
identidade globalmente exclusiva.

### Potenciais problemas {#potential-problems}

O acesso simultâneo de várias aplicações que modificam ou relatam os mesmos
dados pode levar à perda de dados ou à degradação da qualidade dos dados. Por
exemplo, você pode ver dados inconsistentes de múltiplas fontes no mesmo
recurso, onde as diferentes fontes podem sobrescrever umas às outras porque o
recurso não está identificado de forma exclusiva.

Existem padrões nos dados que podem fornecer informações sobre se isso está
acontecendo ou não. Por exemplo, em uma inspeção visual, uma série com lacunas
ou saltos inexplicáveis pode ser uma pista de que múltiplos collectors estão
enviando as mesmas amostras. Você também pode ver erros em seu _backend_. Por
exemplo, com um _backend_ Prometheus:

`Error on ingesting out-of-order samples`

Este erro pode indicar que existem alvos idênticos em dois _jobs_, e a ordem dos
_timestamps_ está incorreta. Por exemplo:

- Métrica `M1` recebida em `T1` com um timestamp 13:56:04 com valor `100`
- Métrica `M1` recebida em `T2` com um timestamp 13:56:24 com valor `120`
- Métrica `M1` recebida em `T3` com um timestamp 13:56:04 com valor `110`
- Métrica `M1` recebida às 13:56:24 com valor `120`
- Métrica `M1` recebida às 13:56:04 com valor `110`

### Melhores práticas {#best-practices}

- Use o
  [processador de atributos do Kubernetes](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)
  para adicionar etiquetas (_labels_) a diferentes recursos do Kubernetes.
- Use o
  [processador de detecção de recursos (resource detector processor)](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/resourcedetectionprocessor/README.md)
  para detectar informações de recursos do _host_ e coletar metadados de
  recursos.

## Próximos passos {#next-steps}

Saiba como [combinar](/docs/collector/deploy/other/agent-to-gateway/) os padrões
de agente e _gateway_ para criar uma arquitetura de Collector robusta e
escalável.
