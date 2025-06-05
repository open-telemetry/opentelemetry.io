---
title: Specification for the reference application
linkTitle: Reference App Spec
description:
  This document contains the specification for the reference application that is
  used across the Getting Started guide
toc_hide: true
---

# General requirements

- Implementations of the Reference App are owned by language SIGs implementing
  the OpenTelemetry APIs and SDKs.
- There must be an uninstrumented and instrumented version of the application.
- There must be a language-specific CI action that verifies the
  application builds and runs in both versions.
- The application must be runnable from a command line interface.
- There must be a Dockerfile to run the application within a containerized
  environment.
- The application must run standing alone. In other words, it cannot take hard dependencies
  on any other content of the repository enclosing it.

## Service requirements

- The application must listen at port 8080 for HTTP requests by default. The
  port should be configurable via the environment variable APPLICATION_PORT.
- For handling the HTTP requests, a library should be used for which an
  instrumentation library is available. The application must provide the
  endpoint `/rolldice?rolls=<n>` via `GET` (and optionally `POST`) and return
  the following HTTP status codes and JSON results: - if `rolls` is not set or
  has a valid input (positive integer > 0): status code `200` and either a
  single number between 1 and 6 if `rolls` is not set or 1, or an array of `n`
  numbers between 1 and 6 where `n` is the value of `rolls` - if `rolls` is set
  to an invalid input (not a number): status code `400` and
  `{"status": "error", "message": "Parameter rolls must be a positive integer"}` -
  if `rolls` is set to a negative integer: status code `500` and no JSON output.
- The application must output the following log lines using a language-specific
  common logging framework:
  - an INFO-level message for each HTTP request with a status code <400
  - a WARN-level message for each HTTP request with a status code between 400
    and 400, including the message which will be sent in the JSON result
  - a ERROR-level message for each HTTP request with a status code above 499
  - a DEBUG-level message for each dice roll containing the rolled number
- The code of the application must be split into two files:
  - an "app" file that contains the handling of the HTTP requests
  - a "lib" file that contains the implementation of the roll dice function.

## Instrumentation requirements

- If possible, the initialization for the OpenTelemetry SDK should be contained
  in a separate file and imported within the "app" file. Otherwise, it should be
  part of the "app" file.
- The "lib" file must depend only on the OpenTelemetry API.
- The `service.*` attributes should be added via environment variables
  (`OTEL_SERVICE_NAME`, `OTEL_RESOURCE_ATTRIBUTES`).
- The exporters for all signals should be set via environment variables. At a
  minimum, a console output and OTLP export must be supported that way.
- There should be an option to enable diagnostic logging for the OpenTelemetry
  components, ideally via `OTEL_LOG_LEVEL`.
- There should be a way to add the instrumentation library for the used HTTP
  library. This instrumentation library should use the stable semantic
  conventions for HTTP.
- There should be a log bridge for the used logging mechanism such that all logs
  are automatically collected and exported.

## TODO

- Add spans
- Add metric measurements
- Add resource detectors
- Look into context propagation (+ baggage)
