---
title: Migration
description: How to migrate to OpenTelemetry
weight: 50
---

## OpenTracing and OpenCensus

OpenTelemetry was created as a merger of OpenTracing and OpenCensus. From the
start, OpenTelemetry was considered [to be the next major version of both
OpenTracing and OpenCensus][]. Because of that, one of the [key goals][] of the
OpenTelemetry project is to provide backward compatibility with OpenCensus and a
migration story for existing users.

If you come from one of these projects, you can follow the migration guides for
both [OpenTracing](./opentracing/) and [OpenCensus](./opencensus/)

## Jaeger Client

The [Jaeger community](https://www.jaegertracing.io/) deprecated their
[Client Libraries](https://www.jaegertracing.io/docs/latest/client-libraries/)
and recommends using the OpenTelemetry APIs, SDKs and instrumentations.

The Jaeger backend can receive trace data via the OpenTelemetry Protocol (OTLP)
since v1.35. Therefore you can migrate your OpenTelemetry SDKs and collectors
from using the Jaeger exporter to the OTLP exporter.

[to be the next major version of both OpenTracing and OpenCensus]:
  https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/
[key goals]:
  https://medium.com/opentracing/merging-opentracing-and-opencensus-f0fe9c7ca6f0
