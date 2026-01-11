---
default_lang_commit: d9b41af1f01873cce900ce37f1c07afb2758f028
---

{{ if $noIntegrations }}

{{% alert title="Help wanted!" color=secondary %}}

На сьогоднішній день нам не відомо про жодну бібліотеку {{ $name }} з вбудованою підтримкою OpenTelemetry. Якщо ви знаєте про таку бібліотеку, [дайте нам знати][let us know].

{{% /alert %}}

{{ end }}

{{ if not $noIntegrations }}

{{% alert color=info %}}

Якщо ви знаєте про бібліотеку {{ $name }}, яка має вбудовану підтримку OpenTelemetry, [дайте нам знати][let us know].

{{% /alert %}}

{{ end }}

[let us know]: https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
