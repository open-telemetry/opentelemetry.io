---
title: Supporting Jaeger with native OTLP
linkTitle: Jaeger OTLP support
date: 2022-10-20
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

We intend to deprecate Jaeger exporters from OpenTelemetry in the near future,
and are looking for your feedback to determine the length of the depreation
phase. The best way to provide feedback is by commenting on
[the existing draft pull request](https://github.com/open-telemetry/opentelemetry-specification/pull/2858).

## OpenTelemetry Support

This interoperability is a wonderful victory both for Jaeger users and for
OpenTelemetry users. However, we're not done yet. The OpenTelemetry
specification still requires support for Jaeger client exporters across
languages.

This causes challenges for both Jaeger users and OpenTelemetry maintainers.

### #1. Confusing Choices

Currently, users are faced with a choice of exporter (Jaeger or OTLP), and this
can be a source of confusion. A user might be inclined, when exporting telemetry
to Jaeger, to simply choose the Jaeger exporter because the name matches (even
though Jaeger now actively encourages the use of OTLP).

If we can eliminate this potentially confusing choice, we can improve the user
experience and continue standardizing on a single interoperable protocol. We
love it when things "just work" out of the box!

### #2. Maintenance and Duplication

Because the Jaeger client libraries are now archived, they will not receive
updates (including security patches). To continue properly supporting Jaeger
client exporters, OpenTelemetry authors would be required to re-implement some
of the functionality it had previously leveraged from the Jaeger clients.

Now that Jaeger supports OTLP, this feels like a step backwards: It results in
an increased maintenance burden with very little benefit.

## Intent to Deprecate

In order to better support users and the interop between OpenTelemetry and
Jaeger, we intend to deprecate and eventually remove support for Jaeger client
exporters in OpenTelemetry.

We would like your feedback! We want to hear from users who could be impacted by this
change.

- Are you an OpenTelemetry user currently sending data to Jaeger?
- Are you using the Jaeger client exporters, or have you already made the switch
  to OTLP?
- How painful will it be for you to migrate to native OTLP with Jaeger?
- Are you using the Jaeger agent? Can you use a collector sidecar instead?
- How much time do you think you need to migrate?

Your input will help us to choose how long to deprecate before removal.

A
[draft PR has been created in the specification](https://github.com/open-telemetry/opentelemetry-specification/pull/2858)
to support this deprecation. If would like to contribute and provide feedback,
visit the link above and add some comments. We want to hear from you.
