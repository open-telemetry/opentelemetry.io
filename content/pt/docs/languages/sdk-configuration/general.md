---
title: Configurações gerais de SDK
linkTitle: Geral
aliases: [general-sdk-configuration]
default_lang_commit: 1e4970e9193c8af1d1f9b86901b13492071aecc7
cSpell:ignore: ottrace
---

{{% alert title="Nota" color="info" %}}

O suporte a variáveis de ambiente é opcional. Para informações detalhadas sobre
quais variáveis de ambiente cada implementação de linguagem suporta, consulte a
[Matriz de Conformidade de Implementação](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#environment-variables).

{{% /alert %}}

## `OTEL_SERVICE_NAME`

Define o valor do atributo de recurso
[`service.name`](/docs/specs/semconv/resource/#service).

**Valor padrão:** `"unknown_service"`

Se `service.name` também for fornecido em `OTEL_RESOURCE_ATTRIBUTES`, então
`OTEL_SERVICE_NAME` terá precedência.

**Exemplo:**

`export OTEL_SERVICE_NAME="your-service-name"`

## `OTEL_RESOURCE_ATTRIBUTES`

Pares de chave-valor que serão utilizados como atributos de recurso. Consulte a
página de
[Recurso do SDK](/docs/specs/otel/resource/sdk#specifying-resource-information-via-an-environment-variable)
para mais detalhes.

**Valor padrão:** Vazio.

Consulte a página
[convenção semântica de Recursos](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value)
para obter informações sobre as convenções semânticas a serem seguidas para
tipos de recursos comuns.

**Exemplo:**

`export OTEL_RESOURCE_ATTRIBUTES="key1=value1,key2=value2"`

## `OTEL_TRACES_SAMPLER`

Especifica o Sampler utilizado pelo SDK para realizar amostragem de rastros.

**Valor padrão:** `"parentbased_always_on"`

**Exemplo:**

`export OTEL_TRACES_SAMPLER="traceidratio"`

Os valores aceitos para `OTEL_TRACES_SAMPLER` são:

- `"always_on"`: `AlwaysOnSampler`
- `"always_off"`: `AlwaysOffSampler`
- `"traceidratio"`: `TraceIdRatioBased`
- `"parentbased_always_on"`: `ParentBased(root=AlwaysOnSampler)`
- `"parentbased_always_off"`: `ParentBased(root=AlwaysOffSampler)`
- `"parentbased_traceidratio"`: `ParentBased(root=TraceIdRatioBased)`
- `"parentbased_jaeger_remote"`: `ParentBased(root=JaegerRemoteSampler)`
- `"jaeger_remote"`: `JaegerRemoteSampler`
- `"xray"`:
  [AWS X-Ray Centralized Sampling](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)
  (_terceiro_)

## `OTEL_TRACES_SAMPLER_ARG`

Especifica os argumentos, se aplicável, para o Sampler definido em
`OTEL_TRACES_SAMPLER`. O valor especificado será utilizado apenas se
`OTEL_TRACES_SAMPLER` for definido. Cada tipo de Sampler define sua própria
entrada esperada, se houver. Entradas inválidas ou não reconhecidas são
registradas como erro.

**Valor padrão:** Vazio.

**Exemplo:**

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.5"
```

Dependendo do valor definido em `OTEL_TRACES_SAMPLER`, a definição de
`OTEL_TRACES_SAMPLER_ARG` pode ocorrer da seguinte maneira:

- Para os Samplers `traceidratio` e `parentbased_traceidratio`: Probabilidade de
  amostragem, um número no intervalo [0..1], por exemplo, "0.25". Caso não seja
  definido, o valor padrão é 1.0.
- Para `jaeger_remote` e `parentbased_jaeger_remote`: O valor é uma lista
  separada por vírgulas:
  - Exemplo:
    `"endpoint=http://localhost:14250,pollingIntervalMs=5000,initialSamplingRate=0.25"`
  - `endpoint`: A rota em formato `scheme://host:port` do servidor gRPC que
    fornece a estratégia de amostragem para o serviço
    ([sampling.proto](https://github.com/jaegertracing/jaeger-idl/blob/main/proto/api_v2/sampling.proto)).
  - `pollingIntervalMs`: em milissegundos, indicando com que frequência o
    Sampler consultará o _backend_ para atualizações na estratégia de
    amostragem.
  - `initialSamplingRate`: no intervalo [0..1], utilizado como valor da
    probabilidade de amostragem caso não seja possível recuperar a estratégia de
    amostragem no _backend_. Este valor perde efeito assim que uma estratégia de
    amostragem é recuperada com sucesso, então a estratégia remota será
    utilizada até que uma nova atualização seja obtida com sucesso.

## `OTEL_PROPAGATORS`

Especifica os Propagators a serem utilizados em uma lista separada por vírgulas.

**Valor padrão:** `"tracecontext,baggage"

**Exemplo:**

`export OTEL_PROPAGATORS="b3"`

Os valores aceitos para `OTEL_PROPAGATORS` são:

- `"tracecontext"`: [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- `"baggage"`: [W3C Baggage](https://www.w3.org/TR/baggage/)
- `"b3"`: [B3 Single](/docs/specs/otel/context/api-propagators#configuration)
- `"b3multi"`:
  [B3 Multi](/docs/specs/otel/context/api-propagators#configuration)
- `"jaeger"`:
  [Jaeger](https://www.jaegertracing.io/docs/1.21/client-libraries/#propagation-format)
- `"xray"`:
  [AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-tracingheader)
  (_terceiro_)
- `"ottrace"`:
  [OT Trace](https://github.com/opentracing?q=basic&type=&language=)
  (_terceiro_)
- `"none"`: Nenhum propagador configurado automaticamente.

## `OTEL_TRACES_EXPORTER`

Especifica qual Exporter é utilizado para os rastros. Dependendo da
implementação, pode ser uma lista separada por vírgulas.

**Valor padrão:** `"otlp"`

**Exemplo:**

`export OTEL_TRACES_EXPORTER="jaeger"`

Os valores aceitos são:

- `"otlp"`: [OTLP][]
- `"jaeger"`: exportar no modelo de dados Jaeger
- `"zipkin"`: [Zipkin](https://zipkin.io/zipkin-api/)
- `"console"`: [Saída Padrão](/docs/specs/otel/trace/sdk_exporters/stdout/)
- `"none"`: Nenhum exportador de rastros configurado automaticamente.

## `OTEL_METRICS_EXPORTER`

Especifica qual Exporter é utilizado para as métricas. Dependendo da
implementação, pode ser uma lista separada por vírgulas.

**Valor padrão:** `"otlp"`

**Exemplo:**

`export OTEL_METRICS_EXPORTER="prometheus"`

Os valores aceitos para `OTEL_METRICS_EXPORTER` são:

- `"otlp"`: [OTLP][]
- `"prometheus"`:
  [Prometheus](https://github.com/prometheus/docs/blob/main/content/docs/instrumenting/exposition_formats.md)
- `"console"`: [Saída Padrão](/docs/specs/otel/metrics/sdk_exporters/stdout/)
- `"none"`: Nenhum exportador de métricas configurado automaticamente.

## `OTEL_LOGS_EXPORTER`

Especifica qual Exporter é utilizado para os logs. Dependendo da implementação,
pode ser uma lista separada por vírgulas.

**Valor padrão:** `"otlp"`

**Exemplo:**

`export OTEL_LOGS_EXPORTER="otlp"`

Os valores aceitos para `OTEL_LOGS_EXPORTER` são:

- `"otlp"`: [OTLP][]
- `"console"`: [Saída Padrão](/docs/specs/otel/logs/sdk_exporters/stdout/)
- `"none"`: Nenhum exportador de logs configurado automaticamente.

[otlp]: /docs/specs/otlp/
