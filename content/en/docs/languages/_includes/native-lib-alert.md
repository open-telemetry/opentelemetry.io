---
---

{{ if $noIntegrations }}

<div class="alert alert-secondary" role="alert">
<div class="h4 alert-title">Help wanted!</div>

As of today, we don't know about any {{ $name }} library that has
OpenTelemetry natively integrated. If you know about such a library,
[let us know][].

</div>

{{ end }}

{{ if not $noIntegrations }}

<div class="alert alert-info" role="alert">

If you know a {{ $name }} library that has OpenTelemetry natively
integrated, [let us know][].

</div>

{{ end }}

[let us know]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
