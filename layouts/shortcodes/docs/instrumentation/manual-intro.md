[Manual instrumentation](/docs/concepts/instrumentation/manual/) is the act
of adding observability code to your application yourself.

If you're instrumenting an application, you need to use the OpenTelemetry SDK
for your language. You'll then use the SDK to initialize OpenTelemetry and the
API to instrument your code. This will emit telemetry from your app, and any
library you installed that also comes with instrumentation.

If you're instrumenting a library, only install the OpenTelemetry API package
for your language. Your library will not emit telemetry on its own. It will only
emit telemetry when it is part of an application that uses the OpenTelemetry
SDK. For more on instrumenting libraries, see
[Libraries](/docs/concepts/instrumentation/libraries/).

For more information about the OpenTelemetry API and SDK, see the
[specification](/docs/specs/otel/).
