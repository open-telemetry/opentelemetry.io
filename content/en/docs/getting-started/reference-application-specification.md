---
title: Specification for the reference application
linkTitle: Reference App Spec
description:
  This document contains the specification for the reference application that is
  used across the Getting Started guide
toc_hide: true
cspell:ignore: uninstrumented rolldice
---

The purpose of the reference application is to have a standardized sample
application that can be implemented in all languages for which an OpenTelemetry
SDK exists.

## General requirements

- Implementations of the Reference App are owned by language SIGs implementing
  the OpenTelemetry APIs and SDKs. This ensures that the application follows
  best practices of the language's ecosystem and we can provide a blueprint for
  how an application should be instrumented.
- There must be an uninstrumented and instrumented version of the application.
  This will be used in the "Getting Started" guide on opentelemetry.io to go
  from an app without OpenTelemetry to one which is fully instrumented.
- There must be a language-specific CI action that verifies the application
  builds and runs in both versions.
- The application must be runnable from a command line interface.
- There must be a Dockerfile to run the application within a containerized
  environment.
- The application must run standing alone. In other words, it cannot take hard
  dependencies on any other content of the repository enclosing it. This allows
  users to copy the code into their own project without untangling the
  dependency management.

## Service requirements

- The application must listen at port 8080 for HTTP requests by default. The
  port should be configurable via the environment variable APPLICATION_PORT.
- For handling the HTTP requests, a library should be used for which an
  instrumentation library is available. The application must provide the
  endpoint `/rolldice?rolls=<n>` via `GET` (and optionally `POST`) and return
  the following HTTP status codes and JSON results:
  - if `rolls` is not set or has a valid input (positive integer > 0): status
    code `200` and either a single number between 1 and 6 if `rolls` is not set
    or 1, or an array of `n` numbers between 1 and 6 where `n` is the value of
    `rolls`
  - if `rolls` is set to an invalid input (not a number): status code `400` and
    `{"status": "error", "message": "Parameter rolls must be a positive integer"}`
  - if `rolls` is set to a `0` or a negative integer: status code `500` and no
    JSON output. The error examples will be used to demonstrate how
    OpenTelemetry can be used to identify errors.
- There may be an optional attribute `player=name` to the `/rolldice` endpoint.
- The application must output the following log lines:
  - an INFO-level message for each HTTP request with a status code `<400`
  - a WARN-level message for each HTTP request with a status code between `400`
    and `499`, including the message which will be sent in the JSON result
  - a ERROR-level message for each HTTP request with a status code above `499`
  - if the optional `player` attribute is set, a DEBUG-level message that
    outputs the value of `player` and the rolled number
  - if the optional `player` attribute is not set, a DEBUG-level message that
    outputs the static value `anonymous player` and the rolled number. The log
    lines will be used to add a log bridge during instrumentation to demonstrate
    how OpenTelemetry can connect to existing logging frameworks.
- The code of the application must be split into two files:
  - an `app` file that contains the handling of the HTTP requests
  - a `library` file that contains the implementation of the roll dice function.
    The names of those files should be idiomatic within the implementing
    language, like `app.js` and `roll-the-dice.js`. The important point is that
    by separating the two, the code demonstrates that the `library` only takes
    dependency on the API and all the SDK code is initalized in the `app` code.
- Error handling for `rolls` should be split as follows:
  - the `app` checks if `rolls` is defined, and if not, sets it to `1`.
  - the `app` only checks if `rolls` is a number. If yes, it calls the function
    for rolling the dice in `library`. If no, it does the error handling with a
    `400` error.
  - the `library` checks if `rolls` is a positive number. If no, it throws an
    exception. `app` is catching the error and sending back the `500` error.
- The `library` should have an outer function that does the error handling as
  described above. The outer function then does the following depending on the
  value of `rolls`:
  - `rolls == 1`: Run the inner function once and return the value.
  - `rolls > 1`: Run a loop which calls the inner function `rolls` time and
    return the results in an array.
- The inner function of `library` is creating the random number between 1 and 6
  and returns that value.

## Instrumentation requirements

- If possible, the initialization for the OpenTelemetry SDK should be contained
  in a separate file and imported within the `app` file. Otherwise, it should be
  part of the `app` file.
- Common resource detectors should be loaded in the initialization, e.g. for
  `process`, `container`, `os`, ...
- The "lib" file must depend only on the OpenTelemetry API.
- The `service.*` attributes should be added via environment variables
  (`OTEL_SERVICE_NAME`, `OTEL_RESOURCE_ATTRIBUTES`).
- Other `resource detectors` should be added to the initialization of the SDK.
- For exporting telemetry the application should use an exporter for
  `stdout`/`console` and `otlp`.
- There should be an option to enable diagnostic logging for the OpenTelemetry
  components, if implemented ideally via `OTEL_LOG_LEVEL`.
- There should be a way to add the instrumentation library for the used HTTP
  library. This instrumentation library should use the stable semantic
  conventions for HTTP. Prefer a library with a coverage for most signals,
  ideally they have traces and metrics.
- If no instrumentation library is available, only then the function in `app`
  which handles the `/rolldice` endpoint is instrumented by the user by adding a
  span and metrics.
- There should be a log bridge for the used logging mechanism such that all logs
  are automatically collected and exported.
- There should be a span created for the outer function in `library`. The span
  tracks the time of the function. It records the exception if thrown. It adds
  attributes to the span like the value of `rolls`, `code.*`, ...
- There should be a span created for the inner function in `library`. The span
  tracks the time of the function. It adds the random number it generated as an
  attribue to the span.
- In the `library` file the following metrics should be created:
  - a counter for the calls of the outer function
  - a histogram for the distribution of the outcomes (1-6)
  - a gauge for the last value of `rolls`
