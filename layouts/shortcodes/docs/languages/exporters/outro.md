{{ $lang := .Get 0 -}} {{ $spanExporterInterfaceUrl := .Get 1 }}

## Custom exporters

Finally, you can also write your own exporter. For more information, see the
[SpanExporter Interface in the API
documentation]({{ $spanExporterInterfaceUrl }}).

## Batching span and log records

The OpenTelemetry SDK provides a set of default span and log record processors,
that allow you to either emit spans one-by-on ("simple") or batched. Using
batching is recommended, but if you do not want to batch your spans or log
records, you can use a simple processor instead as follows:

{{ .Inner }}
