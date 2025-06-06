---
title: Configure o SDK
linkTitle: Configure o SDK
weight: 13
default_lang_commit: 8fc5481a1acd7f9d7712256b065c1609ef328539
aliases: [config]
# prettier-ignore
cSpell:ignore: autoconfigured blrp Customizer Dotel ignore LOWMEMORY ottrace PKCS
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

O [SDK](../sdk/) é a implementação de referência integrada da [API](../api/),
processando e exportando telemetrias produzidas pelas chamadas de
instrumentação. Configurar o SDK para processar e exportar apropriadamente é um
passo essencial para integrar o OpenTelemetry na sua aplicação.

Todos os componentes do SDK possuem
[APIs de configurações via código (configuração programática)](#configuração-programática).
É o caminho mais flexível e expressivo para configurar o SDK. No entanto,
alterar as configurações requer ajustes no código e recompilar a aplicação, e
não possui interoperabilidade na linguagem desde que a API seja escrita em Java.

O módulo de [auto configuração sem código](#auto-configuração-sem-código)
configura os componentes do SDK através de propriedades do sistema ou variáveis
de ambiente, com vários pontos de extensão para instâncias onde as propriedades
são insuficientes.

{{% alert %}} Nós recomendamos usar o módulo de
[auto configuração sem código](#auto-configuração-sem-código) pois ele reduz o
código repetitivo, permite reconfigurar sem reescrever códigos ou recompilar a
aplicação, e evita a interoperabilidade na linguagem. {{% /alert %}}

{{% alert %}} O [Java agent](/docs/zero-code/java/agent/) e
[Spring starter](/docs/zero-code/java/spring-boot-starter/) configuram
automaticamente o SDK usando o módulo de
[auto configuração sem código](#auto-configuração-sem-código), e instala
instrumentação com ele. Todo o conteúdo de autoconfiguração é aplicação ao Java
agent e aos usuários de Spring starter. {{% /alert %}}

## configuração programática

A interface de configuração via código (configuração programática) é um conjunto
de APIs para construir componentes do [SDK](../sdk/). Todos os componentes do
SDK possuem APIs de configurações via código, e todos os outros mecanismos de
configurações são implementados no inicio da API. Por exemplo, a interface de
configuração
[auto configuração de variáveis de ambiente e propriedades do sistema](#variáveis-de-ambiente-e-propriedades-do-sistema)
interpreta as variáveis de ambiente e propriedades do sistema conhecidas em uma
série de chamadas para a API.

Enquanto outros mecânicos de configurações oferecem mais conveniência, nenhum
oferece a flexibilidade de escrever código que expresse com precisão as
configurações necessárias. Quando uma capacidade especifica não é suportada por
mecanismos de configuração de alto nível, pode ser necessário recorrer à
configuração via código.

As seções de [componentes do SDK](./sdk.md/#componentes-do-SDK) demonstram
exemplos simples de configuração via código para as principais áreas do SDK
voltadas ao usuário. Consulte o código para uma referência completa da API.

## auto configuração sem código

O módulo de auto configuração (artifact
`io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`)
é uma interface de configuração construída sobre a,
[interface de configuração via código](#configuração-programática), que
configura os [componentes do SDK](../sdk/#componentes-do-SDK) sem código. Eles
possuem dois fluxos de auto configuração distintos:

- [Variáveis de ambiente e propriedades do sistema](#variáveis-de-ambiente-e-propriedades-do-sistema)
  interpreta variáveis de ambiente e propriedades do sistema para criar
  componentes do SDK, incluindo diversos pontos de customizações para
  sobrescrever configurações via código (configuração programática).
- [Configurações declarativas](#configurações-declarativas) (**atualmente está
  em desenvolvimento**) interpreta um modelo de configuração para criar os
  componentes do SDK, que normalmente é codificado em um arquivo de configuração
  YAML.

Automaticamente configura os componentes do SDK usando auto configurações
descritas abaixo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;

public class AutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.initialize().getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

{{% alert %}} O [Java agent](/docs/zero-code/java/agent/) e o
[Spring starter](/docs/zero-code/java/spring-boot-starter/) automaticamente
configuram o SDK usando o módulo de auto configuração sem código, e instala a
instrumentação com eles. Todo o conteúdo de auto configuração é aplicado ao Java
agent e aos usuários de Spring starter. {{% /alert %}}

{{% alert color="info" %}} O módulo de auto configuração registra hooks de
desligamento do Java para encerrar o SDK quando apropriado. Como o OpenTelemetry
Java
[usa `java.util.logging` para registros internos](../sdk/#registro-interno),
alguns registros podem ser suprimidos durante os hooks de desligamento. Esse é
um bug do próprio SDK, e não algo sob controle do OpenTelemetry Java. Se você
precisar de registros durante os hooks de desligamento, considere usar
`System.out` em vez de um framework de registros que pode ser encerrado durante
o hook e, assim suprimir suas mensagens de registros. Para mais detalhes, veja
este [bug do JDK](https://bugs.openjdk.java.net/browse/JDK-8161253).
{{% /alert %}}

### variáveis de ambiente e propriedades do sistema

O módulo de auto configuração suporta propriedades listadas em
[especificação de configuração por variável de ambiente](/docs/specs/otel/configuration/sdk-environment-variables/),
com algumas adições experimentais e específicas para Java.

As propriedades a seguir são listadas como propriedades do sistema, mas também
podem ser definidas usando variáveis de ambiente. Aplique os passos a seguir
para converter propriedades do sistema em variáveis de ambiente:

- Converta os nomes para maiúsculo.
- Substitua todos os `.` e `-` com `_`.

Por exemplo, a propriedade do sistema `otel.sdk.enabled` é equivalente à
variável de ambiente `OTEL_SDK_ENABLED`.

Se a propriedade é definida como uma propriedade do sistema e variável de
ambiente, a propriedade do sistema irá ser prioritaria.

#### Propriedades: geral

Propriedades para desativar o [SDK](../sdk/#opentelemetrysdk):

| Propriedades do sistema | Descrição                                           | Padrão  |
| ----------------------- | --------------------------------------------------- | ------- |
| `otel.sdk.disabled`     | Se `true`, desativa o SDK do OpenTelemetry. **[1]** | `false` |

**[1]**: Se desativado, `AutoConfiguredOpenTelemetrySdk#getOpenTelemetrySdk()`
retorna uma configuração minima da instancia (por exemplo,
`OpenTelemetrySdk.builder().build()`).

Propriedades para limites de atributos (Observe
[span limits](../sdk/#spanlimits), [log limits](../sdk/#loglimits)):

| Propriedades do sistema             | Descrição                                                                                                                                                            | Padrão   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `otel.attribute.value.length.limit` | O comprimento máximo dos valores de atributos.Aplica-se a spans e logs. Sobrescrito por `otel.span.attribute.value.length.limit`, `otel.span.attribute.count.limit`. | No limit |
| `otel.attribute.count.limit`        | O número máximo de atributos. Aplica-se a spans, span events, span links, e logs.                                                                                    | `128`    |

Propriedades para [propagação de contexto](../sdk/#textmappropagator):

| Propriedades do sistema | Descrição                                                                                                                                                               | Padrão                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `otel.propagators`      | Lista de propagators separados por vírgulas. Valores conhecidos incluem `tracecontext`, `baggage`, `b3`, `b3multi`, `jaeger`, `ottrace`, `xray`, `xray-lambda`. **[1]** | `tracecontext,baggage` (W3C) |

**[1]**: Known propagators and artifacts (Observer
[text map propagator](../sdk/#textmappropagator) para artifact coordinates):

- `tracecontext` configura `W3CTraceContextPropagator`.
- `baggage` configura `W3CBaggagePropagator`.
- `b3`, `b3multi` configura `B3Propagator`.
- `jaeger` configura `JaegerPropagator`.
- `ottrace` configura `OtTracePropagator`.
- `xray` configura `AwsXrayPropagator`.
- `xray-lambda` configura `AwsXrayLambdaPropagator`.

#### Propriedades: recursos

Propriedades para configurar [recursos](../sdk/#recursos):

| Propriedades do sistema                 | Descrição                                                                                                                                    | Padrão                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `otel.service.name`                     | Especifica logical service name. Takes precedence over `service.name` definido com `otel.resource.attributes`.                               | `unknown_service:java` |
| `otel.resource.attributes`              | Especifica resource attributes in the following format: `key1=val1,key2=val2,key3=val3`.                                                     |                        |
| `otel.resource.disabled.keys`           | Especifica resource attribute keys to filter.                                                                                                |                        |
| `otel.java.enabled.resource.providers`  | Lista separa por vírgulas de `ResourceProvider` fully qualified class names to enable. **[1]** If unset, all resource providers are enabled. |                        |
| `otel.java.disabled.resource.providers` | Lista separa por vírgulas de `ResourceProvider` fully qualified class names to disable. **[1]**                                              |                        |

**[1]**: Por exemplo, para desabilitar o
[OS resource provider](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/resources/library/src/main/java/io/opentelemetry/instrumentation/resources/OsResourceProvider.java),
defina
`-Dotel.java.disabled.resource.providers=io.opentelemetry.instrumentation.resources.OsResourceProvider`.

**NOTE**: As propriedades do sistema / variáveis de ambiente `otel.service.name`
e `otel.resource.attributes` pelo provedor de recurso
`io.opentelemetry.sdk.autoconfigure.EnvironmentResourceProvider`. Se optar por
especificar o provedor de recursos via `otel.java.enabled.resource-providers`,
provavelmente você vai querer incluí-lo para evitar surpresas. Veja
[Provedor de Recursos](#provedor-de-recursos)para coordenadas de artefato do
provedor de recurso.

#### Propriedades: traços

Propriedades para [batch span processor(s)](../sdk/#spanprocessor) paired with
exporters specified via `otel.traces.exporter`:

| Propriedades do sistema          | Descrição                                                           | Padrão  |
| -------------------------------- | ------------------------------------------------------------------- | ------- |
| `otel.bsp.schedule.delay`        | O intervalo, em milissegundos, between two consecutive exports.     | `5000`  |
| `otel.bsp.max.queue.size`        | O número máximo de spans that can be queued before batching.        | `2048`  |
| `otel.bsp.max.export.batch.size` | O número máximo de spans to export in a single batch.               | `512`   |
| `otel.bsp.export.timeout`        | O tempo máximo permitido, em milissegundos, para exportar os dados. | `30000` |

Propriedades para [Amostras](../sdk/#amostrador):

| Propriedades do sistema   | Descrição                                                                                                                                                                                           | Padrão                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `otel.traces.sampler`     | The sampler to use. Valores conhecidos incluídos `always_on`, `always_off`, `traceidratio`, `parentbased_always_on`, `parentbased_always_off`, `parentbased_traceidratio`, `jaeger_remote`. **[1]** | `parentbased_always_on` |
| `otel.traces.sampler.arg` | Um argumento para configurar o traço se suportados, Por exemplo a ratio.                                                                                                                            |                         |

**[1]**: Known samplers and artifacts (see [sampler](../sdk/#sampler) for
artifact coordinates):

- `always_on` configura `AlwaysOnSampler`.
- `always_off` configura `AlwaysOffSampler`.
- `traceidratio` configura `TraceIdRatioBased`. `otel.traces.sampler.arg` sets
  the ratio.
- `parentbased_always_on` configura `ParentBased(root=AlwaysOnSampler)`.
- `parentbased_always_off` configura `ParentBased(root=AlwaysOffSampler)`.
- `parentbased_traceidratio` configura `ParentBased(root=TraceIdRatioBased)`.
  `otel.traces.sampler.arg` sets the ratio.
- `jaeger_remote` configura `JaegerRemoteSampler`. `otel.traces.sampler.arg` é
  uma lista separada por vírgulas de argumentos como os descritos em
  [especificações](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration).

Propriedades para [span limits](../sdk/#spanlimits):

| Propriedades do sistema                  | Descrição                                                                                               | Padrão   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- |
| `otel.span.attribute.value.length.limit` | The maximum length of span attribute values. Takes precedence over `otel.attribute.value.length.limit`. | No limit |
| `otel.span.attribute.count.limit`        | O número máximo de attributes per span. Takes precedence over `otel.attribute.count.limit`.             | `128`    |
| `otel.span.event.count.limit`            | O número máximo de events per span.                                                                     | `128`    |
| `otel.span.link.count.limit`             | O número máximo de links per span.                                                                      | `128`    |

#### Propriedades: métricas

Propriedades para [periodic metric reader](../sdk/#metricreader):

| Propriedades do sistema       | Descrição                                                                | Padrão  |
| ----------------------------- | ------------------------------------------------------------------------ | ------- |
| `otel.metric.export.interval` | O intervalo, em milissegundos, between the start of two export attempts. | `60000` |

Propriedades para exemplars:

| Propriedades do sistema        | Descrição                                                                            | Padrão        |
| ------------------------------ | ------------------------------------------------------------------------------------ | ------------- |
| `otel.metrics.exemplar.filter` | The filter for exemplar sampling. Can be `ALWAYS_OFF`, `ALWAYS_ON` or `TRACE_BASED`. | `TRACE_BASED` |

Propriedades para cardinality limits:

| Propriedades do sistema                       | Descrição                                                                                                                                                               | Padrão |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `otel.experimental.metrics.cardinality.limit` | If set, configure cardinality limit. The value dictates the maximum number of distinct points per metric. This option is experimental and subject to change or removal. | `2000` |

#### Propriedades: logs

Propriedades para [log record processor(s)](../sdk/#logrecordprocessor) pared
with exporters via `otel.logs.exporter`:

| Propriedades do sistema           | Descrição                                                          | Padrão  |
| --------------------------------- | ------------------------------------------------------------------ | ------- |
| `otel.blrp.schedule.delay`        | O intervalo, em milissegundos, between two consecutive exports.    | `1000`  |
| `otel.blrp.max.queue.size`        | O número máximo de log records that can be queued before batching. | `2048`  |
| `otel.blrp.max.export.batch.size` | O número máximo de log records to export in a single batch.        | `512`   |
| `otel.blrp.export.timeout`        | The maximum allowed time, in milliseconds, to export data.         | `30000` |

#### Propriedades: exporters

Propriedades para setting exporters:

| Propriedades do sistema          | Purpose                                                                                                                                                                | Padrão          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `otel.traces.exporter`           | Lista separa por vírgulas de span exporters. Known values include `otlp`, `zipkin`, `console`, `logging-otlp`, `none`. **[1]**                                         | `otlp`          |
| `otel.metrics.exporter`          | Lista separa por vírgulas de metric exporters. Known values include `otlp`, `prometheus`, `none`. **[1]**                                                              | `otlp`          |
| `otel.logs.exporter`             | Lista separa por vírgulas de log record exporters. Known values include `otlp`, `console`, `logging-otlp`, `none`. **[1]**                                             | `otlp`          |
| `otel.java.exporter.memory_mode` | If `reusable_data`, enable reusable memory mode (on exporters which support it) to reduce allocations. Known values include `reusable_data`, `immutable_data`. **[2]** | `reusable_data` |

**[1]**: Known exporters and artifacts (see
[span exporter](../sdk/#spanexporter),
[metric exporter](../sdk/#metricexporter),
[log exporter](../sdk/#logrecordexporter) for exporter artifact coordinates):

- `otlp` configures `OtlpHttp{Signal}Exporter` / `OtlpGrpc{Signal}Exporter`.
- `zipkin` configures `ZipkinSpanExporter`.
- `console` configures `LoggingSpanExporter`, `LoggingMetricExporter`,
  `SystemOutLogRecordExporter`.
- `logging-otlp` configures `OtlpJsonLogging{Signal}Exporter`.
- `experimental-otlp/stdout` configures `OtlpStdout{Signal}Exporter` (this
  option is experimental and subject to change or removal).

**[2]**: Exporters which adhere to
`otel.java.exporter.memory_mode=reusable_data` are `OtlpGrpc{Signal}Exporter`,
`OtlpHttp{Signal}Exporter`, `OtlpStdout{Signal}Exporter`, and
`PrometheusHttpServer`.

Propriedades para `otlp` span, métrica, e registros exporters:

| Propriedades do sistema                                    | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                           | Padrão                                                                                                                     |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `otel.{signal}.exporter=otlp`                              | Selecione o exportador OpenTelemetry para {signal}.                                                                                                                                                                                                                                                                                                                                                                                 |                                                                                                                            |
| `otel.exporter.otlp.protocol`                              | O protocolo de transporte para usar no traço OTLP, métrica e requisições de registros. Opções incluem `grpc` e `http/protobuf`.                                                                                                                                                                                                                                                                                                     | `grpc` **[1]**                                                                                                             |
| `otel.exporter.otlp.{signal}.protocol`                     | O protocolo de transporte para usar on OTLP {signal} requests. Opções incluem `grpc` e `http/protobuf`.                                                                                                                                                                                                                                                                                                                             | `grpc` **[1]**                                                                                                             |
| `otel.exporter.otlp.endpoint`                              | O endpoint para enviar todos os traços OTLP, métricas, e registros to. Often the address of an OpenTelemetry Collector. Must be a URL with a scheme of either `http` or `https` based on the use of TLS.                                                                                                                                                                                                                           | `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318` when protocol is `http/protobuf`.             |
| `otel.exporter.otlp.{signal}.endpoint`                     | O endpoint para enviar OTLP {signal} to. Often the address of an OpenTelemetry Collector. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. If protocol is `http/protobuf` the version and signal must be appended to the path (e.g. `v1/traces`, `v1/metrics`, or `v1/logs`)                                                                                                                        | `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/{signal}` when protocol is `http/protobuf`. |
| `otel.exporter.otlp.certificate`                           | The path to the file containing trusted certificates to use when verifying an OTLP trace, métrica, or log server's TLS credentials. The file should contain one or more X.509 certificates in PEM format.                                                                                                                                                                                                                           | The host platform's trusted root certificates are used.                                                                    |
| `otel.exporter.otlp.{signal}.certificate`                  | The path to the file containing trusted certificates to use when verifying an OTLP {signal} server's TLS credentials. The file should contain one or more X.509 certificates in PEM format.                                                                                                                                                                                                                                         | The host platform's trusted root certificates are used                                                                     |
| `otel.exporter.otlp.client.key`                            | The path to the file containing private client key to use when verifying an OTLP trace, métrica, or log client's TLS credentials. The file should contain one private key PKCS8 PEM format.                                                                                                                                                                                                                                         | No client key file is used.                                                                                                |
| `otel.exporter.otlp.{signal}.client.key`                   | The path to the file containing private client key to use when verifying an OTLP {signal} client's TLS credentials. The file should contain one private key PKCS8 PEM format.                                                                                                                                                                                                                                                       | No client key file is used.                                                                                                |
| `otel.exporter.otlp.client.certificate`                    | The path to the file containing trusted certificates to use when verifying an OTLP trace, métrica, or log client's TLS credentials. The file should contain one or more X.509 certificates in PEM format.                                                                                                                                                                                                                           | No chain file is used.                                                                                                     |
| `otel.exporter.otlp.{signal}.client.certificate`           | The path to the file containing trusted certificates to use when verifying an OTLP {signal} server's TLS credentials. The file should contain one or more X.509 certificates in PEM format.                                                                                                                                                                                                                                         | No chain file is used.                                                                                                     |
| `otel.exporter.otlp.headers`                               | Key-value pairs separated by commas to pass as request headers on OTLP trace, métrica, e registros requests.                                                                                                                                                                                                                                                                                                                        |                                                                                                                            |
| `otel.exporter.otlp.{signal}.headers`                      | Key-value pairs separated by commas to pass as request headers on OTLP {signal} requests.                                                                                                                                                                                                                                                                                                                                           |                                                                                                                            |
| `otel.exporter.otlp.compression`                           | O tipo de compressão para ser usado em um traço OTLP, métrica, e requisições de registros. Opções incluem `gzip`.                                                                                                                                                                                                                                                                                                                   | Nenhuma compressão será utilizada.                                                                                         |
| `otel.exporter.otlp.{signal}.compression`                  | O tipo de compressão para ser usado em um requisição de {signal} OTLP. Opções incluem `gzip`.                                                                                                                                                                                                                                                                                                                                       | Nenhuma compressão será utilizada.                                                                                         |
| `otel.exporter.otlp.timeout`                               | O tempo máximo de espera, em milissegundos, permitidos para enviar cada traço OTLP, métrica, e registros batch.                                                                                                                                                                                                                                                                                                                     | `10000`                                                                                                                    |
| `otel.exporter.otlp.{signal}.timeout`                      | O tempo máximo de espera, em milissegundos, permitidos para enviar cada lote OTLP de {signal}.                                                                                                                                                                                                                                                                                                                                      | `10000`                                                                                                                    |
| `otel.exporter.otlp.metrics.temporality.preference`        | The preferred output aggregation temporality. Opções incluem `DELTA`, `LOWMEMORY`, and `CUMULATIVE`. If `CUMULATIVE`, all instruments will have cumulative temporality. If `DELTA`, counter (sync and async) and histograms will be delta, up down counters (sync and async) will be cumulative. If `LOWMEMORY`, sync counter and histograms will be delta, async counter and up down counters (sync and async) will be cumulative. | `CUMULATIVE`                                                                                                               |
| `otel.exporter.otlp.metrics.default.histogram.aggregation` | The preferred default histogram aggregation. Opções incluem `BASE2_EXPONENTIAL_BUCKET_HISTOGRAM` and `EXPLICIT_BUCKET_HISTOGRAM`.                                                                                                                                                                                                                                                                                                   | `EXPLICIT_BUCKET_HISTOGRAM`                                                                                                |
| `otel.java.exporter.otlp.retry.enabled`                    | Se `true`, novas tentativas serão feitas quando erros transientes ocorrerem. **[2]**                                                                                                                                                                                                                                                                                                                                                | `true`                                                                                                                     |

**NOTE:** The text placeholder `{signal}` refers to the supported
[OpenTelemetry Signal](/docs/concepts/signals/). Valid values include `traces`,
`metrics`, and `logs`. Signal specific configurations take priority over the
generic versions. Por exemplo, if you set both `otel.exporter.otlp.endpoint` and
`otel.exporter.otlp.traces.endpoint`, the latter will take precedence.

**[1]**: OpenTelemetry Java agent 2.x and the OpenTelemetry Spring Boot starter
use `http/protobuf` by default.

**[2]**: [OTLP](/docs/specs/otlp/#otlpgrpc-response) requer que erros
[transientes](/docs/specs/otel/protocol/exporter/#retry) sejam tratados com uma
estratégia de nova tentativa. Quando a opção de _retry_ (nova tentativa) está
habilitada, os códigos de status gRPC que permitem repetição serão novamente
tentados usando um algoritmo de backoff exponencial com jitter. Essa opção
específica do `RetryPolicy` só pode ser customizada via
[customizações programáticas](#customizações-programáticas).

Propriedades para `zipkin` span exporter:

| Propriedades do sistema         | Descrição                                                  | Padrão                               |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------ |
| `otel.traces.exporter=zipkin`   | Select the Zipkin exporter                                 |                                      |
| `otel.exporter.zipkin.endpoint` | The Zipkin endpoint to connect to. Only HTTP is supported. | `http://localhost:9411/api/v2/spans` |

Propriedades para `prometheus` metric exporter.

| Propriedades do sistema            | Descrição                                                               | Padrão    |
| ---------------------------------- | ----------------------------------------------------------------------- | --------- |
| `otel.metrics.exporter=prometheus` | Seleciona o exportador do Prometheus                                    |           |
| `otel.exporter.prometheus.port`    | A porta local usada para ligar o servidor de métricas do Prometheus.    | `9464`    |
| `otel.exporter.prometheus.host`    | O endereço local usado para ligar o servidor de métricas do Prometheus. | `0.0.0.0` |

#### Customizações programáticas

Customizações programáticas provê hooks para suplementar as
[propriedades suportadas](#variáveis-de-ambiente-e-propriedades-do-sistema) com
[configurações programática](<(#configuração-programática)>).

Se estiver usando [Spring starter](/docs/zero-code/java/spring-boot-starter/),
veja também
[spring starter configuração programática](/docs/zero-code/java/spring-boot-starter/sdk-configuration/#programmatic-configuration).

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizedAutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;
import java.util.Collections;

public class CustomizedAutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.builder()
        // Optionally customize TextMapPropagator.
        .addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator)
        // Optionally customize Resource.
        .addResourceCustomizer((resource, configProperties) -> resource)
        // Optionally customize Sampler.
        .addSamplerCustomizer((sampler, configProperties) -> sampler)
        // Optionally customize SpanExporter.
        .addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter)
        // Optionally customize SpanProcessor.
        .addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor)
        // Optionally supply additional properties.
        .addPropertiesSupplier(Collections::emptyMap)
        // Optionally customize ConfigProperties.
        .addPropertiesCustomizer(configProperties -> Collections.emptyMap())
        // Optionally customize SdkTracerProviderBuilder.
        .addTracerProviderCustomizer((builder, configProperties) -> builder)
        // Optionally customize SdkMeterProviderBuilder.
        .addMeterProviderCustomizer((builder, configProperties) -> builder)
        // Optionally customize MetricExporter.
        .addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter)
        // Optionally customize MetricReader.
        .addMetricReaderCustomizer((metricReader, configProperties) -> metricReader)
        // Optionally customize SdkLoggerProviderBuilder.
        .addLoggerProviderCustomizer((builder, configProperties) -> builder)
        // Optionally customize LogRecordExporter.
        .addLogRecordExporterCustomizer((logRecordExporter, configProperties) -> logRecordExporter)
        // Optionally customize LogRecordProcessor.
        .addLogRecordProcessorCustomizer((processor, configProperties) -> processor)
        .build()
        .getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

#### SPI (Service provider interface)

[SPIs](https://docs.oracle.com/javase/tutorial/sound/SPI-intro.html) (artefato
`io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}`)
estendem a autoconfiguração do SDK além dos componentes já incluídos no SDK.

As seções a seguir descrevem os SPIs disponíveis. Cada seção de SPI inclui:

- Uma breve descrição, incluindo link para a referência do tipo Javadoc.
- Uma tabela com as implementações já incluídas e as do
  `opentelemetry-java-contrib`.
- Uma demonstração simples de uma implementação personalizada.

##### Provedor de Recursos

[ResourceProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ResourceProvider.html)s
contribute to the autoconfigured [resource](../sdk/#recursos).

`ResourceProvider`s built-in to the SDK and maintained by the community in
`opentelemetry-java-contrib`:

| Class                                                                     | Artifact                                                                                            | Descrição                                                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `io.opentelemetry.sdk.autoconfigure.internal.EnvironmentResourceProvider` | `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`                | Provides resource attributes based on `OTEL_SERVICE_NAME` and `OTEL_RESOURCE_ATTRIBUTES` env vars. |
| `io.opentelemetry.instrumentation.resources.ContainerResourceProvider`    | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides container resource attributes.                                                            |
| `io.opentelemetry.instrumentation.resources.HostResourceProvider`         | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides host resource attributes.                                                                 |
| `io.opentelemetry.instrumentation.resources.HostIdResourceProvider`       | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides host ID resource attribute.                                                               |
| `io.opentelemetry.instrumentation.resources.ManifestResourceProvider`     | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides service resource attributes based on jar manifest.                                        |
| `io.opentelemetry.instrumentation.resources.OsResourceProvider`           | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides OS resource attributes.                                                                   |
| `io.opentelemetry.instrumentation.resources.ProcessResourceProvider`      | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides process resource attributes.                                                              |
| `io.opentelemetry.instrumentation.resources.ProcessRuntimeProvider`       | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides process runtime resource attributes.                                                      |
| `io.opentelemetry.contrib.gcp.resource.GCPResourceProvider`               | `io.opentelemetry.contrib:opentelemetry-gcp-resources:{{% param vers.contrib %}}-alpha`             | Provides GCP runtime environment resource attributes.                                              |
| `io.opentelemetry.contrib.aws.resource.BeanstalkResourceProvider`         | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS beanstalk runtime environment resource attributes.                                    |
| `io.opentelemetry.contrib.aws.resource.Ec2ResourceProvider`               | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS ec2 runtime environment resource attributes.                                          |
| `io.opentelemetry.contrib.aws.resource.EcsResourceProvider`               | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS ecs runtime environment resource attributes.                                          |
| `io.opentelemetry.contrib.aws.resource.EksResourceProvider`               | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS eks runtime environment resource attributes.                                          |
| `io.opentelemetry.contrib.aws.resource.LambdaResourceProvider`            | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS lambda runtime environment resource attributes.                                       |

Implement the `ResourceProvider` interface to participate in resource
autoconfiguration. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomResourceProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ResourceProvider;
import io.opentelemetry.sdk.resources.Resource;

public class CustomResourceProvider implements ResourceProvider {

  @Override
  public Resource createResource(ConfigProperties config) {
    // Callback invoked to contribute to the resource.
    return Resource.builder().put("my.custom.resource.attribute", "abc123").build();
  }

  @Override
  public int order() {
    // Optionally influence the order of invocation.
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### AutoConfigurationCustomizerProvider

Implement the
[AutoConfigurationCustomizerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.html)
interface to customize a variety of autoconfigured SDK components. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizer;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import java.util.Collections;

public class CustomizerProvider implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer customizer) {
    // Optionally customize TextMapPropagator.
    customizer.addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator);
    // Optionally customize Resource.
    customizer.addResourceCustomizer((resource, configProperties) -> resource);
    // Optionally customize Sampler.
    customizer.addSamplerCustomizer((sampler, configProperties) -> sampler);
    // Optionally customize SpanExporter.
    customizer.addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter);
    // Optionally customize SpanProcessor.
    customizer.addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor);
    // Optionally supply additional properties.
    customizer.addPropertiesSupplier(Collections::emptyMap);
    // Optionally customize ConfigProperties.
    customizer.addPropertiesCustomizer(configProperties -> Collections.emptyMap());
    // Optionally customize SdkTracerProviderBuilder.
    customizer.addTracerProviderCustomizer((builder, configProperties) -> builder);
    // Optionally customize SdkMeterProviderBuilder.
    customizer.addMeterProviderCustomizer((builder, configProperties) -> builder);
    // Optionally customize MetricExporter.
    customizer.addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter);
    // Optionally customize MetricReader.
    customizer.addMetricReaderCustomizer((metricReader, configProperties) -> metricReader);
    // Optionally customize SdkLoggerProviderBuilder.
    customizer.addLoggerProviderCustomizer((builder, configProperties) -> builder);
    // Optionally customize LogRecordExporter.
    customizer.addLogRecordExporterCustomizer((exporter, configProperties) -> exporter);
    // Optionally customize LogRecordProcessor.
    customizer.addLogRecordProcessorCustomizer((processor, configProperties) -> processor);
  }

  @Override
  public int order() {
    // Optionally influence the order of invocation.
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSpanExporterProvider

Implement the
[ConfigurableSpanExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSpanExporterProvider.html)
interface to allow a custom span exporter to participate in autoconfiguration.
Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSpanExporterProvider;
import io.opentelemetry.sdk.trace.export.SpanExporter;

public class CustomSpanExporterProvider implements ConfigurableSpanExporterProvider {

  @Override
  public SpanExporter createExporter(ConfigProperties config) {
    // Callback invoked when OTEL_TRACES_EXPORTER includes the value from getName().
    return new CustomSpanExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableMetricExporterProvider

Implement the
[ConfigurableMetricExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/metrics/ConfigurableMetricExporterProvider.html)
interface to allow a custom metric exporter to participate in autoconfiguration.
Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.metrics.ConfigurableMetricExporterProvider;
import io.opentelemetry.sdk.metrics.export.MetricExporter;

public class CustomMetricExporterProvider implements ConfigurableMetricExporterProvider {

  @Override
  public MetricExporter createExporter(ConfigProperties config) {
    // Callback invoked when OTEL_METRICS_EXPORTER includes the value from getName().
    return new CustomMetricExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableLogRecordExporterProvider

Implement the
[ConfigurableLogRecordExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/logs/ConfigurableLogRecordExporterProvider.html)
interface to allow a custom log record exporter to participate in
autoconfiguration. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.logs.ConfigurableLogRecordExporterProvider;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;

public class CustomLogRecordExporterProvider implements ConfigurableLogRecordExporterProvider {

  @Override
  public LogRecordExporter createExporter(ConfigProperties config) {
    // Callback invoked when OTEL_LOGS_EXPORTER includes the value from getName().
    return new CustomLogRecordExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSamplerProvider

Implement the
[ConfigurableSamplerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSamplerProvider.html)
interface to allow a custom sampler to participate in autoconfiguration. For
example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSamplerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSamplerProvider;
import io.opentelemetry.sdk.trace.samplers.Sampler;

public class CustomSamplerProvider implements ConfigurableSamplerProvider {

  @Override
  public Sampler createSampler(ConfigProperties config) {
    // Callback invoked when OTEL_TRACES_SAMPLER is set to the value from getName().
    return new CustomSampler();
  }

  @Override
  public String getName() {
    return "custom-sampler";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurablePropagatorProvider

Implement the
[ConfigurablePropagatorProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ConfigurablePropagatorProvider.html)
interface to allow a custom propagator to participate in autoconfiguration. For
example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomTextMapPropagatorProvider.java"?>
```java
package otel;

import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigurablePropagatorProvider;

public class CustomTextMapPropagatorProvider implements ConfigurablePropagatorProvider {
  @Override
  public TextMapPropagator getPropagator(ConfigProperties config) {
    // Callback invoked when OTEL_PROPAGATORS includes the value from getName().
    return new CustomTextMapPropagator();
  }

  @Override
  public String getName() {
    return "custom-propagator";
  }
}
```
<!-- prettier-ignore-end -->

### Configurações declarativas

Configurações declarativas estão em desenvolvimento atualmente. Elas permitem a
configuração baseada em arquivos YAML, conforme descrito em
[configuração do OpenTelemetry](https://github.com/open-telemetry/opentelemetry-configuration)
e
[Configurações declarativas](/docs/specs/otel/configuration/#configurações-declarativas).

Para usar, inclua
`io.opentelemetry:opentelemetry-sdk-extension-incubator:{{% param vers.otel %}}-alpha`
e especifique o caminho para o arquivo de configuração descrito na tabela
abaixo.

| Propriedades do Sistema         | Função                                  | Padrão |
| ------------------------------- | --------------------------------------- | ------ |
| `otel.experimental.config.file` | The path to the SDK configuration file. | Unset  |

{{% alert title="Note" color="warning" %}} Quando um arquivo de configuração é
especificado,
[variáveis de ambiente e propriedades do sistema](#variáveis-de-ambiente-e-propriedades-do-sistema)
são ignorados, [customização programáticas](#programmatic-customization) e
[SPIs](#spi-service-provider-interface) são ignoradas. E o conteúdo deste
arquivo sozinho determina a configuração do SDK. {{% /alert %}}

Para detalhes adicionais, consulte os links abaixo:

- [Uso da Documentação](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/incubator#declarative-configuration)
- [Exemplo com Java agent](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent#declarative-configuration)
- [Exemplo sem Java agent](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/declarative-configuration)
