---
title: Getting Started
description: >-
  Depending on your role, you might be looking for a different way to get 
  started with OpenTelemetry. Find your way on how to get started with
  OpenTelemetry.
spelling: cSpell:ignore otel
aliases: [/about, /docs/concepts/overview, /otel]
weight: 1
---

Before you deep dive into your role specific _Getting Started_, you can try out
our official [OpenTelemetry Demo](/docs) to **see** how observability with
OpenTelemetry looks like.

If none of the roles below is applicable to you, [let us know](https://github.com/open-telemetry/opentelemetry.io/issues/new?title=Add%20a%20new%20persona:%20My%20Persona&body=Provide%20a%20description%20of%20your%20role%20and%20responsibilities%20and%20what%20your%20observability%20goals%20are)

## Operations

> I operate a set of applications in production.
>
> My goal is to get telemetry out of them without touching their code.
>
> I want to collect traces, metrics, and logs from several services and
> send them off to my observability backend easily

OpenTelemetry can help you with that! To get you started, learn ...

* ... [what OpenTelemetry is][].
* ... [how you can instrument applications without touching their code][]
* ... [how you can setup a collector][]
* ... [how you can get automation for Kubernetes with the OpenTelemetry Operator & helm charts.](/docs)
* ... [how you can get automation for your existing tooling (Chef, Ansible, ...)](/docs)

## Application Developer

> I write code for my organization's apps and services.
>
> My goal is to get observability for my application by writing code.
>
> I want to have my dependencies emiting telemetry for me automatically.

OpenTelemetry can help you with that! To get you started, learn ...

* ... [what OpenTelemetry is][].
* ... [how you can instrument your application automatically][]
* ... [how you can instrument your application manually](/docs)
* ... [how you can get your dependencies instrumented](/docs)
* ... [how you can send telemetry off to an observability backend for better debugging experience](/docs)

## Library Developer

> I write the code of libraries that are used by application developers.
>
> My goal is to provide telemetry for my library to those other developers natively.

OpenTelemetry can help you with that! To get you started, learn ...

* ... [what OpenTelemetry is][].
* ... [how you can instrument your library](/docs)
* ... [what the impact is on my library](/docs)


[what OpenTelemetry is]: /docs/concepts/what-is-opentelemetry/
[how you can instrument your application automatically]: /docs/concepts/instrumenting/#automatic-instrumentation
[how you can instrument applications without touching their code]: /docs/concepts/instrumenting/#automatic-instrumentation
[how you can setup a collector]: /docs/collector