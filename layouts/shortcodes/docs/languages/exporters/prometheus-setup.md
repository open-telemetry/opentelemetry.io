## Prometheus

To send your metric data to [Prometheus](https://prometheus.io/), you can either
[enable Prometheus' OTLP Receiver](https://prometheus.io/docs/prometheus/latest/feature_flags/#otlp-receiver)
and use the [OTLP exporter](#otlp) or you can use the
[`PrometheusHttpServer`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-exporter-prometheus/latest/io/opentelemetry/exporter/prometheus/PrometheusHttpServer.html),
a `MetricReader`, that starts an HTTP server that will collect metrics and
serialize to Prometheus text format on request.

### Backend Setup {#prometheus-setup}

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Note</h4>

If you have Prometheus or a Prometheus-compatible backend already set up, you
can skip this section and setup the [Prometheus](#prometheus-dependencies) or
[OTLP](#otlp-dependencies) exporter dependencies for your application.

</div>

You can run [Prometheus](https://prometheus.io) in a docker container,
accessible on port `9090` by following these instructions:

Create a file called `prometheus.yml` with the following content:

```yaml
scrape_configs:
  - job_name: dice-service
    scrape_interval: 5s
    static_configs:
      - targets: [host.docker.internal:9464]
```

Run Prometheus in a docker container with the UI accessible on port `9090`:

```shell
docker run --rm -v ${PWD}/prometheus.yml:/prometheus/prometheus.yml -p 9090:9090 prom/prometheus --enable-feature=otlp-write-receive
```

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Note</h4>

When using Prometheus' OTLP Receiver, make sure that you set the OTLP endpoint
for metrics in your application to `http://localhost:9090/api/v1/otlp`.

Not all docker environments support `host.docker.internal`. In some cases you
may need to replace `host.docker.internal` with `localhost` or the IP address of
your machine.

</div>
