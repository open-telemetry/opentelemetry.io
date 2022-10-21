---
title: Using the Collector Builder with Sample Configs on GCP
linkTitle: Collector builder with GCP
date: 2022-10-17
author: >-
  [Mike Dame](https://github.com/damemi) (Google)
---

The [OpenTelemetry Collector](/docs/collector/) is a versatile tool for
processing and exporting telemetry data. It supports ingestion from many
different sources and routing to just as many observability backends thanks to
its modular design. This design, based on individual receivers, processors, and
exporters, enables third-party development of new backend support. It also
allows users to configure telemetry pipelines that are customized to their use
case.

The
[collector-builder tool](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
takes that customizability a step further, offering a way to easily compile a
Collector binary built with only certain ingestion and export components. In
contrast with publicly available binary releases (which bundle in a number of
components by default), custom Collectors can be slimmed down to only include
the components you really care about. This means the compiled Collector can be
smaller, faster, and more secure than a public release.

Google Cloud recently launched a
[sample GitHub repository](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample)
for building and deploying your own custom OpenTelemetry Collector on GCP. This
takes the guesswork out of running the collector on GCP, but leaves you free to
extend it to meet your use-cases.

This repository will help you:

- **Compile a custom Collector designed for GCP with the**
  [**collector-builder**](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).
  Low-overhead Collector builds are possible with the upstream collector-builder
  tool, so we’ve provided the setup files for building a lightweight collector
  with GCP services in mind. This is GCP's recommended base set of components to
  use when running on GCP or working with GCP services. OpenTelemetry can be
  complex and intimidating, and we are providing a curated and tested
  configuration as a starting point.

- **Adapt existing tutorials for the OpenTelemetry Collector to GCP use cases.**
  By distilling the wide breadth of available information on using the Collector
  and abstracting setup into a few simple commands, this repository reduces the
  process for setting up a custom collector to a few simple Make commands.

- **Keep your Collector deployment up-to-date.** By incorporating custom
  Collectors into your CI/CD pipeline, you can automate builds to ensure your
  Collector stays current with the latest features and fixes. In this repo,
  we'll show one way to do that with Cloud Build.

Each of these represents part of the “Getting Started” process with
OpenTelemetry Collector, so by identifying and consolidating these steps we hope
to expedite and ease the experience down to a few clicks.

## Build an OpenTelemetry Collector that suits your needs

While there are
[public Docker images for the Collector](https://hub.docker.com/r/otel/opentelemetry-collector-contrib/tags)
published by the OpenTelemetry community, these images can be as large as 40MB.
This is due to all of the
[receivers](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver),
[processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor),
and
[exporters](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter)
that are bundled into the image by default. With all of these default
components, there is also the potential for security issues to arise, part of
the reason why the
[Collector maintainers recommend only enabling necessary components](https://github.com/open-telemetry/opentelemetry-collector/blob/5ab00fc/docs/security.md)
in your Collector.

The
[collector-builder tool](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
accelerates compiling stripped-down Collector images with a simple YAML config
file. This file declares which components to include in the build, and
collector-builder includes only those components (and nothing else). This is in
contrast to a default Collector build, where many more components are included
in the compiled binary (even if they are not being enabled in the Collector’s
runtime configuration). This difference is how you can achieve improvements over
public images that include many excess components, with extra dependencies
adding weight and security burden. Now, those extra components can’t take up
space because they aren’t even available in the custom build.

To show how this works we start with a sample config file in this repository
which has been pre-filled with a few of the most relevant OpenTelemetry
components for GCP. However, we encourage you to modify that sample file to fit
your use case.

For example, the following build file includes only the OTLP receiver and
exporter, along with a logging exporter:

```yaml
receivers:
  - import: go.opentelemetry.io/collector/receiver/otlpreceiver
    gomod: go.opentelemetry.io/collector v0.57.2

exporters:
  - import: go.opentelemetry.io/collector/exporter/otlpexporter
    gomod: go.opentelemetry.io/collector v0.57.2
  - import: go.opentelemetry.io/collector/exporter/loggingexporter
    gomod: go.opentelemetry.io/collector v0.57.2
```

Edit
[this file](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample/blob/main/build/local/builder-config.yaml)
in the repository and run `make build` to automatically generate a local binary,
or `make docker-build` to compile a container image.

## Get up and running quickly on GKE

For convenience, this repository includes the minimum Kubernetes manifests used
to deploy the Collector in a GKE cluster, with a compatible
[runtime configuration](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample/blob/main/deploy/gke/simple/otel-config.yaml)
for the sample collector-builder components built by default. When used
together, the Make commands provided to build and push an image to Artifact
Registry will automatically update those manifests in the repository to use the
newly-created image, offering an end-to-end build and deployment reference.

### Deploying the Collector in GKE

As mentioned earlier in this post, the collector offers vendor-agnostic routing
and processing for logs, metrics, and tracing telemetry data. For example, while
you may already be using a collection agent on GKE (such as for metrics and
logs), the collector can provide a pathway for exporting traces. Those traces
can be sent to an observability backend of your choice. It then opens up
flexibility to process and export your other telemetry signals to any backend.

With the
[provided Kubernetes manifests](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample/blob/main/deploy/gke/simple/manifest.yaml),
you only need one `kubectl` command to deploy the Collector:

```shell
kubectl apply -f k8s/manifest.yaml -n otel-collector
```

Using a Collector generated from the build file shown earlier in this post, a
matching [OpenTelemetry Collector configuration](/docs/collector/configuration/)
would look like the following:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  otlp:
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp]
```

The Collector in GKE consumes this config file through a Kubernetes ConfigMap
that is mounted by the Collector Pod. This ConfigMap is created with a basic
`kubectl` command:

```shell
kubectl create configmap otel-config --from-file=./otel-config.yaml -n otel-collector
```

### Modifying the Collector Config

The OpenTelemetry config file format allows hot-swapping Collector
configurations to re-route telemetry data with minimal disruption. For example,
it may be useful to temporarily enable the `logging` exporter, which provides
debugging insights into the Collector. This is done by editing the local config
file from above to add two lines:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  otlp:
  logging:
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp, logging]
```

The runtime config can then be re-applied with `kubectl apply`:

```shell
kubectl create configmap otel-config --from-file=./otel-config.yaml --dry-run=client -n otel-collector -o yaml | kubectl apply -f -
```

After restarting the Collector pod (such as with `kubectl delete` or by applying
a new manifest, as we’ll show below), the new config changes will take effect.
This workflow can be used to enable or disable any OpenTelemetry exporter, with
exporters available for
[many popular observability backends](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

### Adding a receiver and processor

You can add more components and follow the same process as above to build and
deploy a new Collector image. For example, you can enable the
[Zipkin exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/zipkinexporter)
(for sending traces to a [Zipkin](https://zipkin.io/) backend service) and the
[batch processor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor)
by editing your builder config from earlier like so:

```yaml
receivers:
  - import: go.opentelemetry.io/collector/receiver/otlpreceiver
    gomod: go.opentelemetry.io/collector v0.57.2

processors:
  - import: go.opentelemetry.io/collector/processor/batchprocessor
    gomod: go.opentelemetry.io/collector v0.57.2

exporters:
  - import: go.opentelemetry.io/collector/exporter/otlpexporter
    gomod: go.opentelemetry.io/collector v0.57.2
  - import: go.opentelemetry.io/collector/exporter/loggingexporter
    gomod: go.opentelemetry.io/collector v0.57.2
  - import: github.com/open-telemetry/opentelemetry-collector-contrib/exporter/zipkinexporter
    gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/exporter/zipkinexporter
      v0.57.2
```

Running `make docker-build` then compiles a new version of your Collector image.
If you have an Artifact Registry set up for hosting Collector images, you can
also run `make docker-push` with environment variables set to make the image
available in your GKE cluster (setup steps for this are documented in the
[README](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample/tree/main/build/cloudbuild#building-with-cloud-build)).

Enabling the new receiver and processor also follows the same steps as above,
starting with editing your local Collector config:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
processors:
  batch:
    send_batch_max_size: 200
    send_batch_size: 200
exporters:
  otlp:
  logging:
  zipkin:
    endpoint: "http://my-zipkin-service:9411/api/v2/spans"
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp, logging, zipkin]
```

Update the config in your cluster by running the same `kubectl apply` command
from earlier:

```shell
kubectl create configmap otel-config --from-file=./otel-config.yaml --dry-run=client -n otel-collector -o yaml | kubectl apply -f -
```

Now, once your Collector pod restarts with the new image it will start using the
new exporter and processor. When you ran `make docker-build`, the command
automatically updated the Kubernetes deployment manifests provided in the
repository to point to your new Collector image. So updating an existing running
Collector with the new image only requires running `kubectl apply` again:

```shell
kubectl apply -f manifest.yaml -n otel-collector
```

This will trigger a new rollout of your Collector deployment, picking up the
config changes and new components as compiled into the updated image.

## Automate builds for secure, up-to-date images

Building your own Collector allows you to control updates and rollouts of the
Collector image. In this repo, we have some samples of how you can own your
Collector build on GCP.

Using a [Cloud Build](https://cloud.google.com/build) configuration supports
serverless, automated builds for your Collector. By doing so you can benefit
from new releases, features, and bug fixes in Collector components with minimal
delay. Combined with
[Artifact Registry](https://cloud.google.com/artifact-registry), these builds
can be pushed as Docker images in your GCP project. This provides portability
and accessibility of your images, as well as enabling container vulnerability
scanning in Artifact Registry to ensure the supply-chain safety of your
Collector deployment.

Serverless builds and vulnerability scanning are valuable aspects of a reliable
CI/CD pipeline. Here, we hope to abstract away some of the complication around
these processes by shipping sample configs with this repository. And while we're
providing some sample steps toward setting these up with GCP, similar approaches
are possible with many other vendors as well.

## Wrapping Up

The OpenTelemetry Collector makes it easy to ingest and export telemetry data.
This is thanks to OpenTelemetry’s vendor-agnostic data model, but also to the
active community of contributors supporting custom components for different
backends. These components provide the flexibility for OpenTelemetry to support
a wide variety of use cases.

We hope this sample, as well as some of the example use cases we’ve discussed
here, help smooth over the friction some experience when getting started with
OpenTelemetry. If you would like to provide some feedback, don’t hesitate to
report any feature requests or issues by
[opening an issue on GitHub](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample/issues).
