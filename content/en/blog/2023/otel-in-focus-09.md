---
title: OpenTelemetry in Focus, September 2023
linkTitle: OTel in Focus 2023/09
date: 2023-10-01
author: '[Austin Parker](https://github.com/austinlparker)'
# prettier-ignore
cSpell:ignore: attributesprocessor Autoconfigure autoinstrumentation Autoscaler checkapi Contribfest coreinternal gopkg jaegerthrifthttp obsreport ottl resourcedetection resourceprocessor structs tailsampling ucum unmanaged
---

Welcome back to **OpenTelemetry in Focus** for September, 2023! The autumn winds
are bringing a flurry of activity to the project, as we prepare for KubeCon and
Observability Day. Are you attending? We hope to see you there for our inaugural
OpenTelemetry Contribfest, Project Pavilion, and more!

Are you a maintainer with something you’d like featured here? Get in touch with
me [via email](mailto:austin+otel@ap2.io), or on the
[CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
channel.

## Releases and Updates

Here are the latest updates from some of our core repositories.

<!-- markdownlint-disable heading-increment -->

##### [Specification](/docs/specs/otel/)

The latest update (v1.25.0) brings several changes chiefly to the Metrics and
Logs. Metric name's maximum length has been increased from 63 to 255 characters.
The `MetricProducer` specification has been put on feature-freeze and has been
stabilized. The addition of a synchronous gauge instrument and clarification on
metric point persistence have been implemented, and the term "advice" has been
replaced with "advisory parameters". A new rule defining the default size of the
`SimpleFixedSizeExemplarReservoir` to be 1 has been established. In Logs, the
GCP data model has been updated to use `TraceFlags` instead of
`gcp.trace_sampled`. Additionally, a change in OpenTelemetry Protocol fixes and
clarifies the definition of "transient error" in the OTLP exporter
specification.

Compatibility updates include changes in OpenTracing Shim and Prometheus, the
latter is permitted to change metric names by default as it translates from
Prometheus to OpenTelemetry.

For full details, please visit the full changelog
[here](https://github.com/open-telemetry/opentelemetry-specification/compare/v1.24.0...v1.25.0)

##### [Collector](/docs/collector/)

In the recent release of OpenTelemetry Collector (v0.86.0), several important
updates have been made. The logging exporter has been deprecated and replaced by
the newly added debug exporter. Furthermore, the linux/s390x architecture has
now been incorporated into cross build tests.

Significant API changes have occurred in this release. The
`service.PipelineConfig` has been removed, which constitutes a breaking change.
Several `obsreport` module functions and structs are being deprecated, mostly
pertaining to Exporter, Processor, Receiver, and Scraper features. These
functionalities have been relocated to various helper modules.

Detailed descriptions, as well as links to the respective relocations and
deprecations, can be found on the
[release page](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.86.0).

[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.86.0)
includes many updates as well. Important breaking changes include the removal of
deprecated `jaeger` and `jaegerthrifthttp` exporters, and changes related to
several packages such as `pkg/ottl`, `pkg/stanza`, `mongoDb` receiver, Azure
Monitor exporter, `tailsampling` processor, and many more to comply with
`checkapi`.

Enhancements include sub-second decision wait time in the `tailsampling`
processor, host's cpuinfo attributes support in `resourcedetection` processor,
addition of 'omit_pattern' setting to `split.Config`, and several updates to the
`pkg/ottl` package such as adding a new 'TruncateTime' function and support for
named arguments in function invocations, among others.

Bug fixes have been rolled out for issues like the `tailsampling` processor
accepting duplicate policy names, JSON marshal errors for metrics with NaN
values in AWS EMF Exporter, and restoration of AWS X-Ray metadata structure
while exporting, along with a range of other bug fixes for various components.

There were also several breaking changes in v0.85.0:

- Removal of deprecated Kubernetes API resources like HorizontalPodAutoscaler
  v2beta2 version and CronJob v1beta1 version means metrics for those resources
  will no longer be emitted on Kubernetes 1.22 and older.
- Prometheus exporters now append type and unit suffixes by default, which can
  be disabled by setting "add_metric_suffixes" to false.
- Transition `attributesprocessor` and `resourceprocessor` feature gate
  `coreinternal.attraction.hash.sha256` to stable.

Again, please refer to the release notes carefully before updating.

[Operator v0.85.0](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.85.0)
has been released. Enhancements include the addition of .NET Automatic
Instrumentation support for Alpine-based images in the autoinstrumentation, and
Go auto-instrumentation support has been upgraded to v0.3.0-alpha. Furthermore,
the Operator now allows for the collector CRD to specify a list of configmaps to
mount, and introduces a new method of reconciliation to reduce complexity and
duplication. A bug has also been fixed where the operator ensures the upgrade
mechanism runs upon changes in an instance, particularly useful for instances
shifting from unmanaged to managed states when the operator is upgraded.
Component updates include OpenTelemetry Collector, Contrib, and several
languages-specific auto-instrumentations.

Important change: The operator now allows for introducing a reliable upgrade
mechanism to handle instance changes.

Breaking Change: Go auto-instrumentation support has considerably upgraded from
previous versions to v0.3.0-alpha, which may include major changes.

This release includes breaking changes from v0.84.0 as well:

- Target allocator no longer has default memory and cpu limits, to match
  collector defaults.
- ServiceMonitors are created when Prometheus exporters are used.

##### [Java](/docs/instrumentation/java/)

[Version 1.30](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.30.1)
includes many updates to incubating APIs and SDKs. In the API incubator, an
experimental synchronous gauge was added. The SDK Metric System has amplified
its facilities with the addition of attributes advice API, AttributesProcessor
`toString`, an attribute filter helper, and it increased the metric name's
maximum length from 63 to 255 characters. The Prometheus exporter has made
changes concerning non-ucum units and their unit addition to metric names in
TYPE and HELP comments.

In SDK Extensions, there's support for file-based configurations added to the
incubator. An update is made to handle blank value entries in the Autoconfigure
`ConfigProperties#getMap` filter.

There is a crucial deprecation for developers to note. The
`io.opentelemetry:opentelemetry-semconv` has been deprecated for removal; an
alternate `io.opentelemetry.semconv:opentelemetry-semconv:1.21.0-alpha` is now
introduced from a new repository.

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.30.0)
brings significant changes including the addition of new Java agent
instrumentation, enhancements, and bug fixes. Important changes include the
splitting of experimental HTTP server metrics into a separate class, renaming of
`HttpClientResend` and `HttpRouteHolder` to `HttpClientResendCount` and
`HttpServerRoute`, and removal of a deprecated configuration.

New Java agent instrumentation has been added for hibernate reactive.
Enhancements encompass support for AWS Secrets Manager JDBC URLs, improved
support for semantic convention changes, addition of `javaagent` to
instrumentation BOM, and more. Several bugs have also been fixed, such as issues
with `getDefinedPackage` lookup for OpenJ9, serializing key with Lettuce
instrumentation, and auto-instrumentation with JMX not working without a
trigger.

#### [Go](/docs/instrumentation/go/)

[Version 1.19.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.19.0)
is the first stable release of Metrics and the standard project stability
guarantees now apply to the `go.opentelemetry.io/otel/sdk/metric` package.

Added features include a new "Roll the Dice" application example and the
`WithWriter` and `WithPrettyPrint` options to customize `io.Writer` and display
output in human-readable JSON format.

Notable changes comprise allowance of '/' characters in metric instrument names
and the change in the default output format of the exporter, which is now more
compact.

Fixed issues include a recurring problem where the SDK attempted to create the
Prometheus metric at each Collect, even if known that the scope was invalid. In
terms of removals, the
`go.opentelemetry.io/otel/bridge/opencensus.NewMetricExporter` has been replaced
by `NewMetricProducer`.

Due to the plethora of content, detailed information is advised to be obtained
by referring to the
[Full Changelog](https://github.com/open-telemetry/opentelemetry-go/compare/v1.18.0...v1.19.0).

Please note that v1.18.0 included several deprecations and removals:

- Jaeger exporters and examples have been removed, as Jaeger accepts native OTLP
  now.
- Go compatibility before version 1.20 is no longer guaranteed.

#### [JavaScript](/docs/instrumentation/js/)

[Version 1.17.0](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.17.0)
fixes an unintentional breaking change in previous releases.

There have been several important changes in the experimental packages,
including deprecation of legacy configuration APIs.

#### [.NET](/docs/instrumentation/net/)

[Version 1.6.0](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.6.0)
includes minor updates to metrics.

## News and Upcoming Events

KubeCon North America is coming to Chicago soon, and the schedule has been
announced!
[Check out the observability track](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/)
for talks on OpenTelemetry, Prometheus, and more.

[Observability Day](https://colocatedeventsna2023.sched.com/overview/type/Observability+Day)
returns as well, and it's shaping up to be a great one! Check out the announced
schedule at the link above.

We're also excited to announce our first ever
[Contribfest](https://kccncna2023.sched.com/event/1R2rQ)! You'll have the
opportunity to work with maintainers of the Collector and JavaScript SIGs on
issues and PRs, and learn more about how to contribute to OpenTelemetry.

Be sure to stay tuned to the blog this week for a full breakdown of all the
events happening at KubeCon this November!
