---
title: Estendendo instrumentações com a API
linkTitle: Estender com a API
description:
  Use a API do OpenTelemetry em combinação com o Java agent para estender a
  telemetria gerada automaticamente com spans e métricas personalizadas.
weight: 21
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
---

## Introdução {#introduction}

Além da instrumentação pronta para uso, você pode estender o Java agent com
instrumentações manuais personalizadas usando a API do OpenTelemetry. Isso
permite que você crie [trechos](/docs/concepts/signals/traces/#spans) e
[métricas](/docs/concepts/signals/metrics) para o seu próprio código sem
precisar fazer muitas alterações de código.

## Dependências {#dependencies}

Adiciona uma dependência na biblioteca `opentelemetry-api`.

### Maven {#maven}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

### Gradle {#gradle}

```groovy
dependencies {
    implementation('io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}')
}
```

## OpenTelemetry {#opentelemetry}

O Java agent é um caso especial onde `GlobalOpenTelemetry` é definido pelo
agente. Simplesmente chame a função `GlobalOpenTelemetry.get()` para acessar a
instância `OpenTelemetry`.

## Trecho {#span}

{{% alert title="Note" %}}

Para os casos de uso mais comuns, use a notação `@WithSpan` ao invés da
instrumentação manual. Veja [Anotações](../annotations) para mais informações.

{{% /alert %}}

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

Tracer tracer = GlobalOpenTelemetry.getTracer("application");
```

Use o `Tracer` para criar um trecho como explicado na seção de
[trechos](/docs/languages/java/api/#span).

Um exemplo completo pode ser encontrado no [repositório de
exemplos][example repository].

## Medidor {#meter}

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

Meter meter = GlobalOpenTelemetry.getMeter("application");
```

Use o `Meter` para criar contadores, medidores ou histogramas como explicados na
seção de [medidores](/docs/languages/java/api/#meter).

Um exemplo completo pode ser encontrado no [repositório de
exemplos][example repository].

[example repository]:
  https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent
