---
title: 'Quickstart: instrument a Go service with OBI'
linkTitle: Go quickstart
description: Learn how to quickly set up and run OBI to instrument a Go service
weight: 2
cSpell:ignore: instrumentable
---

## 1. Run an instrumentable Go service

Run an instrumentable Go service or download and run a simple example
[Go HTTP service](https://github.com/grafana/beyla/tree/main/examples/quickstart/golang).

```bash
curl -OL https://raw.githubusercontent.com/grafana/beyla/main/examples/quickstart/golang/quickstart.go
go run quickstart.go
```

## 2. Download OBI

Download the latest OBI executable from the
[OBI releases page](https://github.com/grafana/beyla/releases). Uncompress and
copy the OBI executable to any location in your `$PATH`.

As an alternative (if your host has the Go toolset installed), you can directly
download the OBI executable with the `go install` command:

```sh
go install github.com/grafana/beyla/cmd/beyla@latest
```

## 4. Run OBI with minimal configuration

To run OBI, first set the following environment variables:

- The `OTEL_EXPORTER_OTLP_PROTOCOL`, `OTEL_EXPORTER_OTLP_ENDPOINT` and
  `OTEL_EXPORTER_OTLP_HEADERS` variables copied from the previous step.
- `OTEL_EBPF_OPEN_PORT`: the port the instrumented service is using (for
  example, `80` or `443`). If using the example service in the first section of
  this guide, set this variable to `8080`.

To facilitate local testing, set the `OTEL_EBPF_TRACE_PRINTER=text` environment
variable. When this option is set, OBI prints traces in text format to the
standard output.

Notice: OBI requires administrative (sudo) privileges, or at least it needs to
be granted the `CAP_SYS_ADMIN` capability.

```sh
export OTEL_EBPF_OPEN_PORT=8080
export OTEL_EBPF_TRACE_PRINTER=text
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_ENDPOINT="https//localhost:4318"
sudo -E beyla
```

## 5. Test the service

With OBI and the service running, make HTTP requests to the instrumented
service:

```bash
curl http://localhost:8080/foo
```

OBI should output traces to the standard output similar to this:

```text
2024-01-08 14:06:14.182614 (432.191µs[80.421µs]) 200 GET /foo [127.0.0.1]->[localhost:8080]
size:0B svc=[{quickstart  go lima-ubuntu-lts-8222}] traceparent=[00-0f82735dab5798dfbf7f7a26d5df827b-0000000000000000-01]
```

The above trace shows:

- `2024-01-08 14:06:14.182614`: time of the trace
- `(432.191µs[80.421µs])`: total response time for the request, with the actual
  internal execution time of the request (not counting the request enqueuing
  time)
- `200 GET /foo`: response code, HTTP method, and URL path
- `[127.0.0.1]->[localhost:8080]` source and destination host:port
- `size:0B`: size of the HTTP request body (0 bytes, as it was a `GET` request).
  For non-go programs, this size would also include the size of the request
  headers
- `svc=[{quickstart  go lima-ubuntu-lts-8222}]`: `quickstart` service, written
  in Go, with an automatically created service instance name
  `lima-ubuntu-lts-8222`
- `traceparent` as received by the parent request, or a new random one if the
  parent request didn't specify it

## 6. Configure routing

The exposed span name in is a generic `GET /**`, where it should
say something like `GET /foo` (the path of the test request URL).

OBI groups any unknown URL path as `/**` to avoid unexpected cardinality
explosions.

Configure routing to tell OBI about expected routes.

For this quickstart, let OBI to heuristically group the routes.

First, create a `config.yml` file with the following content:

```yaml
routes:
  unmatched: heuristic
```

Then, run OBI with the `-config` argument (or use the `OTEL_EBPF_CONFIG_PATH`
environment variable instead):

```bash
sudo -E beyla -config config.yml
```

Finally, make HTTP requests:

```bash
curl http://localhost:8080/foo
curl http://localhost:8080/user/1234
curl http://localhost:8080/user/5678
```

## Next steps

- Get more details of the different
  [OBI configuration options](../../configure/).
- Learn how to deploy OBI as a [Docker container](../../setup/docker/) or as a
  [Kubernetes DaemonSet or sidecar](../../setup/kubernetes/).
