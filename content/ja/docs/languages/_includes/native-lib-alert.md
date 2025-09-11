---
default_lang_commit: 5fdcac03a4be4f063089a72a82348ec90cce9874
---

{{ if $noIntegrations }}

{{% alert title="ヘルプ募集中！" color=secondary %}}

現在のところ、OpenTelemetryがネイティブに統合された{{ $name }}ライブラリは把握していません。
もしそのようなライブラリをご存知でしたら、[お知らせください][let us know]。

{{% /alert %}}

{{ end }}

{{ if not $noIntegrations }}

{{% alert color=info %}}

OpenTelemetryがネイティブに統合された{{ $name }}ライブラリをご存知でしたら、[お知らせください][let us know]。

{{% /alert %}}

{{ end }}

[let us know]: https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
