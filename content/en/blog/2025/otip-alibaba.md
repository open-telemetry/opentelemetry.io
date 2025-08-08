---
title: "OTel in Practice: Alibaba's OpenTelemetry Journey"
linkTitle: 'OTiP: Alibaba'
date: 2025-08-07
author: >-
  [Dan Gomez Blanco](https://github.com/danielgblanco) (New Relic)
sig: End-User
cSpell:ignore: Huxing Quesma youtube Zhang
---

In the latest session of
[OTel in Practice](/community/end-user/otel-in-practice/), engineers
[Huxing Zhang](https://github.com/ralf0131) and
[Steve Rao](https://github.com/steverao) shared Alibaba's journey adopting
OpenTelemetry within their services.

The discussion focused on a wide range of topics, from Java agents to Go
compile-time instrumentation, and of course Gen-AI observability!

Focusing on Java, Alibaba initially used an in-house solution based on Pinpoint,
but faced limitations with framework support and asynchronous context
propagation. It was then that they decided to migrate to OpenTelemetry to
leverage its strong ecosystem and status as an industry standard.

They took us through their migration process, how they first forked the OTel
Java agent to quickly add necessary custom features, such as profiling
capabilities and support for frameworks popular in China, and how they now moved
onto a more maintainable model that relies on the official/upstream agent
directly, bundling it in with the rest of their custom extensions.

Another key innovation they shared is their Go compile-time instrumentation
approach, which provides automatic instrumentation for Go applications without
requiring any code changes. This project has been donated to the OTel community
and is now a
[collaborative effort between Alibaba, Datadog, and Quesma](/blog/2025/go-compile-time-instrumentation/).

OpenTelemetry is now widely used at Alibaba, providing end-to-end observability
for cloud services and modern applications, and the team remains committed to
contributing their enhancements back to the upstream project.

Thanks Huxing and Steve for joining us. Catch up on the recording below!

<div class="td-max-width-on-larger-screens">
{{< youtube fgbB0HhVBq8 >}}
</div>
