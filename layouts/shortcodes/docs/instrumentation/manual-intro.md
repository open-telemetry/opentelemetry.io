[Manual instrumentation](/docs/concepts/instrumentation/manual/)
is the process of adding observability code to your application yourself. If you
are developing a standalone service, then you would take a dependency
on the API and the SDK.

If you are developing a library and want it to export telemetry data using
OpenTelemetry, it **must** depend only on the API and should never configure or
depend on the OpenTelemetry SDK.

This way libraries will obtain a real implementation of OpenTelemetry only if
the user application is configured for it and otherwise will function as without
added observability.

For more details, see
[Library Guidelines](/docs/concepts/instrumentation/libraries/).
