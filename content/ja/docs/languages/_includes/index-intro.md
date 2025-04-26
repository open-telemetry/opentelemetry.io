---
default_lang_commit: 3c38c3392fc74f8f071a7a0179fbd141faa7dc40
---

これはOpenTelemetry{{ $name }}のドキュメントです。
OpenTelemetryはオブザーバビリティのためのフレームワークであり、メトリクス、ログ、トレースといったアプリケーションのテレメトリーデータの生成および収集を支援するように設計された API、SDK、およびツール群で構成されています。
このドキュメントは、OpenTelemetry {{ $name }}の使い方を理解し、利用を開始するための手助けとなるように作られています。

## ステータスとリリース {#status-and-releases}

OpenTelemetry {{ $name }}の主要な機能コンポーネントの現在のステータスは以下の通りです。

| トレース            | メトリクス           | ログ              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

[最新のリリース][latest release]を含むリリース情報については、[リリース][Releases]をご覧ください。
{{ $.Inner }}

[latest release]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>
