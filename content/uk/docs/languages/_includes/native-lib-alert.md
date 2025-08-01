---
default_lang_commit: 10b2aa9fc1a8f434b6212dc453f01dd520b2f9e3
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
