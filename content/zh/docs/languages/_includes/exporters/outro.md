## 自定义导出器（Exporter）{#custom-exporters}

最后，你还可以编写自己的导出器。有关更多信息，请参见
[SpanExporter Interface in the API documentation]({{ $1 }}).

## 批量处理 Span 和日志记录{#batching-span-and-log-records}

OpenTelemetry SDK 提供了一组默认的 span 和日志记录处理器，允许你选择按单条（simple）或按批量（batch）方式导出 spans。推荐使用批量处理，但如果你不想批量处理 spans 或日志记录，可以使用 simple 处理器，方法如下：
