---
---

[Instrumentation](/docs/concepts/instrumentation/) 是指向应用中添加可观察性代码的行为。

如果你正在对一个应用进行埋点，需要使用适合你语言的 OpenTelemetry SDK。然后，你可以使用 SDK 初始化 OpenTelemetry，并使用 API 对代码进行埋点。这将从你的应用及其安装的任何带有埋点的库中导出遥测数据。

如果你正在对一个库进行埋点，只需安装适合你语言的 OpenTelemetry API 包。你的库不会自行导出遥测数据。只有当该库作为使用 OpenTelemetry SDK 的应用的一部分时，它才会导出遥测数据。有关如何对库进行埋点的更多信息，请参见
[Libraries](/docs/concepts/instrumentation/libraries/)。

有关 OpenTelemetry API 和 SDK 的更多信息，请参见
[specification](/docs/specs/otel/)。
