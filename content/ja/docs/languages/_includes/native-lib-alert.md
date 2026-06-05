---
default_lang_commit: c87c4cd1a007500700746c184918add6456175c3
---

{{ if $noIntegrations }}

> [!IMPORTANT] ヘルプ募集中
>
> 現在のところ、OpenTelemetry がネイティブに統合された {{ $name }} ライブラリは把握していません。
> もしそのようなライブラリをご存知でしたら、[お知らせください][new-issue]。

{{ end }}

{{ if not $noIntegrations }}

> [!IMPORTANT] ヘルプ募集中
>
> OpenTelemetry がネイティブに統合された {{ $name }} ライブラリをご存知でしたら、[お知らせください][new-issue]。

{{ end }}

[new-issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
