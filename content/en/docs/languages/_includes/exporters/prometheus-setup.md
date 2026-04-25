## Prometheus

To send your metric data to [Prometheus](https://prometheus.io/), you can
either:

- [Enable Prometheus' OTLP Receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)
  and use the [OTLP exporter](#otlp) (best practice), or
- Use the Prometheus exporter, a `MetricReader` that starts an HTTP server that
  collects metrics and serializes to Prometheus text format on request.

### Backend setup {#prometheus-setup}

To run a Prometheus server backend and begin scraping metrics, see the
[Prometheus getting started guide](https://prometheus.io/docs/prometheus/latest/getting_started/).

To enable the OTLP Receiver, see the
[Prometheus guide for enabling the OTLP Receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver).
