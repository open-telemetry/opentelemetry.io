---
title: Resurse
weight: 70
default_lang_commit: f5b3c44e7ed3e98a7307379e8c867750dd2f1dea
---

## Introducere {#introduction}

{{% docs/languages/resources-intro %}}

Dacă utilizezi [Jaeger](https://www.jaegertracing.io/) ca backend de
observabilitate, atributele de resursă sunt grupate în fila **Process**:

![O captură de ecran din Jaeger care prezintă un exemplu de atribute de resursă asociate unui trace](screenshot-jaeger-resources.png)

O resursă este asociată unui `TracerProvider` sau `MetricProvider` în momentul
creării acestora, în timpul inițializării. Această asociere nu mai poate fi
modificată ulterior. După asocierea resursei, toate span-urile și metricile
produse de un `Tracer` sau `Meter` al furnizorului respectiv vor avea asociată
aceeași resursă.

## Atribute semantice cu valori implicite furnizate de SDK {#semantic-attributes-with-sdk-provided-default-value}

SDK-ul OpenTelemetry furnizează anumite atribute în mod implicit. Unul dintre
acestea este `service.name`, care reprezintă numele logic al serviciului. În mod
implicit, SDK-urile atribuie valoarea `unknown_service` acestui atribut. De
aceea, se recomandă setarea explicită a acestuia, fie în cod, fie prin variabila
de mediu `OTEL_SERVICE_NAME`.

În plus, SDK-ul furnizează următoarele atribute de resursă pentru a se
identifica: `telemetry.sdk.name`, `telemetry.sdk.language` și
`telemetry.sdk.version`.

## Detectoare de resurse {#resource-detectors}

Majoritatea SDK-urilor pentru diferite limbaje de programare oferă un set de
detectoare de resurse care pot identifica automat informații despre resurse din
mediul în care rulează aplicația. Printre detectoarele de resurse uzuale se
numără:

- [Sistem de operare](/docs/specs/semconv/resource/os/)
- [Host](/docs/specs/semconv/resource/host/)
- [Proces și mediu de execuție](/docs/specs/semconv/resource/process/)
- [Container](/docs/specs/semconv/resource/container/)
- [Kubernetes](/docs/specs/semconv/resource/k8s/)
- [Atribute specifice furnizorului de cloud](/docs/specs/semconv/resource/#cloud-provider-specific-attributes)
- [Și altele](/docs/specs/semconv/resource/)

## Resurse personalizate {#custom-resources}

Poți defini și propriile atribute de resursă, fie în cod, fie prin setarea
variabilei de mediu `OTEL_RESOURCE_ATTRIBUTES`. Dacă este cazul, utilizează
[convențiile semantice pentru atributele de resursă](/docs/specs/semconv/resource).

De exemplu, poți specifica numele
[mediului de deployment](/docs/specs/semconv/resource/deployment-environment/)
folosind `deployment.environment.name`:

```shell
env OTEL_RESOURCE_ATTRIBUTES=deployment.environment.name=production yourApp
```
