---
title: Supporting Jaeger with native OTLP
linkTitle: Jaeger OTLP support
date: 2022-11-03
author: >-
  [Jason Plumb](https://github.com/breedx-splk) (Splunk)
---

Back in May of 2022, the Jaeger project
[announced native support for the OpenTelemetry Protocol](https://medium.com/jaegertracing/introducing-native-support-for-opentelemetry-in-jaeger-eb661be8183c)
(OTLP). This followed a
[generous deprecation cycle](https://twitter.com/YuriShkuro/status/1455170693197402119)
for the Jaeger client libraries across many languages. With these changes,
OpenTelemetry users are now able to send traces into Jaeger with
industry-standard OTLP, and the Jaeger client library repositories have been
finally archived.

We intend to **deprecate Jaeger exporters from OpenTelemetry** in the near
future, and are looking for your feedback to determine the length of the
deprecation phase. The best way to provide feedback is by
[filling out a 4-question survey](https://forms.gle/aUuJg5DQwNzncJ4s8) or
commenting on
[the existing draft pull request](https://github.com/open-telemetry/opentelemetry-specification/pull/2858).

## OpenTelemetry Support

This interoperability is a wonderful victory both for Jaeger users and for
OpenTelemetry users. However, we're not done yet. The OpenTelemetry
specification still requires support for Jaeger client exporters across
languages.

This causes challenges for both Jaeger users and OpenTelemetry maintainers:

1. **Confusing Choices**

   Currently, users are faced with a choice of exporter (Jaeger or OTLP), and
   this can be a source of confusion. A user might be inclined, when exporting
   telemetry to Jaeger, to simply choose the Jaeger exporter because the name
   matches (even though Jaeger now actively encourages the use of OTLP).

   If we can eliminate this potentially confusing choice, we can improve the
   user experience and continue standardizing on a single interoperable
   protocol. We love it when things "just work" out of the box!

2. **Maintenance and duplication**

   Because the Jaeger client libraries are now archived, they will not receive
   updates (including security patches). To continue properly supporting Jaeger
   client exporters, OpenTelemetry authors would be required to re-implement
   some of the functionality it had previously leveraged from the Jaeger
   clients.

   Now that Jaeger supports OTLP, this feels like a step backwards: It results
   in an increased maintenance burden with very little benefit.

### User Impact

The proposal is to deprecate the following exporters from OpenTelemetry in favor
of using native OTLP into Jaeger:

- Jaeger Thrift over HTTP
- Jaeger protobuf via gRPC
- Jaeger Thrift over UDP

In addition to application configuration changes, there could be other
architectural considerations. HTTP and gRPC should be straightforward
replacements, although it may require exposing ports 4317 and 4318 if they are
not already accessible.

Thrift over UDP implies the use of the
[Jaeger Agent](https://www.jaegertracing.io/docs/1.24/architecture/#agent).
Users with this deployment configuration will need to make a slightly more
complicated change, typically one of the following:

1. Direct ingest. Applications will change from using Thrift+UDP to sending OTLP
   traces directly to their `jaeger-collector` instance. This may also have
   sampling implications.
2. Replacing the Jaeger Agent with a sidecar
   [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector)
   instance. This could have sampling implications and requires changes to your
   infrastructure deployment code.

## Intent to Deprecate - We'd Like Your Feedback!

In order to better support users and the interop between OpenTelemetry and
Jaeger, we intend to deprecate and eventually remove support for Jaeger client
exporters in OpenTelemetry.

We would like your feedback! We want to hear from users who could be impacted by
this change. To better make a data-informed decision,
[we have put together a short 4-question survey](https://forms.gle/aUuJg5DQwNzncJ4s8).

Your input will help us to choose how long to deprecate before removal.

A
[draft PR has been created in the specification](https://github.com/open-telemetry/opentelemetry-specification/pull/2858)
to support this deprecation. If would like to contribute and provide feedback,
visit the link above and add some comments. We want to hear from you.
