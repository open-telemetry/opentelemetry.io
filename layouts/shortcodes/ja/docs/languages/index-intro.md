{{ $prettier_ignore := `

<!-- prettier-ignore -->
` -}}
{{ $lang := .Get 0 -}}
{{ $data := index $.Site.Data.instrumentation $lang }}
{{ $name := $data.name -}}

{{ $tracesStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "traces") -}}
{{ $metricsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "metrics") -}}
{{ $logsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "logs") -}}

これはOpenTelemetry{{ $name }}のドキュメントです。
OpenTelemetryはオブザーバビリティのためのフレームワークであり、メトリクス、ログ、トレースといったアプリケーションのテレメトリーデータの生成および収集を支援するように設計された API、SDK、およびツール群で構成されています。
このドキュメントは、OpenTelemetry {{ $name }}の使い方を理解し、利用を開始するための手助けとなるように作られています。

## ステータスとリリース {#status-and-releases}

OpenTelemetry {{ $name }}の主要な機能コンポーネントの現在のステータスは以下の通りです。

| トレース              | メトリクス              | ログ              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

{{ partial "ja/docs/latest-release.md" (dict "lang" $lang "Inner" .Inner) -}}
