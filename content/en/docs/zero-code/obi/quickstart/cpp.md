---
title: 'Quickstart: instrument a C/C++ service with OBI'
linkTitle: C/C++ quickstart
description:
  Learn how to quickly set up and run OBI to instrument a C/C++ service
weight: 2
cSpell:ignore: instrumentable
---

## 1. Run an instrumentable C/C++ service

Run an instrumentable C/C++ service or download and run a simple example
[C++ HTTP service](https://github.com/grafana/beyla/tree/main/examples/quickstart/cpp).

```bash
curl -OL https://raw.githubusercontent.com/grafana/beyla/main/examples/quickstart/cpp/httplib.h
curl -OL https://raw.githubusercontent.com/grafana/beyla/main/examples/quickstart/cpp/quickstart.cpp
g++ -std=c++11 quickstart.cpp -o quickstart && ./quickstart
```

If necessary, replace the `g++` command by another compiler supporting C++11.

## 2. Download OBI

Download the latest OBI executable from the
[OBI releases page](https://github.com/grafana/beyla/releases). Uncompress and
copy the OBI executable to any location in your `$PATH`.

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
2024-01-09 10:31:33.19103133 (3.254486ms[3.254486ms]) 200 GET /foo [127.0.0.1]->[127.0.0.1:8080]
size:80B svc=[{quickstart  generic lima-ubuntu-lts-5074}] traceparent=[00-46214bd23716280eef43cf798dbe5522-0000000000000000-01]
```

The above trace shows:

- `2024-01-09 10:31:33.19103133`: time of the trace
- `(3.254486ms[3.254486ms])`: total response time for the request
- `200 GET /foo`: response code, HTTP method, and URL path
- `[127.0.0.1]->[127.0.0.1:8080]` source and destination `host:port`
- `size:80B`: size of the HTTP request (sum of the headers and the body)
- `svc=[{quickstart  generic lima-ubuntu-lts-5074}]`: `quickstart` service,
  using the generic kernel-based instrumenter, with an automatically created
  service instance name `lima-ubuntu-lts-5074`
- `traceparent` as received by the parent request, or a new random one if the
  parent request didn't specify it

## 6. Configure routing

The exposed span name is a generic `GET /**`, where it should
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
