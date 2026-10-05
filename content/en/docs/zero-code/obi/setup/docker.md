---
title: Run OBI as a Docker container
linkTitle: Docker
description:
  Learn how to set up and run OBI as a standalone Docker container that
  instruments another container.
weight: 3
cSpell:ignore: goblog
---

OBI can run a standalone Docker container that can instrument a process running
in another container.

OBI container images are published to both registries:

- [Docker Hub](https://hub.docker.com/r/otel/ebpf-instrument):
  `otel/ebpf-instrument:v<version>`
- [GHCR](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/pkgs/container/opentelemetry-ebpf-instrumentation%2Febpf-instrument):
  `ghcr.io/open-telemetry/opentelemetry-ebpf-instrumentation/ebpf-instrument:v<version>`

The development tag is also published on Docker Hub as:

```text
otel/ebpf-instrument:main
```

The OBI container must be configured in following way:

- Run as a **privileged** container for the example below, or grant the
  [capabilities required by the enabled features](../../security/). Starting
  with v0.14.0, most probes do not require `SYS_ADMIN`; Go library-level context
  propagation and other user-memory-write features still do.
- Use the `host` PID namespace to allow accessing to the processes in other
  containers.

## Image Signing and Verification

The OBI container image is signed using
[Cosign](https://docs.sigstore.dev/cosign/signing/overview/) with ephemeral
keys, authenticated via the OIDC (OpenID Connect) protocol in GitHub Actions.
This ensures the authenticity and integrity of the container published by the
OpenTelemetry project.

You can verify the signature of the container image using the following
commands:

```sh
export VERSION=v0.14.0

# Verify a release image from Docker Hub
cosign verify --certificate-identity-regexp 'https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/' --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' otel/ebpf-instrument:${VERSION}

# Verify the same release from GHCR
cosign verify --certificate-identity-regexp 'https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/' --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' ghcr.io/open-telemetry/opentelemetry-ebpf-instrumentation/ebpf-instrument:${VERSION}
```

Successful verification reports that the Cosign claims were validated and shows
the signed image digest. If verification fails:

- confirm that the tag exists in the registry you queried
- make sure you are verifying a published release tag, not just `main`
- verify that you are using the GitHub OIDC issuer and identity regular
  expression shown above

## Docker CLI example

For this example you need a container running an HTTP/S or gRPC service. If you
don't have one, you can use this
[simple blog engine service written in Go](https://macias.info):

```sh
export VERSION=v0.14.0
docker run -p 18443:8443 --name goblog mariomac/goblog:dev
```

The above command runs a simple HTTPS application. The process opens the
container's internal port `8443`, which is then exposed at the host level as the
port `18443`.

Set environment variables to configure OBI to print to stdout and listen to a
port (container) to inspect the executable:

```sh
export OTEL_EBPF_TRACE_PRINTER=text
export OTEL_EBPF_OPEN_PORT=8443
```

OBI needs to be run with the following settings:

- in `--privileged` mode for this example, or with the capabilities required by
  the enabled features
- the host PID namespace, with the option `--pid=host`.

```sh
docker run --rm \
  -e OTEL_EBPF_OPEN_PORT=8443 \
  -e OTEL_EBPF_TRACE_PRINTER=text \
  --pid=host \
  --privileged \
  otel/ebpf-instrument:${VERSION}
```

After OBI is running, open `https://localhost:18443` in your browser, use the
app to generate test data, and verify that OBI prints trace requests to stdout
similar to:

```sh
time=2023-05-22T14:03:42.402Z level=INFO msg="creating instrumentation pipeline"
time=2023-05-22T14:03:42.526Z level=INFO msg="Starting main node"
2023-05-22 14:03:53.5222353 (19.066625ms[942.583µs]) 200 GET / [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:03:53.5222353 (355.792µs[321.75µs]) 200 GET /static/style.css [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:03:53.5222353 (170.958µs[142.916µs]) 200 GET /static/img.png [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:13:47.52221347 (7.243667ms[295.292µs]) 200 GET /entry/201710281345_instructions.md [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:13:47.52221347 (115µs[75.625µs]) 200 GET /static/style.css [172.17.0.1]->[localhost:18443] size:0B
```

Now that OBI is tracing the target HTTP service, configure it to send metrics
and traces to an OpenTelemetry endpoint, or have metrics scraped by Prometheus.

For information on how to export traces and metrics, refer to the
[configuration options](../../configure/options/) documentation.

## Docker Compose example

The following Docker compose file replicates the same functionality of the
Docker CLI example:

```yaml
version: '3.8'

services:
  # Service to instrument. Change it to any
  # other container that you want to instrument.
  goblog:
    image: mariomac/goblog:dev
    ports:
      # Exposes port 18843, forwarding it to container port 8443
      - '18443:8443'

  autoinstrumenter:
    image: otel/ebpf-instrument:v0.14.0
    pid: 'host'
    privileged: true
    environment:
      OTEL_EBPF_TRACE_PRINTER: text
      OTEL_EBPF_OPEN_PORT: 8443
```

Run the Docker compose file with the following command and use the app to
generate traces:

```sh
docker compose -f compose-example.yml up
```
