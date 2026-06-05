---
default_lang_commit: c87c4cd1a007500700746c184918add6456175c3
---

OpenTelemetry {{ $name }} のドキュメントへようこそ。
このセクションでは、OpenTelemetry の API と SDK を使って、メトリクス、ログ、トレースなどのテレメトリーデータを生成・収集するために、{{ $name }} で OpenTelemetry を使う方法を紹介します。

これらのページは、OpenTelemetry {{ $name }} の使い方を理解し、現在の機能やステータスを把握するための手助けとなるように作られています。

## ステータスとリリース {#status-and-releases}

OpenTelemetry {{ $name }}の主要な機能コンポーネントの現在のステータスは以下の通りです。

| トレース            | メトリクス           | ログ              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

[最新のリリース][latest release]を含むリリース情報については、[リリース][Releases]をご覧ください。
{{ $.Inner }}

[latest release]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>
