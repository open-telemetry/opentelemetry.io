---
default_lang_commit: c88a006471f039334aed7990736e089a62b33f94
---

OpenTelemetry {{ $name }} のドキュメントへようこそ。
このセクションでは、OpenTelemetry の API と SDK を使い、{{ $name }} でメトリクス、ログ、トレースなどのテレメトリーデータを生成・収集する方法を紹介します。

これらのページは、OpenTelemetry {{ $name }} の利用を開始し、現在の機能とステータスを理解するための手助けとなるように作られています。

## ステータスとリリース {#status-and-releases}

OpenTelemetry {{ $name }}の主要な機能コンポーネントの現在のステータスは以下の通りです。

| トレース            | メトリクス           | ログ              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

[最新のリリース][latest release]を含むリリース情報については、[リリース][Releases]をご覧ください。
{{ $.Inner }}

[latest release]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>
