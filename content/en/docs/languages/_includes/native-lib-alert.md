---
---

{{ if $noIntegrations }}

{{% alert title="Help wanted!" color=secondary %}}

As of today, we don't know about any {{ $name }} library that has OpenTelemetry
natively integrated. If you know about such a library, [let us know][].

{{% /alert %}}

{{ end }}

{{ if not $noIntegrations }}

{{% alert color=info %}}

If you know a {{ $name }} library that has OpenTelemetry natively integrated,
[let us know][].

{{% /alert %}}

{{ end }}

[let us know]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
