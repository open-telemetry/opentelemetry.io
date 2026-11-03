---
title: Migrație
description: Cum să migrezi la OpenTelemetry
aliases: [/docs/migration/]
weight: 300
default_lang_commit: f59ee85b6013fd0bcda3e17337113d76370a803a
---

## OpenTracing și OpenCensus {#openTracing-and-openCensus}

OpenTelemetry a luat naștere prin fuziunea dintre OpenTracing și OpenCensus.
Încă de la început, OpenTelemetry a fost considerat [următoarea versiune majoră
atât pentru OpenTracing, cât și pentru
OpenCensus][to be the next major version of both OpenTracing and OpenCensus].
Din acest motiv, unul dintre [obiectivele principale][key goals] ale proiectului
OpenTelemetry este asigurarea compatibilității cu versiunile anterioare pentru
ambele proiecte, precum și oferirea unei strategii de migrare pentru
utilizatorii existenți.

Dacă provii dinspre unul dintre aceste proiecte, poți consulta ghidurile de
migrare atât pentru [OpenTracing](opentracing/), cât și pentru
[OpenCensus](opencensus/).

## Clientul Jaeger {#jaeger-client}

Comunitatea [Jaeger](https://www.jaegertracing.io/) a marcat bibliotecile sale
client ca fiind învechite și recomandă
[migrarea](https://www.jaegertracing.io/docs/latest/migration/) către API-urile,
SDK-urile și instrumentațiile OpenTelemetry.

Începând cu versiunea 1.35, backend-ul Jaeger poate primi date despre urme
utilizând protocolul OpenTelemetry (OTLP). Poți migra SDK-urile și colectoarele
(Collectors) OpenTelemetry de la utilizarea exportatorului Jaeger la cea a
exportatorului OTLP.

[to be the next major version of both OpenTracing and OpenCensus]:
  https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/
[key goals]:
  https://medium.com/opentracing/merging-opentracing-and-opencensus-f0fe9c7ca6f0
