---
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

{{ if $noIntegrations }}

> [!IMPORTANT] Colabore conosco
>
> Até o momento, não temos conhecimento de nenhuma biblioteca {{ $name }} que
> possua integração nativa com o OpenTelemetry. Se você souber de alguma,
> [avise-nos][new-issue].

{{ end }}

{{ if not $noIntegrations }}

> [!IMPORTANT] Colabore conosco
>
> Caso saiba de alguma biblioteca {{ $name }} que possua integração nativa com o
> OpenTelemetry, [avise-nos][new-issue].

{{ end }}

[new-issue]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
