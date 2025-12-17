---
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
---

Envie dados de telemetria para o [OpenTelemetry Collector](/docs/collector/)
para garantir que estes dados sejam exportados corretamente. A utilização de um
Collector em ambientes de produção é a melhor prática. Para visualizar os dados
de telemetria que foram gerados, exporte-os para um _backend_ como
[Jaeger](https://jaegertracing.io/), [Zipkin](https://zipkin.io/),
[Prometheus](https://prometheus.io/), ou um _backend_
[específico de um fornecedor](/ecosystem/vendors/).

{{ if $name }}

## Exportadores disponíveis {#available-exporters}

O registro oferece uma [lista de exportadores para {{ $name }}][reg].

{{ end }}

{{ if not $name }}

O registro oferece uma [lista de exportadores específicos de linguagem][reg].

{{ end }}

Entre os exportadores, os exportadores do [OpenTelemetry Protocol (OTLP)][OTLP]
são projetados tendo em mente o modelo de dados do OpenTelemetry, emitindo dados
OTel sem qualquer perda de informação. Além disso, muitas ferramentas que operam
com dados de telemetria suportam o formato OTLP (como [Prometheus], [Jaeger] e a
maioria dos [fornecedores]), proporcionando um alto grau de flexibilidade quando
necessário. Para saber mais sobre o OTLP, consulte a [Especificação do
OTLP][OTLP].

[Jaeger]: /blog/2022/jaeger-native-otlp/
[OTLP]: /docs/specs/otlp/
[Prometheus]:
  https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver
[reg]: </ecosystem/registry/?component=exporter&language={{ $lang }}>
[fornecedores]: /ecosystem/vendors/

{{ if $name }}

Esta página reúne informações sobre os principais exportadores do OpenTelemetry
{{ $name }} e como configurá-los.

{{ end }}

{{ if $zeroConfigPageExists }}

{{% alert title=Nota %}}

Caso você esteja utilizando
[instrumentação sem código](</docs/zero-code/{{ $langIdAsPath }}>), você poderá
aprender a configurar os exporters através do
[Guia de Configurações](</docs/zero-code/{{ $langIdAsPath }}/configuration/>).

{{% /alert %}}

{{ end }}

{{ if $supportsOTLP }}

## OTLP

### Configuração do Collector {#collector-setup}

{{% alert title=Nota %}}

Caso já possua um coletor ou _backend_ OTLP configurado, poderá pular para
[configurar as dependências do exportador OTLP](#otlp-dependencies) para a sua
aplicação.

{{% /alert %}}

Para testar e validar os seus exportadores OTLP, é possível executar o Collector
em um contêiner Docker que escreve os dados diretamente no console.

Em uma pasta vazia, crie um arquivo chamado `collector-config.yaml` e adicione o
seguinte conteúdo:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Em seguida, execute o Collector em um contêiner Docker através do seguinte
comando:

```shell
docker run -p 4317:4317 -p 4318:4318 --rm -v $(pwd)/collector-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector
```

Este Collector agora é capaz receber dados de telemetria via OTLP. Mais tarde,
você também poderá [configurar o Collector](/docs/collector/configuration) para
enviar os seus dados de telemetria para o seu _backend_ de observabilidade.
{{ end }}
