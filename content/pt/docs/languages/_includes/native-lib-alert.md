---
default_lang_commit: 6eddc725571667e112a41aa7422bcd4c69764503
---

{{ if $noIntegrations }}

{{% alert title="Colabore conosco!" color=secondary %}}

Até o momento, não temos conhecimento de nenhuma biblioteca {{ $name }} que
possua integração com o OpenTelemetry de forma nativa. Se você souber de alguma,
[avise-nos][let us know].

{{% /alert %}}

{{ end }}

{{ if not $noIntegrations }}

{{% alert color=info %}}

Caso saiba de alguma biblioteca {{ $name }} que possua integração com o
OpenTelemetry de forma nativa, [avise-nos][let us know].

{{% /alert %}}

{{ end }}

[let us know]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
