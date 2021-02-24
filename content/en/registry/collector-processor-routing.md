---
title: Routing Processor
registryType: processor
isThirdParty: false
language: collector
tags:
  - go
  - processor
  - collector
repo: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/routingprocessor
license: Apache 2.0
description: The Routing Processor for the OpenTelemetry Collector will read a header from the incoming HTTP request (gRPC or plain HTTP) and direct the trace information to specific exporters based on the attribute's value.
authors: OpenTelemetry Authors
otVersion: latest
---