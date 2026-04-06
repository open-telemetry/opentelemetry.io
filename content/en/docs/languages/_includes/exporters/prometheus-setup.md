## Prometheus

To send your metric data to [Prometheus](https://prometheus.io/), you can either
[enable Prometheus' OTLP Receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)
and use the [OTLP exporter](#otlp) or you can use the Prometheus exporter, a
`MetricReader` that starts an HTTP server that collects metrics and serialize to
Prometheus text format on request.

### Backend Setup {#prometheus-setup}

> [!NOTE]
>
> If you have Prometheus or a Prometheus-compatible backend already set up, you
> can skip this section and setup the [Prometheus](#prometheus-dependencies) or
> [OTLP](#otlp-dependencies) exporter dependencies for your application.

To run a Prometheus server backend and begin scraping metrics, see the [Prometheus getting started guide](https://prometheus.io/docs/prometheus/latest/getting_started/).

To enable the OTLP Receiver, see the [Prometheus guide for enabling the OTLP Receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)