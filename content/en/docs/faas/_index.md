---
title: Cloud Functions
description: >-
  OpenTelemetry supports various methods of monitoring Cloud Functions
weight: 2
---

Functions as a Service (FaaS) is an important serverless compute platform for cloud native applications. However, platform quirks usually mean these applications have slightly different monitoring guidance and requirements than applications running on Kubernetes or Virtual Machines.

The initial vendor scope of the FaaS documentation is around Azure, GCP, and AWS functions (lambdas).

### Community Assets

The community currently provides pre-built Lambda layers to quickly add instrumentation or the Collector to your Lambda.

The release status can be tracked in the [OpenTelemetry-Lambda repo](https://github.com/open-telemetry/opentelemetry-lambda).
