---
title: Getting Started
description: Get started with OpenTelemetry based on your role.
no_list: true
weight: 160
---

OpenTelemetry helps you collect **traces, metrics, logs, and profiles** from your applications and infrastructure and send that telemetry to the systems where you analyze and visualize it.

## Typical telemetry setup

A typical OpenTelemetry setup follows these steps:

1. Instrument an application.
2. Collect telemetry.
3. Export telemetry.
4. Deploy OpenTelemetry.
5. Configure a Collector.
6. Add metrics.
7. Add tracing.
8. Troubleshoot telemetry.

The best way to get started depends on what you are responsible for.

* **Developers** instrument applications and generate telemetry.
* **Operations and platform engineers** collect, process, route, and export telemetry.
* **Teams responsible for both** can start with application instrumentation and then build the telemetry pipeline around it.

If you are new to OpenTelemetry, start with [What is OpenTelemetry?](../what-is-opentelemetry/), then choose the path that best matches your role.

---

## Choose your path

### Developers

**Your goal:** instrument an application and generate useful telemetry.

Start with the [Developer Getting Started](#developer-getting-started) path.

You will learn how to:

1. Choose your programming language.
2. Choose an instrumentation approach.
3. Instrument your application.
4. Generate telemetry.
5. Export telemetry to an observability backend.
6. Verify that telemetry is being received.
7. Add application-specific instrumentation when needed.

### Operations and Platform Engineers

**Your goal:** collect telemetry from applications and infrastructure, process it, and deliver it to your observability backend.

Start with the [Operations Getting Started](#operations-getting-started) path.

You will learn how to:

1. Identify the telemetry sources in your environment.
2. Decide whether you need an OpenTelemetry Collector.
3. Design your telemetry pipeline.
4. Deploy and configure the Collector.
5. Receive, process, and export telemetry.
6. Connect applications and infrastructure to the pipeline.
7. Monitor and troubleshoot the telemetry pipeline.

### Developers and Operations Working Together

If you develop applications and manage the infrastructure around them, you will use both sides of OpenTelemetry.

OpenTelemetry works best when application development and operations are treated as parts of the same observability workflow.

The responsibilities are different, but they connect through the telemetry pipeline.

| Developers                            | Operations and platform engineers             |
| ------------------------------------- | --------------------------------------------- |
| Instrument application code           | Deploy and manage telemetry infrastructure    |
| Generate useful application telemetry | Collect telemetry from multiple sources       |
| Add application-specific context      | Process and route telemetry                   |
| Define useful attributes and events   | Configure exporters and destinations          |
| Verify application instrumentation    | Monitor pipeline health                       |
| Work with application behavior        | Manage scalability, reliability, and security |

<br />

A typical workflow looks like this:

**Application → Instrumentation → Telemetry → Collector → Observability backend**

Developers primarily work on the application and instrumentation side.

Operations and platform engineers primarily work on the collection, processing, transport, and infrastructure side.

The boundaries can vary between organizations. The important point is that both sides contribute to the same observability pipeline.

Start with the [Developer Getting Started](#developer-getting-started) path to instrument an application. Then continue with the [Operations Getting Started](#operations-getting-started) path to build and manage the telemetry pipeline.

---

## Getting Started in Common Environments

The basic OpenTelemetry workflow applies across environments, but the implementation details vary.

### Kubernetes

In Kubernetes environments, OpenTelemetry can be used to collect telemetry from applications, workloads, nodes, and other components.

The [OpenTelemetry Kubernetes documentation](../platforms/kubernetes/) covers Kubernetes-specific approaches and components.

The [OpenTelemetry Operator](../collector/deploy/operator/) can help manage OpenTelemetry Collector deployments and related resources in Kubernetes.

### Linux

Linux hosts can generate telemetry from applications and infrastructure components running on the system.

See the [Linux documentation](../platforms/linux/) for Linux-specific guidance.

### Serverless and FaaS

Serverless applications have different lifecycle and execution characteristics from long-running services.

See the [FaaS documentation](../platforms/faas/) for environment-specific guidance.

### Client-side applications

OpenTelemetry can also be used with client-side applications, including web and mobile applications.

See the [Client-side Applications documentation](../platforms/client-side-apps/) for supported approaches.

---

## Your First OpenTelemetry Implementation

If you are implementing OpenTelemetry for the first time, keep the first setup small.

A practical first implementation can follow these steps:

1. Choose one application.
2. Choose one telemetry signal, such as traces.
3. Use the recommended instrumentation for your language.
4. Generate a small amount of telemetry.
5. Export it to a development or test destination.
6. Verify that the telemetry arrives.
7. Add additional signals.
8. Add custom instrumentation where it provides value.
9. Introduce a Collector if your architecture requires one.
10. Expand the implementation to additional applications and environments.

This approach lets you validate each part of the observability pipeline before introducing additional complexity.

---

## Try OpenTelemetry with the Demo

If you want to see OpenTelemetry working before instrumenting your own application, use the [OpenTelemetry demo][demo].

The Demo provides a complete example environment with multiple services and telemetry signals.

It is useful for understanding how:

* Applications generate telemetry.
* Services are connected through distributed traces.
* Metrics are collected.
* Logs are generated and correlated.
* Telemetry moves through an OpenTelemetry pipeline.
* Observability backends display the resulting data.

If you are learning OpenTelemetry for the first time, the Demo can provide a practical overview before you begin working with your own application or infrastructure.

---

## Where to Go Next

Choose the next topic based on what you want to accomplish.

### OpenTelemetry fundamentals

Start with [What is OpenTelemetry?](../what-is-opentelemetry/) and then read [Concepts](../concepts/).

### Instrument an application

Continue with [Language APIs and SDKs](../languages/) and choose your programming language.

### Automate instrumentation

See [Zero-code Instrumentation](../zero-code/).

### Add instrumentation to application code

See [Code-based Instrumentation](../concepts/instrumentation/code-based/).

### Deploy a Collector

Continue with the [OpenTelemetry Collector documentation](../collector/).

### Collect telemetry in Kubernetes

See the [Kubernetes documentation](../platforms/kubernetes/).

### Telemetry signals

Read about [Signals](../concepts/signals/).

### I want to understand how telemetry should be structured

Read about [Semantic Conventions](../concepts/semantic-conventions/).

### Demo example

Try the [OpenTelemetry demo][demo].

---

## Quick Reference

| If you want to...                    | Start here                                                            |
| ------------------------------------ | --------------------------------------------------------------------- |
| Learn what OpenTelemetry is          | [What is OpenTelemetry?](../what-is-opentelemetry/)                   |
| Instrument an application            | [Language APIs and SDKs](../languages/)                               |
| Use automatic instrumentation        | [Zero-code Instrumentation](../zero-code/)                            |
| Add custom instrumentation           | [Code-based Instrumentation](../concepts/instrumentation/code-based/) |
| Understand traces, metrics, and logs | [Signals](../concepts/signals/)                                       |
| Collect telemetry centrally          | [OpenTelemetry Collector](../collector/)                              |
| Deploy a Collector                   | [Collector deployment](../collector/deploy/)                          |
| Run OpenTelemetry in Kubernetes      | [Kubernetes](../platforms/kubernetes/)                                |
| Understand telemetry structure       | [Semantic Conventions](../concepts/semantic-conventions/)             |
| See OpenTelemetry in action          | [OpenTelemetry demo][demo]demo/)                                        |

## Keep learning

Once you have successfully generated and received your first telemetry, move from the basic setup to the parts of OpenTelemetry that match your environment.

Developers can explore language-specific instrumentation, APIs, SDKs, and semantic conventions.

Operations and platform engineers can explore Collector deployment, configuration, scaling, security, and monitoring.

For a deeper understanding of how the pieces fit together, continue with [Concepts](../concepts/) and the relevant language, platform, and Collector documentation.

[demo]: /ecosystem/demo/
[let us know]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new?title=Add%20a%20new%20persona:%20My%20Persona&body=Provide%20a%20description%20of%20your%20role%20and%20responsibilities%20and%20what%20your%20observability%20goals%20are 


<!-- Select a role[^1] to get started:

<div class="l-get-started-buttons justify-content-start mt-3 ms-3">

- [Dev](dev/)
- [Ops](ops/)

</div>

You can also try out the official [OpenTelemetry demo][demo] to _see_ what
observability with OpenTelemetry looks like!

<div class="l-primary-buttons justify-content-start mt-3 mb-5 ms-3">

- [Try the demo][demo]

</div>

[^1]: If none of these roles apply to you, [let us know][].

[demo]: /ecosystem/demo/
[let us know]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new?title=Add%20a%20new%20persona:%20My%20Persona&body=Provide%20a%20description%20of%20your%20role%20and%20responsibilities%20and%20what%20your%20observability%20goals%20are -->
