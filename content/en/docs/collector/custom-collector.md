---
title: Building a custom collector
weight: 29
# prettier-ignore
cSpell:ignore: chipset darwin debugexporter gomod otlpexporter otlpreceiver wyrtw
---

If you are building and debugging custom Collector receivers, processors,
extensions, or exporters, you need your own Collector instance.
This allows you to launch and debug your OpenTelemetry Collector components
directly within your favorite Golang IDE.

Another benefit of this approach
is that you can use all the debugging features from your IDE (stack traces are
great teachers!) to understand how the Collector itself interacts with your
component code.

The OpenTelemetry Community developed a tool called [OpenTelemetry Collector
builder][ocb] (or `ocb` for short) to assist people in assembling their own
distribution, making it easy to build a distribution that includes their custom
components along with components that are publicly available.

As part of the process, the `ocb` generates the Collector's source code,
which you can use to build and debug your own custom components.

## Step 1 - Install the builder

{{% alert title="Note" %}}

The `ocb` tool requires Go to build the Collector distribution.
[Install Go](https://go.dev/doc/install) on your machine, if you haven't done so
already.

{{% /alert %}}

The `ocb` binary is available as a downloadable asset from OpenTelemetry
Collector [releases with `cmd/builder` tags](https://github.com/open-telemetry/opentelemetry-collector-releases/tags). You can find a list of
assets named based on OS and chipset, so download the one that fits your
configuration:

- Linux (AMD 64)
- Linux (ARM 64)
- Linux (ppc64le)
- macOS (AMD 64)
- macOS (ARM 64)
- Windows (AMD 64)

{{< tabpane text=true >}} {{% tab "Linux (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2Fv0.139.0/ocb_0.139.0_linux_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2Fv0.139.0/ocb_0.139.0_linux_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux (ppc64le)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2Fv0.139.0/ocb_0.139.0_linux_ppc64le
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2Fv0.139.0/ocb_0.139.0_darwin_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2Fv0.139.0/ocb_0.139.0_darwin_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Windows" %}}

```powershell
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2Fv0.139.0/ocb_0.139.0_windows_amd64.exe" -OutFile "ocb.exe"
Unblock-File -Path "ocb.exe"
```

{{% /tab %}} {{< /tabpane >}}

To make sure the `ocb` is ready to use, go to your terminal and type
`./ocb help`. When you press enter, you should see the output of the `help`
command in your console.

## Step 2 - Create a builder manifest file

The builder's `manifest` file is a YAML file where you provide information about the
code generation and compile process combined with the components you would
like to add to your Collector's distribution.

The `manifest` starts with a map named `dist` which contains tags to help you
configure the code generation and compile process. In fact, all the tags for
`dist` are equivalent to the `ocb` command line `flags`.

Here are the tags for the `dist` map:

| Tag              | Description                                                                | Optional | Default Value                                                                            |
| ---------------- | -------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| module:          | The module name for the new distribution, following Go mod conventions.    | Yes      | `go.opentelemetry.io/collector/cmd/builder`                                              |
| name:            | The binary name for your distribution                                      | Yes      | `otelcol-custom`                                                                         |
| description:     | A long name for the application.                                           | Yes      | `Custom OpenTelemetry Collector distribution`                                            |
| output_path:     | The path to write the output (sources and binary).                         | Yes      | `/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831`        |
| version:         | The version for your custom OpenTelemetry Collector.                       | Yes      | `1.0.0`                                                                                  |
| go:              | Which Go binary to use to compile the generated sources.                   | Yes      | go from the PATH                                                                         |

As you can see in the table above, all the `dist` tags are optional. You add
custom values for them depending on whether you intend to make your
custom Collector distribution available for consumption by other users or if you
are simply using the `ocb` to bootstrap your component development and
testing environment.

For this tutorial, you create a Collector's distribution to support
the development and testing of components.

Go ahead and create a manifest file named `builder-config.yaml` with the
following content:

```yaml
dist:
  name: otelcol-dev
  description: Basic OTel Collector distribution for Developers
  output_path: ./otelcol-dev
```

Now add the modules representing the components you want
incorporated in this custom Collector distribution. Take a look at the
[ocb configuration documentation](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration)
to understand the different modules and how to add the components.

Add the following components to the development and testing
Collector distribution:

- Exporters: OTLP and Debug
- Receivers: OTLP
- Processors: Batch

The `builder-config.yaml` manifest file looks like this after adding the
components:

```yaml
dist:
  name: otelcol-dev
  description: Basic OTel Collector distribution for Developers
  output_path: ./otelcol-dev

exporters:
  - gomod:
      go.opentelemetry.io/collector/exporter/debugexporter {{% version-from-registry collector-exporter-debug %}}
  - gomod:
      go.opentelemetry.io/collector/exporter/otlpexporter {{% version-from-registry collector-exporter-otlp %}}

processors:
  - gomod:
      go.opentelemetry.io/collector/processor/batchprocessor {{% version-from-registry collector-processor-batch %}}

receivers:
  - gomod:
      go.opentelemetry.io/collector/receiver/otlpreceiver {{% version-from-registry collector-receiver-otlp %}}

providers:
  - gomod: go.opentelemetry.io/collector/confmap/provider/envprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/fileprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/httpprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/httpsprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/yamlprovider v1.18.0
```

{{% alert title="Tip" %}}

For a list of components that you can add to your custom Collector, see the
[OpenTelemetry Registry](/ecosystem/registry/?language=collector). Note that
registry entries provide the full name and version you need to add to your
`builder-config.yaml`.

{{% /alert %}}

## Step 3a - Generate the code and build your Collector's distribution

{{% alert title="Note" %}}

This step builds your custom Collector distribution using the `ocb`
binary. If you would like to build and deploy your custom Collector distribution
to a container orchestrator (for example, Kubernetes), skip this step and go to
[Step 3b](#step-3b---containerize-your-collectors-distribution).

{{% /alert %}}

Now let the `ocb` do its job. Go to your terminal and type
the following command:

```sh
./ocb --config builder-config.yaml
```

If everything went well, here is what the output of the command looks
like:

```text
2022-06-13T14:25:03.037-0500	INFO	internal/command.go:85	OpenTelemetry Collector distribution builder	{"version": "0.139.0", "date": "2023-01-03T15:05:37Z"}
2022-06-13T14:25:03.039-0500	INFO	internal/command.go:108	Using config file	{"path": "builder-config.yaml"}
2022-06-13T14:25:03.040-0500	INFO	builder/config.go:99	Using go	{"go-executable": "/usr/local/go/bin/go"}
2022-06-13T14:25:03.041-0500	INFO	builder/main.go:76	Sources created	{"path": "./otelcol-dev"}
2022-06-13T14:25:03.445-0500	INFO	builder/main.go:108	Getting go modules
2022-06-13T14:25:04.675-0500	INFO	builder/main.go:87	Compiling
2022-06-13T14:25:17.259-0500	INFO	builder/main.go:94	Compiled	{"binary": "./otelcol-dev/otelcol-dev"}
```

As defined in the `dist` section of your config file, you now have a folder
named `otelcol-dev` containing all the source code and the binary for your
Collector's distribution.

The folder structure looks like this:

```text
.
├── builder-config.yaml
├── ocb
└── otelcol-dev
    ├── components.go
    ├── components_test.go
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── main_others.go
    ├── main_windows.go
    └── otelcol-dev
```

You can now use the generated code to bootstrap your component development
projects and easily build and distribute your own Collector distribution with
your components.

## Step 3b - Containerize your Collector's distribution

{{% alert title="Note" %}}

This step builds your Collector distribution inside a `Dockerfile`. Follow
this step if you need to deploy your Collector distribution to a container
orchestrator (for example, Kubernetes). If you would like to *only* build your
Collector distribution without containerization, go to
[Step 3a](#step-3a---generate-the-code-and-build-your-collectors-distribution).

{{% /alert %}}

Add two new files to your project:

- `Dockerfile` - Container image definition of your Collector distribution
- `collector-config.yaml` - Minimalist Collector configuration YAML for testing
  your distribution

After adding these files, your file structure looks like this:

```text
.
├── builder-config.yaml
├── collector-config.yaml
└── Dockerfile
```

The following `Dockerfile` builds your Collector distribution in-place, ensuring
that the resulting Collector distribution binary matches the target container
architecture (for example, `linux/arm64`, `linux/amd64`):

```dockerfile
FROM alpine:3.19 AS certs
RUN apk --update add ca-certificates

FROM golang:1.25.0 AS build-stage
WORKDIR /build

COPY ./builder-config.yaml builder-config.yaml

RUN --mount=type=cache,target=/root/.cache/go-build GO111MODULE=on go install go.opentelemetry.io/collector/cmd/builder@v0.139.0
RUN --mount=type=cache,target=/root/.cache/go-build builder --config builder-config.yaml

FROM gcr.io/distroless/base:latest

ARG USER_UID=10001
USER ${USER_UID}

COPY ./collector-config.yaml /otelcol/collector-config.yaml
COPY --from=certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --chmod=755 --from=build-stage /build/otelcol-dev /otelcol

ENTRYPOINT ["/otelcol/otelcol-dev"]
CMD ["--config", "/otelcol/collector-config.yaml"]

EXPOSE 4317 4318 12001
```

The following is the minimalist `collector-config.yaml` definition:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Use the following commands to build a multi-architecture Docker image of the OCB
using `linux/amd64` and `linux/arm64` as the target build architectures. To
learn more, see this
[blog post](https://blog.jaimyn.dev/how-to-build-multi-architecture-docker-images-on-an-m1-mac/)
about multi-architecture builds.

```bash
# Enable Docker multi-arch builds
docker run --rm --privileged tonistiigi/binfmt --install all
docker buildx create --name mybuilder --use

# Build the Docker image as Linux AMD and ARM,
# and loads the build result to "docker images"
docker buildx build --load \
  -t <collector_distribution_image_name>:<version> \
  --platform=linux/amd64,linux/arm64 .

# Test the newly-built image
docker run -it --rm -p 4317:4317 -p 4318:4318 \
    --name otelcol <collector_distribution_image_name>:<version>
```

## Further reading

- [Building a trace receiver](/docs/collector/building/receiver)
- [Building a connector](/docs/collector/building/connector)
