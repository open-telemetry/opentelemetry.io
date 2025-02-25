---
title: Gerenciar Telemetria com SDK
weight: 12
default_lang_commit: 17c3b8eb53b8abc56213abb736c0f850eab752df
cSpell:ignore: Interceptable Logback okhttp
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

O SDK é uma referência integrada da implementação da [API](../api/), processando
e exportando a telemetria produzida pela instrumentação das chamadas de API.
Esta página é uma visão geral dos conceitos do SDK, incluindo descrições, links
relevantes para Javadocs, coordenadas dos artefatos, configurações programadas
de amostras e mais. Veja **[Configure o SDK](../configuration/)** para detalhes
na configuração do SDK, incluindo
[Autoconfiguração do SDK sem código](../configuration/#zero-code-sdk-autoconfigure).

O SDK consiste nos seguintes componentes de alto nível:

- [SdkTracerProvider](#sdktracerprovider): A implementação do SDK
  `TracerProvider`, incluindo ferramentas para amostragem, processamento, e
  exportação de trechos.
- [SdkMeterProvider](#sdkmeterprovider): A implementação do SDK `MeterProvider`,
  incluindo ferramentas para configuração de fluxo de métricas e lendo /
  exportando métricas.
- [SdkLoggerProvider](#sdkloggerprovider): A implementação do SDK
  `LoggerProvider`, incluindo ferramentas para processamento e exportação de
  logs.
- [TextMapPropagator](#textmappropagator): Propaga o contexto através dos
  limites dos processos.

Essa combinação no [OpenTelemetrySdk](#opentelemetrysdk), transporta um objeto
que facilita a passagem de [Componentes SDK](#sdk-components) totalmente
configurados para instrumentação.

O SDK é empacotado com uma variedade de componentes integrados que são
suficientes para muitos casos de uso, e suporta
[plugins de interfaces](#SDK-interfaces-de-extensões-para-plugins) para
extensibilidade.

## SDK interfaces de extensões para plugins

Quando os componentes integrados são suficientes, o SDK pode ser extendido por
uma implementação para várias interfaces de extensões para plugins:

- [Amostrador](#amostrador): Configura quais trechos são gravados e amostrados.
- [SpanProcessor](#spanprocessor): Processa trechos quando eles iniciam e quando
  eles finalizam.
- [SpanExporter](#spanexporter): Exporta trechos fora dos processos.
- [MetricReader](#metricreader): Lê métricas agregadas.
- [MetricExporter](#metricexporter): Exporta métricas fora dos processos.
- [LogRecordProcessor](#logrecordprocessor): Processa registros de logs quando
  eles são emitidos.
- [LogRecordExporter](#logrecordexporter): Exporta registros de logs fora dos
  processos.
- [TextMapPropagator](#textmappropagator): Propaga o contexto através dos
  limites dos processos.

## Componentes do SDK

O artefato `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}` contém o
OpenTelemetry SDK.

A seção a seguir descreve o núcleo _(core)_ dos componentes do SDK voltados ao
usuário. Cada seção do componente incluí:

- Uma pequena descrição, incluindo um link para a documentação do Java com um
  tipo de referência.
- Se este componente é
  [interfaces de extensões para plugins](#SDK-interfaces-de-extensões-para-plugins),
  uma tabela de implementações disponíveis do `opentelemetry-java-contrib`.
- Uma demonstração simples de
  [Configuração programática](../configuration/#programmatic-configuration).
- Se este componente é
  [interfaces de extensões para plugins](#SDK-interfaces-de-extensões-para-plugins),
  uma simples demonstração de uma implementação personalizada.

### OpenTelemetrySdk

[OpenTelemetrySdk](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)
é uma implementação do SDK do [OpenTelemetry](../api/#opentelemetry). Ele
armazena os componentes de alto nível do SDK, o que facilita a passagem de
componentes do SDK totalmente configurados para a instrumentação.

`OpenTelemetrySdk` é configurado pelo responsável da aplicação, e consiste em:

- [SdkTracerProvider](#sdktracerprovider): A implementação do SDK
  `TracerProvider`.
- [SdkMeterProvider](#sdkmeterprovider): A implementação do SDK `MeterProvider`.
- [SdkLoggerProvider](#sdkloggerprovider): A implementação do SDK
  `LoggerProvider`.
- [ContextPropagators](#textmappropagator): Propaga o contexto através dos
  limites dos processos.

O trecho de código a seguir demonstra a configuração programática do
`OpenTelemetrySdk`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OpenTelemetrySdkConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.resources.Resource;

public class OpenTelemetrySdkConfig {
  public static OpenTelemetrySdk create() {
    Resource resource = ResourceConfig.create();
    return OpenTelemetrySdk.builder()
        .setTracerProvider(SdkTracerProviderConfig.create(resource))
        .setMeterProvider(SdkMeterProviderConfig.create(resource))
        .setLoggerProvider(SdkLoggerProviderConfig.create(resource))
        .setPropagators(ContextPropagatorsConfig.create())
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### Recursos

[Recursos](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-common/latest/io/opentelemetry/sdk/resources/Resource.html)
é uma lista de atributos definindo a origem da telemetria. Uma aplicação deve
associar o mesmo recurso com o [SdkTracerProvider](#sdktracerprovider),
[SdkMeterProvider](#sdkmeterprovider), [SdkLoggerProvider](#sdkloggerprovider).

{{% alert color="info" %}}
[ResourceProviders](../configuration/#resourceprovider) contribui com informação
contextual para a
[auto configuração](../configuration/#zero-code-sdk-autoconfigure) do recurso
baseado no ambiente. Veja a lista de documentação disponível
`ResourceProvider`s. {{% /alert %}}

O trecho de código a seguir demonstra a configuração programática do `Resource`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ResourceConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.semconv.ServiceAttributes;

public class ResourceConfig {
  public static Resource create() {
    return Resource.getDefault().toBuilder()
        .put(ServiceAttributes.SERVICE_NAME, "my-service")
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### SdkTracerProvider

[SdkTracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SdkTracerProvider.html)
é uma implementação do SDK do [TracerProvider](../api/#tracerprovider), e é
responsável por lidar com a telemetria de traços produzidos pela API.

`SdkTracerProvider` é configurado pelo responsável da aplicação, e consiste em:

- [Recursos](#resource): Os trechos associados com o traço.
- [Amostrador](#amostrador): Configura quais trechos são gravados e amostrados.
- [SpanProcessors](#spanprocessor): Processa trechos quando eles iniciam e
  quando eles finalizam.
- [SpanExporters](#spanexporter): Exporta trechos fora dos processos (junção dos
  associados com `SpanProcessor`s).
- [SpanLimits](#spanlimits): Controla o limite de dados associados com os
  trechos.

O trecho de código a seguir demonstra a configuração programática do
`SdkTracerProvider`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SdkTracerProviderConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;

public class SdkTracerProviderConfig {
  public static SdkTracerProvider create(Resource resource) {
    return SdkTracerProvider.builder()
        .setResource(resource)
        .addSpanProcessor(
            SpanProcessorConfig.batchSpanProcessor(
                SpanExporterConfig.otlpHttpSpanExporter("http://localhost:4318/v1/spans")))
        .setSampler(SamplerConfig.parentBasedSampler(SamplerConfig.traceIdRatioBased(.25)))
        .setSpanLimits(SpanLimitsConfig::spanLimits)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

#### Amostrador

Uma
[Amostra](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/samplers/Sampler.html)
é uma
[interfaces de extensão para plugins](#SDK-interfaces-de-extensões-para-plugins)
responsável por determinar quais trechos são gravados e amostrados.

{{% alert color="info" %}} Por padrão o `SdkTracerProvider` é configurado com a
amostra `ParentBased(root=AlwaysOn)`. Isto resulta em 100% dos spans sendo
amostrados, a menos que algum aplicação cliente realize a amostragem. Se essa
abordagem ser muito poluída / caro, troque a amostragem. {{% /alert %}}

Amostras integradas ao SDK e mantidas pela comunidade em
`opentelemetry-java-contrib`:

| Classe                    | Artefato                                                                                      | Descrição                                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ParentBased`             | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Amostra trechos com base no status de amostragem do trecho pai.                                                                                              |
| `AlwaysOn`                | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Amostra todos os trechos.                                                                                                                                    |
| `AlwaysOff`               | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Excluí todos os trechos.                                                                                                                                     |
| `TraceIdRatioBased`       | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Amostra trechos baseados em a razão configurável.                                                                                                            |
| `JaegerRemoteSampler`     | `io.opentelemetry:opentelemetry-sdk-extension-jaeger-remote-sampler:{{% param vers.otel %}}`  | Amostra trechos baseados em uma configuração de um servidor remoto.                                                                                          |
| `LinksBasedSampler`       | `io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha`            | Amostra trechos baseados no status de amostragem dos links do trecho.                                                                                        |
| `RuleBasedRoutingSampler` | `io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha`            | Amostra trechos baseados em regras configuráveis.                                                                                                            |
| `ConsistentSamplers`      | `io.opentelemetry.contrib:opentelemetry-consistent-sampling:{{% param vers.contrib %}}-alpha` | Várias implementações consistentes de amostrador, conforme definido por [amostras probabilísticas](/docs/specs/otel/trace/tracestate-probability-sampling/). |

O trecho de código a seguir demonstra a configuração programática do `Sampler`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SamplerConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.extension.trace.jaeger.sampler.JaegerRemoteSampler;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import java.time.Duration;

public class SamplerConfig {
  public static Sampler parentBasedSampler(Sampler root) {
    return Sampler.parentBasedBuilder(root)
        .setLocalParentNotSampled(Sampler.alwaysOff())
        .setLocalParentSampled(Sampler.alwaysOn())
        .setRemoteParentNotSampled(Sampler.alwaysOff())
        .setRemoteParentSampled(Sampler.alwaysOn())
        .build();
  }

  public static Sampler alwaysOn() {
    return Sampler.alwaysOn();
  }

  public static Sampler alwaysOff() {
    return Sampler.alwaysOff();
  }

  public static Sampler traceIdRatioBased(double ratio) {
    return Sampler.traceIdRatioBased(ratio);
  }

  public static Sampler jaegerRemoteSampler() {
    return JaegerRemoteSampler.builder()
        .setInitialSampler(Sampler.alwaysOn())
        .setEndpoint("http://endpoint")
        .setPollingInterval(Duration.ofSeconds(60))
        .setServiceName("my-service-name")
        .build();
  }
}
```
<!-- prettier-ignore-end -->

Implementando a interface da `Amostra` para fornecer sua própria lógica de
amostragem personalizada. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSampler.java"?>
```java
package otel;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.trace.data.LinkData;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import io.opentelemetry.sdk.trace.samplers.SamplingResult;
import java.util.List;

public class CustomSampler implements Sampler {
  @Override
  public SamplingResult shouldSample(
      Context parentContext,
      String traceId,
      String name,
      SpanKind spanKind,
      Attributes attributes,
      List<LinkData> parentLinks) {
    // Callback invoked when span is started, before any SpanProcessor is called.
    // If the SamplingDecision is:
    // - DROP: the span is dropped. A valid span context is created and SpanProcessor#onStart is
    // still called, but no data is recorded and SpanProcessor#onEnd is not called.
    // - RECORD_ONLY: the span is recorded but not sampled. Data is recorded to the span,
    // SpanProcessor#onStart and SpanProcessor#onEnd are called, but the span's sampled status
    // indicates it should not be exported out of process.
    // - RECORD_AND_SAMPLE: the span is recorded and sampled. Data is recorded to the span,
    // SpanProcessor#onStart and SpanProcessor#onEnd are called, and the span's sampled status
    // indicates it should be exported out of process.
    return SpanKind.SERVER == spanKind ? SamplingResult.recordAndSample() : SamplingResult.drop();
  }

  @Override
  public String getDescription() {
    // Return a description of the sampler.
    return this.getClass().getSimpleName();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanProcessor

Um
[SpanProcessor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SpanProcessor.html)
é uma
[interface de extensão para plugins](#SDK-interfaces-de-extensões-para-plugins)
com funções de retorno invocadas quando um trecho é inicializado e finalizado.
Elas são frequentemente combinadas com [SpanExporters](#spanexporter) para
exportar trechos ao limites dos processos, mas também possui outras aplicações,
como enriquecimento de dados.

Span processors integrados ao SDK e mantidos pela comunidade em
`opentelemetry-java-contrib`:

| Classe                    | Artefato                                                                                    | Descrição                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `BatchSpanProcessor`      | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                | Agrupa trechos amostrados e os exporta por meio de um `SpanExporter` configurável. |
| `SimpleSpanProcessor`     | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                | Exporta cada amostra de trecho por meio de um `SpanExporter` configurável.         |
| `BaggageSpanProcessor`    | `io.opentelemetry.contrib:opentelemetry-baggage-processor:{{% param vers.contrib %}}-alpha` | Enriquece os trechos com bagagem.                                                  |
| `JfrSpanProcessor`        | `io.opentelemetry.contrib:opentelemetry-jfr-events:{{% param vers.contrib %}}-alpha`        | Cria eventos JFR a partir de trechos.                                              |
| `StackTraceSpanProcessor` | `io.opentelemetry.contrib:opentelemetry-span-stacktrace:{{% param vers.contrib %}}-alpha`   | Enriquece trechos selecionados com dados de stack trace.                           |
| `InferredSpansProcessor`  | `io.opentelemetry.contrib:opentelemetry-inferred-spans:{{% param vers.contrib %}}-alpha`    | Gera trechos a partir do profiler assíncrono em vez de instrumentação.             |

O trecho de código a seguir demonstra a configuração programática do
`SpanProcessor`

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanProcessorConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.trace.SpanProcessor;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import java.time.Duration;

public class SpanProcessorConfig {
  public static SpanProcessor batchSpanProcessor(SpanExporter spanExporter) {
    return BatchSpanProcessor.builder(spanExporter)
        .setMaxQueueSize(2048)
        .setExporterTimeout(Duration.ofSeconds(30))
        .setScheduleDelay(Duration.ofSeconds(5))
        .build();
  }

  public static SpanProcessor simpleSpanProcessor(SpanExporter spanExporter) {
    return SimpleSpanProcessor.builder(spanExporter).build();
  }
}
```
<!-- prettier-ignore-end -->

Implementando a interface do `SpanProcessor` para fornecer seu próprio
processamento lógico de trecho. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanProcessor.java"?>
```java
package otel;

import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.ReadWriteSpan;
import io.opentelemetry.sdk.trace.ReadableSpan;
import io.opentelemetry.sdk.trace.SpanProcessor;

public class CustomSpanProcessor implements SpanProcessor {

  @Override
  public void onStart(Context parentContext, ReadWriteSpan span) {
    // Callback invoked when span is started.
    // Enrich the record with a custom attribute.
    span.setAttribute("my.custom.attribute", "hello world");
  }

  @Override
  public boolean isStartRequired() {
    // Indicate if onStart should be called.
    return true;
  }

  @Override
  public void onEnd(ReadableSpan span) {
    // Callback invoked when span is ended.
  }

  @Override
  public boolean isEndRequired() {
    // Indicate if onEnd should be called.
    return false;
  }

  @Override
  public CompletableResultCode shutdown() {
    // Optionally shutdown the processor and cleanup any resources.
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode forceFlush() {
    // Optionally process any records which have been queued up but not yet processed.
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanExporter

Um
[SpanExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/export/SpanExporter.html)
é uma
[interface de extensão para plugins](#SDK-interfaces-de-extensões-para-plugins)
responsável por exportar trechos foras dos processos. Ao invés de registrar
diretamente com `SdkTracerProvider`, eles são associados com
[SpanProcessors](#spanprocessor) (normalmente `BatchSpanProcessor`).

Exportadores de trechos integrados ao SDK e mantidos pela comunidade em
`opentelemetry-java-contrib`:

| Classe                         | Artefato                                                                                 | Descrição                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `OtlpHttpSpanExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`                   | Exporta trechos via OTLP `http/protobuf`.                                                        |
| `OtlpGrpcSpanExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`                   | Exporta trechos via OTLP `grpc`.                                                                 |
| `LoggingSpanExporter`          | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`                | Registra trechos para JUL em um formato de debugging.                                            |
| `OtlpJsonLoggingSpanExporter`  | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`           | Registra trechos para JUL em um JSON OTLP codificado.                                            |
| `OtlpStdoutSpanExporter`       | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`           | Registra trechos para o `System.out` em formato OTLP [Arquivo JSON Codificado][] (experimental). |
| `ZipkinSpanExporter`           | `io.opentelemetry:opentelemetry-exporter-zipkin:{{% param vers.otel %}}`                 | Exporta trechos para o Zipkin.                                                                   |
| `InterceptableSpanExporter`    | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha`     | Passes trechos para um interceptador flexível antes da exportação.                               |
| `KafkaSpanExporter`            | `io.opentelemetry.contrib:opentelemetry-kafka-exporter:{{% param vers.contrib %}}-alpha` | Exporta trechos escrevendo para um tópico do Kafka.                                              |

**[1]**: Veja [OTLP exporters](#otlp-exporters) para detalhes de implementação.

O trecho de código a seguir demonstra configuração programática do
`SpanExporter`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanExporterConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.logging.LoggingSpanExporter;
import io.opentelemetry.exporter.logging.otlp.OtlpJsonLoggingSpanExporter;
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import java.time.Duration;

public class SpanExporterConfig {
  public static SpanExporter otlpHttpSpanExporter(String endpoint) {
    return OtlpHttpSpanExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static SpanExporter otlpGrpcSpanExporter(String endpoint) {
    return OtlpGrpcSpanExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static SpanExporter logginSpanExporter() {
    return LoggingSpanExporter.create();
  }

  public static SpanExporter otlpJsonLoggingSpanExporter() {
    return OtlpJsonLoggingSpanExporter.create();
  }
}
```
<!-- prettier-ignore-end -->

Implementando a interface do `SpanExporter` para fornecer sua própria lógica de
exportação de trechos. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanExporter.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import java.util.Collection;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomSpanExporter implements SpanExporter {

  private static final Logger logger = Logger.getLogger(CustomSpanExporter.class.getName());

  @Override
  public CompletableResultCode export(Collection<SpanData> spans) {
    // Export the records. Typically, records are sent out of process via some network protocol, but
    // we simply log for illustrative purposes.
    logger.log(Level.INFO, "Exporting spans");
    spans.forEach(span -> logger.log(Level.INFO, "Span: " + span));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // Export any records which have been queued up but not yet exported.
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Shutdown the exporter and cleanup any resources.
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanLimits

[SpanLimits](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SpanLimits.html)
define restrições para os dados capturados pelos trechos, incluindo o
comprimento máximo dos atributos, máximo numero de atributos, entre outros.

O trecho de código a seguir demonstra a configuração programática do
`SpanLimits`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanLimitsConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.trace.SpanLimits;

public class SpanLimitsConfig {
  public static SpanLimits spanLimits() {
    return SpanLimits.builder()
        .setMaxNumberOfAttributes(128)
        .setMaxAttributeValueLength(1024)
        .setMaxNumberOfLinks(128)
        .setMaxNumberOfAttributesPerLink(128)
        .setMaxNumberOfEvents(128)
        .setMaxNumberOfAttributesPerEvent(128)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### SdkMeterProvider

[SdkMeterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/SdkMeterProvider.html)
é a implementação do SDK [MeterProvider](../api/#meterprovider), e é responsável
por gerenciar a telemetria de métricas produzidas pela API.

`SdkMeterProvider` é configurado pelo responsável pela aplicação, e consiste em:

- [Resource](#resource): O recurso ao qual as métricas estão associadas.
- [MetricReader](#metricreader): Lê o estado agregado das métricas.
  - Opcionalmente, com o
    [CardinalityLimitSelector](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/CardinalityLimitSelector.html)
    para substituir o limite de cardinalidade por tipo de instrumento. Se não
    configurado, cada é limitado a 2000 combinações únicas de atributos por
    ciclo de coleta. Limites de cardinalidade também são configuráveis para
    instrumentos individuais via [views](#views). Consulte
    [limites de cardinalidade](/docs/specs/otel/metrics/sdk/#cardinality-limits)
    para mais detalhes.
- [MetricExporter](#metricexporter): Exporta métricas para fora do processo (em
  conjunto com o `MetricReader` associado).
- [Views](#views): Configura fluxos de métricas, incluindo a exclusão de
  métricas não utilizadas.

O trecho de código a seguir demonstra a configuração programática
`SdkMeterProvider`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SdkMeterProviderConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.SdkMeterProviderBuilder;
import io.opentelemetry.sdk.resources.Resource;
import java.util.List;
import java.util.Set;

public class SdkMeterProviderConfig {
  public static SdkMeterProvider create(Resource resource) {
    SdkMeterProviderBuilder builder =
        SdkMeterProvider.builder()
            .setResource(resource)
            .registerMetricReader(
                MetricReaderConfig.periodicMetricReader(
                    MetricExporterConfig.otlpHttpMetricExporter(
                        "http://localhost:4318/v1/metrics")));
    // Descomente para opcionalmente registrar um leitor de métrica com limites de cardinalidade.
    // builder.registerMetricReader(
    //     MetricReaderConfig.periodicMetricReader(
    //         MetricExporterConfig.otlpHttpMetricExporter("http://localhost:4318/v1/metrics")),
    //     instrumentType -> 100);

    ViewConfig.dropMetricView(builder, "some.custom.metric");
    ViewConfig.histogramBucketBoundariesView(
        builder, "http.server.request.duration", List.of(1.0, 5.0, 10.0));
    ViewConfig.attributeFilterView(
        builder, "http.client.request.duration", Set.of("http.request.method"));
    ViewConfig.cardinalityLimitsView(builder, "http.server.active_requests", 100);
    return builder.build();
  }
}
```
<!-- prettier-ignore-end -->

#### MetricReader

O
[MetricReader](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/MetricReader.html)
é uma
[interface de extensão para plugins](#SDK-interfaces-de-extensões-para-plugins)
que é responsável por ler as métricas agregadas. Eles são muitas vezes
associadas com [MetricExporters](#metricexporter) para exportar métricas fora do
processo, mas pode também ser usada para servir métricas para scrapers externos
em protocolos baseados em _pull_.

Metric readers integrados ao SDK e mantidos pela comunidade em
`opentelemetry-java-contrib`:

| Classe                 | Artefato                                                                           | Descrição                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `PeriodicMetricReader` | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                       | Lê as métricas em uma base periódica e os exporta por meio de uma configuração do `MetricExporter`. |
| `PrometheusHttpServer` | `io.opentelemetry:opentelemetry-exporter-prometheus:{{% param vers.otel %}}-alpha` | Disponibiliza métricas em um servidor HTTP em vários formatos Prometheus.                           |

O trecho de código a seguir demonstra a configuração programática do
`MetricReader`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MetricReaderConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.prometheus.PrometheusHttpServer;
import io.opentelemetry.sdk.metrics.export.MetricExporter;
import io.opentelemetry.sdk.metrics.export.MetricReader;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import java.time.Duration;

public class MetricReaderConfig {
  public static MetricReader periodicMetricReader(MetricExporter metricExporter) {
    return PeriodicMetricReader.builder(metricExporter).setInterval(Duration.ofSeconds(60)).build();
  }

  public static MetricReader prometheusMetricReader() {
    return PrometheusHttpServer.builder().setHost("localhost").setPort(9464).build();
  }
}
```
<!-- prettier-ignore-end -->

Implementa a interface do `MetricReader` para fornecer sua própria lógica de
leitura de métricas. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricReader.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.common.export.MemoryMode;
import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentType;
import io.opentelemetry.sdk.metrics.data.AggregationTemporality;
import io.opentelemetry.sdk.metrics.export.AggregationTemporalitySelector;
import io.opentelemetry.sdk.metrics.export.CollectionRegistration;
import io.opentelemetry.sdk.metrics.export.MetricReader;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomMetricReader implements MetricReader {

  private static final Logger logger = Logger.getLogger(CustomMetricExporter.class.getName());

  private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);
  private final AtomicReference<CollectionRegistration> collectionRef =
      new AtomicReference<>(CollectionRegistration.noop());

  @Override
  public void register(CollectionRegistration collectionRegistration) {
    // Callback invoked when SdkMeterProvider is initialized, providing a handle to collect metrics.
    collectionRef.set(collectionRegistration);
    executorService.scheduleWithFixedDelay(this::collectMetrics, 0, 60, TimeUnit.SECONDS);
  }

  private void collectMetrics() {
    // Collect metrics. Typically, records are sent out of process via some network protocol, but we
    // simply log for illustrative purposes.
    logger.log(Level.INFO, "Collecting metrics");
    collectionRef
        .get()
        .collectAllMetrics()
        .forEach(metric -> logger.log(Level.INFO, "Metric: " + metric));
  }

  @Override
  public CompletableResultCode forceFlush() {
    // Export any records which have been queued up but not yet exported.
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Shutdown the exporter and cleanup any resources.
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(InstrumentType instrumentType) {
    // Specify the required aggregation temporality as a function of instrument type
    return AggregationTemporalitySelector.deltaPreferred()
        .getAggregationTemporality(instrumentType);
  }

  @Override
  public MemoryMode getMemoryMode() {
    // Optionally specify the memory mode, indicating whether metric records can be reused or must
    // be immutable
    return MemoryMode.REUSABLE_DATA;
  }

  @Override
  public Aggregation getDefaultAggregation(InstrumentType instrumentType) {
    // Optionally specify the default aggregation as a function of instrument kind
    return Aggregation.defaultAggregation();
  }
}
```
<!-- prettier-ignore-end -->

#### MetricExporter

A
[MetricExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/MetricExporter.html)
é uma
[interface de extensão para plugins](#SDK-interfaces-de-extensões-para-plugins)
responsável por exportar métricas fora do processo. Ao invés de registrar
diretamente com `SdkMeterProvider`, eles são associados com o
[PeriodicMetricReader](#metricreader).

Metric exporters integrados ao SDK e mantidos pela comunidade em
`opentelemetry-java-contrib`:

| Classe                           | Artefato                                                                             | Descrição                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `OtlpHttpMetricExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Exporta métricas via OTLP `http/protobuf`.                                                      |
| `OtlpGrpcMetricExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Exporta métricas via OTLP `grpc`.                                                               |
| `LoggingMetricExporter`          | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`            | Registra métricas para JUL em um formato debugging.                                             |
| `OtlpJsonLoggingMetricExporter`  | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Registra métricas para JUL em um JSON OTLP codificado.                                          |
| `OtlpStdoutMetricExporter`       | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Registra métricas para `System.out` em formato OTLP [Arquivo JSON Codificado][] (experimental). |
| `InterceptableMetricExporter`    | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | Passes métricas para um interceptador flexível antes da exportação.                             |

**[1]**: Veja [OTLP exporters](#otlp-exporters) para detalhes de implementação.

O trecho de código a seguir demonstra a configuração programática do
`MetricExporter`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MetricExporterConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.logging.LoggingMetricExporter;
import io.opentelemetry.exporter.logging.otlp.OtlpJsonLoggingMetricExporter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.exporter.otlp.metrics.OtlpGrpcMetricExporter;
import io.opentelemetry.sdk.metrics.export.MetricExporter;
import java.time.Duration;

public class MetricExporterConfig {
  public static MetricExporter otlpHttpMetricExporter(String endpoint) {
    return OtlpHttpMetricExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static MetricExporter otlpGrpcMetricExporter(String endpoint) {
    return OtlpGrpcMetricExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static MetricExporter logginMetricExporter() {
    return LoggingMetricExporter.create();
  }

  public static MetricExporter otlpJsonLoggingMetricExporter() {
    return OtlpJsonLoggingMetricExporter.create();
  }
}
```
<!-- prettier-ignore-end -->

Implementa a interface do `MetricExporter` para fornecer sua própria lógica de
exportação de métricas. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricExporter.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.common.export.MemoryMode;
import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentType;
import io.opentelemetry.sdk.metrics.data.AggregationTemporality;
import io.opentelemetry.sdk.metrics.data.MetricData;
import io.opentelemetry.sdk.metrics.export.AggregationTemporalitySelector;
import io.opentelemetry.sdk.metrics.export.MetricExporter;
import java.util.Collection;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomMetricExporter implements MetricExporter {

  private static final Logger logger = Logger.getLogger(CustomMetricExporter.class.getName());

  @Override
  public CompletableResultCode export(Collection<MetricData> metrics) {
    // Export the records. Typically, records are sent out of process via some network protocol, but
    // we simply log for illustrative purposes.
    logger.log(Level.INFO, "Exporting metrics");
    metrics.forEach(metric -> logger.log(Level.INFO, "Metric: " + metric));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // Export any records which have been queued up but not yet exported.
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Shutdown the exporter and cleanup any resources.
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(InstrumentType instrumentType) {
    // Specify the required aggregation temporality as a function of instrument type
    return AggregationTemporalitySelector.deltaPreferred()
        .getAggregationTemporality(instrumentType);
  }

  @Override
  public MemoryMode getMemoryMode() {
    // Optionally specify the memory mode, indicating whether metric records can be reused or must
    // be immutable
    return MemoryMode.REUSABLE_DATA;
  }

  @Override
  public Aggregation getDefaultAggregation(InstrumentType instrumentType) {
    // Optionally specify the default aggregation as a function of instrument kind
    return Aggregation.defaultAggregation();
  }
}
```
<!-- prettier-ignore-end -->

#### Views

[Views](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/View.html)
permitem que os fluxos de métricas sejam personalizados, incluindo a alteração
de nomes de métricas, descrições de métricas, agregações de métricas (ou seja,
limites de intervalos de histograma), o conjunto de chaves de atributos a serem
mantidos, limite de cardinalidade, etc.

{{% alert %}} As Views têm um comportamento um tanto não intuitivo quando várias
coincidem com um instrumento particular. Se uma view correspondente altera o
nome da métrica e outra altera a agregação da métrica, você pode esperar que o
nome e a agregação sejam alterados, mas este não é o caso. Em vez disso, dois
fluxos de métricas são produzidos: um com o nome da métrica configurado e a
agregação padrão, e outro com o nome da métrica original e a agregação
configurada. Em outras palavras, as views correspondentes não são mescladas _do
not merge_. For best results, Para melhores resultados, configure as views com
critérios de seleção mais restritos (ex. selecione um único instrumento
específico). {{% /alert %}}

O trecho de código a seguir demonstra a configuração programática do `View`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ViewConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentSelector;
import io.opentelemetry.sdk.metrics.SdkMeterProviderBuilder;
import io.opentelemetry.sdk.metrics.View;
import java.util.List;
import java.util.Set;

public class ViewConfig {
  public static SdkMeterProviderBuilder dropMetricView(
      SdkMeterProviderBuilder builder, String metricName) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder().setAggregation(Aggregation.drop()).build());
  }

  public static SdkMeterProviderBuilder histogramBucketBoundariesView(
      SdkMeterProviderBuilder builder, String metricName, List<Double> bucketBoundaries) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder()
            .setAggregation(Aggregation.explicitBucketHistogram(bucketBoundaries))
            .build());
  }

  public static SdkMeterProviderBuilder attributeFilterView(
      SdkMeterProviderBuilder builder, String metricName, Set<String> keysToRetain) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder().setAttributeFilter(keysToRetain).build());
  }

  public static SdkMeterProviderBuilder cardinalityLimitsView(
      SdkMeterProviderBuilder builder, String metricName, int cardinalityLimit) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder().setCardinalityLimit(cardinalityLimit).build());
  }
}
```
<!-- prettier-ignore-end -->

### SdkLoggerProvider

[SdkLoggerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/SdkLoggerProvider.html)
é a implementação do SDK do [LoggerProvider](../api/#loggerprovider), e é
responsável por gerenciar a telemetria dos logs produzidos pela API.

`SdkLoggerProvider` é configurado pelo responsável da aplicação, e consiste em:

- [Resource](#resource): O recurso ao qual os logs estão associados.
- [LogRecordProcessor](#logrecordprocessor): Processa os logs quando eles são
  emitidos.
- [LogRecordExporter](#logrecordexporter): Exporta logs fora do processo (em
  conjunto com os `LogRecordProcessor` associados).
- [LogLimits](#loglimits): Controla os limites dos dados associados com os logs.

O trecho de código a seguir demonstra a configuração programática do
`SdkLoggerProvider`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SdkLoggerProviderConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.logs.SdkLoggerProvider;
import io.opentelemetry.sdk.resources.Resource;

public class SdkLoggerProviderConfig {
  public static SdkLoggerProvider create(Resource resource) {
    return SdkLoggerProvider.builder()
        .setResource(resource)
        .addLogRecordProcessor(
            LogRecordProcessorConfig.batchLogRecordProcessor(
                LogRecordExporterConfig.otlpHttpLogRecordExporter("http://localhost:4318/v1/logs")))
        .setLogLimits(LogLimitsConfig::logLimits)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

#### LogRecordProcessor

A
[LogRecordProcessor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/LogRecordProcessor.html)
é uma
[interface de extensão para plugins](#SDK-interfaces-de-extensões-para-plugins)
com um callback invocado quando um log é emitido. Eles são frequentemente
associados com [LogRecordExporters](#logrecordexporter) para exportar logs fora
do processo, mas tem outras aplicações, como enriquecimento de dados.

Os processadores de registros de log integrados ao SDK e mantidos pela
comunidade em `opentelemetry-java-contrib`:

| Classe                     | Artefato                                                                             | Descrição                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `BatchLogRecordProcessor`  | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                         | Agrupa os registros de log e os exporta por meio de um `LogRecordExporter` configurável. |
| `SimpleLogRecordProcessor` | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                         | Exporta cada registro de log a via de um `LogRecordExporter` configurável.               |
| `EventToSpanEventBridge`   | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | Registra os eventos de log como eventos de trecho no trecho atual.                       |

O trecho de código a seguir demonstra a configuração programática do
`LogRecordProcessor`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/LogRecordProcessorConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.logs.LogRecordProcessor;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import io.opentelemetry.sdk.logs.export.SimpleLogRecordProcessor;
import java.time.Duration;

public class LogRecordProcessorConfig {
  public static LogRecordProcessor batchLogRecordProcessor(LogRecordExporter logRecordExporter) {
    return BatchLogRecordProcessor.builder(logRecordExporter)
        .setMaxQueueSize(2048)
        .setExporterTimeout(Duration.ofSeconds(30))
        .setScheduleDelay(Duration.ofSeconds(1))
        .build();
  }

  public static LogRecordProcessor simpleLogRecordProcessor(LogRecordExporter logRecordExporter) {
    return SimpleLogRecordProcessor.create(logRecordExporter);
  }
}
```
<!-- prettier-ignore-end -->

Implementando a interface do `LogRecordProcessor` para fornecer sua própria
lógica personalizada de processamento de logs. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordProcessor.java"?>
```java
package otel;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.logs.LogRecordProcessor;
import io.opentelemetry.sdk.logs.ReadWriteLogRecord;

public class CustomLogRecordProcessor implements LogRecordProcessor {

  @Override
  public void onEmit(Context context, ReadWriteLogRecord logRecord) {
    // Callback invoked when log record is emitted.
    // Enrich the record with a custom attribute.
    logRecord.setAttribute(AttributeKey.stringKey("my.custom.attribute"), "hello world");
  }

  @Override
  public CompletableResultCode shutdown() {
    // Optionally shutdown the processor and cleanup any resources.
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode forceFlush() {
    // Optionally process any records which have been queued up but not yet processed.
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### LogRecordExporter

Um
[LogRecordExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/export/LogRecordExporter.html)
é uma
[interface de extensão para plugins](#SDK-interfaces-de-extensões-para-plugins)
responsável por exportar registros de logs fora do processo. Ao invés de
registrar diretamente com `SdkLoggerProvider`, eles podem ser associados ao
[LogRecordProcessors](#logrecordprocessor) (tipicamente
`BatchLogRecordProcessor`).

Span exporters integrados ao SDK e mantidos pela comunidade em
`opentelemetry-java-contrib`:

| Classe                                     | Artefato                                                                             | Descrição                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `OtlpHttpLogRecordExporter` **[1]**        | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Exporta registros de logs via OTLP `http/protobuf`.                                           |
| `OtlpGrpcLogRecordExporter` **[1]**        | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Exporta registros de logs via OTLP `grpc`.                                                    |
| `SystemOutLogRecordExporter`               | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`            | Grava registros de logs para system out em um formato de debugging.                           |
| `OtlpJsonLoggingLogRecordExporter` **[2]** | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Grava registros de logs para JUL em um JSON OTLP codificado.                                  |
| `OtlpStdoutLogRecordExporter`              | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Grava registros de logs para `System.out` em OTLP [Arquivo JSON Codificado][] (experimental). |
| `InterceptableLogRecordExporter`           | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | Passa registros de logs para um interceptador flexível antes de exportar.                     |

**[1]**: Veja [Exportadores OTLP](#otlp-exporters) para detalhes de
implementação.

**[2]**: `OtlpJsonLoggingLogRecordExporter` registra no JUL e pode causar loops
infinitos (ex. JUL -> SLF4J -> Logback -> OpenTelemetry Appender ->
OpenTelemetry Log SDK -> JUL) se não for configurado com cuidado.

O trecho de código a seguir demonstra a configuração programática do
`LogRecordProcessor`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/LogRecordExporterConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.logging.SystemOutLogRecordExporter;
import io.opentelemetry.exporter.logging.otlp.OtlpJsonLoggingLogRecordExporter;
import io.opentelemetry.exporter.otlp.http.logs.OtlpHttpLogRecordExporter;
import io.opentelemetry.exporter.otlp.logs.OtlpGrpcLogRecordExporter;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import java.time.Duration;

public class LogRecordExporterConfig {
  public static LogRecordExporter otlpHttpLogRecordExporter(String endpoint) {
    return OtlpHttpLogRecordExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static LogRecordExporter otlpGrpcLogRecordExporter(String endpoint) {
    return OtlpGrpcLogRecordExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static LogRecordExporter systemOutLogRecordExporter() {
    return SystemOutLogRecordExporter.create();
  }

  public static LogRecordExporter otlpJsonLoggingLogRecordExporter() {
    return OtlpJsonLoggingLogRecordExporter.create();
  }
}
```
<!-- prettier-ignore-end -->

Implementando a interface do `LogRecordExporter` para fornecer sua própria
lógica personalizada de exportação de registros. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordExporter.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.logs.data.LogRecordData;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import java.util.Collection;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomLogRecordExporter implements LogRecordExporter {

  private static final Logger logger = Logger.getLogger(CustomLogRecordExporter.class.getName());

  @Override
  public CompletableResultCode export(Collection<LogRecordData> logs) {
    // Export the records. Typically, records are sent out of process via some network protocol, but
    // we simply log for illustrative purposes.
    System.out.println("Exporting logs");
    logs.forEach(log -> System.out.println("log record: " + log));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // Export any records which have been queued up but not yet exported.
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Shutdown the exporter and cleanup any resources.
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### LogLimits

[LogLimits](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/LogLimits.html)
define restrições para os dados capturados pelos registros de logs, incluindo o
comprimento máximo dos atributos, e número máximo de atributos.

O trecho de código a seguir demonstra a configuração programática do
`LogRecordProcessor`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/LogLimitsConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.logs.LogLimits;

public class LogLimitsConfig {
  public static LogLimits logLimits() {
    return LogLimits.builder()
        .setMaxNumberOfAttributes(128)
        .setMaxAttributeValueLength(1024)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### TextMapPropagator

[TextMapPropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/propagation/TextMapPropagator.html)
é uma
[interface de extensão para plugins](#SDK-interfaces-de-extensões-para-plugins)
responsável por propagar o contexto através dos processos conectados em um
formato de texto.

TextMapPropagators integrados ao SDK e mantidos pela comunidade em
`opentelemetry-java-contrib`:

| Classe                      | Artefato                                                                                      | Descrição                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `W3CTraceContextPropagator` | `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}`                                  | Propaga contextos de rastros usando W3C contextos de rastros protocolo de propagação.               |
| `W3CBaggagePropagator`      | `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}`                                  | Propaga baggage usando W3C baggage protocolo de propagação.                                         |
| `MultiTextMapPropagator`    | `io.opentelemetry:opentelemetry-context:{{% param vers.otel %}}`                              | Compor múltiplos propagadores.                                                                      |
| `JaegerPropagator`          | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | Propagador de contextos de rastros usando o protocolo de propagação do Jaeger.                      |
| `B3Propagator`              | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | Propagador de contextos de rastros usando o protocolo de propagação B3.                             |
| `OtTracePropagator`         | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | Propagador de contextos de rastros usando o protocolo de propagação do OpenTracing.                 |
| `PassThroughPropagator`     | `io.opentelemetry:opentelemetry-api-incubator:{{% param vers.otel %}}-alpha`                  | Propaga um conjunto configurável de campos sem participar da telemetria.                            |
| `AwsXrayPropagator`         | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator:{{% param vers.contrib %}}-alpha` | Propaga contextos de rastros usando o protocolo de propagação do AWS X-Ray.                         |
| `AwsXrayLambdaPropagator`   | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator:{{% param vers.contrib %}}-alpha` | Propaga contextos de rastros usando variáveis de ambiente e o protocolo de propagação do AWS X-Ray. |

O trecho de código a seguir demonstra a configuração programática do
`TextMapPropagator`:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ContextPropagatorsConfig.java"?>
```java
package otel;

import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;

public class ContextPropagatorsConfig {
  public static ContextPropagators create() {
    return ContextPropagators.create(
        TextMapPropagator.composite(
            W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));
  }
}
```
<!-- prettier-ignore-end -->

Implementando a interface do `TextMapPropagator` para fornecer sua própria
lógica de propagação. Por exemplo:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomTextMapPropagator.java"?>
```java
package otel;

import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.TextMapGetter;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.context.propagation.TextMapSetter;
import java.util.Collection;
import java.util.Collections;

public class CustomTextMapPropagator implements TextMapPropagator {

  @Override
  public Collection<String> fields() {
    // Return fields used for propagation. See W3CTraceContextPropagator for reference
    // implementation.
    return Collections.emptyList();
  }

  @Override
  public <C> void inject(Context context, C carrier, TextMapSetter<C> setter) {
    // Inject context. See W3CTraceContextPropagator for reference implementation.
  }

  @Override
  public <C> Context extract(Context context, C carrier, TextMapGetter<C> getter) {
    // Extract context. See W3CTraceContextPropagator for reference implementation.
    return context;
  }
}
```
<!-- prettier-ignore-end -->

## Apêndice

### Registro interno

Os componentes do SDK registram uma variedade de informações no
[java.util.logging](https://docs.oracle.com/javase/7/docs/api/java/util/logging/package-summary.html),
em diferentes níveis de log e usando nomes de loggers baseados no nome
totalmente qualificado da classe _Fully Qualified Class Name - FQDN_ do
respectivo componente.

Por padrão, as mensagens de log são gerenciados pelo manipulador raíz na sua
aplicação. Se você não tem um manipulador raíz personalizado para sua aplicação,
logs de nível `INFO` ou superior serão enviados ao console por padrão.

Você pode querer mudar o comportamento do logger para OpenTelemetry. Por
exemplo, você pode reduzir o nível de logging para fornecer informações
adicionais quando estiver em modo _debugging_, aumentar o nível para uma classe
particular para ignorar erros originados de uma classe, ou instalar um
comportamento personalizado ou filtrar para executar um código personalizado
sempre que o OpenTelemetry registrar uma mensagem específica. Não há uma lista
detalhada de nomes de loggers e informações de log mantida. No entanto, todas as
APIs, SDK, contribuições e componentes de instrumentação compartilham o mesmo
prefixo do pacote `io.opentelemetry.*`. Isso pode ser útil para ativar logs mais
detalhados para todos os `io.opentelemetry.*`, inspecionar a saída, e restringir
aos pacotes ou FQDNs de interesse.

Por exemplo:

```propriedades
## Desligar todos os loggins do OpenTelemetry
io.opentelemetry.level = OFF
```

```propriedades
## Desligar logging somente para o BatchSpanProcessor
io.opentelemetry.sdk.trace.export.BatchSpanProcessor.level = OFF
```

```propriedades
## Registrar mensagens "FINE" para ajudar no *debugging*
io.opentelemetry.level = FINE

## Sets o padrão ConsoleHandler's nível de loggers
## Observe o impacto do logging fora do OpenTelemetry também
java.util.logging.ConsoleHandler.level = FINE
```

Para um controle mais detalhado e tratamento de casos especiais, manipuladores e
filtros personalizados podem ser especificados com código.

```java
// Custom filter which does not log errors which come from the export
public class IgnoreExportErrorsFilter implements java.util.logging.Filter {

 public boolean isLoggable(LogRecord record) {
    return !record.getMessage().contains("Exception thrown by the export");
 }
}
```

```propriedades
## Registrando o filtro personalizado no BatchSpanProcessor
io.opentelemetry.sdk.trace.export.BatchSpanProcessor = io.opentelemetry.extension.logging.IgnoreExportErrorsFilter
```

### Exportadores OTLP

As seções [span exporter](#spanexporter), [metric exporter](#metricexporter), e
[log exporter](#logrecordexporter) descrevem os exportadores OTLP do tipo:

- `OtlpHttp{Signal}Exporter`, que exporta dados via OTLP `http/protobuf`
- `OtlpGrpc{Signal}Exporter`, que exporta dados via OTLP `grpc`

Os exportadores para todos os sinais estão disponíveis via
`io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`, e
possuem uma sobreposição significativa entre as versões `grpc` and
`http/protobuf` do protocolo OTLP, e entre os sinais. As seções a seguir
detalham esses conceitos chave:

- [Emissores](#senders): Uma abstração para diferentes bibliotecas do lado do
  cliente HTTP / gRPC.
- [Autenticação](#authentication) opções para exportadores OTLP.

#### Emissores

Um exportador OTLP depende de várias bibliotecas do lado do cliente para
executar requisições HTTP e gRPC. Não existe uma única biblioteca de cliente
HTTP / gRPC que atenda a todos os casos de uso no ecossistema Java:

- Java 11+ traz o `java.net.http.HttpClient` integrado, mas o
  `opentelemetry-java` precisa oferecer suporte a usuários com o Java 8+, e esse
  cliente não pode ser usado para exportação via `gRPC` devido a ausência de
  suporte para cabeçalhos de trailer.
- [OkHttp](https://square.github.io/okhttp/) fornece um cliente HTTP poderoso
  com suporte para cabeçalhos de trailer, mas depende da biblioteca padrão do
  Kotlin.
- [grpc-java](https://github.com/grpc/grpc-java) oferece sua própria abstração
  `ManagedChannel` com várias
  [implementações de transporte](https://github.com/grpc/grpc-java#transport),
  mas não é adequado para o protocolo `http/protobuf`.

Para atender diversos casos de uso, `opentelemetry-exporter-otlp` usa uma
abstração interna de envio (sender), com uma variedade de implementações para
refletir as restrições da aplicação. Para usar outra implementação, exclua a
dependência padrão `io.opentelemetry:opentelemetry-exporter-sender-okhttp`, e
adicione a dependência alternativa.

| Artefato                                                                                              | Descrição                                                        | Protocolos OTLP         | Padrão |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------- | ------ |
| `io.opentelemetry:opentelemetry-exporter-sender-okhttp:{{% param vers.otel %}}`                       | Implementação baseada em OkHttp.                                 | `grpc`, `http/protobuf` | Yes    |
| `io.opentelemetry:opentelemetry-exporter-sender-jdk:{{% param vers.otel %}}`                          | Implementação baseada em `java.net.http.HttpClient` do Java 11+. | `http/protobuf`         | No     |
| `io.opentelemetry:opentelemetry-exporter-sender-grpc-managed-channel:{{% param vers.otel %}}` **[1]** | Implementação baseada em `ManagedChannel` do `grpc-java`         | `grpc`                  | No     |

**[1]**: Para usar `opentelemetry-exporter-sender-grpc-managed-channel`, você
precisa adicionar uma dependência em
[Implementação de Transporte gRPC](https://github.com/grpc/grpc-java#transport).

#### Autenticação

O exportador OTLP provê mecanismos para autenticação baseada em cabeçalho
estático e dinâmico, e para mTLS.

Se você usa
[Autoconfiguração sem código do](../configuration/#zero-code-sdk-autoconfigure)
com variáveis de ambientes e propriedades do sistema, veja
[propriedades relevantes do sistema](../configuration/#properties-exporters):

- `otel.exporter.otlp.headers` autenticação baseada em cabeçalho estático.
- `otel.exporter.otlp.client.key`, `otel.exporter.otlp.client.certificate` para
  autenticação mTLS.

O trecho de código a seguir demonstra a a configuração programática da
autenticação baseada em cabeçalho estático e dinâmico:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtlpAuthenticationConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.otlp.http.logs.OtlpHttpLogRecordExporter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.function.Supplier;

public class OtlpAuthenticationConfig {
  public static void staticAuthenticationHeader(String endpoint) {
    // If the OTLP destination accepts a static, long-lived authentication header like an API key,
    // set it as a header.
    // This reads the API key from the OTLP_API_KEY env var to avoid hard coding the secret in
    // source code.
    String apiKeyHeaderName = "api-key";
    String apiKeyHeaderValue = System.getenv("OTLP_API_KEY");

    // Initialize OTLP Span, Metric, and LogRecord exporters using a similar pattern
    OtlpHttpSpanExporter spanExporter =
        OtlpHttpSpanExporter.builder()
            .setEndpoint(endpoint)
            .addHeader(apiKeyHeaderName, apiKeyHeaderValue)
            .build();
    OtlpHttpMetricExporter metricExporter =
        OtlpHttpMetricExporter.builder()
            .setEndpoint(endpoint)
            .addHeader(apiKeyHeaderName, apiKeyHeaderValue)
            .build();
    OtlpHttpLogRecordExporter logRecordExporter =
        OtlpHttpLogRecordExporter.builder()
            .setEndpoint(endpoint)
            .addHeader(apiKeyHeaderName, apiKeyHeaderValue)
            .build();
  }

  public static void dynamicAuthenticationHeader(String endpoint) {
    // If the OTLP destination requires a dynamic authentication header, such as a JWT which needs
    // to be periodically refreshed, use a header supplier.
    // Here we implement a simple supplier which adds a header of the form "Authorization: Bearer
    // <token>", where <token> is fetched from refreshBearerToken every 10 minutes.
    String username = System.getenv("OTLP_USERNAME");
    String password = System.getenv("OTLP_PASSWORD");
    Supplier<Map<String, String>> supplier =
        new AuthHeaderSupplier(() -> refreshToken(username, password), Duration.ofMinutes(10));

    // Initialize OTLP Span, Metric, and LogRecord exporters using a similar pattern
    OtlpHttpSpanExporter spanExporter =
        OtlpHttpSpanExporter.builder().setEndpoint(endpoint).setHeaders(supplier).build();
    OtlpHttpMetricExporter metricExporter =
        OtlpHttpMetricExporter.builder().setEndpoint(endpoint).setHeaders(supplier).build();
    OtlpHttpLogRecordExporter logRecordExporter =
        OtlpHttpLogRecordExporter.builder().setEndpoint(endpoint).setHeaders(supplier).build();
  }

  private static class AuthHeaderSupplier implements Supplier<Map<String, String>> {
    private final Supplier<String> tokenRefresher;
    private final Duration tokenRefreshInterval;
    private Instant refreshedAt = Instant.ofEpochMilli(0);
    private String currentTokenValue;

    private AuthHeaderSupplier(Supplier<String> tokenRefresher, Duration tokenRefreshInterval) {
      this.tokenRefresher = tokenRefresher;
      this.tokenRefreshInterval = tokenRefreshInterval;
    }

    @Override
    public Map<String, String> get() {
      return Collections.singletonMap("Authorization", "Bearer " + getToken());
    }

    private synchronized String getToken() {
      Instant now = Instant.now();
      if (currentTokenValue == null || now.isAfter(refreshedAt.plus(tokenRefreshInterval))) {
        currentTokenValue = tokenRefresher.get();
        refreshedAt = now;
      }
      return currentTokenValue;
    }
  }

  private static String refreshToken(String username, String password) {
    // For a production scenario, this would be replaced with an out-of-band request to exchange
    // username / password for bearer token.
    return "abc123";
  }
}
```
<!-- prettier-ignore-end -->

### Testando

[Arquivo JSON Codificado]:
  /docs/specs/otel/protocol/file-exporter/#json-file-serialization
