---
default_lang_commit: 788277e362bc602b72a90aa9191f9c05c403458e
---

当你开发应用时，可能会使用第三方库和框架来加快开发进度。如果你随后使用 OpenTelemetry
对应用进行插桩，你可能希望避免额外花时间为所用的第三方库和框架手动添加链路、日志和指标。

许多库和框架已经原生支持 OpenTelemetry，或者通过 OpenTelemetry
的[插桩](/docs/concepts/instrumentation/libraries/)获得支持，
因此它们能够生成可导出到可观测性后端的遥测数据。

如果你正在为使用第三方库或框架的应用或服务进行插桩，
请按照以下说明学习如何为你的依赖项使用原生插桩库和插桩库。

## 使用原生插桩库 {#use-natively-instrumented-libraries}

如果某个库默认就支持 OpenTelemetry，你只需在应用中添加并配置 OpenTelemetry SDK，
就可以获取该库发出的链路、指标和日志。

该库可能需要一些额外的插桩配置。请查阅该库的文档以了解更多信息。
