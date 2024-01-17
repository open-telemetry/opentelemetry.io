<!-- prettier-ignore -->
{{ $lang := .Get 0 -}}
{{ $howMany := .Get 1 | default 10 -}}
{{ $integrations := where (where $.Site.Data.ecosystem.integrations ".components" "intersect" (slice $lang)) ".native" "eq" true -}}

When you develop an app, you make use of third-party libraries and frameworks to
accelerate your work and to not reinvent the wheel. If you now instrument your
app with OpenTelemetry, you don't want to spend additional time on manually
adding traces, logs and metrics to those libraries and frameworks. Fortunately,
you don't have to reinvent the wheel for those either: libraries might come with
OpenTelemetry support natively or you can use an
[Instrumentation Library](/docs/concepts/instrumentation/libraries/) in order to
generate telemetry data for a library or framework.

If you are instrumenting an app, you can learn on this page how to make use of
natively instrumented libraries and Instrumentation Libraries for your
dependencies.

## Use natively instrumented libraries

If a library comes with OpenTelemetry out of the box, you get the traces,
metrics and logs emitted from that library, by adding and setting up the
OpenTelemetry SDK with your app.

The library may provide some additional configuration for the instrumentation.
Go to the documentation of that library to learn more.

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
