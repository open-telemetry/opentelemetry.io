---
default_lang_commit: 1f686d5f7b6bbdfaa30dafdc6ca0214c6f2308db
---

{{ if $noIntegrations }}

> [!IMPORTANT] Help wanted
>
> 現在のところ、OpenTelemetryがネイティブに統合された{{ $name }}ライブラリは把握していません。
> もしそのようなライブラリをご存知でしたら、[お知らせください][new-issue]。

{{ end }}

{{ if not $noIntegrations }}

> [!IMPORTANT] Help wanted
>
> OpenTelemetryがネイティブに統合された{{ $name }}ライブラリをご存知でしたら、[お知らせください][new-issue]。

{{ end }}

[new-issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
