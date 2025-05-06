{{/* cSpell:ignore cond */ -}} Envie dados de telemetria para o
[OpenTelemetry Collector](/docs/collector/) para garantir que estes dados sejam
exportados corretamente. A utilização de um Collector em ambientes de produção é
a melhor prática. Para visualizar os dados de telemetria que foram gerados,
exporte-os para um _backend_ como [Jaeger](https://jaegertracing.io/),
[Zipkin](https://zipkin.io/), [Prometheus](https://prometheus.io/), ou um
_backend_ [específico de um fornecedor](/ecosystem/vendors/).

{{ $lang := .Get 0 | default "" -}}

{{ $name := "" -}}

{{ if $lang -}}

{{ $name = (index $.Site.Data.instrumentation $lang).name -}}

## Exportadores disponíveis {#available-exporters}

O registro oferece uma [lista de exportadores para {{ $name }}][reg].

{{ else -}}

O registro oferece uma [lista de exportadores específicos de linguagem][reg].

{{ end -}}

Entre os exportadores, os exportadores do [OpenTelemetry Protocol (OTLP)][OTLP]
são projetados tendo em mente o modelo de dados do OpenTelemetry, emitindo dados
OTel sem qualquer perda de informação. Além disso, muitas ferramentas que operam
com dados de telemetria suportam o formato OTLP (como [Prometheus][Prometheus],
[Jaeger][Jaeger] e a maioria dos [fornecedores][vendors]), proporcionando um
alto grau de flexibilidade quando necessário. Para saber mais sobre o OTLP,
consulte a [Especificação do OTLP][OTLP].

[Jaeger]: /blog/2022/jaeger-native-otlp/
[OTLP]: /docs/specs/otlp/
[Prometheus]:
  https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver
[vendors]: /ecosystem/vendors/

[reg]: /ecosystem/registry/?component=exporter&language={{ $lang }}

{{ if $name -}}

Esta página reúne informações sobre os principais exportadores do OpenTelemetry
{{ $name }} e como configurá-los.

{{ end -}}

{{ $l := cond (eq $lang "dotnet") "net" $lang }}
{{ with $.Page.GetPage (print "/docs/zero-code/" $l "/configuration" ) }}

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Nota</h4>

Caso você esteja utilizando [instrumentação sem
código](/docs/zero-code/{{ $l }}), você poderá aprender a configurar os
exporters através do [Guia de
Configurações](/docs/zero-code/{{ $l }}/configuration/).

</div>

{{ end -}}

{{/*
 a lista a seguir precisa crescer até que todas as línguas sejam atualizadas para uma estrutura consistente.
 */ -}}

{{ if in (slice "python" "js" "java" "cpp" "dotnet") $lang -}}

## OTLP

### Configuração do Collector {#collector-setup}

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Nota</h4>

Caso já possua um coletor ou _backend_ OTLP configurado, poderá pular para
[configurar as dependências do exportador OTLP](#otlp-dependencies) para a sua
aplicação.

</div>

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
{{ end -}}
