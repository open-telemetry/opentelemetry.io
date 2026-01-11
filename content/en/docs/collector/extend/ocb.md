---
title: Build a custom Collector with OpenTelemetry Collector Builder
linkTitle: Build a custom Collector
description: Assemble your own distribution of the OpenTelemetry Collector
weight: 200
aliases: [/docs/collector/custom-collector/]
params:
  providers-vers: v1.48.0
# prettier-ignore
cSpell:ignore: chipset darwin debugexporter gomod otlpexporter otlpreceiver wyrtw
---

The OpenTelemetry Collector has five official
[distributions](/docs/collector/distributions/) that come pre-configured with
certain components. If you require more flexibility, you can use the
[OpenTelemetry Collector Builder][ocb] (or `ocb`) to generate a custom binary of
your own distribution that includes custom components, upstream components, and
other publicly available components.

The following guide shows you how to get started with `ocb` to build your own
Collector. In this example, you create a Collector distribution to support the
development and testing of custom components. You can launch and debug your
Collector components directly in your preferred Golang integrated development
environment (IDE). Use all the debugging features of your IDE (stack traces are
great teachers!) to understand how the Collector interacts with your component
code.

## Prerequisites

The `ocb` tool requires Go to build the Collector distribution. Make sure to
[install](https://go.dev/doc/install) a
[compatible version](https://github.com/open-telemetry/opentelemetry-collector/blob/main/README.md#compatibility)
of Go on your machine before you begin.

## Install the OpenTelemetry Collector Builder

The `ocb` binary is available as a downloadable asset from OpenTelemetry
Collector releases with [`cmd/builder` tags][tags]. Find and download the asset
that fits your operating system and chipset:

{{< tabpane text=true >}}

{{% tab "Linux (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux (ppc64le) "%}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_ppc64le
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Windows (AMD 64)" %}}

```sh
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_windows_amd64.exe" -OutFile "ocb.exe"
Unblock-File -Path "ocb.exe"
```

{{% /tab %}} {{< /tabpane >}}

To make sure `ocb` is installed correctly, enter `./ocb help` in your terminal.
You should see the output of the `help` command in your console.

## Configure the OpenTelemetry Collector Builder

Configure `ocb` with a YAML manifest file. The manifest has two main sections.
The first section, `dist`, contains options for configuring code generation and
the compile process. The second section contains top-level module types, such as
`extensions`, `exporters`, `receivers` or `processors`. Each module type accepts
a list of components.

The `dist` section of the manifest contains tags that are equivalent to `ocb`
command line `flags`. The following table lists the options for configuring the
`dist` section.

| Tag                | Description                                                            | Optional             | Default Value                                                                     |
| ------------------ | ---------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------- |
| module:            | The module name for the new distribution, following Go mod conventions | Yes, but recommended | `go.opentelemetry.io/collector/cmd/builder`                                       |
| name:              | The binary name for your distribution                                  | Yes                  | `otelcol-custom`                                                                  |
| description:       | A long name for the application                                        | Yes                  | `Custom OpenTelemetry Collector distribution`                                     |
| output_path:       | The path to write the output (sources and binary)                      | Yes                  | `/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831` |
| version:           | The version for your custom OpenTelemetry Collector                    | Yes                  | `1.0.0`                                                                           |
| go:                | The Go binary to use to compile the generated sources                  | Yes                  | go from the PATH                                                                  |
| debug_compilation: | Keep the debug symbols in the resulting binary                         | Yes                  | False                                                                             |

All `dist` tags are optional. You can add custom values for them depending on
whether you intend to make your custom Collector distribution available to other
users or you are using `ocb` to bootstrap your component development and testing
environment.

To configure `ocb`, follow these steps:

1. Create a manifest file named `builder-config.yaml` with the following
   content:

   ```yaml
   dist:
     name: otelcol-dev
     description: Basic OTel Collector distribution for Developers
     output_path: ./otelcol-dev
   ```

1. Add modules for the components you want to include in this custom Collector
   distribution. See the
   [`ocb` configuration documentation](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration)
   to understand the different modules and how to add components.

   For this example distribution, add the following components:
   - Exporters: OTLP and Debug
   - Receivers: OTLP
   - Processors: Batch

   The `builder-config.yaml` manifest file should look like this:

   ```yaml
   dist:
     name: otelcol-dev
     description: Basic OTel Collector distribution for Developers
     output_path: ./otelcol-dev

   exporters:
     - gomod:
         go.opentelemetry.io/collector/exporter/debugexporter {{%
         version-from-registry collector-exporter-debug %}}
     - gomod:
         go.opentelemetry.io/collector/exporter/otlpexporter {{%
         version-from-registry collector-exporter-otlp %}}

   processors:
     - gomod:
         go.opentelemetry.io/collector/processor/batchprocessor {{%
         version-from-registry collector-processor-batch %}}

   receivers:
     - gomod:
         go.opentelemetry.io/collector/receiver/otlpreceiver {{%
         version-from-registry collector-receiver-otlp %}}

   providers:
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/envprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/fileprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/httpprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/httpsprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/yamlprovider {{% param
         providers-vers %}}
   ```

{{% alert title="Tip" %}}

For a list of components that you can add to your custom Collector, see the
[OpenTelemetry Registry](/ecosystem/registry/?language=collector). Each registry
entry contains the full name and version you need to add to your
`builder-config.yaml`.

{{% /alert %}}

## Generate the code and build your Collector distribution

{{% alert title="Note" %}}

This section instructs you to build your custom Collector distribution using the
`ocb` binary. If you would like to build and deploy your custom Collector
distribution to a container orchestrator such as Kubernetes, skip this section
and see
[Containerize your Collector Distribution](#containerize-your-collector-distribution).

{{% /alert %}}

With `ocb` installed and configured, you are ready to build your distribution.

In your terminal, type the following command to start `ocb`:

```sh
./ocb --config builder-config.yaml
```

The output of the command looks like this:

```text
2025-06-13T14:25:03.037-0500	INFO	internal/command.go:85	OpenTelemetry Collector distribution builder	{"version": "{{% version-from-registry collector-builder noPrefix %}}", "date": "2025-06-03T15:05:37Z"}
2025-06-13T14:25:03.039-0500	INFO	internal/command.go:108	Using config file	{"path": "builder-config.yaml"}
2025-06-13T14:25:03.040-0500	INFO	builder/config.go:99	Using go	{"go-executable": "/usr/local/go/bin/go"}
2025-06-13T14:25:03.041-0500	INFO	builder/main.go:76	Sources created	{"path": "./otelcol-dev"}
2025-06-13T14:25:03.445-0500	INFO	builder/main.go:108	Getting go modules
2025-06-13T14:25:04.675-0500	INFO	builder/main.go:87	Compiling
2025-06-13T14:25:17.259-0500	INFO	builder/main.go:94	Compiled	{"binary": "./otelcol-dev/otelcol-dev"}
```

As defined in the `dist` section of your manifest, you now have a folder named
`otelcol-dev` containing all the source code and the binary for your Collector
distribution.

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

You can use the generated code to bootstrap your component development projects
and then build and distribute your own Collector distribution with those
components.

## Containerize your Collector distribution

{{% alert title="Note" %}}

This section teaches you to build your Collector distribution inside a
`Dockerfile`. Follow these instructions if you need to deploy your Collector
distribution to a container orchestrator such as Kubernetes. If you want to
build your Collector distribution without containerization, see
[Generate the code and build your Collector distribution](#generate-the-code-and-build-your-collector-distribution).

{{% /alert %}}

Follow these steps to containerize your custom Collector.

1. Add two new files to your project:
   - `Dockerfile` - Container image definition of your Collector distribution
   - `collector-config.yaml` - Minimal Collector configuration YAML for testing
     your distribution

   After adding these files, your file structure looks like this:

   ```text
   .
   ├── builder-config.yaml
   ├── collector-config.yaml
   └── Dockerfile
   ```

1. Add the following content to the `Dockerfile`. This definition builds your
   Collector distribution in-place and ensures the resulting Collector
   distribution binary matches the target container architecture (for example,
   `linux/arm64`, `linux/amd64`):

   ```dockerfile
   FROM alpine:3.19 AS certs
   RUN apk --update add ca-certificates

   FROM golang:1.25.0 AS build-stage
   WORKDIR /build

   COPY ./builder-config.yaml builder-config.yaml

   RUN --mount=type=cache,target=/root/.cache/go-build GO111MODULE=on go install go.opentelemetry.io/collector/cmd/builder@{{% version-from-registry collector-builder %}}
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

1. Add the following definition to your `collector-config.yaml` file:

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

1. Use the following commands to build a multi-architecture Docker image of
   `ocb` using `linux/amd64` and `linux/arm64` as the target build
   architectures. To learn more, see this
   [blog post](https://blog.jaimyn.dev/how-to-build-multi-architecture-docker-images-on-an-m1-mac/)
   about multi-architecture builds.

   ```sh
   # Enable Docker multi-arch builds
   docker run --rm --privileged tonistiigi/binfmt --install all
   docker buildx create --name mybuilder --use

   # Build the Docker image as Linux AMD and ARM
   # and load the result to "docker images"
   docker buildx build --load \
     -t <collector_distribution_image_name>:<version> \
     --platform=linux/amd64,linux/arm64 .

   # Test the newly built image
   docker run -it --rm -p 4317:4317 -p 4318:4318 \
       --name otelcol <collector_distribution_image_name>:<version>
   ```

## Further reading

- [Build a receiver](/docs/collector/extend/custom-component/receiver)
- [Build a connector](/docs/collector/extend/custom-component/connector)

[ocb]:
  https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[tags]: https://github.com/open-telemetry/opentelemetry-collector-releases/tags
