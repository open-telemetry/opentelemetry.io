[Manual instrumentation](/docs/concepts/instrumentation/manual/)
is the process of adding observability code to your application yourself.
To do so, you need to import OpenTelemetry to your code. If you're
developing a library or some other component that is intended to be consumed by
a runnable binary, then you would only take a dependency on the API, because
unless the OpenTelemetry SDK, the instrumentation does nothing and does not
impact software performance. For more details, on instrumenting libraries read
[these guidelines](/docs/concepts/instrumentation/libraries/).

If your artifact is a standalone service, then you would take a dependency on
the API and the SDK.

For more information about the OpenTelemetry API and SDK,
see the [specification](/docs/specs/otel/).
