<!-- prettier-ignore -->
{{ $howMany := .Get 1 | default 10 -}}
{{ $langIndex := .Get 0 }}
{{ $lang := index $.Site.Data.instrumentation $langIndex -}}
{{ $integrations := where (slice ) ".language" $langIndex -}}

{{ $integrations := slice }} {{ range $entry := $.Site.Data.registry }}
{{ if and (and (eq $entry.language $langIndex) (eq $entry.isNative true)) (eq $entry.registryType "instrumentation") }}
{{ $integrations = $integrations | append $entry }} {{ end }} {{ end }}

When you develop an app, you might use third-party libraries and frameworks to
accelerate your work. If you then instrument your app using OpenTelemetry, you
might want to avoid spending additional time to manually add traces, logs, and
metrics to the third-party libraries and frameworks you use.

Many libraries and frameworks already support OpenTelemetry or are supported
through OpenTelemetry
[instrumentation](/docs/concepts/instrumentation/libraries/), so that they can
generate telemetry you can export to an observability back end.

If you are instrumenting an app or service that use third-party libraries or
frameworks, follow these instructions to learn how to use natively instrumented
libraries and instrumentation libraries for your dependencies.

## Use natively instrumented libraries

If a library comes with OpenTelemetry support by default, you can get traces,
metrics, and logs emitted from that library by adding and setting up the
OpenTelemetry SDK with your app.

The library might require some additional configuration for the instrumentation.
Go to the documentation for that library to learn more.

{{ partial "docs/native-libraries.md" . }}
