---
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
---

[插桩](/docs/concepts/instrumentation/)是指向应用中添加可观测性代码的行为。

如果你正在对一个应用进行插桩，需要使用适合你语言的 OpenTelemetry SDK。然后，你可以使用
SDK 初始化 OpenTelemetry，并使用 API 对代码进行插桩。这将从你的应用及其安装的任何带有插桩的库中导出遥测数据。

如果你正在对一个库进行插桩，只需安装适合你语言的 OpenTelemetry API 包。你的库不会自行导出遥测数据。
只有当该库作为使用 OpenTelemetry SDK 的应用的一部分时，它才会导出遥测数据。
有关如何对库进行插桩的更多信息，请参见[插桩库](/docs/concepts/instrumentation/libraries/)。

有关 OpenTelemetry API 和 SDK 的更多信息，请参见[规范](/docs/specs/otel/)。
