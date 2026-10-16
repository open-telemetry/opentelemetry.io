---
title: More reasons to build your own Collector
linkTitle: More reasons to build your own Collector
date: 2026-10-16
author: >-
  [Alex Boten](https://github.com/codeboten) (Grafana Labs)
issue:
# sig:
cSpell:ignore: otelconf trimpath
---

There are many reasons for building your own OpenTelemetry Collector
distribution. The existing distributions are designed to be broadly useful,
which means they include many components that any single deployment will never
use. Building your own gives you the ability to select only the components you
care about, add your own custom components, and control exactly what ends up in
the binary you run in production.

One of the reasons I prefer to build my own distribution when I need to is to
limit the size of the binary I have to ship around and to ensure that the least
amount of dependencies are included. Fewer dependencies means a smaller binary,
a smaller attack surface, and fewer third-party modules to track when a
vulnerability is disclosed. The OpenTelemetry Collector Builder (ocb) makes this
possible, you write a manifest file in YAML to select components you care about
and ocb compiles into the resulting binary.

## Resource detectors

Limiting components is great, but as a user
[reported recently](https://github.com/open-telemetry/opentelemetry-collector/issues/16075),
resource detectors can also cause unexpected dependencies to bloat the size of
the binary with code you never use. Resource detectors are used to
[automatically inject resource attributes](/docs/specs/otel/resource/sdk/#detecting-resource-information-from-the-environment)
into the telemetry a process produces. They are great in cloud environments,
where you want to have as much information as possible about the deployment of
your applications and services.

The catch is that detectors for different environments (various cloud providers,
container runtimes, and so on) each bring their own dependencies. Selecting a
component that supports resource detection, such as the resource detection
processor, compiles in all of its detectors, even if you only ever run in one
environment.

Additionally, the Collector has included support for the
[OpenTelemetry Configuration Schema](https://github.com/open-telemetry/opentelemetry-configuration/)
since version
[v0.128.0](https://github.com/open-telemetry/opentelemetry-collector/blob/main/CHANGELOG.md#v1340v01280).
This is done via the include of the
[otelconf](https://pkg.go.dev/go.opentelemetry.io/contrib/otelconf/v0.3.0)
package, which also supports configuring resource detectors. Until now, the
manifest had no way to say "I only want these detectors".

## Using go build flags

Because ocb produces a regular Go program, standard Go tooling can already help
trim the result. For example, stripping debug information and symbol tables with
`-ldflags="-s -w"` and removing local file system paths with `-trimpath` reduces
the size of the binary. You can pass these through the `ldflags` and `gcflags`
settings in the `dist` section of your manifest.

These flags only shrink what was compiled, though. They can't remove code that
your binary still imports, so they don't solve the resource detector problem.
Build tags can exclude code from a build, but only if the code you depend on
provides them. Thankfully, with updates to both
[otelconf](https://github.com/open-telemetry/opentelemetry-go-contrib/pull/9818)
and to the
[resource detection processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/47218),
detectors can now be omitted at compile time. For example, the following
configuration will omit the system resource detector:

```yaml
dist:
  module: github.com/open-telemetry/opentelemetry-collector-releases/core
  name: otelcol
  description: OpenTelemetry Collector
  version: 0.163.1
  output_path: ./_build
  build_tags: 'omit_detector_system'
```

Each detector can be disabled via a `omit_` flag, which allows the Collector to
continue including all detectors by default, to remain backwards compatible with
its existing behaviour. This offers great flexibility for end users, but can
become cumbersome to configure, the following disables all detectors currently
available:

```yaml
dist:
  name: otelcol-custom
  description: My Custom Collector
  version: 0.199.0
  build_tags: 'omit_detector_akamai,omit_detector_alibaba_ecs,omit_detector_aws_ec2,omit_detector_aws_ecs,omit_detector_aws_eks,omit_detector_aws_elastic_beanstalk,omit_detector_aws_lambda,omit_detector_azure,omit_detector_azure_aks,omit_detector_azure_appservice,omit_detector_azure_containerapps,omit_detector_azure_functions,omit_detector_azure_vm,omit_detector_consul,omit_detector_digitalocean,omit_detector_docker,omit_detector_dynatrace,omit_detector_env,omit_detector_gcp,omit_detector_heroku,omit_detector_hetzner,omit_detector_ibmcloud_classic,omit_detector_ibmcloud_vpc,omit_detector_k8s_api,omit_detector_kubeadm,omit_detector_openshift,omit_detector_openstack_nova,omit_detector_oraclecloud,omit_detector_scaleway,omit_detector_system,omit_detector_tencent_cvm,omit_detector_upcloud,omit_detector_vultr'
...
processors:
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/processor/resourcedetectionprocessor
      v0.163.0
...
```

## New OCB configuration

The
[latest release](https://github.com/open-telemetry/opentelemetry-collector-releases/releases#release-v0.163.1)
of the Collector and
[ocb](https://github.com/open-telemetry/opentelemetry-collector-releases/releases#release-cmd/builder/v0.163.1)
now also supports users wanting to filter out resource detectors with less
configuration. It follows the configuration defined in the Configuration schema,
the following removes all detectors except the ones configured in the `resource`
block:

```yaml
dist:
  name: otelcol-custom
  description: My Custom Collector
  version: 0.199.0
  resource:
    detection:
      detectors:
        - env:
        - system:
...
processors:
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/processor/resourcedetectionprocessor
      v0.163.0
...
```

With only the detectors you need compiled in, you avoid pulling in dependencies
for environments you don't run in. How much of a difference does it make? The
following is the result of using published OpenTelemetry Collector Kubernetes
distribution
[manifest](https://github.com/open-telemetry/opentelemetry-collector-releases/blob/e3bd087aedd311e3b1a5cdbb4c4f82043f02f1f2/distributions/otelcol-k8s/manifest.yaml)
with and without the resource configuration above:

```sh
$ ocb --config ./manifest.yaml
$ ls -alh ./_build/otelcol-k8s
-rwxr-xr-x@ 1 alexboten  alexboten   182M Oct 16 14:25 ./_build/otelcol-k8s

$ ocb --config ./manifest-less-detectors.yaml
$ ls -alh ./_build/otelcol-k8s-less-detectors
-rwxr-xr-x@ 1 alexboten  alexboten   147M Oct 16 14:30 ./_build/otelcol-k8s-less-detectors
```

The binary is roughly 20% smaller!

## Try it out

Update to the latest release of ocb, add the detector filtering to your
manifest, and rebuild. If you run into problems or have ideas for further
reducing dependencies, open an issue in the
[opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector)
repository, or find us in the `#otel-collector-dev` channel on the
[CNCF Slack](https://slack.cncf.io).
