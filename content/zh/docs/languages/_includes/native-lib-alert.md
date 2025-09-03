---
default_lang_commit: 788277e362bc602b72a90aa9191f9c05c403458e
---

{{ if $noIntegrations }}

{{% alert title="需要帮助！" color=secondary %}}

截至目前，我们还不知道有任何 {{ $name }} 库已原生集成 OpenTelemetry。
如果你知道这样的库，[请告诉我们][let us know]。

{{% /alert %}}

{{ end }}

{{ if not $noIntegrations }}

{{% alert color=info %}}

如果你知道某个 {{ $name }} 库已原生集成了 OpenTelemetry，[请告诉我们][let us know]。

{{% /alert %}}

{{ end }}

[let us know]: https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
