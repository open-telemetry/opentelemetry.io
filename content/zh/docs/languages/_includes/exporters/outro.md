---
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
---

## 自定义导出器 {#custom-exporters}

最后，你还可以编写自己的导出器。有关更多信息，请参见
[API 文档中的 SpanExporter 接口]({{ $1 }}).

## 批量处理 Span 和日志记录 {#batching-span-and-log-records}

OpenTelemetry SDK 提供了一组默认的 Span 和日志记录处理器，
允许你选择按单条（simple）或按批量（batch）方式导出一个或多个 Span。
推荐使用批量处理，但如果你不想批量处理 Span 或日志记录，可以使用 simple 处理器，方法如下：
