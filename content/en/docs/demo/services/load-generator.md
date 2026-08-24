---
title: Load Generator
aliases: [loadgenerator]
cSpell:ignore: baggage goroutines loadgenerator otelHeaders xk6
---

The load generator is based on [k6](https://k6.io), a Go load testing tool that
runs test scenarios written in JavaScript. By default it will simulate users
requesting several different routes from the frontend. All of its OpenTelemetry
instrumentation comes from the Go SDK, embedded in the k6 binary by the
`xk6-otel` extension described below.

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

The `startSpan(name, attrs?)` method starts a new client span and returns an
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
`xk6-otel` extension injects the span's trace and span IDs into each log record.

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

Baggage on its own doesn't mark the telemetry. Each backend service reads the
`synthetic_request` entry out of the incoming baggage and copies it onto its own
spans and log records as an attribute, and it is that attribute which records
whether the telemetry came from a synthetic flow. The frontend sets
`demo.synthetic_request`, while the checkout and payment services set
`user_agent.synthetic.type` to `test`. Because the marker ends up on the
telemetry itself, you can filter load-generator traffic in or out of any query
in your observability backend.
