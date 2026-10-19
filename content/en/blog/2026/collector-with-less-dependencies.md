---
title: Only include resource detectors you need by building your own Collector
linkTitle:
  Only include resource detectors you need by building your own Collector
date: 2026-10-16
author: >-
  [Alex Boten](https://github.com/codeboten) (Grafana Labs)
issue: 12217
sig: Collector SIG
cSpell:ignore: otelconf trimpath
---

There are many reasons for building your own OpenTelemetry Collector
distribution. The existing distributions are designed to be broadly useful,
which means they include many components that any single deployment will never
use. Building your own gives you the ability to select only the components you
care about, add your own custom components, and control exactly what ends up in
the binary you run in production.

One of the reasons I prefer to build my own distribution is to limit the size of
the binary I have to ship around and to ensure that the least amount of
dependencies are included. Fewer dependencies means a smaller binary, a smaller
attack surface, and fewer third-party modules to track when a vulnerability is
disclosed. The OpenTelemetry Collector Builder (ocb) makes this possible: you
write a manifest file in YAML to select the components you care about, and ocb
compiles them into the resulting binary.

## Resource detectors

Limiting components is great, but as a user
[reported recently](https://github.com/open-telemetry/opentelemetry-collector/issues/16075),
resource detectors can bloat the size of the binary with dependencies you never
use. Resource detectors are used to
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
since version v0.128.0. This is done via the include of the
[otelconf](https://pkg.go.dev/go.opentelemetry.io/contrib/otelconf/v0.3.0)
package, which also supports configuring resource detectors. Until now, the
manifest had no way to say "I only want these detectors".

## Using go build flags

Because ocb produces a regular Go program, standard Go tooling can already help
trim the result. For example, stripping debug information and symbol tables with
`-ldflags="-s -w"` and removing local file system paths with `-trimpath` reduces
the size of the binary. These are already defaults with ocb and can be
overwritten as needed via command line flags.

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

Each detector can be disabled via an `omit_` flag, which allows the Collector to
continue including all detectors by default, to remain backwards compatible with
its existing behaviour. This offers great flexibility for end users, but can
become cumbersome to configure. The following disables all detectors currently
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
now also support users wanting to filter out resource detectors with less
configuration. It follows the configuration defined in the Configuration schema;
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

The binary is roughly 20% smaller and comparing the dependencies between both,
the list has shrunk by 13 packages:

```sh
$ go version -m ./_build/otelcol-k8s | grep -w dep | sort > /tmp/deps-all-detectors.txt
$ go version -m ./_build/otelcol-k8s-less-detectors | grep -w dep | sort > /tmp/deps-less-detectors.txt
$ diff --suppress-common-lines /tmp/deps-all-detectors.txt /tmp/deps-less-detectors.txt
3d2
<       dep     cloud.google.com/go/compute     v1.72.0 h1:cwmwK/ADu7G1DNRN2Dt+qTpdg1hrAqzArBSmgSFumXE=
64d62
<       dep     github.com/digitalocean/go-metadata     v0.0.0-20250129100319-e3650a3df44b      h1:2EkxDInMJ3ii8mk8kZs0Qq75JpsvNOOoa5etBJluzbI=
178d175
<       dep     github.com/linode/go-metadata   v0.3.1  h1:F34TL9aF2qNDEViTOxFf9cXOMrdhckczVg3T80h1XZY=
228d224
<       dep     github.com/open-telemetry/opentelemetry-collector-contrib/internal/aws/ecsutil  v0.163.0        h1:U8O65C/kBbHdsFNfCU3PG8wDn3llm2TXJafCOw9HOA4=
330d325
<       dep     github.com/stretchr/objx        v0.5.3  h1:jmXUvGomnU1o3W/V5h2VEradbpJDwGrzugQQvL0POH4=
429,432d423
<       dep     go.opentelemetry.io/contrib/detectors/aws/elasticbeanstalk      v0.19.0 h1:U5lXYh/n93SXxBOvBp9B1e1AeC+Nc5j/VYna6cBP5qI=
<       dep     go.opentelemetry.io/contrib/detectors/azure/azureappservice     v0.19.0 h1:VKQWNR6IxVq9DyZxsGEciogNo8wQST3IeFw7Dp0jtV0=
<       dep     go.opentelemetry.io/contrib/detectors/azure/azurecontainerapps  v0.19.0 h1:jod9iGbB4p8smBQ0IRILOXq444KGnvBMHDJF6jqVDTo=
<       dep     go.opentelemetry.io/contrib/detectors/azure/azurefunctions      v0.19.0 h1:Dn5+LcOW0qvxP/2eNDZr3HA+RoJe3L/UhjwWAEFzPz0=
435,437d425
<       dep     go.opentelemetry.io/contrib/detectors/hetzner   v0.19.0 h1:bt2D4vPOIxDjgvZiBQ69UhMmWR7+K7TbXwv9c25+lQ4=
<       dep     go.opentelemetry.io/contrib/detectors/ibmcloud/vpc      v0.19.0 h1:jxs+/EjbVFUyPmqWWF/4FZ8mzdKrjcjTE9FLAuK8g/c=
<       dep     go.opentelemetry.io/contrib/detectors/vultr     v0.19.0 h1:xFmRazM+v0Kbk7YbkgeX5JajCL5HC+U6cGN3gbpow6k=
487d474
<       dep     google.golang.org/genproto      v0.0.0-20260715232425-e75dac1f907d      h1:C9v1o0/4quuhOAfmRXA2j+we0PqZIp8traLdeogF3Ms=
```

## Try it out

Update to the latest release of ocb, add the detector filtering to your
manifest, and rebuild. If you run into problems or have ideas for further
reducing dependencies, open an issue in the
[opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector)
repository, or find us in the `#otel-collector-dev` channel on the
[CNCF Slack](https://slack.cncf.io).
