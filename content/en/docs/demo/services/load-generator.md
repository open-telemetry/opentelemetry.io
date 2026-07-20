---
title: Load Generator
aliases: [loadgenerator]
cSpell:ignore: baggage goroutines loadgenerator otelHeaders xk6
---

The load generator is based on the JavaScript load testing framework
[k6](https://k6.io). By default it will simulate users requesting several
different routes from the frontend.

[Load generator source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/load-generator/)

## Traces

### Initializing Tracing

Tracing in the load generator is provided by a custom
[xk6](https://github.com/grafana/xk6) extension (`xk6-otel`) that wraps the
OpenTelemetry Go SDK and exposes it to k6 JavaScript scripts. The extension is
compiled into the k6 binary at image build time.

The extension initializes a `TracerProvider` backed by an OTLP HTTP exporter on
first use. The collector endpoint, protocol, resource attributes, and service
name are read from the standard
[OpenTelemetry environment variables](/docs/specs/otel/configuration/sdk-environment-variables/)
(`OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_PROTOCOL`,
`OTEL_RESOURCE_ATTRIBUTES`, and `OTEL_SERVICE_NAME`).

### Creating Spans

Scripts import the `Tracer` class from the `k6/x/otel` module and create spans
manually around each simulated user action:

```javascript
import { Tracer } from 'k6/x/otel';

const tracer = new Tracer();

function browseProduct() {
  const span = tracer.startSpan('user_browse_product', {
    'product.id': product,
  });
  http.get(`${BASE_URL}/api/products/${product}`, {
    headers: otelHeaders(span.traceParent()),
  });
  span.end();
}
```

The `startSpan(name, attrs?)` method starts a new client-span and returns an
object with three methods:

- `traceParent()` — returns the W3C `traceparent` header value for the span,
  used to propagate trace context to backend services.
- `log(message)` — emits a correlated OTel log record tied to the span's trace
  and span IDs.
- `end()` — ends the span and flushes it to the exporter.

## Metrics

The load generator emits two kinds of metrics:

- **k6 built-in test metrics** (request duration, error rate, throughput, etc.)
  are exported to the OpenTelemetry Collector via k6's built-in `opentelemetry`
  output (`--out opentelemetry`). The output protocol and collector endpoint are
  configured via the `K6_OTEL_EXPORTER_PROTOCOL` and
  `K6_OTEL_HTTP_EXPORTER_ENDPOINT` environment variables.
- **Go runtime metrics** (memory, garbage collection, goroutines) are emitted by
  the `xk6-otel` extension using the OpenTelemetry `runtime` instrumentation.

## Logs

Log records are emitted by calling `span.log(message)` on any active span. The
`xk6-otel` extension injects the span's trace and span IDs into each log record
so that logs are correlated with their parent span in the collector.

## Baggage

OpenTelemetry Baggage is used by the load generator to indicate that traces are
synthetically generated. Each outgoing HTTP request carries a `baggage` header
and a `traceparent` header constructed by the `otelHeaders` helper:

```javascript
function otelHeaders(traceParent, extra) {
  return Object.assign(
    {
      baggage: `synthetic_request=true,session.id=${sessionId}`,
      traceparent: traceParent,
    },
    extra,
  );
}
```

Backend services read the `synthetic_request=true` baggage value to distinguish
load-generator traffic from real user traffic.
