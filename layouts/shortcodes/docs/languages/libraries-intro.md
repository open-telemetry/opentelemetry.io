<!-- prettier-ignore -->
{{ $lang := .Get 0 -}}
{{ $howMany := .Get 1 | default 10 -}}
{{ $integrations := where (where $.Site.Data.ecosystem.integrations ".components" "intersect" (slice $lang)) ".native" "eq" true -}}

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

{{ range first $howMany (sort $integrations "name") -}}

<!-- prettier-ignore -->
- [{{ .name }}]({{ .docsUrl }})
{{- end }}

{{ if eq (len $integrations) 0 -}}

<div class="alert alert-secondary" role="alert">
<h4 class="alert-title">Help wanted!</h4>
As of today, we don't know about any {{ $lang }} library that has OpenTelemetry
natively integrated. If you know about such a library,
<a href="https://github.com/open-telemetry/opentelemetry.io/issues/new" target="_blank" rel="noopener" class="external-link">let us know</a>.
</div>
{{ else -}}
<div class="alert alert-info" role="alert">
If you know a {{ $lang }} library that has OpenTelemetry
natively integrated,
<a href="https://github.com/open-telemetry/opentelemetry.io/issues/new" target="_blank" rel="noopener" class="external-link">let us know</a>.
</div>
{{ end -}}
