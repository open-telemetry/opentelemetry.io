---
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

{{ if $noIntegrations }}

> [!IMPORTANT] Help wanted
>
> На сьогоднішній день нам не відомо про жодну бібліотеку {{ $name }} з вбудованою підтримкою OpenTelemetry. Якщо ви знаєте про таку бібліотеку, [дайте нам знати][new-issue].

{{ end }}

{{ if not $noIntegrations }}

> [!IMPORTANT] Потрібна допомога
>
> Якщо ви знаєте про бібліотеку {{ $name }}, яка має вбудовану підтримку OpenTelemetry, [дайте нам знати][new-issue].

{{ end }}

[new-issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
