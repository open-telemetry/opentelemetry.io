---
title: Functions as a Service
description: >-
  OpenTelemetry supports various methods of monitoring Functions as a Service
  provided by different cloud vendors
weight: 2
---

Functions as a Service (FaaS) is an important serverless compute platform for
cloud native applications. However, platform quirks usually mean these
applications have slightly different monitoring guidance and requirements than
applications running on Kubernetes or Virtual Machines.

The initial vendor scope of the FaaS documentation is around Azure, GCP, and AWS
functions (Lambdas).

### Community Assets

The community currently provides pre-built Lambda layers able to auto-instrument
your application as well as a the option of standalone Collector Lambda layer
that can be used when instrumenting applications manually or automatically.

The release status can be tracked in the
[OpenTelemetry-Lambda repository](https://github.com/open-telemetry/opentelemetry-lambda).

- [Get started with the Collector Lambda Layer](./lambda-collector)
- [Auto-instrumentation](./lambda-auto-instrument)
- [Manual instrumentation](./lambda-manual-instrument)
