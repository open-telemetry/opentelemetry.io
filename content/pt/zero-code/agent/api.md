---
title: Extending instrumentations with the API
linkTitle: Extend with the API
description:
  Use the OpenTelemetry API in combination with the Java agent to extend the
  automatically generated telemetry with custom spans and metrics
weight: 21
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
---

## Introdução {#introduction}

In addition to the out-of-the-box instrumentation, você pode estender o Java
agent com instrumentações manuais personalizadas usando a API do OpenTelemetry.
Isso permite que você crie [trechos](/docs/concepts/signals/traces/#spans) e
[métricas](/docs/concepts/signals/metrics) para o seu próprio código sem
precisar fazer muitas alterações de código.

## Dependências

Adiciona uma dependência na biblioteca `opentelemetry-api`.

### Maven

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

### Gradle

```groovy
dependencies {
    implementation('io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}')
}
```

## OpenTelemetry

O Java agent é um caso especial onde `GlobalOpenTelemetry` é definido pelo
agente. Uma simples chamada `GlobalOpenTelemetry.get()` para acessar a instância
`OpenTelemetry`.

## Trecho

{{% alert title="Note" %}}

Para os casos de uso mais comum, use a notação `@WithSpan` ao invés da
instrumentação manual. Veja [Anotações](../annotations) para mais informações.

{{% /alert %}}

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

Tracer tracer = GlobalOpenTelemetry.getTracer("application");
```

Use o `Tracer` para criar um trecho como explicado na seção de
[trechos](/docs/languages/java/api/#span).

Um exemplo completo pode ser encontrado no [repositório de exemplos].

## Medidor

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

Meter meter = GlobalOpenTelemetry.getMeter("application");
```

Use o `Meter` para criar contadores, medidores ou histogramas como explicados na
seção de [medidores](/docs/languages/java/api/#meter).

Um exemplo completo pode ser encontrado no [repositório de exemplos].

[repositório de exemplos]:
  https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent
